# Drawsome
Drawsome is a simple and accessible service to view, create, and share digital drawings online. Users who enter the site may create works in-browser and browse works that have been published on the platform. Registered users are able to save prior works, as well as publish them to be seen by everyone. The intended users of Drawsome are people who are interested in drawing or sketching and that would like to share their work.

- [Drawsome](https://google.com)
- [Project Video](https://google.eom)

### Team 1
- Bryce Corbitt
- Pooja Patel

## Instructions
**How To: Login**
- Users can log in by OAuth2 authentication through Google on the 'Home' page

**How To: Draw**
- Navigate to the ‘Draw’ page
- Use the color picker to select a color to draw with
- To clear the board, undo previous lines, and erase you can use the buttons to the left of the canvas to perform those operations
- Use the brush-radius sliding tool to adjust the brush to be smaller or larger
- Be creative!

**How To: Publish and Save a Drawing**
- After completing a drawing on the page fill out the fields below ‘Save/Publish Drawing’, ‘Name’ and ‘Title’ are required fields
- If you would like to have your art piece to be published in the gallery, toggle the switch to publish
- Click ‘Save’

**How to: View All Your Drawings**
- Navigate to the ‘My Drawings’ tab
- This is where all of your drawings are held

**How to: View All Published Drawings**
- Navigate to the ‘Gallery’ tab
- This is where all published drawings are held

**How to: Logout**
- Click the ‘Sign Out’ button in the navigation bar

## Technologies Outline
**Backend**
- Node.js Express server that hosts a REST API
  - x
- MongoDB + Mongoose for modelling and persisting user data
	- x
- OAuth2 Authentication through Google
	- x
  
**Frontend**
- React Application
	- Several React components were used in this project for frontend development.
  - react-canvas-draw and react-color were used to provide an elegant canvas interface with drawing controls
      - The react-canvas-draw component was used for the drawing canvas, the tool to adjust brush size, to save and to undo.
      - The react-color component was used for the color picker.
  - react-bootstrap & bootswatch for CSS boilerplate and theming
    - react-bootstrap was used for various components including: container, row, col, button, and form
    - bootswatch was used for the theming of Drawsome. The selected theme was ‘Sketchy’
- REST API Client carried out with axios
	- x
- react-router-dom for self-contained site navigation
	- x

## Challenges
**Pooja**
Working with the React components was challenging, especially working with various states. However, by looking at documentation, online sources, and getting clarification the concepts became more clear.

**Bryce**
xyz

## Workload Split
- Bryce Corbitt
	- x
  - y
  - z
- Pooja Patel
	- Integrating react-canvas-draw and react-colors for drawing capability
  - Styling the ‘Draw’ page through CSS 

