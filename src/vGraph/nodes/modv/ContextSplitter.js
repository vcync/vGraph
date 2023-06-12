export default {
  name: "modV/contextSplitter",
  group: "modV",
  title: "Context Splitter",
  inputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      default: undefined
    }
  },
  outputs: {
    canvas: {
      type: "texture",
      default: {}
    },
    canvasContext: {
      type: "canvasContext"
    },
    delta: {
      type: "number"
    }
  },
  exec({ inputs, outputs }) {
    const renderContext = inputs.context.value;
    if (!renderContext) return;

    const { canvas, context, delta } = renderContext;

    outputs.canvas.value = canvas;
    outputs.canvasContext.value = context;
    outputs.delta.value = delta;
  }
};
