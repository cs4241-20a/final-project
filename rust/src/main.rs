// CS Webware

#[macro_use]
extern crate stdweb;

use std::cell::RefCell;
use std::rc::Rc;

use std::str::FromStr;

use stdweb::{
    traits::*,
    unstable::TryInto,
    web::{
        document, event::KeyDownEvent, html_element::CanvasElement, CanvasRenderingContext2d,
        IEventTarget,
    },
};

#[derive(Debug, PartialEq, Copy, Clone)]
pub enum Direction {
    Up,
    Down,
    Left,
    Right,
}

impl Direction {
    pub fn opposite(self, other: Direction) -> bool {
        self == Direction::Up && other == Direction::Down
            || self == Direction::Down && other == Direction::Up
            || self == Direction::Left && other == Direction::Right
            || self == Direction::Right && other == Direction::Left
    }
}

pub struct Canvas {
    pub canvas: CanvasElement,
    pub ctx: CanvasRenderingContext2d,
    scaled_width: u32,
    scaled_height: u32,
    width: u32,
    height: u32,
}

impl Canvas {
    pub fn new(attr_id: &str, width: u32, height: u32) -> Canvas {
        let canvas: CanvasElement = document()
            .query_selector(attr_id)
            .unwrap()
            .unwrap()
            .try_into()
            .unwrap();

        let ctx: CanvasRenderingContext2d = canvas.get_context().unwrap();
        let scaled_width = canvas.width() / width;
        let scaled_height = canvas.height() / height;

        Canvas {
            canvas,
            ctx,
            scaled_width,
            scaled_height,
            width,
            height,
        }
    }

    pub fn draw(&self, x: u32, y: u32, color: &str) {
        assert!(x < self.width);
        assert!(y < self.height);
        self.ctx.set_fill_style_color(color);

        let x = x * self.scaled_width;
        let y = y * self.scaled_height;

        self.ctx.fill_rect(
            f64::from(x),
            f64::from(y),
            f64::from(self.scaled_width),
            f64::from(self.scaled_height),
        );
    }

    pub fn clear_all(&self) {
        self.ctx.set_fill_style_color("seagreen");
        self.ctx.fill_rect(
            0.0,
            0.0,
            f64::from(self.canvas.width()),
            f64::from(self.canvas.height()),
        )
    }
}

#[derive(Debug, Copy, Clone, Eq, PartialEq)]
struct Block(u32, u32);

#[derive(Debug)]
pub struct GameResults {
    length: u32,
}

#[derive(Debug)]
pub struct Snake {
    head: Block,
    tail: Vec<Block>,
    food: Block,
    height: u32,
    width: u32,
    direction: Option<Direction>,
    next_direction: Option<Direction>,
    last_direction: Direction,
}

impl Snake {
    pub fn new(width: u32, height: u32) -> Snake {
        let head_x: u32 = js! {return @{width} / 2}.try_into().unwrap();

        let head_y: u32 = js! {return  @{height} / 2}.try_into().unwrap();

        let dirs = vec![
            Direction::Up,
            Direction::Down,
            Direction::Left,
            Direction::Right,
        ];
        let direction: u32 = js! { return Math.floor(Math.random() * 4) }
            .try_into()
            .unwrap();
        let direction = Some(*dirs.get(direction as usize).unwrap_or(&Direction::Left));

        let head = Block(head_x, head_y);

        let food_x: u32 = js! { return Math.floor(Math.random() * @{width}) }
            .try_into()
            .unwrap();
        let food_y: u32 = js! { return Math.floor(Math.random() * @{height}) }
            .try_into()
            .unwrap();

        let food = Block(food_x, food_y);
        let tail = Vec::new();

        Snake {
            head,
            tail,
            food,
            height,
            width,
            direction,
            next_direction: None,
            last_direction: Direction::Right,
        }
    }

    pub fn change_direction(&mut self, direction: Direction) {
        if !self.last_direction.opposite(direction) && self.direction.is_none() {
            self.direction = Some(direction)
        } else if self.direction.iter().any(|d| !d.opposite(direction)) {
            self.next_direction = Some(direction)
        }
    }

