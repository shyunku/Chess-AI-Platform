const { Move } = require("./objects");
const { PieceType, TeamType, PieceChar, PieceSymbol } = require("./types");

export class Piece {
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

export class King extends Piece {
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

export class Queen extends Piece {
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

export class Bishop extends Piece {
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

export class Knight extends Piece {
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

export class Rook extends Piece {
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

export class Pawn extends Piece {
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
