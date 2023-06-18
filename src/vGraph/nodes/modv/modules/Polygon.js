import * as Types from "../../../index";

function polygon(ctx, x, y, radius, sides, startAngle, anticlockwise) {
  if (sides < 3) return;

  let a = (Math.PI * 2) / sides;
  a = anticlockwise ? -a : a;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(startAngle);
  ctx.moveTo(radius, 0);

  for (let i = 1; i < sides; i += 1) {
    ctx.lineTo(radius * Math.cos(a * i), radius * Math.sin(a * i));
  }

  ctx.restore();
}

const polygonCanvas = document.createElement("canvas");
const polygonContext = polygonCanvas.getContext("2d");
polygonCanvas.width = polygonCanvas.height = 500;

/**
 * @type {Types.NodeDefinition}
 */
export default {
  name: "modV/module/polygon",
  group: "modV/module",
  title: "Polygon",
  inputs: {
    radius: {
      type: "number",
      default: 10
    },
    sides: {
      type: "number",
      default: 5
    },
    strokeSize: {
      type: "number",
      default: 1
    },
    rotation: {
      type: "number",
      default: 0
    }
  },
  outputs: {
    texture: {
      type: "texture",
      default: undefined
    }
  },
  exec({ inputs, outputs }) {
    polygonContext.clearRect(0, 0, polygonCanvas.width, polygonCanvas.height);
    polygonContext.beginPath();
    polygon(
      polygonContext,
      polygonCanvas.width / 2,
      polygonCanvas.height / 2,
      inputs.radius.value,
      inputs.sides.value,
      inputs.rotation.value,
      false
    );
    polygonContext.closePath();
    polygonContext.lineWidth = inputs.strokeSize.value;
    polygonContext.strokeStyle = `hsl(${Date.now() / 10},50%, 50%)`;
    polygonContext.stroke();
    outputs.texture.value = polygonCanvas;
  }
};
