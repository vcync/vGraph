import * as Types from "../../../index";

/**
 * @type {Types.NodeDefinition}
 */
export default {
  name: "modV/module/blockColor",
  group: "modV/module",
  title: "Block Color",
  inputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      default: undefined
    },
    rgb: {
      type: "color",
      default: "#000"
    },
    a: {
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
  exec({ inputs, outputs }) {
    const renderContext = inputs.context.value;
    const color = inputs.rgb.value;
    const alpha = inputs.a.value;

    if (renderContext) {
      const { canvas, context } = renderContext;
      const { width, height } = canvas;
      context.save();
      context.globalAlpha = alpha;
      context.fillStyle = color;
      context.fillRect(0, 0, width, height);
      context.restore();
    }

    outputs.context.value = renderContext;
  }
};
