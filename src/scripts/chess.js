const PieceType = {
  KING: "KING",
  QUEEN: "QUEEN",
  BISHOP: "BISHOP",
  KNIGHT: "KNIGHT",
  ROOK: "ROOK",
  PAWN: "PAWN",
};

const PieceChar = {
  KING: "K",
  QUEEN: "Q",
  BISHOP: "B",
  KNIGHT: "N",
  ROOK: "R",
  PAWN: "P",
};

const PieceSymbol = {
  KING: "♔",
  QUEEN: "♕",
  BISHOP: "♗",
  KNIGHT: "♘",
  ROOK: "♖",
  PAWN: "♙",
};

const PieceValue = {
  KING: 50,
  QUEEN: 9,
  BISHOP: 3,
  KNIGHT: 3,
  ROOK: 5,
  PAWN: 1,
};

const TeamType = {
  WHITE: "WHITE",
  BLACK: "BLACK",
};

class Move {
  constructor(ox, oy, x, y) {
    this.ox = ox;
    this.oy = oy;
    this.x = x;
    this.y = y;
  }
}

class Board {
  constructor() {
    this.board = new Array(8);
    for (let i = 0; i < 8; i++) {
      this.board[i] = new Array(8);
    }
    this.notations = [];
    this.reset();
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
    const piece = this.getPiece(move.ox, move.oy);
    if (piece == null) {
      console.log("piece", piece);
      this.draw();
      throw new Error("Invalid move");
    }
    const originalPiece = piece.copy();
    const targetPiece = this.getPiece(move.x, move.y);

    this.board[move.ox][move.oy] = null;
    this.board[move.x][move.y] = piece;

    piece.x = move.x;
    piece.y = move.y;
    piece.moved++;

    // check promotion
    if (piece.type === PieceType.PAWN && (piece.x === 0 || piece.x === 7)) {
      piece.type = PieceType.QUEEN;
    }

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

    const notation = this.getNotation(originalPiece, move.x, move.y, { isCastling });

    // add notation
    if (!withoutNotation) {
      const payload = this.export();
      this.notations.push({ notation, payload, move, teamTurn: piece.team, killed: targetPiece });
      return notation;
    }
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

  getNotation(piece, moveX, moveY, opt = { isCastling: false }) {
    if (opt.isCastling) {
      return "O-O";
    }

    let notation = "";
    if (piece.type !== PieceType.PAWN) {
      const pieceChar = PieceChar[piece.type];
      notation += piece.team == TeamType.WHITE ? pieceChar.toUpperCase() : pieceChar.toLowerCase();
    }
    const originalPiece = this.getPiece(moveX, moveY);
    if (originalPiece !== null && originalPiece.team !== piece.team) {
      notation += "x";
    }
    notation += String.fromCharCode(97 + moveY);
    notation += 8 - moveX;
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
    const pieces = this.getTeamPieces(team);
    for (const piece of pieces) {
      const moves = this.getAvailableMoves(piece);
      for (const move of moves) {
        const movingPieceXY = [piece.x, piece.y];
        const originalPiece = this.getPiece(move.x, move.y);
        this.movePiece(move, true);
        const isCheck = this.isCheck(team);

        const reverseMove = new Move(move.x, move.y, movingPieceXY[0], movingPieceXY[1]);
        this.movePiece(reverseMove, true); // Undo move
        this.board[move.x][move.y] = originalPiece;
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
    const whitePieces = this.getTeamPieces(TeamType.WHITE);
    const blackPieces = this.getTeamPieces(TeamType.BLACK);

    if (whitePieces.length === 0) {
      return { team: TeamType.BLACK, reason: "whiteAllDead" };
    }
    if (blackPieces.length === 0) {
      return { team: TeamType.WHITE, reason: "blackAllDead" };
    }

    if (whitePieces.filter((piece) => piece.type === PieceType.KING).length === 0) {
      return { team: TeamType.BLACK, reason: "whiteKingDead" };
    }
    if (blackPieces.filter((piece) => piece.type === PieceType.KING).length === 0) {
      return { team: TeamType.WHITE, reason: "blackKingDead" };
    }

    const whiteCheckMate = this.isCheckMate(TeamType.WHITE);
    const blackCheckMate = this.isCheckMate(TeamType.BLACK);

    if (whiteCheckMate) {
      return { team: TeamType.BLACK, reason: "whiteCheckMate" };
    }
    if (blackCheckMate) {
      return { team: TeamType.WHITE, reason: "blackCheckMate" };
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

class Piece {
  constructor(team, type, x, y, moved = 0) {
    this.team = team;
    this.type = type;
    this.x = x;
    this.y = y;
    this.moved = moved;
  }

  copy() {
    return new Piece(this.team, this.type, this.x, this.y, this.moved);
  }

  /**
   *
   * @param {Board} board
   * @param {number} x
   * @param {number} y
   * @returns {boolean}
   */
  movable(board, x, y, withThreatenCheck = false) {
    const originalPiece = board.getPiece(x, y);
    // check if the piece is moving to the same position
    if (this.x === x && this.y === y) {
      return false;
    }
    // check if the piece killed the same team piece
    if (originalPiece !== null && originalPiece.team === this.team) {
      return false;
    }
    // threaten check
    if (withThreatenCheck && board.isThreatenedAfterMove(this, new Move(this.x, this.y, x, y))) {
      return false;
    }
    return true;
  }

  getChar() {
    const char = PieceChar[this.type];
    return char;
  }

  getSymbol() {
    const COLOR = "\x1b[32m";
    const RESET = "\x1b[0m";
    const symbol = PieceSymbol[this.type];
    if (this.team === TeamType.WHITE) {
      // return this.type[0].toUpperCase();
      return symbol;
    } else {
      return COLOR + symbol + RESET;
    }
  }
}

class King extends Piece {
  constructor(team, x, y) {
    super(team, PieceType.KING, x, y);
  }

  movable(board, x, y, withThreatenCheck = false) {
    if (!super.movable(board, x, y, withThreatenCheck)) return false;
    // castling
    if (this.x === x && this.y === y - 2) {
      if (board.getPiece(this.x, this.y + 1) !== null || board.getPiece(this.x, this.y + 2) !== null) {
        return false;
      }
      const rook = board.getPiece(this.x, this.y + 3);
      if (rook === null || rook.type !== PieceType.ROOK || rook.team !== this.team || rook.moved > 0) {
        return false;
      }
      // check if the king is in check
      return true;
    }
    if (Math.abs(this.x - x) <= 1 && Math.abs(this.y - y) <= 1) {
      return true;
    }
    return false;
  }
}

class Queen extends Piece {
  constructor(team, x, y) {
    super(team, PieceType.QUEEN, x, y);
  }

  movable(board, x, y, withThreatenCheck = false) {
    if (!super.movable(board, x, y, withThreatenCheck)) return false;
    let xDir = this.x === x ? 0 : (x - this.x) / Math.abs(x - this.x);
    let yDir = this.y === y ? 0 : (y - this.y) / Math.abs(y - this.y);

    // console.log("this", this.x, this.y, "to", x, y);

    if (this.x === x || this.y === y || Math.abs(this.x - x) === Math.abs(this.y - y)) {
      let curX = this.x + xDir;
      let curY = this.y + yDir;
      while (curX !== x || curY !== y) {
        if (board.getPiece(curX, curY) !== null) {
          return false;
        }
        curX += xDir;
        curY += yDir;
      }
      return true;
    }
    return false;
  }
}

class Bishop extends Piece {
  constructor(team, x, y) {
    super(team, PieceType.BISHOP, x, y);
  }

  movable(board, x, y, withThreatenCheck = false) {
    if (!super.movable(board, x, y, withThreatenCheck)) return false;
    if (Math.abs(this.x - x) === Math.abs(this.y - y)) {
      let xDir = this.x == x ? 0 : (x - this.x) / Math.abs(x - this.x);
      let yDir = this.y == y ? 0 : (y - this.y) / Math.abs(y - this.y);
      let curX = this.x + xDir;
      let curY = this.y + yDir;
      while ((curX !== x || curY !== y) && curX >= 0 && curX < 8 && curY >= 0 && curY < 8) {
        if (board.getPiece(curX, curY) !== null) {
          return false;
        }
        curX += xDir;
        curY += yDir;
      }
      return true;
    }
    return false;
  }
}

class Knight extends Piece {
  constructor(team, x, y) {
    super(team, PieceType.KNIGHT, x, y);
  }

  movable(board, x, y, withThreatenCheck = false) {
    if (!super.movable(board, x, y, withThreatenCheck)) return false;
    if (
      (Math.abs(this.x - x) === 2 && Math.abs(this.y - y) === 1) ||
      (Math.abs(this.x - x) === 1 && Math.abs(this.y - y) === 2)
    ) {
      return true;
    }
    return false;
  }
}

class Rook extends Piece {
  constructor(team, x, y) {
    super(team, PieceType.ROOK, x, y);
  }

  movable(board, x, y, withThreatenCheck = false) {
    if (!super.movable(board, x, y, withThreatenCheck)) return false;
    if (this.x === x) {
      let yDir = this.y === y ? 0 : (y - this.y) / Math.abs(y - this.y);
      let curY = this.y + yDir;
      while (curY !== y && curY >= 0 && curY < 8) {
        if (board.getPiece(x, curY) !== null) {
          return false;
        }
        curY += yDir;
      }
      return true;
    } else if (this.y === y) {
      let xDir = this.x === x ? 0 : (x - this.x) / Math.abs(x - this.x);
      let curX = this.x + xDir;
      while (curX !== x && curX >= 0 && curX < 8) {
        if (board.getPiece(curX, y) !== null) {
          return false;
        }
        curX += xDir;
      }
      return true;
    }
    return false;
  }
}

class Pawn extends Piece {
  constructor(team, x, y) {
    super(team, PieceType.PAWN, x, y);
  }

  movable(board, x, y, withThreatenCheck = false) {
    if (!super.movable(board, x, y, withThreatenCheck)) return false;

    const direction = this.team === TeamType.WHITE ? -1 : 1;
    const startRow = this.team === TeamType.WHITE ? 6 : 1;

    if (this.x + direction === x && this.y === y && board.getPiece(x, y) === null) {
      return true; // normal move
    }

    if (
      this.x === startRow &&
      this.x + 2 * direction === x &&
      this.y === y &&
      board.getPiece(x, y) === null &&
      board.getPiece(this.x + direction, this.y) === null
    ) {
      return true; // initial double move
    }

    if (
      this.x + direction === x &&
      Math.abs(this.y - y) === 1 &&
      board.getPiece(x, y) !== null &&
      board.getPiece(x, y).team !== this.team
    ) {
      return true; // capture move
    }

    return false;
  }
}

export {
  Board,
  Piece,
  Move,
  King,
  Queen,
  Bishop,
  Knight,
  Rook,
  Pawn,
  TeamType,
  PieceType,
  PieceChar,
  PieceSymbol,
  PieceValue,
};
