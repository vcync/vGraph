export default [
  {
    name: "time",
    group: "input",
    outputs: {
      time: {
        name: "time",
        type: "number",
        default: 0
      }
    },
    exec({ outputs }) {
      outputs.time.value = performance.now();
    }
  },

  {
    name: "Color",
    group: "input",
    outputs: {
      rgb: {
        type: "color",
        default: "#000000"
      }
    },
    widget({ setOutput, outputUpdate }) {
      const out = document.createElement("div");
      const input = document.createElement("input");
      input.type = "color";
      input.value = "#000000";
      input.addEventListener("input", e => {
        setOutput("rgb", e.target.value);
      });
      out.appendChild(input);

      outputUpdate(({ prop, value }) => {
        input.value = value;
      });

      return out;
    }
  },

  {
    name: "Number",
    group: "input",
    outputs: {
      x: {
        type: "number",
        default: 0
      }
    },
    widget({ setOutput, outputUpdate }) {
      const out = document.createElement("div");
      const input = document.createElement("input");
      input.style.width = "25%";
      input.type = "number";
      input.value = 0;
      input.step = 0.001;
      input.addEventListener("input", e => {
        setOutput("x", parseFloat(e.target.value, 10));
      });
      out.appendChild(input);

      outputUpdate(({ prop, value }) => {
        input.value = value;
      });

      return out;
    }
  },

  {
    name: "Text",
    group: "input",
    outputs: {
      x: {
        type: "string",
        default: 0
      }
    },
    widget({ setOutput, outputUpdate }) {
      const out = document.createElement("div");
      const input = document.createElement("input");
      input.style.width = "75%";
      input.type = "text";
      input.value = "";
      input.addEventListener("input", e => {
        setOutput("x", e.target.value);
      });
      out.appendChild(input);

      outputUpdate(({ prop, value }) => {
        input.value = value;
      });

      return out;
    }
  },

  {
    name: "Checkbox",
    group: "input",
    outputs: {
      x: {
        type: "bool",
        default: false
      }
    },
    widget({ setOutput, outputUpdate }) {
      const out = document.createElement("div");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.value = false;
      input.addEventListener("input", e => {
        setOutput("x", e.target.checked);
      });
      out.appendChild(input);

      outputUpdate(({ prop, value }) => {
        input.checked = value;
      });

      return out;
    }
  }
];
