import { TeamType } from "scripts/chess/types";
import AI from "./AI";

// QLearningAI는 Q-러닝 알고리즘을 사용하여 최적의 수를 학습합니다.
export default class QLearningAI extends AI {
  constructor(alpha = 0.1, gamma = 0.9, epsilon = 0.2) {
    super(`QLearningAI (alpha: ${alpha}, gamma: ${gamma}, epsilon: ${epsilon})`);
    this.alpha = alpha; // 학습률
    this.gamma = gamma; // 할인 인수
    this.epsilon = epsilon; // 탐색 확률
    this.qTable = {}; // Q 테이블
  }

  /**
   * Q-값을 반환합니다.
   * @param {string} state
   * @param {Move} move
   * @returns {number} Q-값
   */
  getQValue(state, move) {
    const key = `${state}_${move.ox}${move.oy}${move.x}${move.y}`;
    return this.qTable[key] || 0;
  }

  /**
   * Q-값을 업데이트합니다.
   * @param {string} state
   * @param {Move} move
   * @param {number} reward
   * @param {string} nextState
   */
  updateQValue(state, move, reward, nextState) {
    const key = `${state}_${move.ox}${move.oy}${move.x}${move.y}`;
    const maxNextQ = this.getMaxQValue(nextState);
    const currentQ = this.getQValue(state, move);
    const newQ = (1 - this.alpha) * currentQ + this.alpha * (reward + this.gamma * maxNextQ);
    this.qTable[key] = newQ;
  }

  /**
   * 주어진 상태에서 가능한 모든 움직임에 대한 최대 Q-값을 반환합니다.
   * @param {string} state
   * @returns {number} 최대 Q-값
   */
  getMaxQValue(state) {
    const moves = state.split("|")[1].split(",");
    let maxQ = -Infinity;
    for (const move of moves) {
      const [ox, oy, x, y] = move.split("").map(Number);
      maxQ = Math.max(maxQ, this.getQValue(state, { ox, oy, x, y }));
    }
    return maxQ === -Infinity ? 0 : maxQ;
  }

  /**
   * 가능한 최적의 수를 반환합니다.
   * @param {Board} board
   * @param {TeamType} currentTeam
   * @returns {Move} 최적의 수
   */
  getMove(board, currentTeam) {
    const state = this.getState(board, currentTeam);
    const availableMoves = board.getAllAvailableMoves(true);

    if (Math.random() < this.epsilon) {
      // 탐색: 무작위로 수를 선택
      const randomMove = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      return { move: randomMove, moves: availableMoves };
    }

    // 이용: Q-값이 가장 높은 수를 선택
    let bestMove = null;
    let bestQ = -Infinity;
    for (const move of availableMoves) {
      const q = this.getQValue(state, move);
      move.profit = q;
      if (q > bestQ) {
        bestMove = move;
        bestQ = q;
      }
    }

    console.log(this.qTable);

    const decisionMove = bestMove || availableMoves[Math.floor(Math.random() * availableMoves.length)];
    return { move: decisionMove, moves: availableMoves };
  }

  /**
   * 현재 상태를 문자열로 반환합니다.
   * @param {Board} board
   * @param {TeamType} currentTeam
   * @returns {string} 상태 문자열
   */
  getState(board, currentTeam) {
    return `${currentTeam}|${board.export()}`;
  }

  /**
   * 학습을 수행합니다.
   * @param {Board} board
   * @param {Move} move
   * @param {number} reward
   * @param {Board} nextBoard
   */
  learn(board, move, reward, nextBoard) {
    const state = this.getState(board, board.getCurrentTurn());
    const nextState = this.getState(nextBoard, nextBoard.getCurrentTurn());
    this.updateQValue(state, move, reward, nextState);
  }
}
