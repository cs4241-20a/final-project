<template>
  <b-container v-on:keydown="getInput" class="page">
    <b-button v-on:click="initGame">New Game</b-button>
    <b-button v-on:click="restartGame">Restart</b-button>
    <h2>
      <b-badge>{{ score }}</b-badge>
    </h2>
    <b-container id="board">
      <b-row>
        <b-col>
          <b-table-lite
            class="table"
            fixed
            large
            striped
            hover
            :items="gameBoard"
            :key="score"
          ></b-table-lite>
        </b-col>
      </b-row>
      <b-row cols="3" align-v="stretch">
        <b-col>
          <b-table class="top-scores" :items="topScores" :fields="['Top Scores']"></b-table>
        </b-col>
        <b-col>
          <b-table class="your-best" :items="[topUserScore]" :fields="['Your Best']"></b-table>
        </b-col>
        <b-col>
          <b-table class="games-played" :items="[playCount]" :fields="['Games Played']"></b-table>
        </b-col>
      </b-row>
    </b-container>
  </b-container>
</template>
<script>
export default {
  name: "Game",
  data: function() {
    return {
      gameBoard: [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ],
      score: 0,
      num: 0,
      topScores: [],
      topUserScore: 0,
      playCount: 0,
    };
  },
  methods: {
    getFetches: function() {
      fetch("/api/2048/all_scores", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => res.json())
        .then((scores) => {
          this.topScores = JSON.parse(scores);
        });

      fetch("/api/2048/score", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((j) => (this.topUserScore = j.body));

      fetch("/api/2048/play_count", {
        method: "GET",
      })
        .then((res) => res.json())
        .then((count) => {
          this.playCount = JSON.parse(count);
        });
    },
    submitScore: function() {
      fetch("/api/2048/score", { method: "POST", body: JSON.stringify(this.score) });
    },
    getInput: function(e) {
      let key = e.key;
      switch (key) {
        case "ArrowUp":
          this.merge(key);
          break;
        case "ArrowDown":
          this.merge(key);
          break;
        case "ArrowLeft":
          this.merge(key);
          break;
        case "ArrowRight":
          this.merge(key);
          break;
        default:
          break;
      }
    },
    hasLost: function() {
      alert("You lose ! The game will now automatically restart");
      this.submitScore();
      this.restartGame();
    },
    populateBoard: function() {
      let pos = Math.floor(Math.random() * 15);

      while (this.gameBoard[Math.floor(pos / 4)][pos % 4] !== 0 && this.num < 15) {
        pos = Math.floor(Math.random() * 15);
        this.num++;
      }
      if (this.num === 14) {
        this.hasLost();
      } else {
        this.num = 0;
      }
      this.gameBoard[Math.floor(pos / 4)].splice(pos % 4, 1, 2);
      this.score += 0;
    },
    initGame: function() {
      let pos1 = Math.floor(Math.random() * 15);
      let pos2;
      if (pos1 > 0) {
        pos2 = pos1 - 1;
      } else {
        pos2 = 1;
      }
      let board = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      board[Math.floor(pos1 / 4)][pos1 % 4] = 2;
      board[Math.floor(pos2 / 4)][pos2 % 4] = 2;
      this.gameBoard = board;
    },
    restartGame: function() {
      this.gameBoard = [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [0, 0, 0, 0],
      ];
      this.score = 0;
      this.initGame();
    },
    merge: function(direction) {
      console.log(this.gameBoard);
      let i, j;
      switch (direction) {
        case "ArrowLeft": {
          for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
              if (this.gameBoard[i][j] !== 0) {
                if (
                  this.gameBoard[i][j + 1] !== 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i][j + 1]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i][j + 1] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i][j + 1];
                } else if (
                  i < 2 &&
                  this.gameBoard[i][j + 1] === 0 &&
                  this.gameBoard[i][j + 2] !== 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i][j + 2]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i][j + 2] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i][j + 2];
                } else if (
                  i < 1 &&
                  this.gameBoard[i][j + 1] === 0 &&
                  this.gameBoard[i][j + 2] === 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i][j + 3]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i][j + 3] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i][j + 3];
                }
              }
            }
          }
          break;
        }
        case "ArrowRight": {
          for (i = 3; i > 0; i--) {
            for (j = 3; j > 0; j--) {
              if (this.gameBoard[i][j] !== 0) {
                if (
                  this.gameBoard[i][j - 1] !== 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i][j - 1]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i][j - 1] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i][j - 1];
                } else if (
                  j > 1 &&
                  this.gameBoard[i][j - 1] === 0 &&
                  this.gameBoard[i][j - 2] !== 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i][j - 2]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i][j - 2] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i][j - 2];
                } else if (
                  j > 2 &&
                  this.gameBoard[i][j - 1] === 0 &&
                  this.gameBoard[i][j - 2] === 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i][j - 3]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i][j - 3] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i][j - 3];
                }
              }
            }
          }
          break;
        }
        case "ArrowUp": {
          for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
              if (this.gameBoard[i][j] !== 0) {
                if (
                  this.gameBoard[i + 1][j] !== 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i + 1][j]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i + 1][j] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i + 1][j];
                } else if (
                  i < 2 &&
                  this.gameBoard[i + 1][j] === 0 &&
                  this.gameBoard[i + 2][j] !== 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i + 2][j]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i + 2][j] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i + 2][j];
                } else if (
                  i < 1 &&
                  this.gameBoard[i + 1][j] === 0 &&
                  this.gameBoard[i + 2][j] === 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i + 3][j]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i + 3][j] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i + 3][j];
                }
              }
            }
          }
          break;
        }
        case "ArrowDown": {
          for (i = 3; i > 0; i--) {
            for (j = 3; j > 0; j--) {
              if (this.gameBoard[i][j] !== 0) {
                if (
                  this.gameBoard[i - 1][j] !== 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i - 1][j]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i - 1][j] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i - 1][j];
                } else if (
                  i > 1 &&
                  this.gameBoard[i - 1][j] === 0 &&
                  this.gameBoard[i - 2][j] !== 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i - 2][j]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i - 2][j] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i - 2][j];
                } else if (
                  i > 2 &&
                  this.gameBoard[i - 1][j] === 0 &&
                  this.gameBoard[i - 2][j] === 0 &&
                  this.gameBoard[i][j] === this.gameBoard[i - 3][j]
                ) {
                  this.gameBoard[i][j] = this.gameBoard[i][j] * 2;
                  this.gameBoard[i - 3][j] = 0;
                  this.score += this.gameBoard[i][j] + this.gameBoard[i - 3][j];
                }
              }
            }
          }
          break;
        }
        default: {
          break;
        }
      }
      this.moveBoard(direction);
    },
    moveBoard: function(direction) {
      let i, j;
      switch (direction) {
        case "ArrowLeft": {
          for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
              if (this.gameBoard[i][j] === 0 && this.gameBoard[i][j + 1] !== 0) {
                this.gameBoard[i][j] = this.gameBoard[i][j + 1];
                this.gameBoard[i][j + 1] = 0;
                this.score += 0;
              } else if (
                j < 2 &&
                this.gameBoard[i][j] === 0 &&
                this.gameBoard[i][j + 1] === 0 &&
                this.gameBoard[i][j + 2] !== 0
              ) {
                this.gameBoard[i][j] = this.gameBoard[i][j + 2];
                this.gameBoard[i][j + 2] = 0;
                this.score += 0;
              } else if (
                j < 1 &&
                this.gameBoard[i][j + 2] === 0 &&
                this.gameBoard[i][j + 3] !== 0
              ) {
                this.gameBoard[i][j + 2] = this.gameBoard[i][j + 3];
                this.gameBoard[i][j + 3] = 0;
                this.score += 0;
              } else if (
                j < 1 &&
                this.gameBoard[i][j] === 0 &&
                this.gameBoard[i][j + 1] === 0 &&
                this.gameBoard[i][j + 2] === 0 &&
                this.gameBoard[i][j + 3] !== 0
              ) {
                this.gameBoard[i][j] = this.gameBoard[i][j + 3];
                this.gameBoard[i][j + 3] = 0;
                this.score += 0;
              }
            }
          }
          break;
        }
        case "ArrowRight": {
          for (i = 3; i > 0; i--) {
            for (j = 3; j > 0; j--) {
              if (this.gameBoard[i][j] === 0 && this.gameBoard[i][j - 1] !== 0) {
                this.gameBoard[i][j] = this.gameBoard[i][j - 1];
                this.gameBoard[i][j - 1] = 0;
                this.score += 0;
              } else if (
                j > 1 &&
                this.gameBoard[i][j - 1] === 0 &&
                this.gameBoard[i][j - 2] !== 0
              ) {
                this.gameBoard[i][j - 1] = this.gameBoard[i][j - 2];
                this.gameBoard[i][j - 2] = 0;
                this.score += 0;
              } else if (
                j > 2 &&
                this.gameBoard[i][j - 2] === 0 &&
                this.gameBoard[i][j - 3] !== 0
              ) {
                this.gameBoard[i][j - 2] = this.gameBoard[i][j - 3];
                this.gameBoard[i][j - 3] = 0;
                this.score += 0;
              } else if (
                j > 2 &&
                this.gameBoard[i][j] === 0 &&
                this.gameBoard[i][j - 1] === 0 &&
                this.gameBoard[i][j - 2] === 0 &&
                this.gameBoard[i][j - 3] !== 0
              ) {
                this.gameBoard[i][j] = this.gameBoard[i][j - 3];
                this.gameBoard[i][j - 3] = 0;
                this.score += 0;
              }
            }
          }
          break;
        }
        case "ArrowUp": {
          for (i = 0; i < 3; i++) {
            for (j = 0; j < 3; j++) {
              if (this.gameBoard[i][j] === 0 && this.gameBoard[i + 1][j] !== 0) {
                this.gameBoard[i][j] = this.gameBoard[i + 1][j];
                this.gameBoard[i + 1][j] = 0;
                this.score += 0;
              } else if (
                i < 2 && // look at this
                this.gameBoard[i + 1][j] === 0 &&
                this.gameBoard[i + 2][j] !== 0
              ) {
                this.gameBoard[i + 1][j] = this.gameBoard[i + 2][j];
                this.gameBoard[i + 2][j] = 0;
                this.score += 0;
              } else if (
                i < 1 &&
                this.gameBoard[i + 2][j] === 0 &&
                this.gameBoard[i + 3][j] !== 0
              ) {
                this.gameBoard[i + 2][j] = this.gameBoard[i + 3][j];
                this.gameBoard[i + 3][j] = 0;
                this.score += 0;
              } else if (
                i < 1 &&
                this.gameBoard[i][j] === 0 &&
                this.gameBoard[i + 1][j] === 0 &&
                this.gameBoard[i + 2][j] === 0 &&
                this.gameBoard[i + 3][j] !== 0
              ) {
                this.gameBoard[i][j] = this.gameBoard[i + 3][j];
                this.gameBoard[i + 3][j] = 0;
                this.score += 0;
              }
            }
          }
          break;
        }
        case "ArrowDown": {
          for (i = 3; i > 0; i--) {
            for (j = 3; j > 0; j--) {
              if (this.gameBoard[i][j] === 0 && this.gameBoard[i - 1][j] !== 0) {
                this.gameBoard[i][j] = this.gameBoard[i - 1][j];
                this.gameBoard[i - 1][j] = 0;
                this.score += 0;
              } else if (
                i > 1 &&
                this.gameBoard[i - 1][j] === 0 &&
                this.gameBoard[i - 2][j] !== 0
              ) {
                this.gameBoard[i - 1][j] = this.gameBoard[i - 2][j];
                this.gameBoard[i - 2][j] = 0;
                this.score += 0;
              } else if (
                i > 2 &&
                this.gameBoard[i - 2][j] === 0 &&
                this.gameBoard[i - 3][j] !== 0
              ) {
                this.gameBoard[i - 2][j] = this.gameBoard[i - 3][j];
                this.gameBoard[i - 3][j] = 0;
                this.score += 0;
              } else if (
                i > 2 &&
                this.gameBoard[i][j] === 0 &&
                this.gameBoard[i - 1][j] === 0 &&
                this.gameBoard[i - 2][j] === 0 &&
                this.gameBoard[i - 3][j] !== 0
              ) {
                this.gameBoard[i][j] = this.gameBoard[i - 3][j];
                this.gameBoard[i - 3][j] = 0;
                this.score += 0;
              }
            }
          }
          break;
        }
      }
      this.populateBoard();
    },
  },
};
</script>

<style scoped>
.table {
  font-size: 40px;
}
.top-scores {
  font-size: 20px;
}
.your-best {
  font-size: 20px;
}
.games-played {
  font-size: 20px;
}
</style>
