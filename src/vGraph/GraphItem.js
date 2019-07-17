import uuid4 from 'uuid/v4'

export default class GraphItem {
  constructor(graph, x, y, options, id = uuid4()) {
    this.parent = graph

    const outputs = {}

    Object.defineProperty(outputs, '$length', {
      enumerable: false,
      writable: true,
      value: 0
    })

    Object.defineProperty(outputs, '$required', {
      enumerable: false,
      writable: true,
      value: []
    })

    // We can't use makeObjectWithLength here because
    // Safari seems to have a Proxy chain limit?
    this.outputs = new Proxy(outputs, {
      set(obj, prop, value) {
        obj[prop] = value
        if ('connectionRequired' in value) {
          if (value.connectionRequired) {
            obj.$required.push(prop)
          }
        }

        obj.$length += 1

        return true
      },
      deleteProperty(obj, prop) {
        delete obj[prop]
        obj.$length -= 1
        return true
      }
    })

    const inputs = {}

    Object.defineProperty(inputs, '$length', {
      enumerable: false,
      writable: true,
      value: 0
    })

    Object.defineProperty(inputs, '$connected', {
      enumerable: false,
      writable: true,
      value: 0
    })

    // We can't use makeObjectWithLength here because
    // Safari seems to have a Proxy chain limit?
    this.inputs = new Proxy(inputs, {
      set(obj, prop, value) {
        obj[prop] = value
        if (prop !== '$connected') {
          obj.$length += 1
        }

        return true
      },
      deleteProperty(obj, prop) {
        delete obj[prop]
        obj.$length -= 1
        return true
      }
    })

    this.id = id
    this.width = 150
    this.height = 50
    this.title = options.title
    this.name = options.name
    this.x = x
    this.y = y
    this.itemHitpoints = []
    this._inputsDirty = 0

    if (options.exec) {
      this.exec = options.exec
    }

    if (options.data) {
      this.data = options.data
    }

    if (options.onInput) {
      this.onInput = options.onInput
    }

    if (options.init) {
      this.init = options.init
      this.init()
    }

    if (options.inputs) {
      const inputs = Object.keys(options.inputs)
      const inputsLength = inputs.length

      for (let i = 0; i < inputsLength; ++i) {
        const key = inputs[i]
        const value = options.inputs[key]

        this.addInput(key, value, false)
      }
    }

    if (options.outputs) {
      const outputs = Object.keys(options.outputs)
      const outputsLength = outputs.length

      for (let i = 0; i < outputsLength; ++i) {
        const key = outputs[i]
        const value = options.outputs[key]

        this.addOutput(key, value, false)
      }
    }

    if (options.destroy) {
      this._optionDestroy = options.destroy
    }
  }

  set position(vector) {
    const [x, y] = vector
    const { hitpoints } = this.parent
    const { dpr, pointRadius, theme } = this.parent.vGraph
    this.x = x
    this.y = y

    this.hitpoint = hitpoints.update(this.hitpoint.id, {
      x1: x,
      y1: y,
      x2: x + this.width * dpr,
      y2: y + this.height * dpr
    })

    const inputs = Object.keys(this.inputs)
    const inputsLength = inputs.length

    for (let i = 0; i < inputsLength; ++i) {
      const input = this.inputs[inputs[i]]

      hitpoints.update(input.hitpoint.id, {
        x: x,
        y: theme.node.padding * dpr * 2 + y + i * pointRadius * 2 * dpr * 2
      })
    }

    const outputs = Object.keys(this.outputs)
    const outputsLength = outputs.length

    for (let i = 0; i < outputsLength; ++i) {
      const output = this.outputs[outputs[i]]

      hitpoints.update(output.hitpoint.id, {
        x: x + this.width * dpr,
        y: theme.node.padding * dpr * 2 + y + i * pointRadius * 2 * dpr * 2
      })
    }
  }

  calculateSize() {
    const { dpr, theme, pointRadius } = this.parent.vGraph

    const maxNodes = Math.max(this.inputs.$length, this.outputs.$length)
    this.height = maxNodes * ((pointRadius * 4) / dpr) * dpr

    this.width += theme.node.padding * 2
    this.height += theme.node.padding * 2

    this.position = [this.x, this.y]
  }

