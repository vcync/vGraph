import * as Types from "../../../index";

/**
 * @type {Types.NodeDefinition}
 */
export default {
  name: "modV/module/GridStretch",
  group: "modV/module",
  description: "GridStretch",
  inputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      default: undefined
    },
    slicesX: {
      type: "number",
      default: 5
    },
    slicesY: {
      type: "number",
      default: 5
    },
    scale: {
      type: "number",
      default: 1
    }
  },
  outputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      default: undefined
    }
  },
  data: {
    newCanvas2: null,
    newCtx2: null
  },
  init() {
    this.data.scratchCanvas = document.createElement("canvas");
    this.data.scratchContext = this.data.scratchCanvas.getContext("2d");
  },
  exec({ inputs, outputs }) {
    const renderContext = inputs.context.value;

    if (renderContext) {
      const { canvas, context } = renderContext;
      const { width, height } = canvas;
      const { scratchCanvas, scratchContext } = this.data;
      const slicesX = inputs.slicesX.value;
      const slicesY = inputs.slicesY.value;
      const scale = inputs.scale.value;

      if (scratchCanvas.width !== width || scratchCanvas.height !== height) {
        scratchCanvas.width = width;
        scratchCanvas.height = height;
      }

      context.save();
      var sliceWidth = canvas.width / slicesX;
      var sliceHeight = canvas.height / slicesY;

      scratchContext.clearRect(0, 0, canvas.width, canvas.height);

      for (var i = slicesX; i >= 0; i--) {
        for (var j = slicesY; j >= 0; j--) {
          scratchContext.drawImage(
            canvas,
            i * sliceWidth,
            j * sliceHeight,
            sliceWidth,
            sliceHeight,

            i * sliceWidth - scale,
            j * sliceHeight - scale,
            sliceWidth + scale * 2,
            sliceHeight + scale * 2
          );
        }
      }
      context.drawImage(scratchCanvas, 0, 0, canvas.width, canvas.height);
      context.restore();
    }

    outputs.context.value = renderContext;
  }
};
