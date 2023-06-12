export default function wheel(e) {
  const { mouseDown, draw } = this;
  if (
    mouseDown ||
    e.target !== this.widgetOverlay ||
    e.target !== this.canvas
  ) {
    return;
  }

  e.preventDefault();

  const deltaScale = e.deltaY / 1000;
  this.setScale(deltaScale);

  requestAnimationFrame(draw);
}
