import Board from "scripts/chess/board";
import { PieceType, PieceValue, TeamType } from "scripts/chess/types";

export default class AI {
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
    const advantage = this.calculateAdvantage(board, currentTeam) - this.calculateAdvantage(board, opponentTeam);
    this.advantageCache[key] = advantage;
    return advantage;
  }

  calculateAdvantage(board, team) {
    const pieces = board.getTeamPieces(team);
    let totalValue = 0;

    for (const piece of pieces) {
      const pieceValue = PieceValue[piece.type];
      const positionValue = this.getPositionValue(board, piece);
      const attackValue = this.getAttackValue(board, team, piece);
      const flexibilityValue = this.getFlexibilityValue(board, piece);
      totalValue += pieceValue + positionValue + attackValue + flexibilityValue;
    }

    return totalValue;
  }

  getPositionValue(board, piece) {
    // 기본적인 위치 가중치를 추가할 수 있음
    // 예: 중반 이후의 중앙 통제, 말의 이동 가능성 등
    // 여기서는 간단히 기물 위치에 대한 가중치를 추가합니다.
    let value = 0;
    if (piece.type === PieceType.PAWN) {
      value = piece.team === TeamType.WHITE ? piece.x : 7 - piece.x;
    }
    return value;
  }

  getAttackValue(board, currentTeam, piece) {
    const pieceValue = PieceValue[piece.type];

    // 특정 기물이 공격받는 상황에 대한 가중치를 추가
    const attackers = piece.getPiecesCanAttackThis(board);
    let attackerCount = attackers.length;
    let attackerMinValue = 0;
    for (const attacker of attackers) {
      const attackerValue = PieceValue[attacker.type];
      if (!attackerMinValue || attackerValue < attackerMinValue) {
        attackerMinValue = attackerValue;
      }
    }

    // 현재 팀의 기물이 상대팀 기물을 공격할 수 있는 경우
    let attackeeCount = 0;
    let attackeeMaxValue = 0;
    const canAttackPieces = piece.getPiecesCanAttackTo(board);
    for (const attackablePiece of canAttackPieces) {
      const attackeeValue = PieceValue[attackablePiece.type];
      if (attackeeValue > attackeeMaxValue) {
        attackeeMaxValue = attackeeValue;
      }
    }

    const attacking = board.turn === currentTeam;
    let raw = 0;
    if (attacking) {
      raw = attackeeCount > 0 ? -pieceValue / 3 + attackeeMaxValue : 0;
    } else {
      raw = attackerCount > 0 ? -pieceValue + attackerMinValue / 3 : 0;
    }
    return raw / 2;
  }

  getFlexibilityValue(board, piece) {
    // 기물의 이동 가능성에 대한 가중치를 추가
    // 예: 이동 가능한 칸의 수, 이동 가능성이 높은 위치에 대한 가중치 등
    let flexibilityValue = 0;
    const moves = board.getAvailableMoves(piece);
    flexibilityValue += moves.length;

    return flexibilityValue / 3;
  }
}
