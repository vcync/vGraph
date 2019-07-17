import randomColor from 'randomcolor'
import Theme from '../ecosystem-theme'
import createCanvas from './util/create-canvas'
import './util/rounded-rectangle'

import resize from './resize'
import draw from './draw'
import interaction from './interaction'
import wheel from './wheel'
import keydown from './keydown'
import keyup from './keyup'
import dblclick from './dblclick'
import contextmenu from './contextmenu'
import HitPoints from './HitPoints'
import InputStatus from './InputStatus'

import SubGraphNode from './nodes/SubGraph'

import Graph from './Graph'

import defaultTheme from './theme'

const hasDom = !(typeof window === 'undefined')

let aEl, rEl
if (hasDom) {
  aEl = window.addEventListener
  rEl = window.addEventListener
}

export default class vGraph {
  _hasDom = hasDom

  resize = resize.bind(this)

  draw = draw.bind(this)

  wheel = wheel.bind(this)

  keydown = keydown.bind(this)

  keyup = keyup.bind(this)

  dblclick = dblclick.bind(this)

  contextmenu = contextmenu.bind(this)

  hitpoints = new HitPoints()

  ecosystemTheme = new Theme()

  constructor(context = createCanvas(128, 128), theme = defaultTheme) {
    this.debug = {
      hitpoints: false,
      executionOrder: false
    }

    this.graph = new Graph(this)

    this.context = context
    this.canvas = context.canvas

    this.theme = theme
    this.ecosystemTheme.install(document.body, this.applyTheme.bind(this))
    this.ecosystemTheme.start()

    if (hasDom) {
      this.widgetOverlay = document.createElement('div')
      this.widgetOverlay.id = 'vgraph-widgets'
      this.inputStatus = new InputStatus(this, this.widgetOverlay)
      interaction.bind(this)()
    }

    this.colors = []
    this.colors.any = {
      light: randomColor({
        luminosity: 'light',
        seed: 'any'
      }),
      bright: randomColor({
        luminosity: 'bright',
        seed: 'any'
      }),
      dark: randomColor({
        luminosity: 'dark',
        seed: 'any'
      })
    }
    this.types = ['any']

    this.availableNodes = []

    this.dpr = 1
    this.scale = 1
    this.setScale = newScale => {
      if (
        (this.scale >= this.minScale && newScale > 0) ||
        (this.scale > this.minScale && newScale < 0)
      ) {
        this.scale += newScale * this.scale
      }

      if (this.scale < this.minScale && newScale < 0) {
        this.scale = this.minScale
      }
    }
    this.minScale = 0.1
    this.scaleOffsetX = 0
    this.scaleOffsetY = 0
    this.pointRadius = 5
    this.tooltip = ''

    this.startPoint = false
    this.endPoint = false

    this.focusedNodes = []

    this.showUi = true

    this.graphToEdit = this.graph

    this.registerNode(SubGraphNode)

    if (hasDom) {
      aEl('resize', this.resize)
      this.resize()
      aEl('wheel', this.wheel, { passive: false })
      aEl('keydown', this.keydown)
      aEl('keyup', this.keyup)
      aEl('dblclick', this.dblclick)
      aEl('contextmenu', this.contextmenu)
    }
  }

  destroy() {
    if (hasDom) {
      rEl('resize', this.resize)
      rEl('wheel', this.wheel)
      rEl('keydown', this.keydown)
      rEl('keyup', this.keyup)
      rEl('dblclick', this.dblclick)
      rEl('contextmenu', this.contextmenu)
    }
  }

  get editingSubGraph() {
    return this.graphToEdit !== this
  }

  /**
   * @typedef {Object} NodeDefinition
   *
   * @property {String}   name
   * @property {String}   description
   * @property {Object}   inputs
   * @property {Object}   outputs
   * @property {Function} exec
   */

  /**
   * Adds a Node Definition to vGraph
   * @param {NodeDefinition} nodeDefinition
   */
  registerNode(node) {
    if (Array.isArray(node)) {
      node.forEach(item => this.registerNode(item))
      return
    }

    this.availableNodes.push(node)

    /* @todo Optimise this */
    ;[
      ...Object.values(node.outputs || {}),
      ...Object.values(node.inputs || {})
    ].forEach(connection => {
      if (this.colors[connection.type]) {
        return
      }

      this.colors[connection.type] = {
        light: randomColor({
          luminosity: 'light',
          seed: connection.type
        }),
        bright: randomColor({
          luminosity: 'bright',
          seed: connection.type
        }),
        dark: randomColor({
          luminosity: 'dark',
          seed: connection.type
        })
      }

      this.types.push(connection.type)
    })
  }

  createNode() {
    const newNode = this.graphToEdit.createNode(...arguments)

    requestAnimationFrame(this.draw)
    return newNode
  }

  moveNode(id, x, y) {
    const { activeNodes } = this.graphToEdit
    const node = activeNodes[id]
    node.position = [x, y]
  }

