export default [
  {
    name: "if",
    group: "logic",
    inputs: {
      condition: {
        type: "bool",
        default: false
      },

      true: {
        type: "any"
      },

      false: {
        type: "any"
      }
    },

    outputs: {
      out: {
        type: "any",
        default: false
      }
    },

    exec({ inputs, outputs }) {
      outputs["out"].value = inputs.condition.value
        ? inputs.true.value
        : inputs.false.value;
    }
  },

  {
    name: "AND",
    group: "logic",
    inputs: {
      a: {
        type: "bool",
        default: false
      },

      b: {
        type: "bool",
        default: false
      }
    },

    outputs: {
      "a.b": {
        type: "bool",
        default: false
      }
    },

    exec({ inputs, outputs }) {
      outputs["a.b"].value = inputs.a.value && inputs.b.value;
    }
  },

  {
    name: "OR",
    group: "logic",
    inputs: {
      a: {
        type: "bool",
        default: false
      },

      b: {
        type: "bool",
        default: false
      }
    },

    outputs: {
      "a+b": {
        type: "bool",
        default: false
      }
    },

    exec({ inputs, outputs }) {
      outputs["a+b"].value = inputs.a.value || inputs.b.value;
    }
  },

  {
    name: "NOT",
    group: "logic",
    inputs: {
      a: {
        type: "bool",
        default: false
      }
    },

    outputs: {
      "!a": {
        type: "bool",
        default: false
      }
    },

    exec({ inputs, outputs }) {
      outputs["!a"].value = !inputs.a.value;
    }
  },

  {
    name: "NAND",
    group: "logic",
    inputs: {
      a: {
        type: "bool",
        default: false
      },

      b: {
        type: "bool",
        default: false
      }
    },

    outputs: {
      "!(a.b)": {
        type: "bool",
        default: false
      }
    },

    exec({ inputs, outputs }) {
      outputs["!(a.b)"].value = !(inputs.a.value && inputs.b.value);
    }
  },

  {
    name: "NOR",
    group: "logic",
    inputs: {
      a: {
        type: "bool",
        default: false
      },

      b: {
        type: "bool",
        default: false
      }
    },

    outputs: {
      "!(a+b)": {
        type: "bool",
        default: false
      }
    },

    exec({ inputs, outputs }) {
      outputs["!(a+b)"].value = !(inputs.a.value || inputs.b.value);
    }
  },

  {
    name: "XOR",
    group: "logic",
    inputs: {
      a: {
        type: "bool",
        default: false
      },

      b: {
        type: "bool",
        default: false
      }
    },

    outputs: {
      "a⨁b": {
        type: "bool",
        default: false
      }
    },

    exec({ inputs, outputs }) {
      outputs["a⨁b"].value = !!(inputs.a.value ^ inputs.b.value);
    }
  },

  {
    name: "XNOR",
    group: "logic",
    inputs: {
      a: {
        type: "bool",
        default: false
      },

      b: {
        type: "bool",
        default: false
      }
    },

    outputs: {
      "!(a⨁b)": {
        type: "bool",
        default: false
      }
    },

    exec({ inputs, outputs }) {
      outputs["!(a⨁b)"].value = !(inputs.a.value ^ inputs.b.value);
    }
  }
];
