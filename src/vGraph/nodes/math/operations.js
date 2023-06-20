import * as Types from "../../index";

/**
 * @type {Types.NodeDefinition[]}
 */
export default [
  {
    name: "math/operation/add",
    group: "math/operation",
    description: "Adds two numbers",
    inputs: {
      a: {
        type: "number",
        default: 0
      },
      b: {
        type: "number",
        default: 0
      }
    },
    outputs: {
      "a+b": {
        type: "number",
        default: 0
      }
    },
    exec({ inputs, outputs }) {
      outputs["a+b"].value = inputs.a.value + inputs.b.value;
    }
  },

  {
    name: "math/operation/subtract",
    group: "math/operation",
    description: "Subtracts two numbers",
    inputs: {
      a: {
        type: "number",
        default: 0
      },
      b: {
        type: "number",
        default: 0
      }
    },
    outputs: {
      "a-b": {
        type: "number",
        default: 0
      }
    },
    exec({ inputs, outputs }) {
      outputs["a-b"].value = inputs.a.value - inputs.b.value;
    }
  },

  {
    name: "math/operation/multiply",
    group: "math/operation",
    description: "Multiplies two numbers",
    inputs: {
      a: {
        type: "number",
        default: 0
      },
      b: {
        type: "number",
        default: 0
      }
    },
    outputs: {
      "a×b": {
        type: "number",
        default: 0
      }
    },
    exec({ inputs, outputs }) {
      outputs["a×b"].value = inputs.a.value * inputs.b.value;
    }
  },

  {
    name: "math/operation/divide",
    group: "math/operation",
    description: "Divides two numbers",
    inputs: {
      a: {
        type: "number",
        default: 0
      },
      b: {
        type: "number",
        default: 0
      }
    },
    outputs: {
      "a÷b": {
        type: "number",
        default: 0
      }
    },
    exec({ inputs, outputs }) {
      outputs["a÷b"].value = inputs.a.value / inputs.b.value;
    }
  }
];