  draw() {
    if (!this.parent.vGraph._hasDom) {
      return
    }

    const {
      x,
      y,
      width,
      height,
      parent: { vGraph },
      id,
      title,
      name,
      inputs,
      outputs
    } = this

    const {
      context,
      dpr,
      focusedNodes,
      startPoint,
      endPoint,
      theme,
      colors
    } = vGraph

    const {
      connectorRadius,
      borderRadius,
      backgroundColor,
      focusedBackgroundColor,
      fontFamily,
      fontSize,
      focusedOutlineWidth,
      focusedOutlineColor,
      titleColor,
      focusedTitleColor,
      textColor,
      focusedTextColor,
      connectorOutlineWidth,
      connectorFocusedOutlineWidth,
      outlineWidth,
      outlineColor,
      connectorOutlineColor,
      connectorFocusedOutlineColor
    } = theme.node

    const nodeFocused =
      focusedNodes.findIndex(focused => focused.id === id) > -1

    context.save()
    if (nodeFocused) {
      context.fillStyle = focusedBackgroundColor
    } else {
      context.fillStyle = backgroundColor
    }

    context.font = `${fontSize * dpr}px ${fontFamily}`

    context.roundedRect(x, y, width * dpr, height * dpr, borderRadius * dpr)
    if (outlineWidth && outlineColor) {
      context.strokeStyle = outlineColor
      context.lineWidth = outlineWidth * dpr
      context.stroke()
    }

    context.fill()
    if (nodeFocused) {
      context.fillStyle = focusedTitleColor
      context.strokeStyle = focusedOutlineColor
      context.lineWidth = focusedOutlineWidth * dpr
      context.stroke()
    } else {
      context.fillStyle = titleColor
    }

    context.fillText(title || name, x + 0.5, y - 5 + 0.5)

    const inputKeys = Object.keys(inputs)
    const inputsLength = inputKeys.length
    for (let i = 0; i < inputsLength; ++i) {
      const input = inputs[inputKeys[i]]
      const name = inputKeys[i]

      const x = input.hitpoint.x
      const y = input.hitpoint.y
      context.fillStyle = colors[input.type].light

      if (
        startPoint &&
        (startPoint.data.dataType === input.type ||
          startPoint.data.dataType === 'any' ||
          input.type === 'any')
      ) {
        context.globalAlpha = 1
      } else if (!startPoint) {
        context.globalAlpha = 1
      } else {
        context.globalAlpha = 0.5
      }

      if (
        endPoint &&
        endPoint.data.connectorId === input.id &&
        startPoint &&
        (startPoint.data.dataType === 'any' ||
          input.type === 'any' ||
          startPoint.data.dataType === input.type)
      ) {
        context.strokeStyle = connectorFocusedOutlineColor
        context.lineWidth = connectorFocusedOutlineWidth * dpr
      } else {
        context.strokeStyle = connectorOutlineColor
        context.lineWidth = connectorOutlineWidth * dpr
      }

      context.beginPath()
      context.arc(x, y, connectorRadius * dpr, 0, Math.PI * 2)
      context.fill()
      context.stroke()

      context.textBaseline = 'middle'
      context.fillStyle = textColor
      context.textAlign = 'left'
      if (nodeFocused) {
        context.fillStyle = focusedTextColor
      } else {
        context.fillStyle = textColor
      }
      context.fillText(name, x + dpr * connectorRadius * 1.5 + 0.5, y + 0.5)
    }

    const outputsKeys = Object.keys(outputs)
    const outputsLength = outputsKeys.length
    for (let i = 0; i < outputsLength; ++i) {
      const output = outputs[outputsKeys[i]]
      const name = outputsKeys[i]

      const x = output.hitpoint.x
      const y = output.hitpoint.y
      context.fillStyle = colors[output.type].light

      if (startPoint && startPoint.data.dataType !== output.type) {
        context.globalAlpha = 0.5
      } else {
        context.globalAlpha = 1
      }

      if (startPoint && output.id === startPoint.data.connectorId) {
        context.lineWidth = connectorFocusedOutlineWidth * dpr
        context.strokeStyle = connectorFocusedOutlineColor
      } else {
        context.strokeStyle = connectorOutlineColor
        context.lineWidth = connectorOutlineWidth * dpr
      }

      context.beginPath()
      context.arc(x, y, connectorRadius * dpr, 0, Math.PI * 2)
      context.fill()
      context.stroke()

      context.textBaseline = 'middle'
      context.fillStyle = textColor
      context.textAlign = 'right'
      if (nodeFocused) {
        context.fillStyle = focusedTextColor
      } else {
        context.fillStyle = textColor
      }
      context.fillText(name, x - dpr * connectorRadius * 1.5 + 0.5, y + 0.5)
    }

    context.restore()
  }

  destroy() {
    if (this._optionDestroy) {
      this._optionDestroy()
    }

    this.itemHitpoints.forEach(hitpointId =>
      this.parent.hitpoints.remove(hitpointId)
    )
  }

