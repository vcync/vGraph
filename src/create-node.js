import uuid4 from "uuid/v4";

export default function createNode(name, x, y) {
  const existingNode = this.availableNodes.find(node => node.name === name);
  if (!existingNode) {
    throw Error(`Cannot find a registered node with the name "${name}"`);
  }

  const newNode = {
    id: uuid4(),
    inputs: {},
    outputs: {},
    width: 150,
    height: 50,
    title: existingNode.title,
    name,
    x,
    y
  };

  if (existingNode.inputs) {
    const inputs = Object.keys(existingNode.inputs);
    const inputsLength = inputs.length;

    for (let i = 0; i < inputsLength; ++i) {
      const key = inputs[i];
      const value = existingNode.inputs[key];

      newNode.inputs[key] = {
        id: uuid4(),
        label: value.label,
        type: value.type
      };
    }
  }

  if (existingNode.outputs) {
    const outputs = Object.keys(existingNode.outputs);
    const inputsLength = outputs.length;

    for (let i = 0; i < inputsLength; ++i) {
      const key = outputs[i];
      const value = existingNode.outputs[key];

      newNode.outputs[key] = {
        label: value.label,
        type: value.type,

        connections: [],
        value: 0
      };
    }
  }
}
