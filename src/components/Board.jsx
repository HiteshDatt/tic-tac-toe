/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useRef, useEffect } from "react";
import { socket } from "../socket";

export default function Board({ roomID, setIsConnected }) {
  const [board, setBoard] = useState([
    ["", "", ""],
    ["", "", ""],
    ["", "", ""],
  ]);
  const [boardUpdated, setBoardUpdated] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [boardLocked, setBoardLocked] = useState(true);
  const [alertMsg, setAlertMsg] = useState("");
  const [boardReset, setBoardReset] = useState(false);
  let Player1 = useRef(true);

  const playAttempted = ({ columnIndex, rowIndex }) => {
    if (boardLocked) {
      setAlertMsg("NOT YOUR TURN!");
    } else {
      if (board[columnIndex][rowIndex] === "") {
        socket.emit("played", { columnIndex, rowIndex, roomID });
      }
    }
  };

  const played = ({ columnIndex, rowIndex }) => {
    if (board[columnIndex][rowIndex] === "") {
      Player1.current = !Player1.current;
      setBoard((prev) => {
        const updatedBoard = [...[...prev]];
        updatedBoard[columnIndex][rowIndex] = Player1.current ? "O" : "X";
        return updatedBoard;
      });
      setBoardUpdated((prev) => !prev);
    }
  };

  useEffect(() => {
    const checkForWin = () => {
      const diagonal1 = {
        X: 0,
        O: 0,
      };

      const diagonal2 = {
        X: 0,
        O: 0,
      };

      let columns = {
        X: [0, 0, 0],
        O: [],
      };

      for (let i = 0; i < board.length; i++) {
        let row = {
          X: 0,
          O: 0,
        };
        for (let j = 0; j < board[i].length; j++) {
          // diagonal 1
          if (i === j) {
            if (board[i][j] === "X") {
              diagonal1["X"]++;
            } else if (board[i][j] === "O") {
              diagonal1["O"]++;
            }
          }
          if (diagonal1["X"] === 3) {
            showWinner("X WINS by digonal1");
          }
          if (diagonal1["O"] === 3) {
            showWinner("O WINS by digonal1");
          }

          // diagonal 2
          if (i + j === board.length - 1) {
            if (board[i][j] === "X") {
              diagonal2["X"]++;
            } else if (board[i][j] === "O") {
              diagonal2["O"]++;
            }
          }
          if (diagonal2["X"] === 3) {
            showWinner("X WINS by digonal2");
          }
          if (diagonal2["O"] === 3) {
            showWinner("O WINS by digonal2");
          }

          // row
          if (board[i][j] === "X") {
            row["X"]++;
          }
          if (board[i][j] === "O") {
            row["O"]++;
          }
          if (row["X"] === 3) {
            showWinner("X WINS by row");
          }
          if (row["O"] === 3) {
            showWinner("O WINS by row");
          }

          //columns
          if (typeof columns["X"][j] === "undefined") {
            columns["X"][j] = 0;
          } else if (typeof columns["O"][j] === "undefined") {
            columns["O"][j] = 0;
          }

          if (board[i][j] === "X" && typeof columns["X"][j] === "number") {
            columns["X"][j]++;
          }
          if (board[i][j] === "O" && typeof columns["O"][j] === "number") {
            columns["O"][j]++;
          }
          if (columns["X"][j] === 3) {
            showWinner("X WINS by column");
          }
          if (columns["O"][j] === 3) {
            showWinner("O WINS by column");
          }
        }
      }
    };

    checkForWin();
  }, [boardUpdated]);

  const onPlayed = ({ columnIndex, rowIndex }) => {
    played({ columnIndex, rowIndex });
    setBoardLocked(true);
  };

  const onStartGame = () => {
    setGameStarted(true);
    setIsConnected(true);
  };

  const onYourTurn = () => {
    setBoardLocked(false);
  };

  useEffect(() => {
    socket.on("played", onPlayed);
    socket.on("start-game", onStartGame);
    socket.on("your-turn", onYourTurn);

    return () => {
      socket.off("played", onPlayed);
      socket.off("start-game", onStartGame);
      socket.off("your-turn", onYourTurn);
    };
  }, [boardReset]);

  const resetGame = () => {
    setBoard([
      ["", "", ""],
      ["", "", ""],
      ["", "", ""],
    ]);
    Player1.current = true;
    setBoardReset((prev) => !prev);
  };

  const showWinner = (winnerMsg) => {
    setAlertMsg(winnerMsg);
    resetGame();
  };

  return (
    <>
      <div
        className="Board"
        style={{ pointerEvents: alertMsg ? "none" : "auto" }}
      >
        {gameStarted ? (
          <>
            {board.map((column, columnIndex) => {
              return (
                <div
                  key={columnIndex}
                  style={{ display: "flex", fontSize: "40px", margin: "auto" }}
                >
                  {column.map((row, rowIndex) => {
                    return (
                      <div
                        key={rowIndex}
                        style={{
                          border: "1px solid black",
                          width: "50px",
                          height: "50px",
                        }}
                        onClick={() => playAttempted({ columnIndex, rowIndex })}
                      >
                        {row}
                      </div>
                    );
                  })}
                </div>
              );
            })}

            <p>{boardLocked ? "Other Player's turn" : "Your turn"}</p>
          </>
        ) : (
          <>Waiting for players to join...</>
        )}
      </div>
      <dialog open={alertMsg ? true : false}>
        <p>{alertMsg}</p>
        <div
          style={{
            background: "white",
            color: "black",
            fontWeight: 700,
            cursor: "pointer",
          }}
          onClick={() => setAlertMsg("")}
        >
          OK
        </div>
      </dialog>
    </>
  );
}
