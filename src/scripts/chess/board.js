import { Move } from "./objects";
import { Bishop, King, Knight, Pawn, Piece, Queen, Rook } from "./piece";
import { PieceChar, PieceType, PieceValue, TeamType } from "./types";

export default class Board {
  static id = 0;

  constructor() {
    this.board = new Array(8);
    for (let i = 0; i < 8; i++) {
      this.board[i] = new Array(8);
    }
    this.notations = [];

    this.id = Board.id++;
    this.onChange = null;
    this.turn = TeamType.WHITE;

    this.reset();
  }

  isCanonical() {
    return this.id === 0;
  }

  onChangeCallback(callback) {
    if (!this.isCanonical()) return;
    this.onChange = callback;
  }

  reset() {
    this.notations = [];
    this.board[0][0] = new Rook(TeamType.BLACK, 0, 0);
    this.board[0][1] = new Knight(TeamType.BLACK, 0, 1);
    this.board[0][2] = new Bishop(TeamType.BLACK, 0, 2);
    this.board[0][3] = new Queen(TeamType.BLACK, 0, 3);
    this.board[0][4] = new King(TeamType.BLACK, 0, 4);
    this.board[0][5] = new Bishop(TeamType.BLACK, 0, 5);
    this.board[0][6] = new Knight(TeamType.BLACK, 0, 6);
    this.board[0][7] = new Rook(TeamType.BLACK, 0, 7);
    for (let i = 0; i < 8; i++) {
      this.board[1][i] = new Pawn(TeamType.BLACK, 1, i);
    }
    for (let i = 2; i < 6; i++) {
      for (let j = 0; j < 8; j++) {
        this.board[i][j] = null;
      }
    }
    for (let i = 0; i < 8; i++) {
      this.board[6][i] = new Pawn(TeamType.WHITE, 6, i);
    }
    this.board[7][0] = new Rook(TeamType.WHITE, 7, 0);
    this.board[7][1] = new Knight(TeamType.WHITE, 7, 1);
    this.board[7][2] = new Bishop(TeamType.WHITE, 7, 2);
    this.board[7][3] = new Queen(TeamType.WHITE, 7, 3);
    this.board[7][4] = new King(TeamType.WHITE, 7, 4);
    this.board[7][5] = new Bishop(TeamType.WHITE, 7, 5);
    this.board[7][6] = new Knight(TeamType.WHITE, 7, 6);
    this.board[7][7] = new Rook(TeamType.WHITE, 7, 7);

    this.turn = TeamType.WHITE;
  }