  toJSON(outputJSON = true) {
    const {
      id,
      x,
      y,
      name,
      inputs,
      outputs,
      graph: { vGraph }
    } = this

    const outputKeys = Object.keys(outputs)
    const mappedOutputs = outputKeys.reduce((obj, key) => {
      obj[key] = {}
      obj[key].id = outputs[key].id
      obj[key].connections = outputs[key].connections
      obj[key].value = outputs[key].value
      return obj
    }, {})

    const inputKeys = Object.keys(inputs)
    const mappedInputs = inputKeys.reduce((obj, key) => {
      obj[key] = {}
      obj[key].id = inputs[key].id
      obj[key].connections = inputs[key].connections
      obj[key].value = inputs[key].value
      return obj
    }, {})

    const out = {
      id,
      name,
      x: x / vGraph.dpr,
      y: y / vGraph.dpr,
      outputs: mappedOutputs,
      inputs: mappedInputs
    }

    if (outputJSON) {
      return JSON.stringify(out)
    } else {
      return out
    }
  }

  addInput(key, value, calculateSize = true) {
    const {
      parent: { vGraph },
      inputs: { $length: inputsLength },
      x,
      y
    } = this

    const { hitpoints } = this.parent

    const { dpr, theme, pointRadius } = vGraph

    const connectorId = uuid4()

    const hitpoint = hitpoints.add(
      'connector',
      {
        connectorId,
        nodeId: this.id,
        output: false,
        dataType: value.type,
        name: key
      },
      x,
      theme.node.padding * 2 * dpr +
        y +
        inputsLength * pointRadius * 2 * dpr * 2,
      pointRadius * dpr
    )

    this.itemHitpoints.push(hitpoint.id)

    this.inputs[key] = new Proxy(
      {
        id: connectorId,
        type: value.type,
        value: value.default,
        connection: [],
        hitpoint
      },
      {
        set: (obj, prop, value) => {
          obj[prop] = value

          if (
            prop === 'value' &&
            this.onInput &&
            vGraph.graphToEdit === this.parent &&
            vGraph.showUi
          ) {
            this.onInput({
              domElement: this.domElement,
              inputs: this.inputs
            })
          }

          if (prop === 'connection') {
            if (value.length) {
              this.inputs.$connected += 1
            } else {
              this.inputs.$connected -= 1
              this.inputs[key].value = value.default
            }
          }

          return true
        }
      }
    )

    if (calculateSize) {
      this.calculateSize()
    }
  }

  addOutput(key, value, calculateSize = true) {
    const {
      parent: { vGraph },
      outputs: { $length: outputsLength },
      x,
      y
    } = this

    const { hitpoints } = this.parent

    const { dpr, theme, pointRadius } = vGraph

    const connectorId = uuid4()

    const hitpoint = hitpoints.add(
      'connector',
      {
        nodeId: this.id,
        connectorId,
        output: true,
        name: key,
        dataType: value.type
      },
      x + this.width * dpr + theme.node.padding * 2 * dpr,
      theme.node.padding * dpr * 2 +
        y +
        outputsLength * pointRadius * 2 * dpr * 2,
      pointRadius * dpr
    )

    this.itemHitpoints.push(hitpoint.id)

    this.outputs[key] = new Proxy(
      {
        id: connectorId,
        key,
        type: value.type,
        value: value.default,
        connectionRequired: value.connectionRequired || false,
        connections: [],
        hitpoint
      },
      {
        set: (obj, prop, value) => {
          obj[prop] = value

          if (prop === 'connections') {
            if (!value.length) {
              this.outputs[key].value = value.default
            }
          }

          if (prop === 'value' && this._widgetOutputUpdate) {
            this._widgetOutputUpdate({ prop: key, value })
          }

          return true
        }
      }
    )

    if (calculateSize) {
      this.calculateSize()
    }
  }

  removeOutput(key) {
    const output = this.outputs[key]
    const hitpointId = output.hitpoint.id
    const itemhitpointIndex = this.itemHitpoints.indexOf(hitpointId)

    if (itemhitpointIndex > -1) {
      this.itemHitpoints.splice(itemhitpointIndex, 1)
    }

    this.parent.hitpoints.remove(hitpointId)

    delete this.outputs[key]

    this.calculateSize()
  }

  removeInput(key) {
    const input = this.inputs[key]
    const hitpointId = input.hitpoint.id
    const itemhitpointIndex = this.itemHitpoints.indexOf(hitpointId)

    if (itemhitpointIndex > -1) {
      this.itemHitpoints.splice(itemhitpointIndex, 1)
    }

    this.parent.hitpoints.remove(hitpointId)

    delete this.inputs[key]

    this.calculateSize()
  }
}