  cloneNode(id) {
    if (Array.isArray(id)) {
      return id.map(item => this.cloneNode(item))
    }

    const node = this.graphToEdit.activeNodes[id]
    if (!node) {
      throw new Error('Cannot find active node in graph with id', id)
    }

    const { dpr } = this

    const newNode = this.createNode(
      node.name,
      node.x + 32 * dpr,
      node.y + 32 * dpr
    )
    return newNode
  }

  updateTree(delta) {
    function doTraversal(graph) {
      const {
        activeNodesExecOrder,
        activeNodesExecOrder: { length: activeNodesExecOrderLength },
        activeNodes
      } = graph

      const inputCheck = {}

      const traverseTree = node => {
        const inputs = node.inputs

        if (inputs.$connected && !inputCheck[node.id]) {
          inputCheck[node.id] = 1
        } else if (inputs.$connected) {
          inputCheck[node.id] += 1
        }

        if (
          inputs.$length &&
          inputs.$connected &&
          (inputCheck[node.id] < inputs.$connected ||
            inputCheck[node.id] > inputs.$connected)
        ) {
          return
        }

        if (node.exec) {
          let canExec = true
          if (node.outputs.$required.length) {
            canExec = node.outputs.$required.every(
              outputName => node.outputs[outputName].connections.length
            )
          }

          if (canExec) {
            try {
              node.exec({
                inputs: node.inputs,
                outputs: node.outputs,
                delta
              })
            } catch (e) {
              console.error(e)
            }
          }
        }

        if (node.isSubgraph) {
          doTraversal(node.graph)
        }

        const outputs = Object.values(node.outputs)

        for (let i = 0; i < outputs.length; ++i) {
          const outputConnections = outputs[i].connections

          for (let j = 0; j < outputConnections.length; ++j) {
            const toNode = node.parent.activeNodes[outputConnections[j][0]]
            const inputName = outputConnections[j][1]
            toNode.inputs[inputName].value = node.outputs[outputs[i].key].value

            traverseTree(toNode)
          }
        }
      }

      for (let i = 0; i < activeNodesExecOrderLength; ++i) {
        const nodeId = activeNodesExecOrder[i]
        traverseTree(activeNodes[nodeId])
      }
    }

    doTraversal(this.graph)
  }

  connect(node1, outputName, node2, inputName) {
    if (node2.inputs[inputName].connection.length) {
      return
    }

    node1.outputs[outputName].connections.push([node2.id, inputName])
    node2.inputs[inputName].connection = [node1.id, outputName]

    this.updateExecOrder()
  }

  disconnect(nodeId, inputName, spliceOutput = true) {
    const { activeNodes } = this.graphToEdit

    const connected = activeNodes[nodeId].inputs[inputName].connection
    if (!connected.length) {
      return
    }

    const [outputNodeId, outputName] = connected
    const outputNode = activeNodes[outputNodeId]

    const outputIndex = outputNode.outputs[outputName].connections.findIndex(
      connection => connection[0] === nodeId && connection[1] === inputName
    )

    if (outputIndex > -1 && spliceOutput) {
      outputNode.outputs[outputName].connections.splice(outputIndex, 1)
    }
    activeNodes[nodeId].inputs[inputName].connection = []
    this.updateExecOrder()
  }

  disconnectOutput(nodeId, outputName) {
    const { activeNodes } = this.graphToEdit

    const connections = activeNodes[nodeId].outputs[outputName].connections

    connections.forEach(connection => {
      const [toNodeId, inputName] = connection
      this.disconnect(toNodeId, inputName, false)
    })

    activeNodes[nodeId].outputs[outputName].connections = []
  }

  isConnected(nodeId) {
    const { activeNodes } = this.graphToEdit

    const node = typeof nodeId === 'string' ? activeNodes[nodeId] : nodeId
    let hasConnection = false
    const outputs = Object.values(node.outputs)

    if (outputs.length) {
      hasConnection = outputs.some(output => output.connections.length)
    }

    if (hasConnection) {
      return hasConnection
    }

    const inputs = Object.values(node.inputs)
    if (inputs.length) {
      hasConnection = inputs.some(input => input.connection.length)
    }

    return hasConnection
  }

