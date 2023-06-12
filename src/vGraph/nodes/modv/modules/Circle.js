export default {
  name: "modV/module/circle",
  group: "modV/module",
  title: "Circle",
  inputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      default: undefined
    },
    circleSize: {
      type: "number",
      default: 1
    },
    strokeSize: {
      type: "number",
      default: 1
    },
    startAngle: {
      type: "number",
      default: 0
    },
    endAngle: {
      type: "number",
      default: Math.PI * 2
    }
  },
  outputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      deafult: undefined
    }
  },
  exec({ inputs, outputs }) {
    const renderContext = inputs.context.value;
    const circleSize = inputs.circleSize.value;
    const startAngle = inputs.startAngle.value;
    const endAngle = inputs.endAngle.value;

    const { canvas, context, delta } = renderContext;
    const { width, height } = canvas;
    const newSize = circleSize;

    context.strokeStyle = context.fillStyle = "rgba(0,0,0,0.001)";
    context.fillRect(0, 0, width, height);
    context.strokeStyle = context.fillStyle = `hsl(${delta / 40}, 80%, 50%)`;
    context.beginPath();
    context.arc(width / 2, height / 2, newSize, startAngle, endAngle);
    context.lineWidth = inputs.strokeSize.value;
    context.stroke();

    outputs.context.value = renderContext;
  }
};
