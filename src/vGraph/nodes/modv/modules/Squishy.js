export default {
  name: 'modV/module/squishy',
  group: 'modV/module',
  title: 'Squishy',
  inputs: {
    context: {
      type: 'renderContext',
      connectionRequired: true,
      default: undefined
    },
    intensity: {
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
    const intensity = inputs.intensity.value

    if (!renderContext) {
      return
    }

    const { canvas, context, delta } = renderContext
    const { width, height } = canvas
    context.drawImage(
      canvas,
      Math.cos(delta / (900 * intensity)) * 5 +
        Math.cos(delta / (100 * intensity)),
      Math.sin(
        delta / (5000 * intensity) + 5 * Math.sin(delta / (500 * intensity))
      ) *
        10 -
        Math.cos(delta / (500 * intensity)),
      width + 20 * Math.sin(delta / (800 * intensity)),
      height +
        20 *
          Math.cos(
            delta / (600 * intensity) + 2 * Math.sin(delta / (500 * intensity))
          )
    )

    outputs.context.value = renderContext
  }
}
