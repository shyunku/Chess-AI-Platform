const { Board, Move, TeamType } = require("./chess");

export class AI {
  constructor(name) {
    this.name = name;
    this.advantageCache = {};
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    return null;
  }

  /**
   *
   * @param {Board} board
   * @param {string} currentTeam
   */
  getAdvantage(board, currentTeam) {
    const key = currentTeam + "|" + board.export();
    if (this.advantageCache[key] != null) {
      return this.advantageCache[key];
    }
    const opponentTeam = currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
    const advantage = board.getTeamPieceValue(currentTeam) - board.getTeamPieceValue(opponentTeam);
    this.advantageCache[key] = advantage;
    return advantage;
  }
}

export class RandomAI extends AI {
  constructor() {
    super("Random AI");
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece);
      availableMoves.push(...moves);
    }

    const movePick = Math.floor(Math.random() * availableMoves.length);
    const move = availableMoves[movePick];
    return { move, moves: [] };
  }
}

// D0PieceProfitAI 는 상대와 나의 기물 가치를 모두 고려하여 최적의 수를 계산하는 AI (D0)입니다.
export class D0PieceProfitAI extends AI {
  constructor() {
    super("D0PieceProfitAI");
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    const opponentTeam = currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, true);
      availableMoves.push(...moves);
    }

    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);
      move.profit = tempBoard.getTeamPieceValue(currentTeam) - tempBoard.getTeamPieceValue(opponentTeam);
    }

    availableMoves.sort((a, b) => b.profit - a.profit);
    const bestMoves = availableMoves.filter((move) => move.profit === availableMoves[0].profit);
    const bestMovePick = Math.floor(Math.random() * bestMoves.length);
    return { move: bestMoves[bestMovePick], moves: availableMoves };
  }
}

// D1PieceProfitAI 는 상대와 나의 기물 가치를 모두 고려하여 최적의 수를 계산하는 AI (D1)입니다.
export class D1PieceProfitAI extends AI {
  constructor() {
    super("D1PieceProfitAI");
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    const opponentTeam = currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, true);
      availableMoves.push(...moves);
    }

    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);

      const d2Pieces = tempBoard.getTeamPieces(opponentTeam);
      const d2Moves = [];
      for (const piece of d2Pieces) {
        const moves = tempBoard.getAvailableMoves(piece);
        d2Moves.push(...moves);
      }

      for (const d2Move of d2Moves) {
        const d2TempBoard = tempBoard.copy();
        d2TempBoard.movePiece(d2Move);
        d2Move.d2profit = d2TempBoard.getTeamPieceValue(opponentTeam) - d2TempBoard.getTeamPieceValue(currentTeam);
      }

      // suppose the opponent will make the best move
      d2Moves.sort((a, b) => a.d2profit - b.d2profit);
      move.profit = -d2Moves[0].d2profit;
    }

    availableMoves.sort((a, b) => b.profit - a.profit);
    const bestMoves = availableMoves.filter((move) => move.profit === availableMoves[0].profit);
    const bestMovePick = Math.floor(Math.random() * bestMoves.length);
    return { move: bestMoves[bestMovePick], moves: availableMoves };
  }
}

// // D2PieceProfitAI 는 상대와 나의 기물 가치를 모두 고려하여 최적의 수를 계산하는 AI (D2)입니다.
// export class D2PieceProfitAI extends AI {
//   constructor() {
//     super("D2PieceProfitAI");
//   }

//   /**
//    *
//    * @param {Board} board
//    * @returns {Move} move
//    */
//   getMove(board, currentTeam) {
//     const opponentTeam = currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
//     const availablePieces = board.getTeamPieces(currentTeam);
//     const availableMoves = [];
//     for (const piece of availablePieces) {
//       const moves = board.getAvailableMoves(piece, true);
//       availableMoves.push(...moves);
//     }

//     for (const move of availableMoves) {
//       const tempBoard = board.copy();
//       tempBoard.movePiece(move);

//       const d2Pieces = tempBoard.getTeamPieces(opponentTeam);
//       const d2Moves = [];
//       for (const piece of d2Pieces) {
//         const moves = tempBoard.getAvailableMoves(piece);
//         d2Moves.push(...moves);
//       }

//       for (const d2Move of d2Moves) {
//         const d2TempBoard = tempBoard.copy();
//         d2TempBoard.movePiece(d2Move);

//         const d3Pieces = d2TempBoard.getTeamPieces(currentTeam);
//         const d3Moves = [];
//         for (const piece of d3Pieces) {
//           const moves = d2TempBoard.getAvailableMoves(piece, true);
//           d3Moves.push(...moves);
//         }

