import React, { useState, useEffect } from 'react';
import backgroundvideo from './Assets/vid.mp4'
import './App.css';



const Minesweeper = () => {
  const [gridSize, setGridSize] = useState(9);
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState([]);
  const [cellRevealed, SetCellRevealed] = useState([]);
  const [timer, setTimer] = useState(0);
  const [score, setScore] = useState(0);
  const [scoreboard, setscoreboard] = useState([]);

  // TIMER(EN SECONDES)
  useEffect(() => {
    if (gameStarted) {
      const intervalId = setInterval(() => {
        setTimer((prevTimer) => prevTimer + 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [gameStarted]);


   // DEFINITION DE LA GRILLE
   const GridSizeChange = (event) => {
    setGridSize(event.target.value);
  };

  // LOCALSTORAGE
  useEffect(() => {
    const scoresLS = JSON.parse(localStorage.getItem('scoreboard'));
    if (scoresLS) {
      setscoreboard(scoresLS);
    }
  }, []);

 

  // LANCER LA GAME
  const startGame = () => {
    // GENERER BOARD
    const board = Array.from({ length: gridSize }, (_, rowIndex) =>
      Array.from({ length: gridSize }, (_, colIndex) => {
        const randomNum = Math.random();
        return randomNum < 0.15 ? 'mine' : null;
      })
    );

    setGrid(board);
    SetCellRevealed(Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => false)));
    setGameStarted(true);
  };

  // DEMANDER PSEUDO SI VICTOIRE DU JOUEUR
  const winnerNickname = () => {
    const nickname_input = prompt("Bravo, vous avez gagné ! Entrez votre nom pour enregistrer votre score :");
    return nickname_input
  };

  // VICTOIRE
  const Win = (score) => {
    const nickname = winnerNickname()
    const newScore = score + 1;
    const newPlayer = { name: nickname, score: newScore };
    const newscoreboard = [...scoreboard, newPlayer].sort((a, b) => b.score - a.score).slice(0, 30);
    setscoreboard(newscoreboard);
    setScore(newScore);
    localStorage.setItem('scoreboard', JSON.stringify(newscoreboard));
  }

  // CHECK VICTOIRE=VRAI
  const checkWin = (grid, cellRevealed) => {
    let win = true;

    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      for (let colIndex = 0; colIndex < grid[0].length; colIndex++) {
        if (grid[rowIndex][colIndex] !== 'mine' && !cellRevealed[rowIndex][colIndex]) {
          win = false;
          break;
        }
      }
    }

    if (win) {
      Win(score);
      return;
    }
  }

  // REVEAL DES CASES ADJACENTES
  const neighborCells = (grid, cellRevealed, rowIndex, colIndex) => {
    let count = 0;
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [rowDiff, colDiff] of directions) {
      const newRowIndex = rowIndex + rowDiff;
      const newColIndex = colIndex + colDiff;
      if (
        newRowIndex >= 0 &&
        newRowIndex < grid.length &&
        newColIndex >= 0 &&
        newColIndex < grid[0].length
      ) {
        if (grid[newRowIndex][newColIndex] === 'mine') {
          count++;
        }
      }
    }

    const newcellRevealed = [...cellRevealed];
    newcellRevealed[rowIndex][colIndex] = true;
    SetCellRevealed(newcellRevealed);

    if (count === 0) {
      for (const [rowDiff, colDiff] of directions) {
        const newRowIndex = rowIndex + rowDiff;
        const newColIndex = colIndex + colDiff;
        if (
          newRowIndex >= 0 &&
          newRowIndex < grid.length &&
          newColIndex >= 0 &&
          newColIndex < grid[0].length &&
          !cellRevealed[newRowIndex][newColIndex]
        ) {
          neighborCells(grid, newcellRevealed, newRowIndex, newColIndex);
        }
      }
    }
  };

  // VERIFICATION DES MINES PROCHES
  function getNeighborMines(grid, rowIndex, colIndex) {
    let count = 0;
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [rowDiff, colDiff] of directions) {
      const newRowIndex = rowIndex + rowDiff;
      const newColIndex = colIndex + colDiff;
      if (
        newRowIndex >= 0 &&
        newRowIndex < grid.length &&
        newColIndex >= 0 &&
        newColIndex < grid[0].length
      ) {
        if (grid[newRowIndex][newColIndex] === 'mine') {
          count++;
        }
      }
    }
    return count;
  }

  // CLIC SUR UNE CASE
  const cellClick = (rowIndex, colIndex) => {
    if (cellRevealed[rowIndex][colIndex]) {
      // CASE REVELEE 
      return;
    }

    if (grid[rowIndex][colIndex] === 'mine') {
      // MIINE TROUVEE FIN DE LA GAME
      alert("Perdu ! Vous avez trouvé une bombe !");
      // AFFIICHAGE DE TOUTES LES MINES
      SetCellRevealed(Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => true)));
    } else {
      // LA GAME CONTINUE
      neighborCells(grid, cellRevealed, rowIndex, colIndex);
      checkWin(grid, cellRevealed);
      setScore(score + getNeighborMines(grid, rowIndex, colIndex));
    }
  };

  // DRAPEAU CLIC DROIT
  const handleRightClick = (e, rowIndex, colIndex) => {
    const newcellRevealed = [...cellRevealed];
    if (newcellRevealed[rowIndex][colIndex] === 'flag') {
      newcellRevealed[rowIndex][colIndex] = false;
    } else {
      newcellRevealed[rowIndex][colIndex] = 'flag';
    }
    SetCellRevealed(newcellRevealed);
    e.preventDefault();
    return false;
  };

  // REJOUER
  const replay = () => {
    setGameStarted(false);
    setGridSize(9);
    setTimer(0);
    setScore(0)
  };

  return (
    <div>
      <video id="video" src={backgroundvideo} autoPlay loop muted />
      <div id='main'>
        
        <h1>Démineur</h1>
        {!gameStarted && (
          <div>
            {/* SELECTION DU NIVEAU DE DIFFICULTE */}
            <select class="button" id="grid-size-select" onChange={GridSizeChange}>
              <option value={9}>Débutant : 9x9</option>
              <option value={16}>Intermédiaire : 16x16</option>
              <option value={22}>Expert : 22x22</option>
              <option value={30}>Maître : 30x30</option>
            </select>
            <div>
              {/* BOUTON NOUVELLE PARTIE */}
              <button class="button" id="Start-button" onClick={startGame}>Nouvelle Partie</button>
            </div>
          </div>
        )}
        {gameStarted && (
          <div>
            {/* AFFICHAGE DU TEMPS ECOULE */}
            <h2 id="style">Chrono: {timer} secondes</h2>
            
            <table>
              <tbody>
                {grid.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, colIndex) => (
                      <td key={colIndex}>
                        {/* CLIC SUR UNE CELLULE */}
                        <button id='cell' onClick={() => cellClick(rowIndex, colIndex)} onContextMenu={(e) => handleRightClick(e, rowIndex, colIndex)}>
                          {cellRevealed[rowIndex][colIndex] === 'flag' ? ' ⚑ ' : cellRevealed[rowIndex][colIndex] ? (cell === 'mine' ? "💣" : getNeighborMines(grid, rowIndex, colIndex)) : ' '}
                        </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <h2 id="style">Score: {score}</h2>
            {/* BOUTON REJOUER */}
            <button class="button" onClick={replay}>Rejouer</button>
          </div>
        )}
        <div id='footer'>
        <h2 id="Score-titre">Tableau des Scores</h2>
        {scoreboard.length > 0 ? (
          <table id="table-score">
            <thead>
              <tr>
                <th id="Score">N° |</th>
                <th id="Score">Pseudo |</th>
                <th id="Score">Score</th>
              </tr>
            </thead>
            <tbody>
              {scoreboard.map((player, index) => (
                <tr key={index} id="tr-stat">
                  <td id="Score-stat">{index + 1}</td>
                  <td id="Score-stat">{player.name}</td>
                  <td id="Score-stat">{player.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <></>
        )}
      </div>

        </div>
        

    </div>
    
  );
};

export default Minesweeper;