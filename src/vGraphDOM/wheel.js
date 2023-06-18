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

  const deltaScale = e.deltaY / 1000;

  const pointerX = e.pageX * dpr;
  const pointerY = e.pageY * dpr;

  const scaledWidth = this.scaleOffsetX * width;
  const scaledHeight = this.scaleOffsetY * height;

  const x = (pointerX - scaledWidth) / this.scale;
  const y = (pointerY - scaledHeight) / this.scale;

  this.scaleOffsetX = (-x * this.scale + pointerX) / width;
  this.scaleOffsetY = (-y * this.scale + pointerY) / height;

  this.setScale(deltaScale);

  this.redraw(draw);
}
