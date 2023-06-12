export default {
  name: "modV/contextJoiner",
  group: "modV",
  title: "Context Joiner",
  inputs: {
    canvas: {
      type: "texture",
      default: undefined
    },
    canvasContext: {
      type: "canvasContext",
      default: undefined
    },
    delta: {
      type: "number",
      default: undefined
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
    const canvas = inputs.canvas.value;
    const context = inputs.canvasContext.value;
    const delta = inputs.delta.value;

    if (canvas && context && delta) {
      outputs.context.value = { canvas, context, delta };
    }
  }
};
