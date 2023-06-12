export default {
  name: "modV/module/clear",
  group: "modV/module",
  title: "Clear",
  inputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
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
    const renderContext = inputs.context.value;

    if (renderContext) {
      const { canvas, context } = renderContext;
      const { width, height } = canvas;
      context.clearRect(0, 0, width, height);
    }

    outputs.context.value = renderContext;
  }
};
