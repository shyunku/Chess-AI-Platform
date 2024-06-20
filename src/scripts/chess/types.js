export const PieceType = {
  KING: "KING",
  QUEEN: "QUEEN",
  BISHOP: "BISHOP",
  KNIGHT: "KNIGHT",
  ROOK: "ROOK",
  PAWN: "PAWN",
};

export const PieceChar = {
  KING: "K",
  QUEEN: "Q",
  BISHOP: "B",
  KNIGHT: "N",
  ROOK: "R",
  PAWN: "P",
};

export const PieceSymbol = {
  KING: "♔",
  QUEEN: "♕",
  BISHOP: "♗",
  KNIGHT: "♘",
  ROOK: "♖",
  PAWN: "♙",
};

export const PieceValue = {
  KING: 50,
  QUEEN: 9,
  BISHOP: 3,
  KNIGHT: 3,
  ROOK: 5,
  PAWN: 1,
};

export const TeamType = {
  WHITE: "WHITE",
  BLACK: "BLACK",
};

export const getOpponentTeam = (team) => (team === TeamType.WHITE ? TeamType.BLACK : TeamType.WHITE);
