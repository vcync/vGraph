import { vGraphDOM } from ".";

/**
 * @this vGraphDOM
 * @param {WheelEvent} e
 */
export function wheel(e) {
  const {
    mouseDown,
    draw,
    inputStatus,
    dpr,
    canvas: { width, height }
  } = this;

  if (
    mouseDown &&
    e.target !== this.widgetOverlay &&
    e.target !== this.canvas
  ) {
    return;
  }

  e.preventDefault();

  const x = e.offsetX * dpr;
  const y = e.offsetY * dpr;
  const delta = e.wheelDelta / 60;

  this.panScale.scaleAt({ x, y }, 1 + delta / (3 + dpr));

  this.setScale(this.panScale.scale);

  this.redraw(draw);
}
