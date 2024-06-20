import { TeamType } from "scripts/chess/types";
import AI from "./AI";

// MCTS 는 몬테카를로 트리 탐색 알고리즘을 사용하여 최적의 수를 계산하는 AI입니다.
export default class MCTS extends AI {
  constructor(iteration = 12) {
    super(`MCTS (iteration: ${iteration})`);
    this.iteration = iteration;
    this.me = null;
    this.root = null;
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    this.me = currentTeam;
    if (this.root === null || this.root.board !== board) {
      this.root = new Node(board, null, currentTeam);
    }

    for (let i = 0; i < this.iteration; i++) {
      let node = this.root;
      let tempBoard = board.copy();
      const visitedBoards = new Set();

      console.log("iteration", i);

      // Selection
      // console.log("selecting...");
      while (node.untriedMoves.length === 0 && node.childNodes.length !== 0) {
        node = node.selectChild();
        tempBoard.movePiece(node.move);
      }

      // Expansion
      // console.log("expanding...");
      if (node.untriedMoves.length !== 0) {
        const randomMove = node.untriedMoves.splice(Math.floor(Math.random() * node.untriedMoves.length), 1)[0];
        tempBoard.movePiece(randomMove);
        node = node.addChild(randomMove, tempBoard, currentTeam);
      }

      // Simulation
      // console.log("simulating...");
      let currentSimTeam = currentTeam;
      while (true) {
        const boardState = tempBoard.export();
        if (visitedBoards.has(boardState)) {
          break;
        }
        visitedBoards.add(boardState);

        const moves = tempBoard.getAllAvailableMoves(currentSimTeam === currentTeam);
        if (moves.length === 0) {
          break;
        }
        // console.log(moves.length);
        const randomMove = moves[Math.floor(Math.random() * moves.length)];
        tempBoard.movePiece(randomMove);

        if (tempBoard.isGameOver()) {
          break;
        }

        currentSimTeam = currentSimTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
      }

      // Backpropagation
      // console.log("backpropagating...");
      while (node !== null) {
        node.update(tempBoard);
        node = node.parent;
      }
    }

    const bestChild = this.root.bestChild();
    const moves = this.root.childNodes.map((child) => {
      const move = child.move;
      move.profit = child.wins / child.visits;
      return move;
    });

    this.root = bestChild;

    return {
      move: bestChild.move,
      moves,
    };
  }
}

class Node {
  constructor(board, move, currentTeam) {
    this.board = board;
    this.move = move;
    this.currentTeam = currentTeam;
    this.childNodes = [];
    this.untriedMoves = board.getAllAvailableMoves(currentTeam);
    this.visits = 0;
    this.wins = 0;
    this.parent = null;
  }

  selectChild() {
    let selected = null;
    let bestValue = -Infinity;
    for (const child of this.childNodes) {
      const uctValue = child.wins / child.visits + Math.sqrt((2 * Math.log(this.visits)) / child.visits);
      if (uctValue > bestValue) {
        selected = child;
        bestValue = uctValue;
      }
    }
    return selected;
  }

  addChild(move, board, currentTeam) {
    const child = new Node(board, move, currentTeam);
    child.parent = this;
    this.childNodes.push(child);
    return child;
  }

  update(board) {
    this.visits++;
    const result =
      board.getTeamPieceValue(this.currentTeam) -
      board.getTeamPieceValue(this.currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE);
    this.wins += result;
  }

  bestChild() {
    let bestChild = null;
    let bestValue = -Infinity;
    for (const child of this.childNodes) {
      const childValue = child.wins / child.visits;
      if (childValue > bestValue) {
        bestChild = child;
        bestValue = childValue;
      }
    }
    return bestChild;
  }
}
