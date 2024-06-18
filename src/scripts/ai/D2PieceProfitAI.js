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
