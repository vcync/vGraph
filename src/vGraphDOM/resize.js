import { vGraphDOM } from ".";

/** @this vGraphDOM */
export function resize() {
  const { canvas } = this;
  const { devicePixelRatio: dpr, innerWidth, innerHeight } = window;
  this.dpr = dpr;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;

  this.redraw();
}
