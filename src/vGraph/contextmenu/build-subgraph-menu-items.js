import { MenuItem } from '../../nwjs-menu-browser'
import Node from '../Node'

export default function buildSubgraphMenuItems(graph, x, y) {
  const { vGraph } = graph

  return [
    new MenuItem({
      label: 'Create output',
      click: () => {
        const nextInput = `${graph.parentNode.outputs.$length + 1}`

        graph.parentNode.addOutput(nextInput, {
          type: 'any'
        })

        const newNode = new Node(
          graph,
          vGraph.inputStatus.x,
          vGraph.inputStatus.y,
          {
            name: `SubGraph Output ${nextInput}`,
            inputs: {
              x: {
                type: 'any'
              }
            },
            exec({ inputs }) {
              this.parent.parentNode.outputs[nextInput].value = inputs.x.value
            },
            destroy() {
              this.parent.parentNode.removeOutput(nextInput)
            }
          }
        )

        graph.activeNodes[newNode.id] = newNode
        requestAnimationFrame(vGraph.draw)
      }
    }),

    new MenuItem({
      label: 'Create input',
      click: () => {
        const nextInput = `${graph.parentNode.inputs.$length + 1}`

        graph.parentNode.addInput(nextInput, {
          type: 'any'
        })

        const newNode = new Node(
          graph,
          vGraph.inputStatus.x,
          vGraph.inputStatus.y,
          {
            name: `SubGraph Input ${nextInput}`,
            outputs: {
              x: {
                type: 'any'
              }
            },
            exec({ outputs }) {
              outputs.x.value = this.parent.parentNode.inputs[nextInput].value
            },
            destroy() {
              this.parent.parentNode.removeInput(nextInput)
            }
          }
        )

        graph.activeNodes[newNode.id] = newNode
        requestAnimationFrame(vGraph.draw)
      }
    }),

    new MenuItem({
      type: 'separator'
    }),

    new MenuItem({
      label: 'Go to parent graph',
      click() {
        graph.vGraph.graphToEdit = graph.parent || graph.vGraph.graph
        requestAnimationFrame(graph.vGraph.draw())
      }
    }),

    new MenuItem({
      label: 'Return to Main graph',
      click() {
        graph.vGraph.graphToEdit = graph.vGraph.graph
        requestAnimationFrame(graph.vGraph.draw())
      }
    })
  ]
}
