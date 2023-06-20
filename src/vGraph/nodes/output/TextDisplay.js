import * as Types from "../../index";

/**
 * @type {Types.NodeDefinition}
 */
export const TextDisplay = {
  name: "Text Display",
  group: "output",
  inputs: {
    x: {
      type: "string",
      default: ""
    }
  },

  widget({ setOutput }) {
    const out = document.createElement("div");
    const input = document.createElement("input");
    input.type = "text";
    input.value = "";
    input.addEventListener("input", e => {
      setOutput("x", parseInt(e.target.value, 10));
    });
    out.appendChild(input);

    return out;
  },

  onInput({ inputs, domElement }) {
    if (!domElement) {
      return;
    }

    domElement.childNodes[0].value = inputs.x.value;
  }
};
