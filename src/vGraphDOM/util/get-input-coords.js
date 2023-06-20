export default function getInputCoords(e) {
  if (typeof e.clientX === "number") {
    return [e.clientX, e.clientY];
  }

  if (e.touches && e.touches.length) {
    return [e.touches[0].clientX, e.touches[0].clientY];
  }
}
