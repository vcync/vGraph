import * as Types from "../../index";

/** @type {MIDIInput[]} */
let inputs;

/** @type {MIDIOutput[]} */
let outputs;

const TYPE_NOTEON = 144;
const TYPE_CC = 176;

/**
 * @param {MIDIMessageEvent} e
 */
function handleInput({ data: [type, channel, data] }) {
  console.log(type, channel, data);
}

/**
 * @param {MIDIAccess} access
 */
function handleStateChange(access) {
  inputs = [...access.inputs.values()];
  outputs = [...access.outputs.values()];

  for (let i = 0; i < outputs.length; i += 1) {
    const input = inputs[i];
    input.removeEventListener("midimessage", handleInput);
    input.addEventListener("midimessage", handleInput);
    // input.addEventListener("statechange", event => {
    //   console.log(event);
    // });
  }
}

navigator.requestMIDIAccess({ sysex: false }).then(access => {
  // Get lists of available MIDI controllers
  inputs = [...access.inputs.values()];
  outputs = [...access.outputs.values()];

  handleStateChange(access);

  access.onstatechange = event => {
    handleStateChange(event.currentTarget);

    // Print information about the (dis)connected MIDI controller
    console.log(event.port.name, event.port.manufacturer, event.port.state);
  };
});

/**
 * @type {Types.NodeDefinition[]}
 */
export default [
  {
    name: "MIDI Input",
    group: "MIDI",

    state() {
      return {
        listenFor: [],
        learning: false
      };
    },

    inputs: {},

    outputs: {
      out: {
        type: "midi",
        default: []
      }
    },

    // onInput({ domElement }) {},

    widget({ setOutput, getState, setState }) {
      const out = document.createElement("div");
      const learnButton = document.createElement("button");
      learnButton.textContent = "Learn";

      learnButton.addEventListener("click", () => {
        const state = getState();
        const learning = !state.learning;

        if (learning) {
          learnButton.textContent = "Learning…";
        } else {
          learnButton.textContent = "Learn";
        }

        setState({ ...state, learning });
      });

      out.appendChild(learnButton);

      // const input = document.createElement("input");
      // input.type = "text";
      // input.value = "";
      // input.addEventListener("input", e => {
      //   setOutput("x", parseInt(e.target.value, 10));
      // });
      // out.appendChild(input);

      return out;
    }
  }
];