  updateExecOrder() {
    const {
      activeNodes,
      activeNodeDrawOrder,
      activeNodeDrawOrder: { length: activeNodesLength }
    } = this.graphToEdit
    const connected = []

    for (let i = 0; i < activeNodesLength; ++i) {
      const node = activeNodes[activeNodeDrawOrder[i]]
      if (this.isConnected(node)) {
        connected.push(node)
      }
    }

    const inputCheck = {}
    const tree = []

    const traverseTree = node => {
      const inputs = node.inputs

      if (inputs.$connected && !inputCheck[node.id]) {
        inputCheck[node.id] = 1
      } else if (inputs.$connected) {
        inputCheck[node.id] += 1
      }

      if (
        inputs.$length &&
        inputs.$connected &&
        inputCheck[node.id] < inputs.$connected
      ) {
        return
      }

      tree.push(node.id)

      const outputs = Object.values(node.outputs)

      for (let i = 0; i < outputs.length; ++i) {
        const outputConnections = outputs[i].connections

        for (let j = 0; j < outputConnections.length; ++j) {
          const toNode = activeNodes[outputConnections[j][0]]

          traverseTree(toNode)
        }
      }
    }

    connected
      .filter(node => !node.inputs.$length)
      .forEach(node => traverseTree(node))

    this.graphToEdit.activeNodesExecOrder = tree
  }

  deleteNode(node) {
    if (Array.isArray(node)) {
      node.forEach(node => this.deleteNode(node))
      return
    }

    const {
      activeNodes,
      activeNodesExecOrder,
      activeNodeDrawOrder
    } = this.graphToEdit

    node.destroy()

    const acnoIndex = activeNodesExecOrder.indexOf(node.id)
    activeNodesExecOrder.splice(acnoIndex, 1)

    const acdoIndex = activeNodeDrawOrder.indexOf(node.id)
    activeNodeDrawOrder.splice(acdoIndex, 1)

    const inputKeys = Object.keys(node.inputs)
    const inputKeysLength = inputKeys.length

    for (let i = 0; i < inputKeysLength; ++i) {
      const inputName = inputKeys[i]
      this.disconnect(node.id, inputName)
    }

    const outputKeys = Object.keys(node.outputs)
    const outputKeysLength = outputKeys.length

    for (let i = 0; i < outputKeysLength; ++i) {
      const outputName = outputKeys[i]
      this.disconnectOutput(node.id, outputName)
    }

    delete activeNodes[node.id]
    requestAnimationFrame(this.draw)
  }

  deleteNodeById(nodeId) {
    if (Array.isArray(nodeId)) {
      nodeId.forEach(node => this.deleteNodeById(nodeId))
      return
    }

    this.deleteNode(this.activeNodes[nodeId])
  }

  toJSON() {
    const {
      activeNodes,
      activeNodesExecOrder,
      activeNodesExecOrder: { length: activeNodesExecOrderLength }
    } = this.graph
    const output = {}

    for (let i = 0; i < activeNodesExecOrderLength; ++i) {
      const id = activeNodesExecOrder[i]
      const fromNode = activeNodes[activeNodesExecOrder[i]]
      output[id] = fromNode.toJSON(false)
    }

    return JSON.stringify({ nodes: output, order: activeNodesExecOrder })
  }

  fromJSON(json) {
    const data = JSON.parse(json)
    this.loadData(data)
  }

  loadData(data) {
    const {
      order,
      order: { length: orderLength },
      nodes
    } = data

    const { activeNodes } = this.graphToEdit

    for (let i = 0; i < orderLength; ++i) {
      const node = nodes[order[i]]
      this.createNode(node.name, node.x * this.dpr, node.y * this.dpr, node.id)
    }

    for (let i = 0; i < orderLength; ++i) {
      const node = nodes[order[i]]

      const inputKeys = Object.keys(node.inputs)
      const inputKeysLength = inputKeys.length

      for (let j = 0; j < inputKeysLength; ++j) {
        const inputName = inputKeys[j]
        const input = node.inputs[inputName]
        activeNodes[node.id].inputs[inputName].value = input.value
      }

      const outputKeys = Object.keys(node.outputs)
      const outputKeysLength = outputKeys.length

      for (let j = 0; j < outputKeysLength; ++j) {
        const outputName = outputKeys[j]
        const output = node.outputs[outputName]

        activeNodes[node.id].outputs[outputName].value = output.value

        const connections = output.connections
        const connectionsLength = connections.length

        if (connectionsLength) {
          for (let k = 0; k < connectionsLength; ++k) {
            const connection = connections[k]
            const node1 = activeNodes[node.id]

            const node2 = activeNodes[connection[0]]
            const inputName = connection[1]
            this.connect(node1, outputName, node2, inputName)
          }
        }
      }
    }
  }

  applyTheme(newTheme) {
    const { theme } = this
    /* eslint-disable camelcase */
    /* eslint-disable no-unused-vars */

    const {
      b_high,
      b_inv,
      b_low,
      b_med,
      background,
      f_high,
      f_inv,
      f_low,
      f_med
    } = newTheme

    theme.backgroundColor = background
    theme.node.backgroundColor = b_low
    theme.node.focusedBackgroundColor = f_low
    theme.node.outlineColor = f_high
    theme.node.textColor = b_high
    theme.node.focusedTextColor = f_high
    theme.node.titleColor = f_high
    theme.node.focusedOutlineColor = b_inv
    theme.node.focusedTitleColor = b_inv
    theme.tooltip.textColor = f_high

    requestAnimationFrame(this.draw)
  }
}