  copy() {
    const newBoard = new Board();
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.board[i][j];
        if (piece !== null) {
          let newPiece = null;
          switch (piece.type) {
            case PieceType.KING:
              newPiece = new King(piece.team, i, j, piece.moved);
              break;
            case PieceType.QUEEN:
              newPiece = new Queen(piece.team, i, j, piece.moved);
              break;
            case PieceType.BISHOP:
              newPiece = new Bishop(piece.team, i, j, piece.moved);
              break;
            case PieceType.KNIGHT:
              newPiece = new Knight(piece.team, i, j, piece.moved);
              break;
            case PieceType.ROOK:
              newPiece = new Rook(piece.team, i, j, piece.moved);
              break;
            case PieceType.PAWN:
              newPiece = new Pawn(piece.team, i, j, piece.moved);
              break;
            default:
              throw new Error("Invalid piece type");
          }
          newBoard.board[i][j] = newPiece;
        } else {
          newBoard.board[i][j] = null;
        }
      }
    }
    newBoard.notations = [...this.notations];
    newBoard.turn = this.turn;
    return newBoard;
  }

  export() {
    let payload = "";
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.board[i][j];
        if (piece !== null) {
          const ch = PieceChar[piece.type];
          payload += `${piece.team === TeamType.WHITE ? ch.toUpperCase() : ch.toLowerCase()}`;
        } else {
          payload += "0";
        }
      }
    }
    return payload;
  }

  importPayload(payload) {
    let idx = 0;
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const ch = payload[idx];
        if (ch !== "0") {
          const team = ch === ch.toUpperCase() ? TeamType.WHITE : TeamType.BLACK;
          const type = Object.keys(PieceChar).find((key) => PieceChar[key] === ch.toUpperCase());
          this.board[i][j] = new Piece(team, type, i, j);
        } else {
          this.board[i][j] = null;
        }
        idx++;
      }
    }
  }

  getAllAvailableMoves(withThreatenCheck = false) {
    const team = this.getCurrentTurn();
    const moves = [];
    const pieces = this.getTeamPieces(team);
    for (const piece of pieces) {
      const pieceMoves = this.getAvailableMoves(piece, withThreatenCheck);
      for (const move of pieceMoves) {
        moves.push(move);
      }
    }
    return moves;
  }

  /**
   *
   * @param {Piece} piece
   * @param {boolean} withThreatenCheck
   * @returns {[]Move}
   */
  getAvailableMoves(piece, withThreatenCheck = false) {
    const moves = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if (piece.movable(this, i, j, withThreatenCheck)) {
          const move = new Move(piece.x, piece.y, i, j);
          moves.push(move);
        }
      }
    }
    return moves;
  }

  getCurrentTurn() {
    return this.notations.length % 2 === 0 ? TeamType.WHITE : TeamType.BLACK;
  }

  /**
   * Move piece and return notation
   * @param {Move} move
   * @param {boolean} withoutNotation
   * @returns
   */
  movePiece(move, withoutNotation = false) {
    let piece = this.getPiece(move.ox, move.oy);
    if (piece == null) {
      console.log("piece", piece, "move", move);
      this.draw();
      throw new Error("Invalid move");
    }

    if (piece.team !== this.turn) {
      console.error(`[${this.id}] Current turn is ${this.turn} but ${piece.team} is moving`, move);
      this.draw();
      throw new Error("Opponent move");
    }

    // check promotion
    let promotion = false;
    if (piece.type === PieceType.PAWN && (piece.team === TeamType.WHITE ? move.x === 0 : move.x === 7)) {
      piece = new Queen(piece.team, move.x, move.y, piece.moved);
      promotion = true;
      if (this.isCanonical()) {
        console.log("promotion", piece.type, piece.x, piece.y, move);
      }
    }

    const originalPiece = piece.copy();
    const targetPiece = this.getPiece(move.x, move.y);

    this.board[move.ox][move.oy] = null;
    this.board[move.x][move.y] = piece;

    piece.x = move.x;
    piece.y = move.y;
    piece.moved++;

    // check castling
    let isCastling = false;
    if (piece.type === PieceType.KING && Math.abs(move.y - move.oy) === 2) {
      const rookY = move.y === 6 ? 7 : 0;
      const rook = this.getPiece(move.x, rookY);
      if (rook === null || rook.type !== PieceType.ROOK || rook.team !== piece.team || rook.moved > 0) {
        // console.log("rook", rook);
        // console.log("piece", piece);
        // throw new Error("Invalid castling");
      } else {
        const rookMove = new Move(move.x, rookY, move.x, move.y === 6 ? 5 : 3);
        this.board[move.x][rookY] = null;
        this.board[move.x][rookMove.y] = rook;

        rook.y = rookMove.y;
        rook.moved++;
        isCastling = true;
      }
    }

    const notation = this.getNotation(originalPiece, targetPiece, move.x, move.y, {
      isCastling,
      isPromotion: promotion,
    });
    const opponentTeam = piece.team === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE;

    const defer = () => {
      if (this.isCanonical()) console.log("invoke onchange");
      this.onChange?.(opponentTeam);
      this.turn = opponentTeam;
    };

    // add notation
    if (!withoutNotation) {
      const payload = this.export();
      this.notations.push({ notation, payload, move, teamTurn: piece.team, killed: targetPiece });

      defer();
      return notation;
    }

    defer();
    return null;
  }

  getTeamPieces(team) {
    const pieces = [];
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = this.board[i][j];
        if (piece !== null && piece.team === team) {
          pieces.push(piece);
        }
      }
    }
    return pieces;
  }

  getPiece(x, y) {
    return this.board[x][y] ?? null;
  }

  getNotation(piece, targetPiece, moveX, moveY, opt = { isCastling: false, isPromotion: false }) {
    if (opt.isCastling) {
      return "O-O";
    }

    let notation = "";
    if (piece.type !== PieceType.PAWN) {
      const pieceChar = PieceChar[piece.type];
      notation += piece.team === TeamType.WHITE ? pieceChar.toUpperCase() : pieceChar.toLowerCase();
    } else if (piece !== null && targetPiece != null && piece.team !== targetPiece.team) {
      notation += "x";
    }
    notation += String.fromCharCode(97 + moveY);
    notation += 8 - moveX;
    if (opt.isPromotion) {
      notation += "=Q";
    }
    return notation;
  }

  getTeamPieceValue(team) {
    let value = 0;
    const pieces = this.getTeamPieces(team);
    for (const piece of pieces) {
      value += PieceValue[piece.type];
    }
    return value;
  }

  isCheck(team) {
    const king = this.getTeamPieces(team).find((piece) => piece.type === PieceType.KING);
    const opponentPieces = this.getTeamPieces(team === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE);
    for (const piece of opponentPieces) {
      if (this.getAvailableMoves(piece).some((move) => move.x === king.x && move.y === king.y)) {
        return true;
      }
    }
    return false;
  }

  isCheckMate(team) {
    const tempBoard = this.copy();
    const pieces = tempBoard.getTeamPieces(team);
    for (const piece of pieces) {
      const moves = tempBoard.getAvailableMoves(piece, true);
      for (const move of moves) {
        // console.log(move);
        tempBoard.movePiece(move, true);
        const isCheck = tempBoard.isCheck(team);
        if (!isCheck) {
          return false;
        }
      }
    }
    return true;
  }

  isThreatenedAfterMove(piece, move) {
    // console.log(`check if king is threatened after move`, piece.type, move);
    const tempBoard = this.copy();
    tempBoard.movePiece(move, true);
    const isThreatened = tempBoard.isKingThreatened(piece.team);
    return isThreatened;
  }

  isKingThreatened(team) {
    const king = this.getTeamPieces(team).find((piece) => piece.type === PieceType.KING);
    if (king == null) {
      return false;
    }
    const opponentPieces = this.getTeamPieces(team === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE);
    for (const piece of opponentPieces) {
      const moves = this.getAvailableMoves(piece);
      for (const move of moves) {
        if (move.x === king.x && move.y === king.y) {
          // console.log(`king is threatened by ${piece.type} at ${piece.x},${piece.y}`);
          return true;
        }
      }
    }
    return false;
  }

  isGameOver() {
    if (this.turn === TeamType.WHITE) {
      const whitePieces = this.getTeamPieces(TeamType.WHITE);
      if (whitePieces.length === 0) {
        return { team: TeamType.BLACK, reason: "whiteAllDead" };
      }

      if (whitePieces.filter((piece) => piece.type === PieceType.KING).length === 0) {
        return { team: TeamType.BLACK, reason: "whiteKingDead" };
      }

      const whiteCheckMate = this.isCheckMate(TeamType.WHITE);
      if (whiteCheckMate) {
        return { team: TeamType.BLACK, reason: "whiteCheckMate" };
      }
    } else {
      const blackPieces = this.getTeamPieces(TeamType.BLACK);
      if (blackPieces.length === 0) {
        return { team: TeamType.WHITE, reason: "blackAllDead" };
      }

      if (blackPieces.filter((piece) => piece.type === PieceType.KING).length === 0) {
        return { team: TeamType.WHITE, reason: "blackKingDead" };
      }

      const blackCheckMate = this.isCheckMate(TeamType.BLACK);
      if (blackCheckMate) {
        return { team: TeamType.WHITE, reason: "blackCheckMate" };
      }
    }
    return null;
  }

  draw() {
    for (let i = 0; i < 8; i++) {
      let str = `${8 - i} `;
      for (let j = 0; j < 8; j++) {
        const piece = this.board[i][j];
        if (piece !== null) {
          str += piece.getSymbol() + " ";
        } else {
          str += "□ ";
        }
      }
      console.log(str);
    }
    console.log("  a b c d e f g h");
  }
}
