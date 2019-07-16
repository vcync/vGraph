export default {
  name: 'modV/module/scale',
  group: 'modV/module',
  description: 'Scales',
  inputs: {
    context: {
      type: 'renderContext',
      connectionRequired: true,
      default: undefined
    },
    scale: {
      type: 'number',
      default: 1
    }
  },
  outputs: {
    context: {
      type: 'renderContext',
      connectionRequired: true,
      default: undefined
    }
  },
  exec({ inputs, outputs }) {
    const renderContext = inputs.context.value
    const scale = inputs.scale.value

    if (renderContext) {
      const { canvas, context } = renderContext
      const { width, height } = canvas

      context.save()
      context.drawImage(
        canvas,
        width / 2 - (width * scale) / 2,
        height / 2 - (height * scale) / 2,
        width * scale,
        height * scale
      )
      context.restore()
    }

    outputs.context.value = renderContext
  }
}
