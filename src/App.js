/* eslint-disable jsx-a11y/alt-text */
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlphaBetaAI, D0PieceProfitAI, D1PieceProfitAI, D2PieceProfitAI, MCTS, MiniMaxAI, RandomAI } from "scripts/AI";
import { Board, TeamType } from "scripts/chess";
import JsxUtil from "utils/JsxUtil";

const AI_LIST = {
  "Random AI": RandomAI,
  "D0 Piece Profit AI": D0PieceProfitAI,
  "D1 Piece Profit AI": D1PieceProfitAI,
  // "D2 Piece Profit AI": D2PieceProfitAI,
  "Minimax AI": MiniMaxAI,
  "Minimax AI (Alpha-Beta Pruning)": AlphaBetaAI,
  "MCTS AI": MCTS,
  Player: null,
};

let userWaiter = null;

function App() {
  const board = useMemo(() => {
    return new Board();
  }, []);

  const turn = useMemo(() => board.notations.length, [board.notations.length]);

  const [currentTurn, setCurrentTurn] = useState(TeamType.WHITE);
  const [autoMode, setAutoMode] = useState(false);
  const [movedFrom, setMovedFrom] = useState(null);
  const [movedTo, setMovedTo] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);

  const [targetHandlePos, setTargetHandlePos] = useState(null);
  const [userHandlePiece, setUserHandlePiece] = useState(null);
  const [userMove, setUserMove] = useState(null);

  const settingDone = useMemo(() => {
    return turn > 0;
  }, [turn]);

  const [blackAI, setBlackAI] = useState(null);
  const [whiteAI, setWhiteAI] = useState(null);

  const [whiteAdvantageMap, setWhiteAdvantageMap] = useState(null);
  const [blackAdvantageMap, setBlackAdvantageMap] = useState(null);

  const blackPieceValue = useMemo(() => board.getTeamPieceValue(TeamType.BLACK));
  const whitePieceValue = useMemo(() => board.getTeamPieceValue(TeamType.WHITE));

  const isPlayerTurn = useMemo(() => {
    return (currentTurn === TeamType.WHITE ? whiteAI : blackAI) == null;
  }, [currentTurn, whiteAI, blackAI]);

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const resetBoard = useCallback(() => {
    board.reset();
    setMovedFrom(null);
    setMovedTo(null);
    setCurrentTurn(TeamType.WHITE);
    setGameOver(false);
    setAutoMode(false);
    setResult(null);
    setUserHandlePiece(null);
    setUserMove(null);
    setTargetHandlePos(null);
    forceUpdate();
  }, [board, forceUpdate]);

  const waitForPlayerInput = useCallback(async () => {
    return new Promise((resolve) => {
      clearInterval(userWaiter);
      userWaiter = setInterval(() => {
        // console.log("capturing userMove", userMove);
        if (whiteAI != null && blackAI != null) {
          clearInterval(userWaiter);
          return;
        }
        if (userMove != null) {
          resolve(userMove);
          setUserMove(null);
          clearInterval(userWaiter);
          return;
        }
      }, 100);
    });
  }, [userMove, whiteAI, blackAI]);

  const doNextTurn = useCallback(async () => {
    if (gameOver) return;

    const currentTeamAI = currentTurn === TeamType.WHITE ? whiteAI : blackAI;
    let move = null;
    if (currentTeamAI == null) {
      // wait for player input
      move = await waitForPlayerInput();
    } else {
      console.log(`${currentTeamAI.name} is calculating...`);
      const result = currentTeamAI.getMove(board, currentTurn);
      console.log(`${currentTeamAI.name} calculated!`);
      const { move: aiMove, moves } = result;
      move = aiMove;

      const map = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));
      moves.forEach((m) => {
        const { x, y, profit } = m;
        map[x] = map[x] ?? [];
        if (map[x][y] != null) map[x][y] = Math.max(map[x][y], profit);
        map[x][y] = profit;
      });
      if (currentTurn === TeamType.WHITE) {
        setWhiteAdvantageMap(map);
      } else {
        setBlackAdvantageMap(map);
      }
    }
    const beforeX = move.ox;
    const beforeY = move.oy;
    const note = board.movePiece(move);

    setMovedFrom({ x: beforeX, y: beforeY });
    setMovedTo({ x: move.x, y: move.y });

    const gameOverResult = board.isGameOver();
    if (gameOverResult != null) {
      console.log(`Game over! ${gameOverResult.team} wins!`);
      console.log(board.notations);

      setResult(gameOverResult);
      setGameOver(true);
      setAutoMode(false);
      return;
    }
    setCurrentTurn((prev) => (prev === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE));
    forceUpdate();
  }, [blackAI, board, currentTurn, forceUpdate, gameOver, waitForPlayerInput, whiteAI]);

  const onBlackAISelect = useCallback((e) => {
    const cln = e.target.value;
    if (cln === "Player") {
      setBlackAI(null);
      return;
    }
    const cl = new AI_LIST[cln]();
    setBlackAI(cl);
  }, []);

  const onWhiteAISelect = useCallback((e) => {
    const cln = e.target.value;
    if (cln === "Player") {
      setWhiteAI(null);
      return;
    }
    const cl = new AI_LIST[cln]();
    setWhiteAI(cl);
  }, []);

  const onNoteApply = (note) => {
    const { notation, payload, move } = note;
    board.importPayload(payload);
    const moveTeam = board.getPiece(move.x, move.y).team;
    setCurrentTurn(moveTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE);
    setMovedFrom({ x: move.ox, y: move.oy });
    setMovedTo({ x: move.x, y: move.y });
    forceUpdate();
  };

  useEffect(() => {
    const isPlayerExist = whiteAI == null || blackAI == null;
    if (autoMode && !gameOver && !isPlayerExist) {
      const t = setInterval(() => {
        doNextTurn();
      }, 500);

      return () => {
        clearInterval(t);
      };
    }
  }, [autoMode, gameOver, doNextTurn, isPlayerTurn, whiteAI, blackAI]);

  useEffect(() => {
    if (autoMode) return;
    if (whiteAI != null && blackAI != null) return;
    const currentAI = currentTurn === TeamType.WHITE ? whiteAI : blackAI;
    if (currentAI == null) {
      doNextTurn();
    } else if (settingDone) {
      setTimeout(() => {
        doNextTurn();
      }, 500);
    }
  }, [board, currentTurn, forceUpdate, settingDone, whiteAI, blackAI, doNextTurn, autoMode]);

  // console.log(whiteAI, blackAI, isPlayerTurn);

  return (
    <div className="app">
      <div className="main-board">
        <div className="title">
          Turn {turn} ({currentTurn})
        </div>
        <div className="description">
          {result != null ? `${result.team} WIN! (${result.reason})` : `waiting ${currentTurn.toLowerCase()}`}
        </div>
        <div className="board-wrapper">
          <div className="board">
            {board.board.map((row, i) => (
              <div key={i} className="row">
                {row.map((piece, j) => {
                  const isDark = (i + j) % 2 === 1;
                  const beforePos = movedFrom != null && movedFrom.x === i && movedFrom.y === j;
                  const afterPos = movedTo != null && movedTo.x === i && movedTo.y === j;
                  const isPlayerTurn = (currentTurn === TeamType.WHITE ? whiteAI : blackAI) == null;
                  const isTargetable = userHandlePiece != null && userHandlePiece.movable(board, i, j, true);
                  const moving = userHandlePiece != null && userHandlePiece.x === i && userHandlePiece.y === j;
                  const targeting = targetHandlePos != null && targetHandlePos.x === i && targetHandlePos.y === j;
                  const targetExists = board.getPiece(i, j) != null;

                  return (
                    <div
                      key={j}
                      className={
                        "square" +
                        JsxUtil.classByCondition(isDark, "black") +
                        JsxUtil.classByCondition(beforePos && userHandlePiece == null, "before") +
                        JsxUtil.classByCondition(afterPos && userHandlePiece == null, "after") +
                        JsxUtil.classByCondition(moving, "moving") +
                        JsxUtil.classByCondition(targeting, "targeting")
                      }
                      onDragOver={(e) => {
                        e.preventDefault();
                        // cursor: pointer;
                        if (isTargetable) {
                          e.dataTransfer.dropEffect = "move";
                          setTargetHandlePos({ x: i, y: j });
                        } else {
                          e.dataTransfer.dropEffect = "none";
                          setTargetHandlePos(null);
                        }
                      }}
                      onDrop={(e) => {
                        if (!isTargetable) {
                          console.log("not targetable", i, j);
                          return;
                        }
                        setUserMove({ ox: userHandlePiece.x, oy: userHandlePiece.y, x: i, y: j });
                        console.log("dropped", i, j);
                      }}
                    >
                      {j === 0 && <div className="y-label label">{8 - i}</div>}
                      {i === 7 && <div className="x-label label">{String.fromCharCode(65 + j)}</div>}
                      {piece == null ? (
                        <></>
                      ) : (
                        <div
                          className="piece"
                          draggable={piece != null && piece.team === currentTurn && isPlayerTurn}
                          onDragStart={(e) => {
                            e.dataTransfer.effectAllowed = "move";
                            setUserHandlePiece(piece);
                          }}
                          onDragEnd={(e) => {
                            setUserHandlePiece(null);
                            setTargetHandlePos(null);
                          }}
                        >
                          <img
                            src={`/img/chess/Chess_${piece.getChar()}${
                              piece.team === TeamType.BLACK ? "d" : "l"
                            }t45.svg`}
                          ></img>
                        </div>
                      )}
                      {isTargetable && (
                        <div
                          className={"targetable-overlay" + JsxUtil.classByCondition(targetExists, "killable")}
                        ></div>
                      )}
                      <div className="advantages">
                        <div className="advantage white">{whiteAdvantageMap?.[i]?.[j] ?? "-"}</div>
                        <div className="advantage black">{blackAdvantageMap?.[i]?.[j] ?? "-"}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <div className="status">
          <div className="piece-value">
            <div
              className="black"
              style={{ width: `${(blackPieceValue * 100) / (blackPieceValue + whitePieceValue)}%` }}
            >
              {blackPieceValue}
            </div>
            <div className="white">{whitePieceValue}</div>
          </div>
        </div>
      </div>
      <div className="controls">
        <div className="control">
          <button onClick={resetBoard}>Reset</button>
          <button
            onClick={() => {
              setAutoMode((prev) => !prev);
            }}
            disabled={gameOver || whiteAI == null || blackAI == null}
          >
            {autoMode ? "Auto Stop" : "Auto Start"}
          </button>
          <button
            onClick={doNextTurn}
            disabled={gameOver || (settingDone ? whiteAI == null || blackAI == null : whiteAI == null)}
          >
            Next Turn
          </button>
        </div>
        <div className="teams">
          <div className="team">
            <div className="title">White</div>
            <div className="ai">
              <select onChange={onWhiteAISelect} disabled={settingDone} defaultValue={"Player"}>
                {Object.keys(AI_LIST).map((ai, i) => (
                  <option key={i}>{ai}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="team">
            <div className="title">Black</div>
            <div className="ai">
              <select onChange={onBlackAISelect} disabled={settingDone} defaultValue={"Player"}>
                {Object.keys(AI_LIST).map((ai, i) => (
                  <option key={i}>{ai}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="notations">
          <div className="title">Notations</div>
          <div className="list">
            <div className="header row">
              <div className="turn col">Turn</div>
              <div className="white col">White</div>
              <div className="black col">Black</div>
            </div>
            {board.notations.length > 0 &&
              Array(Math.floor((board.notations.length + 1) / 2))
                .fill(null)
                .map((_, i) => {
                  const whiteNote = board.notations[2 * i] ?? null;
                  const blackNote = board.notations[2 * i + 1] ?? null;
                  return (
                    <div key={i} className="row">
                      <div className="turn col">{i + 1}</div>
                      <div className="white col" onClick={(e) => onNoteApply(whiteNote)}>
                        {whiteNote.notation}
                      </div>
                      <div className="black col" onClick={(e) => blackNote != null && onNoteApply(blackNote)}>
                        {blackNote?.notation ?? null}
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
