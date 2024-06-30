import { HighResCanvas2D } from "../../HighResCanvas";

export function createCanvas(
  width = 128,
  height = 128,
  type = "2d",
  options = {}
) {
  // if (typeof window !== undefined) {
  //   const canvas = new OffscreenCanvas(width, height)
  //   return canvas.getContext(type, options)
  // }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  if (type === "2d") {
    return new HighResCanvas2D(canvas.getContext(type, options));
  }

  return canvas.getContext(type, options);
}
