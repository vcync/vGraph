import * as Types from "../../../index";

const tempCanvas = document.createElement("canvas");
const tempContext = tempCanvas.getContext("2d");

/**
 * @type {Types.NodeDefinition}
 */
export default {
  name: "modV/module/pixelate",
  group: "modV/module",
  description: "Pixelates",
  inputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      default: undefined
    },
    size: {
      type: "number",
      default: 5
    }
  },
  outputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      default: undefined
    }
  },
  exec({ inputs, outputs }) {
    const renderContext = inputs.context.value;
    const size = inputs.size.value;

    if (renderContext) {
      const { canvas, context } = renderContext;
      const { width, height } = canvas;

      if (tempCanvas.width !== width || tempCanvas.height !== height) {
        tempCanvas.width = width;
        tempCanvas.height = height;
      }

      const w = width / size;
      const h = height / size;

      context.save();
      tempContext.clearRect(0, 0, tempCanvas.width, tempCanvas.height);
      context.imageSmoothingEnabled = false;
      tempContext.drawImage(
        canvas,
        0,
        0,
        canvas.width,
        canvas.height,
        0,
        0,
        w,
        h
      );
      context.drawImage(
        tempCanvas,
        0,
        0,
        w,
        h,
        0,
        0,
        canvas.width,
        canvas.height
      );
      context.restore();
    }

    outputs.context.value = renderContext;
  }
};
