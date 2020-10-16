var N_SIZE = 3,
  EMPTY = '&nbsp;',
  boxes = [],
  score,
  moves;

/**
 * Initializes the Tic Tac Toe board and starts the game.
 */
function init() {
  var board = document.createElement('table');
  board.setAttribute('border', 1);
  board.setAttribute('cellspacing', 0);

  var identifier = 1;
  for (var i = 0; i < N_SIZE; i++) {
    var row = document.createElement('tr');
    board.appendChild(row);
    for (var j = 0; j < N_SIZE; j++) {
      var cell = document.createElement('td');
      cell.setAttribute('height', 360/N_SIZE);
      cell.setAttribute('width', 360/N_SIZE);
      cell.setAttribute('align', 'center');
      cell.setAttribute('valign', 'center');
	  cell.setAttribute('id', 'button_' + i + j);
      cell.classList.add('tile');
      if (i == j) {
        cell.classList.add('diagonal0');
      }
      if (j == N_SIZE - i - 1) {
        cell.classList.add('diagonal1');
      }
      row.appendChild(cell);
      boxes.push(cell);
    }
  }
  document.getElementById('tictactoe').appendChild(board);
}