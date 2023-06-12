export default {
  name: "Value Display",
  group: "output",
  inputs: {
    x: {
      type: "number",
      default: 0
    }
  },

  widget({ setOutput }) {
    const out = document.createElement("div");
    const input = document.createElement("input");
    input.type = "number";
    input.value = 0;
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

    domElement.childNodes[0].value = inputs.x.value || 0;
  }
};
