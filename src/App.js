/* eslint-disable jsx-a11y/alt-text */
import { useCallback, useEffect, useMemo, useState } from "react";
import AlphaBetaAI from "scripts/ai/AlphaBetaAI";
import D0PieceProfitAI from "scripts/ai/D0PieceProfitAI";
import { D1PieceProfitAI } from "scripts/ai/D1PieceProfitAI";
import MCTS from "scripts/ai/MCTSAI";
import MiniMaxAI from "scripts/ai/MiniMaxAI";
import QLearningAI from "scripts/ai/QLearningAI";
import RandomAI from "scripts/ai/RandomAI";
import Board from "scripts/chess/board";
import { getMinMaxSumOfMoves, normalizeMoves } from "scripts/chess/objects";
import { PieceType, TeamType, getOpponentTeam } from "scripts/chess/types";
import JsxUtil from "utils/JsxUtil";

const AI_LIST = {
  Player: null,
  "Random AI": RandomAI,
  "D0 Piece Profit AI": D0PieceProfitAI,
  "D1 Piece Profit AI": D1PieceProfitAI,
  // "D2 Piece Profit AI": D2PieceProfitAI,
  "Minimax AI": MiniMaxAI,
  "Minimax AI (Alpha-Beta Pruning)": AlphaBetaAI,
  "MCTS AI": MCTS,
  "QLearning AI": QLearningAI,
};

const board = new Board();

