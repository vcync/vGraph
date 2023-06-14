export default function keydown(e) {
  if (
    (e.keyCode === 46 || e.keyCode === 8) &&
    !this.widgetTransformArea.contains(document.activeElement)
  ) {
    this.deleteNode(this.focusedNodes);
  }

  if (e.keyCode === 81) {
    this.showUi = !this.showUi;
    this.canvas.classList.toggle("hide");
    this.widgetOverlay.classList.toggle("hide");
    document.getElementById("controls").classList.toggle("hide");
    [...document.querySelectorAll(".nwjs-menu")].forEach(node =>
      node.classList.toggle("hide")
    );
  }
}