    pub fn update(&mut self) -> Option<GameResults> {
        let direction = self.direction.unwrap_or(self.last_direction);
        self.last_direction = direction;

        let new_head = match direction {
            Direction::Up => Block(
                self.head.0,
                self.head.1.checked_sub(1).unwrap_or(self.height),
            ),
            Direction::Down => Block(self.head.0, self.head.1 + 1),
            Direction::Right => Block(self.head.0 + 1, self.head.1),
            Direction::Left => Block(
                self.head.0.checked_sub(1).unwrap_or(self.width),
                self.head.1,
            ),
        };

        self.tail.insert(0, self.head);
        let last_end = self.tail.pop();

        if self.tail.contains(&new_head) || new_head.0 >= self.width || new_head.1 >= self.height {
            let length = self.tail.len() as u32 + 1;
            // game over
            *self = Snake::new(self.width, self.height);
            return Some(GameResults { length });
        }

        self.head = new_head;
        if self.head == self.food {
            let mut food = self.food;
            while food == self.head || self.tail.contains(&food) {
                let food_x: u32 = js! { return Math.floor(Math.random() * @{self.width}) }
                    .try_into()
                    .unwrap();

                let food_y: u32 = js! { return Math.floor(Math.random() * @{self.height}) }
                    .try_into()
                    .unwrap();

                food = Block(food_x, food_y);
            }
            self.food = food;
            last_end.map(|x| self.tail.push(x));
        }
        self.direction = self.next_direction.take();

        None
    }

    pub fn draw(&self, canvas: &Canvas, score: u32) {
        canvas.clear_all();
        canvas.draw(self.head.0, self.head.1, "blue");
        for &Block(x, y) in &self.tail {
            canvas.draw(x, y, "lightblue ");
        }
        canvas.draw(self.food.0, self.food.1, "orange");

        canvas.ctx.set_font("30px Arial");
        let s = String::from_str("Top Score: ").unwrap() + &score.to_string();
        canvas.ctx.fill_text(&s, 10.0, 50.0, None);
    }
}

fn main() {
    stdweb::initialize();

    let canvas = Canvas::new("#canvas", 22, 22);
    let snake = Rc::new(RefCell::new(Snake::new(22, 22)));

    snake.borrow().draw(&canvas, 0);

    stdweb::web::document().add_event_listener({
        let snake = snake.clone();
        move |event: KeyDownEvent| {
            match event.key().as_ref() {
                "ArrowLeft" => snake.borrow_mut().change_direction(Direction::Left),
                "ArrowRight" => snake.borrow_mut().change_direction(Direction::Right),
                "ArrowDown" => snake.borrow_mut().change_direction(Direction::Down),
                "ArrowUp" => snake.borrow_mut().change_direction(Direction::Up),
                _ => {}
            };
        }
    });

    fn game_loop(snake: Rc<RefCell<Snake>>, canvas: Rc<Canvas>, time: u32, score: u32) {
        stdweb::web::set_timeout(
            move || {
                let mut time = time;
                let len = snake.borrow().tail.len();
                let mut new_score = score;
                if len == 0 {
                    time = 100;
                }

                match snake.borrow_mut().update() {
                    Some(result) => {
                        new_score = result.length;
                        js! {
                            fetch("/api/snake/score", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ value: @{result.length} }),
                            })
                            .then((response) => response.json())
                            .then((data) => (this.postId = data.id));

                        }
                    }
                    None => {}
                }
                let score = std::cmp::max(score, new_score);
                snake.borrow().draw(&canvas, score);

                let new_len = snake.borrow().tail.len();
                if len != new_len {
                    time = std::cmp::max(50, time - 1);
                }

                game_loop(snake.clone(), canvas.clone(), time, score);
            },
            time,
        );
    }

    game_loop(snake, Rc::new(canvas), 110, 0);

    stdweb::event_loop();
}