//         for (const d3Move of d3Moves) {
//           const d3TempBoard = d2TempBoard.copy();
//           d3TempBoard.movePiece(d3Move);
//           d3Move.d3profit = d3TempBoard.getTeamPieceValue(currentTeam) - d3TempBoard.getTeamPieceValue(opponentTeam);
//         }

//         // suppose the opponent will make the best move
//         d3Moves.sort((a, b) => a.d3profit - b.d3profit);
//         d2Move.d2profit = -d3Moves[0].d3profit;
//       }

//       // suppose the opponent will make the best move
//       d2Moves.sort((a, b) => a.d2profit - b.d2profit);
//       move.profit = -d2Moves[0].d2profit;
//     }

//     availableMoves.sort((a, b) => b.profit - a.profit);
//     const bestMoves = availableMoves.filter((move) => move.profit === availableMoves[0].profit);
//     const bestMovePick = Math.floor(Math.random() * bestMoves.length);
//     return bestMoves[bestMovePick];
//   }
// }

// MiniMaxAI 는 MinMax 알고리즘을 사용하여 최적의 수를 계산하는 AI입니다.
export class MiniMaxAI extends AI {
  constructor(depth = 2) {
    super(`MiniMaxAI (depth: ${depth})`);
    this.depth = depth;
    this.me = null;
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    this.me = currentTeam;

    const opponentTeam = currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, true);
      availableMoves.push(...moves);
    }

    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);
      move.profit = this.minMax(tempBoard, this.depth, currentTeam, opponentTeam);
    }

    availableMoves.sort((a, b) => b.profit - a.profit);
    const bestMoves = availableMoves.filter((move) => move.profit === availableMoves[0].profit);
    const bestMovePick = Math.floor(Math.random() * bestMoves.length);
    return { move: bestMoves[bestMovePick], moves: availableMoves };
  }

  minMax(board, depth, currentTeam, opponentTeam) {
    if (depth === 0) {
      return board.getTeamPieceValue(currentTeam) - board.getTeamPieceValue(opponentTeam);
    }

    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, this.me === currentTeam);
      availableMoves.push(...moves);
    }

    let bestProfit = -Infinity;
    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);
      const profit = -this.minMax(tempBoard, depth - 1, opponentTeam, currentTeam);
      bestProfit = Math.max(bestProfit, profit);
    }

    return bestProfit;
  }
}

// AlphaBetaAI 는 Alpha-Beta 가지치기 알고리즘을 사용하여 최적의 수를 계산하는 AI입니다.
export class AlphaBetaAI extends AI {
  constructor(depth = 2) {
    super(`AlphaBetaAI (depth: ${depth})`);
    this.depth = depth;
    this.me = null;
  }

  /**
   *
   * @param {Board} board
   * @returns {Move} move
   */
  getMove(board, currentTeam) {
    this.me = currentTeam;
    const opponentTeam = currentTeam === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;
    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, true);
      availableMoves.push(...moves);
    }

    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);
      move.profit = this.alphaBeta(tempBoard, this.depth, -Infinity, Infinity, currentTeam, opponentTeam);
    }

    availableMoves.sort((a, b) => b.profit - a.profit);
    const bestMoves = availableMoves.filter((move) => move.profit === availableMoves[0].profit);
    const bestMovePick = Math.floor(Math.random() * bestMoves.length);
    return { move: bestMoves[bestMovePick], moves: availableMoves };
  }

  alphaBeta(board, depth, alpha, beta, currentTeam, opponentTeam) {
    if (depth === 0) {
      return board.getTeamPieceValue(currentTeam) - board.getTeamPieceValue(opponentTeam);
    }

    const availablePieces = board.getTeamPieces(currentTeam);
    const availableMoves = [];
    for (const piece of availablePieces) {
      const moves = board.getAvailableMoves(piece, this.me === currentTeam);
      availableMoves.push(...moves);
    }

    let bestProfit = -Infinity;
    for (const move of availableMoves) {
      const tempBoard = board.copy();
      tempBoard.movePiece(move);
      const profit = -this.alphaBeta(tempBoard, depth - 1, -beta, -alpha, opponentTeam, currentTeam);
      bestProfit = Math.max(bestProfit, profit);
      alpha = Math.max(alpha, profit);
      if (alpha >= beta) {
        break;
      }
    }

    return bestProfit;
  }
}

// MCTS 는 몬테카를로 트리 탐색 알고리즘을 사용하여 최적의 수를 계산하는 AI입니다.
export class MCTS extends AI {
  constructor(iteration = 5) {
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
