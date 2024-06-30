// https://stackoverflow.com/a/60235061

export class PanScale {
  constructor(context) {
    this.context = context;
    this.matrix = [1, 0, 0, 1, 0, 0]; // current view transform
    this.scale = 1; // current scale
    this.position = { x: 0, y: 0 }; // current position of origin
    this.dirty = false;
  }

  apply() {
    this.update();

    const m = this.matrix;

    this.context.setTransform(m[0], m[1], m[2], m[3], m[4], m[5]);
  }

  update() {
    this.dirty = false;
    this.matrix[3] = this.matrix[0] = this.scale;
    this.matrix[2] = this.matrix[1] = 0;
    this.matrix[4] = this.position.x;
    this.matrix[5] = this.position.y;
  }

  pan({ x, y }) {
    if (this.dirty) {
      this.update();
    }
    this.position.x += x * this.scale;
    this.position.y += y * this.scale;
  }

  scaleAt({ x, y }, amount) {
    // at in screen coords
    this.update();

    if (this.scale * amount > 3) {
      this.scale = 3;
    } else if (this.scale * amount < 0.5) {
      this.scale = 0.5;
    } else {
      this.scale *= amount;

      this.position.x = x - (x - this.position.x) * amount;
      this.position.y = y - (y - this.position.y) * amount;
    }
  }
}
