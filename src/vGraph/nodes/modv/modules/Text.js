import ctw from "canvas-text-wrapper/canvas-text-wrapper.js";
import * as Types from "../../../index";

const CanvasTextWrapper = ctw.CanvasTextWrapper;

const textCanvas = document.createElement("canvas");
const textContext = textCanvas.getContext("2d");

/**
 * @type {Types.NodeDefinition}
 */
export default {
  name: "modV/module/text",
  group: "modV/module",
  description: "Text",
  inputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      default: undefined
    },
    text: {
      type: "string",
      default: ""
    },

    size: {
      type: "number",
      min: 0,
      max: 1000,
      default: 16
    },

    positionX: {
      type: "number",
      default: 0.5,
      max: 1,
      min: 0,
      strict: true
    },

    positionY: {
      type: "number",
      default: 0.5,
      max: 1,
      min: 0,
      strict: true
    },

    strokeSize: {
      type: "number",
      default: 1,
      max: 50,
      min: 0,
      abs: true
    },

    font: {
      type: "string",
      default: "Proxima Nova"
    },

    weight: {
      type: "string",
      default: "bold"
    },

    fill: {
      type: "bool",
      default: true
    },

    fillColor: {
      type: "color",
      default: "#000000"
    },

    stroke: {
      type: "bool",
      default: false
    },

    strokeColor: {
      type: "color",
      default: "#ffffff"
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

    if (renderContext) {
      const { canvas, context } = renderContext;
      const { width, height } = canvas;

      if (textCanvas.width !== width || textCanvas.height !== height) {
        textCanvas.width = width;
        textCanvas.height = height;
      }

      const size = inputs.size.value;
      const text = inputs.text.value;
      const strokeSize = inputs.strokeSize.value;
      const font = inputs.font.value;
      const weight = inputs.weight.value;
      const stroke = inputs.stroke.value;
      const strokeColor = inputs.strokeColor.value;
      const fillColor = inputs.fillColor.value;
      const fill = inputs.fill.value;

      if (fill) {
        textContext.fillStyle = fillColor;
      } else {
        textContext.fillStyle = "rgba(0,0,0,0)";
      }
      textContext.strokeStyle = strokeColor;
      textContext.lineWidth = strokeSize;
      textContext.clearRect(0, 0, width, height);

      const offsetX = -(width * inputs.positionX.value);
      const offsetY = -(height * inputs.positionY.value);

      CanvasTextWrapper(textCanvas, text, {
        font: `${weight} ${size}px ${font}`,
        verticalAlign: "middle",
        textAlign: "center",
        strokeText: stroke,
        offsetX,
        offsetY
      });

      context.drawImage(textCanvas, 0, 0);
    }

    outputs.context.value = renderContext;
  }
};