function App() {
  const turn = board.notations.length;
  const blackPieceValue = board.getTeamPieceValue(TeamType.BLACK);
  const whitePieceValue = board.getTeamPieceValue(TeamType.WHITE);
  const isBlackKingThreatened = board.isKingThreatened(TeamType.BLACK);
  const isWhiteKingThreatened = board.isKingThreatened(TeamType.WHITE);

  const [aiCalculating, setAICalculating] = useState(false);
  const [rotated, setRotated] = useState(false);

  const [blackAI, setBlackAI] = useState(null);
  const [whiteAI, setWhiteAI] = useState(null);

  const isPlayerTurn = (board.turn === TeamType.WHITE ? whiteAI : blackAI) == null;

  const [autoMode, setAutoMode] = useState(false);
  const [movedFrom, setMovedFrom] = useState(null);
  const [movedTo, setMovedTo] = useState(null);
  const [gameOver, setGameOver] = useState(false);
  const [result, setResult] = useState(null);

  const [targetHandlePos, setTargetHandlePos] = useState(null);
  const [userHandlePiece, setUserHandlePiece] = useState(null);
  const [userMove, setUserMove] = useState(null);

  const settingDone = useMemo(() => turn > 0, [turn]);

  const [blackAdvantageMap, setBlackAdvantageMap] = useState(null);
  const [whiteAdvantageMap, setWhiteAdvantageMap] = useState(null);

  const [hovering, setHovering] = useState(null);

  const [, updateState] = useState();
  const forceUpdate = useCallback(() => updateState({}), []);

  const resetBoard = useCallback(() => {
    board.reset();
    setMovedFrom(null);
    setMovedTo(null);
    setGameOver(false);
    setAutoMode(false);
    setResult(null);
    setUserHandlePiece(null);
    setUserMove(null);
    setTargetHandlePos(null);
    setRotated(false);
    setBlackAdvantageMap(null);
    setWhiteAdvantageMap(null);
    forceUpdate();
  }, [forceUpdate]);

  const doNextTurn = useCallback(
    async (def = { move: null }) => {
      if (gameOver) return;

      const currentTurn = board.turn;
      const currentTeamAI = currentTurn === TeamType.WHITE ? whiteAI : blackAI;
      console.log(`Now turn: ${currentTurn} (${currentTeamAI?.name ?? `Player`})`);
      let move = null;
      if (currentTeamAI == null) {
        if (def.move == null) {
          console.log("userMove is null");
          return;
        }
        // wait for player input
        // console.log("waiting for player input...");
        console.log("received user move", def.move);
        move = def.move;
      } else {
        if (def.move != null) {
          console.log("userMove is not null");
          return;
        }
        setAICalculating(true);
        console.log(`${currentTeamAI.name} is calculating...`);
        const result = currentTeamAI.getMove(board, board.turn);
        console.log(`${currentTeamAI.name} calculated!`);
        const { move: aiMove, moves } = result;
        move = aiMove;

        const map = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null));
        const oppMap = Array(8)
          .fill(null)
          .map(() => Array(8).fill(null));

        const normalizedMoves = normalizeMoves(moves);
        const oppMoves = move.oppMoves ?? [];
        const oppNormalizedMoves = normalizeMoves(oppMoves);

        normalizedMoves.forEach((m) => {
          const { ox, oy, x, y, profit, nProfit, optimal } = m;
          map[x] = map[x] ?? [];
          const original = map[x][y];
          if (original == null) {
            map[x][y] = { type: board.getPiece(ox, oy)?.getChar(), profit, optimal };
          } else if (original.profit < profit) {
            map[x][y] = { type: board.getPiece(ox, oy)?.getChar(), profit, optimal };
          }
        });

        oppNormalizedMoves.forEach((m) => {
          const { ox, oy, x, y, profit, nProfit, optimal } = m;
          oppMap[x] = oppMap[x] ?? [];
          const original = oppMap[x][y];
          if (original == null) {
            oppMap[x][y] = { type: board.getPiece(ox, oy)?.getChar(), profit, optimal };
          } else if (original.profit < profit) {
            oppMap[x][y] = { type: board.getPiece(ox, oy)?.getChar(), profit, optimal };
          }
        });

        if (currentTurn === TeamType.WHITE) {
          setWhiteAdvantageMap(map);
          setBlackAdvantageMap(oppMap);
        } else {
          setBlackAdvantageMap(map);
          setWhiteAdvantageMap(oppMap);
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
    },
    [blackAI, gameOver, whiteAI]
  );

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
    setMovedFrom({ x: move.ox, y: move.oy });
    setMovedTo({ x: move.x, y: move.y });
    forceUpdate();
  };

  const onChange = useCallback(
    async (nextTurn) => {
      setAICalculating(false);
      if (gameOver) return;
      if (!!whiteAI && !!blackAI) {
        if (!autoMode) return;
        console.log(autoMode);
        setTimeout(() => {
          console.log("Next AI turn start (Bot vs Bot)");
          doNextTurn();
        }, 500);
      } else {
        // player exists
        const nextAI = nextTurn === TeamType.WHITE ? whiteAI : blackAI;
        if (nextAI != null) {
          // AI turn
          setTimeout(() => {
            console.log("Next AI Turn Start");
            doNextTurn();
          }, 500);
        }
      }
    },
    [gameOver, whiteAI, blackAI, autoMode, doNextTurn]
  );

  useEffect(() => {
    board.onChangeCallback((...args) => {
      forceUpdate();
      onChange(...args);
    });
  }, [forceUpdate, onChange]);

  useEffect(() => {
    let userWaiter = setInterval(() => {
      if (whiteAI != null && blackAI != null) return;
      // console.log("capturing userMove", userMove);
      if (userMove != null) {
        setUserMove(null);
        doNextTurn({ move: userMove });
        return;
      }
    }, 100);

    return () => {
      clearInterval(userWaiter);
    };
  }, [blackAI, whiteAI, userMove, doNextTurn]);

  useEffect(() => {
    return () => {
      resetBoard();
    };
  }, [resetBoard]);

  useEffect(() => {
    forceUpdate();
    console.log(hovering);
  }, [hovering]);

  return (
    <div className="app">
      <div className="main-board">
        <div className="title">
          Turn {turn} ({board?.turn})
        </div>
        <div className="description">
          {result != null ? `${result.team} WIN! (${result.reason})` : `waiting ${board.turn.toLowerCase()}`}
        </div>
        <div className="board-wrapper">
          <div className={"board" + JsxUtil.classByCondition(rotated, "rotated")}>
            {board.board.map((row, i) => (
              <div key={i} className="row">
                {row.map((piece, j) => {
                  const isDark = (i + j) % 2 === 1;
                  const beforePos = movedFrom != null && movedFrom.x === i && movedFrom.y === j;
                  const afterPos = movedTo != null && movedTo.x === i && movedTo.y === j;

                  const isTargetable = userHandlePiece != null && userHandlePiece.movable(board, i, j, true);
                  const moving = userHandlePiece != null && userHandlePiece.x === i && userHandlePiece.y === j;
                  const targeting = targetHandlePos != null && targetHandlePos.x === i && targetHandlePos.y === j;
                  const targetExists = board.getPiece(i, j) != null;
                  const isThreatened =
                    piece?.type === PieceType.KING &&
                    (piece.team === TeamType.WHITE ? isWhiteKingThreatened : isBlackKingThreatened);

                  const whiteProfit = whiteAdvantageMap?.[i]?.[j]?.profit ?? null;
                  const whiteOptimal = whiteAdvantageMap?.[i]?.[j]?.optimal ?? false;
                  const blackProfit = blackAdvantageMap?.[i]?.[j]?.profit ?? null;
                  const blackOptimal = blackAdvantageMap?.[i]?.[j]?.optimal ?? false;

                  const yLabelHovered = hovering?.i === i;
                  const xLabelHovered = hovering?.j === j;

                  return (
                    <div
                      key={j}
                      className={
                        "square" +
                        JsxUtil.classByCondition(isDark, "black") +
                        JsxUtil.classByCondition(beforePos && userHandlePiece == null, "before") +
                        JsxUtil.classByCondition(afterPos && userHandlePiece == null, "after") +
                        JsxUtil.classByCondition(moving, "moving") +
                        JsxUtil.classByCondition(targeting, "targeting") +
                        JsxUtil.classByCondition(isThreatened, "threatened")
                      }
                      onMouseEnter={(e) => setHovering({ i, j })}
                      onMouseLeave={(e) => setHovering(null)}
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
                        console.log(`player ${board.turn} moved`, i, j);
                      }}
                    >
                      {j === (rotated ? 7 : 0) && (
                        <div className={"y-label label" + JsxUtil.classByCondition(yLabelHovered, "hovered")}>
                          {8 - i}
                        </div>
                      )}
                      {i === (rotated ? 0 : 7) && (
                        <div className={"x-label label" + JsxUtil.classByCondition(xLabelHovered, "hovered")}>
                          {String.fromCharCode(65 + j)}
                        </div>
                      )}
                      {piece == null ? (
                        <></>
                      ) : (
                        <div
                          className="piece"
                          draggable={piece != null && piece.team === board.turn && isPlayerTurn}
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
                      <div className="coordinate">{`(${i},${j})`}</div>
                      <div className="advantages">
                        <div className={"advantage white" + JsxUtil.classByCondition(whiteOptimal, "optimal")}>
                          {/* {whiteAdvantageMap?.[i]?.[j]?.type ?? ""} */}
                          {!!whiteProfit ? whiteProfit.toFixed(2) : ""}
                          {whiteOptimal ? "*" : ""}
                        </div>
                        <div className={"advantage black" + JsxUtil.classByCondition(blackOptimal, "optimal")}>
                          {/* {blackAdvantageMap?.[i]?.[j]?.type ?? ""} */}
                          {!!blackProfit ? blackProfit.toFixed(2) : ""}
                          {blackOptimal ? "*" : ""}
                        </div>
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
          <button onClick={() => setRotated((prev) => !prev)}>Rotate</button>
          <button
            onClick={() => {
              setAutoMode((prev) => !prev);
              setTimeout(() => doNextTurn(), 500);
            }}
            disabled={gameOver || whiteAI == null || blackAI == null}
          >
            {autoMode ? "Auto Stop" : "Auto Start"}
          </button>
          <button
            onClick={(e) => doNextTurn()}
            disabled={gameOver || (settingDone ? whiteAI == null || blackAI == null : whiteAI == null) || aiCalculating}
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
        <div className={"notations" + JsxUtil.classByCondition(!gameOver, "disabled")}>
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
