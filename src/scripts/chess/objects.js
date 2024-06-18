export class Move {
  constructor(ox, oy, x, y) {
    this.ox = ox;
    this.oy = oy;
    this.x = x;
    this.y = y;
  }

  toString() {
    return `${this.ox},${this.oy} -> ${this.x},${this.y}`;
  }
}
