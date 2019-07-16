export default function resize() {
  const { canvas } = this
  const { devicePixelRatio: dpr, innerWidth, innerHeight } = window
  this.dpr = dpr
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr

  requestAnimationFrame(this.draw)
}
