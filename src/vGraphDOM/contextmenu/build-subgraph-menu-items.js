import { MenuItem } from "../../nwjs-menu-browser";

export function buildSubgraphMenuItems(vGraphDOM, x, y) {
  const { graphToEdit } = vGraphDOM;

  return [
    new MenuItem({
      label: "Create output",
      click: () => {
        const nextOutput = `${graphToEdit.parentNode.outputs.$length + 1}`;

        vGraphDOM.addOutput(graphToEdit.parentNode.id, nextOutput, {
          type: "any"
        });

        vGraphDOM.createNode(
          {
            name: `SubGraph Output ${nextOutput}`,
            inputs: {
              x: {
                type: "any"
              }
            },
            exec({ inputs }) {
              this.parent.parentNode.outputs[nextOutput].value = inputs.x.value;
            },
            destroy() {
              this.parent.parentNode.removeOutput(nextOutput);
            }
          },
          vGraphDOM.inputStatus.x,
          vGraphDOM.inputStatus.y
        );
      }
    }),

    new MenuItem({
      label: "Create input",
      click: () => {
        const nextInput = `${graphToEdit.parentNode.inputs.$length + 1}`;

        vGraphDOM.addInput(graphToEdit.parentNode.id, nextInput, {
          type: "any"
        });

        vGraphDOM.createNode(
          {
            name: `SubGraph Input ${nextInput}`,
            outputs: {
              x: {
                type: "any"
              }
            },
            exec({ outputs }) {
              outputs.x.value = this.parent.parentNode.inputs[nextInput].value;
            },
            destroy() {
              this.parent.parentNode.removeInput(nextInput);
            }
          },
          vGraphDOM.inputStatus.x,
          vGraphDOM.inputStatus.y
        );
      }
    }),

    new MenuItem({
      type: "separator"
    }),

    new MenuItem({
      label: "Go to parent graph",
      click() {
        vGraphDOM.graphToEdit =
          graphToEdit.parent || vGraphDOM.vGraphCore.graph;
      }
    }),

    new MenuItem({
      label: "Return to Main graph",
      click() {
        vGraphDOM.graphToEdit = vGraphDOM.vGraphCore.graph;
      }
    })
  ];
}
