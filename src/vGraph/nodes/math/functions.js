export default Object.getOwnPropertyNames(Math)
  .filter(fn => typeof Math[fn] === "function" && Math[fn].length < 3)
  .map(fn => {
    const node = {
      name: `math/function/${fn}`,
      group: "math/function",
      inputs: {},
      outputs: {
        x: {
          type: "number",
          default: 0
        }
      }
    };

    const operation = Math[fn];
    const argsLength = Math[fn].length;

    node.inputs.x = {
      type: "number",
      default: 0
    };

    node.exec = ({ inputs, outputs }) => {
      outputs.x.value = operation(inputs.x.value);
    };

    if (argsLength > 1) {
      node.inputs.y = {
        type: "number",
        default: 0
      };

      node.exec = ({ inputs, outputs }) => {
        outputs.x.value = operation(inputs.x.value, inputs.y.value);
      };
    }

    if (argsLength > 2) {
      node.inputs.z = {
        type: "number",
        default: 0
      };

      node.exec = ({ inputs, outputs }) => {
        outputs.x.value = operation(
          inputs.x.value,
          inputs.y.value,
          inputs.z.value
        );
      };
    }

    return node;
  });
