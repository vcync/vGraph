import { v4 as uuidv4 } from "uuid";
import EventEmitter from "eventemitter3";

export default class GraphItem extends EventEmitter {
  state = {};

  constructor(graph, options, id = uuidv4()) {
    super();
    this.parent = graph;

    const outputs = {};

    Object.defineProperty(outputs, "$length", {
      enumerable: false,
      writable: true,
      value: 0
    });

    Object.defineProperty(outputs, "$required", {
      enumerable: false,
      writable: true,
      value: []
    });

    // We can't use makeObjectWithLength here because
    // Safari seems to have a Proxy chain limit?
    this.outputs = new Proxy(outputs, {
      set(obj, prop, value) {
        obj[prop] = value;
        if ("connectionRequired" in value) {
          if (value.connectionRequired) {
            obj.$required.push(prop);
          }
        }

        obj.$length += 1;

        return true;
      },
      deleteProperty(obj, prop) {
        delete obj[prop];
        obj.$length -= 1;
        return true;
      }
    });

    const inputs = {};

    Object.defineProperty(inputs, "$length", {
      enumerable: false,
      writable: true,
      value: 0
    });

    Object.defineProperty(inputs, "$connected", {
      enumerable: false,
      writable: true,
      value: 0
    });

    // We can't use makeObjectWithLength here because
    // Safari seems to have a Proxy chain limit?
    this.inputs = new Proxy(inputs, {
      set(obj, prop, value) {
        obj[prop] = value;
        if (prop !== "$connected") {
          obj.$length += 1;
        }

        return true;
      },
      deleteProperty(obj, prop) {
        delete obj[prop];
        obj.$length -= 1;
        return true;
      }
    });

    this.id = id;

    this.title = options.title;
    this.name = options.name;

    this.itemHitpoints = [];

    if (options.exec) {
      this.exec = options.exec;
    }

    if (options.data) {
      this.data = options.data;
    }

    if (options.onInput) {
      this.onInput = options.onInput;
    }

    if (options.init) {
      this.init = options.init;
      this.init();
    }

    if (options.state) {
      this.state = options.state();
    }

    if (options.inputs) {
      const inputs = Object.keys(options.inputs);
      const inputsLength = inputs.length;

      for (let i = 0; i < inputsLength; ++i) {
        const key = inputs[i];
        const value = options.inputs[key];

        this.addInput(key, value, false);
      }
    }

    if (options.outputs) {
      const outputs = Object.keys(options.outputs);
      const outputsLength = outputs.length;

      for (let i = 0; i < outputsLength; ++i) {
        const key = outputs[i];
        const value = options.outputs[key];

        this.addOutput(key, value, false);
      }
    }

    if (options.destroy) {
      this._optionDestroy = options.destroy;
    }
  }

  destroy() {
    if (this._optionDestroy) {
      this._optionDestroy();
    }

    this.itemHitpoints.forEach(hitpointId =>
      this.parent.hitpoints.remove(hitpointId)
    );
  }

  toJSON(outputJSON = true) {
    const {
      id,
      x,
      y,
      name,
      inputs,
      outputs,
      graph: { vGraph }
    } = this;

    const outputKeys = Object.keys(outputs);
    const mappedOutputs = outputKeys.reduce((obj, key) => {
      obj[key] = {};
      obj[key].id = outputs[key].id;
      obj[key].connections = outputs[key].connections;
      obj[key].value = outputs[key].value;
      return obj;
    }, {});

    const inputKeys = Object.keys(inputs);
    const mappedInputs = inputKeys.reduce((obj, key) => {
      obj[key] = {};
      obj[key].id = inputs[key].id;
      obj[key].connections = inputs[key].connections;
      obj[key].value = inputs[key].value;
      return obj;
    }, {});

    const out = {
      id,
      name,
      x: x / vGraph.dpr,
      y: y / vGraph.dpr,
      outputs: mappedOutputs,
      inputs: mappedInputs
    };

    if (outputJSON) {
      return JSON.stringify(out);
    } else {
      return out;
    }
  }

  addInput(key, value) {
    const {
      parent: { vGraph }
    } = this;

    const id = uuidv4();

    this.inputs[key] = new Proxy(
      {
        id,
        type: value.type,
        value: value.default,
        connection: []
      },
      {
        set: (obj, prop, value) => {
          obj[prop] = value;

          if (
            prop === "value" &&
            vGraph.graphToEdit === this.parent // possible optimisation?
          ) {
            this.emit("input", {
              inputs: this.inputs
            });
          }

          if (prop === "connection") {
            if (value.length) {
              this.inputs.$connected += 1;
            } else {
              this.inputs.$connected -= 1;
              this.inputs[key].value = value.default;
            }
          }

          return true;
        }
      }
    );

    return id;
  }

  addOutput(key, value) {
    const id = uuidv4();

    this.outputs[key] = new Proxy(
      {
        id,
        key,
        type: value.type,
        value: value.default,
        connectionRequired: value.connectionRequired || false,
        connections: []
      },
      {
        set: (obj, prop, value) => {
          obj[prop] = value;

          if (prop === "connections") {
            if (!value.length) {
              this.outputs[key].value = value.default;
            }
          }

          if (prop === "value") {
            this.emit("output", { prop: key, value });
          }

          return true;
        }
      }
    );

    return id;
  }

  removeOutput(key) {
    const output = this.outputs[key];
    const hitpointId = output.hitpoint.id;
    const itemhitpointIndex = this.itemHitpoints.indexOf(hitpointId);

    if (itemhitpointIndex > -1) {
      this.itemHitpoints.splice(itemhitpointIndex, 1);
    }

    this.parent.hitpoints.remove(hitpointId);

    delete this.outputs[key];
  }

  removeInput(key) {
    const input = this.inputs[key];
    const hitpointId = input.hitpoint.id;
    const itemhitpointIndex = this.itemHitpoints.indexOf(hitpointId);

    if (itemhitpointIndex > -1) {
      this.itemHitpoints.splice(itemhitpointIndex, 1);
    }

    this.parent.hitpoints.remove(hitpointId);

    delete this.inputs[key];
  }
}
