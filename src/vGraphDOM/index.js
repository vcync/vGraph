import randomColor from "randomcolor";

import "./util/rounded-rectangle";
import { Theme } from "../ecosystem-theme";

import { vGraph } from "../vGraph";

import { createCanvas } from "./util/create-canvas";
import { HitPoints } from "./HitPoints";
import { draw } from "./draw";
import { resize } from "./resize";
import interaction from "./interaction";
import wheel from "./wheel";
import keydown from "./keydown";
import keyup from "./keyup";
import dblclick from "./dblclick";
import contextmenu from "./contextmenu";
import { defaultTheme } from "./theme";

import { InputStatus } from "./InputStatus";

const events = ["TYPE_ADDED", "CREATE_NODE", "DELETE_NODE"];

const aEl = window.addEventListener;
const rEl = window.addEventListener;

export class vGraphDOM {
  _boundHandlers = {};

  showUi = true;

  vGraphCore = null;
  _graphToEdit = null;
  colors = {};
  availableNodes = [];
  activeNodes = {};

  graphHitpoints = {
    // graphId: new HitPoints()
  };

  ecosystemTheme = new Theme(/* TODO: set default */);

  startPoint = false;
  endPoint = false;
  focusedNodes = [];

  context = null;
  canvas = null;

  widgetOverlay = null;
  inputStatus = null;

  dpr = 1;
  scale = 1;
  minScale = 0.1;
  scaleOffsetX = 0;
  scaleOffsetY = 0;
  pointRadius = 5;
  tooltip = "";

  draw = draw.bind(this);
  resize = resize.bind(this);
  wheel = wheel.bind(this);
  keydown = keydown.bind(this);
  keyup = keyup.bind(this);
  dblclick = dblclick.bind(this);
  contextmenu = contextmenu.bind(this);

  /**
   * @param {vGraph} graph
   */
  constructor(context = createCanvas(128, 128), theme = defaultTheme) {
    this.debug = {
      hitpoints: false,
      executionOrder: false
    };

    this.context = context;
    this.canvas = context.canvas;

    this.theme = theme;
    this.ecosystemTheme.install(document.body, this.applyTheme.bind(this));
    this.ecosystemTheme.start();

    this.widgetOverlay = document.createElement("div");
    this.widgetOverlay.id = "vgraph-widgets";
    this.inputStatus = new InputStatus(this, this.widgetOverlay);
    interaction.bind(this)();

    aEl("resize", this.resize);
    this.resize();
    aEl("wheel", this.wheel, { passive: false });
    aEl("keydown", this.keydown);
    aEl("keyup", this.keyup);
    aEl("dblclick", this.dblclick);
    aEl("contextmenu", this.contextmenu);

    events.forEach(event => {
      this._boundHandlers[event] = this[`${event}_eventHandler`].bind(this);
    });
  }

  set graphToEdit(graph) {
    this._graphToEdit = graph;
    this.vGraphCore.graphToEdit = graph;
  }

  get graphToEdit() {
    return this._graphToEdit;
  }

  destroy() {
    rEl("resize", this.resize);
    rEl("wheel", this.wheel);
    rEl("keydown", this.keydown);
    rEl("keyup", this.keyup);
    rEl("dblclick", this.dblclick);
    rEl("contextmenu", this.contextmenu);
  }

  setScale(newScale) {
    if (
      (this.scale >= this.minScale && newScale > 0) ||
      (this.scale > this.minScale && newScale < 0)
    ) {
      this.scale += newScale * this.scale;
    }

    if (this.scale < this.minScale && newScale < 0) {
      this.scale = this.minScale;
    }
  }

  moveNode(id, x, y) {
    const { activeNodes, dpr, pointRadius, theme } = this;
    const nodeSize = activeNodes[id];
    const node = this.graphToEdit.activeNodes[id];

    const hitpoints = this.graphHitpoints[this.graphToEdit.id];

    hitpoints.update(id, {
      x1: x,
      y1: y,
      x2: x + nodeSize.width * dpr,
      y2: y + nodeSize.height * dpr
    });

    activeNodes[id] = {
      ...activeNodes[id],
      x,
      y
    };

    if (activeNodes[id].domElement) {
      const { domElement } = activeNodes[id];

      domElement.style.left = `${x / dpr}px`;
      domElement.style.top = `${y / dpr}px`;
    }

    const inputs = Object.keys(node.inputs);
    const inputsLength = inputs.length;

    for (let i = 0; i < inputsLength; ++i) {
      const input = node.inputs[inputs[i]];

      hitpoints.update(input.id, {
        x: x,
        y: theme.node.padding * dpr * 2 + y + i * pointRadius * 2 * dpr * 2
      });
    }

    const outputs = Object.keys(node.outputs);
    const outputsLength = outputs.length;

    for (let i = 0; i < outputsLength; ++i) {
      const output = node.outputs[outputs[i]];

      hitpoints.update(output.id, {
        x: x + nodeSize.width * dpr,
        y: theme.node.padding * dpr * 2 + y + i * pointRadius * 2 * dpr * 2
      });
    }
  }

  connect(node1, outputName, node2, inputName) {
    this.graphToEdit.connect(node1, outputName, node2, inputName);
  }

  disconnect(nodeId, inputName, spliceOutput = true) {
    this.graphToEdit.disconnect(nodeId, inputName, spliceOutput);
  }

  applyTheme(newTheme) {
    const { theme } = this;

    const {
      b_high,
      b_inv,
      b_low,
      b_med,
      background,
      f_high,
      f_inv,
      f_low,
      f_med
    } = newTheme;

    theme.backgroundColor = background;
    theme.node.backgroundColor = b_low;
    theme.node.focusedBackgroundColor = f_low;
    theme.node.outlineColor = f_high;
    theme.node.textColor = b_high;
    theme.node.focusedTextColor = f_high;
    theme.node.titleColor = f_high;
    theme.node.focusedOutlineColor = b_inv;
    theme.node.focusedTitleColor = b_inv;
    theme.tooltip.textColor = f_high;

    requestAnimationFrame(this.draw);
  }

  createNode(name, x, y) {
    let nodeDefinition = name;

    if (typeof name === "string") {
      nodeDefinition = this.availableNodes.find(node => node.name === name);

      if (!nodeDefinition) {
        throw Error(`Cannot find a registered node with the name "${name}"`);
      }
    }

    const node = this.graphToEdit.createNode(nodeDefinition);

    const { dpr, theme, pointRadius, graphHitpoints } = this;
    const maxNodes = Math.max(node.inputs.$length, node.outputs.$length);

    // Create hitpoints for node's graph if it doesn't exist
    if (!graphHitpoints[this.graphToEdit.id]) {
      graphHitpoints[this.graphToEdit.id] = new HitPoints();
    } else if (nodeDefinition.isSubgraph) {
      graphHitpoints[node.graph.id] = new HitPoints();
    }

    const hitpoints = graphHitpoints[this.graphToEdit.id];

    // Calculate node size
    let width = 150;
    let height = 50;

    height = maxNodes * ((pointRadius * 4) / dpr) * dpr;
    width += theme.node.padding * 2;
    height += theme.node.padding * 2;

    hitpoints.add(
      "node",
      node.id,
      { nodeId: node.id },
      x,
      y,
      x + width * dpr,
      y + height * dpr
    );

    const localNode = { ref: node, id: node.id, width, height, x, y };

    // Set up widget and node size
    if (nodeDefinition.widget) {
      const domElement = nodeDefinition.widget({
        setOutput: (name, value) => {
          node.outputs[name].value = value;
        },

        outputUpdate: callback => {
          node.on("update", o => console.log(o));
        }
      });

      if (domElement) {
        domElement.id = node.id;
        domElement.style.padding = `${theme.node.padding}px`;
        domElement.style.top = `${y / dpr}px`;
        domElement.style.left = `${x / dpr}px`;
        localNode.domElement = domElement;
        this.widgetOverlay.appendChild(domElement);

        if (
          localNode.height <
          domElement.clientHeight - theme.node.padding * 2
        ) {
          localNode.height +=
            domElement.clientHeight +
            theme.node.padding * 2 -
            localNode.height * dpr;
        }

        localNode.domElement = domElement;
      }
    }

    if (nodeDefinition.onInput) {
      node.on("input", ({ inputs }) => {
        nodeDefinition.onInput({ inputs, ...localNode });
      });
    }

    this.activeNodes[node.id] = localNode;

    const {
      outputs: { $length: outputsLength },
      inputs: { $length: inputsLength }
    } = node;

    // Create hitpoints for node outputs
    // TODO: use addOutput instead

    const outputKeys = Object.entries(node.outputs);

    for (let i = 0; i < outputsLength; i += 1) {
      const [key, value] = outputKeys[i];
      const { id } = value;

      hitpoints.add(
        "connector",
        id,
        {
          nodeId: node.id,
          connectorId: id,
          output: true,
          name: key,
          dataType: value.type
        },
        x + width * dpr,
        y + outputsLength * pointRadius * 2 * dpr,
        pointRadius * dpr
      );
    }

    // Create hitpoints for node inputs
    // TODO: use addInput instead
    const inputKeys = Object.entries(node.inputs);

    for (let i = 0; i < inputsLength; i += 1) {
      const [key, value] = inputKeys[i];
      const { id } = value;

      hitpoints.add(
        "connector",
        id,
        {
          nodeId: node.id,
          connectorId: id,
          output: false,
          dataType: value.type,
          name: key
        },
        x,
        y + inputsLength * pointRadius * 2 * dpr * 2,
        pointRadius * dpr
      );
    }

    requestAnimationFrame(this.draw);

    return node;
  }

  cloneNode(id) {
    if (Array.isArray(id)) {
      return id.map(item => this.cloneNode(item));
    }

    const node = this.graphToEdit.activeNodes[id];
    const nodeSize = this.activeNodes[id];
    if (!node) {
      throw new Error("Cannot find active node in graph with id", id);
    }

    const { dpr } = this;

    return this.createNode(
      node.name,
      nodeSize.x + 32 * dpr,
      nodeSize.y + 32 * dpr
    );
  }

  deleteNode(id) {
    this.vGraphCore.deleteNode(id);

    delete this.activeNodes[id];
  }

  addInput(nodeId, key, value) {
    const { pointRadius, dpr, graphHitpoints } = this;
    const { ref: node, x, y } = this.activeNodes[nodeId];
    const id = node.addInput(key, value);

    let hitpoints = graphHitpoints[node.graph.id];
    if (node.isSubgraph) {
      hitpoints = graphHitpoints[node.parent.id];
    }

    const inputsLength = node.inputs.$length;

    hitpoints.add(
      "connector",
      id,
      {
        nodeId: node.id,
        connectorId: id,
        output: false,
        dataType: value.type,
        name: key
      },
      x,
      y + inputsLength * pointRadius * 2 * dpr * 2,
      pointRadius * dpr
    );
  }

  addOutput(nodeId, key, value) {
    const { pointRadius, dpr, graphHitpoints } = this;
    const { ref: node, x, y, width } = this.activeNodes[nodeId];
    const id = node.addOutput(key, value);

    let hitpoints = graphHitpoints[node.graph.id];
    if (node.isSubgraph) {
      hitpoints = graphHitpoints[node.parent.id];
    }

    const outputsLength = node.outputs.$length;

    for (let i = 0; i < outputsLength; i += 1) {
      hitpoints.add(
        "connector",
        id,
        {
          nodeId: node.id,
          connectorId: id,
          output: true,
          dataType: value.type,
          name: key
        },
        x + width * dpr,
        y + outputsLength * pointRadius * 2 * dpr,
        pointRadius * dpr
      );
    }
  }

  /**
   * @param {vGraph} graph
   */
  useGraph(vGraphCore) {
    if (this.vGraphCore) {
      this.releaseEventListeners(this.vGraphCore);
      this.graphHitpoints = {};
    }

    this.vGraphCore = vGraphCore;
    this.graphToEdit = vGraphCore.graphToEdit;

    // TODO: a traversal to find subgraphs and create their hitpoints
    this.graphHitpoints[this.graphToEdit.id] = new HitPoints();

    [...vGraphCore.types].forEach(type => this.TYPE_ADDED_eventHandler(type));

    events.forEach(event => {
      vGraphCore.on(vGraphCore.events[event], this._boundHandlers[event]);
    });
  }

  registerNode(node) {
    if (Array.isArray(node)) {
      node.forEach(item => this.registerNode(item));
      return;
    }

    this.availableNodes.push(node);
    this.vGraphCore.registerNode(node);
  }

  releaseEventListeners(vGraphCore) {
    events.forEach(event => {
      vGraphCore.off(vGraphCore.events[event], this._boundHandlers[event]);
    });
  }

  TYPE_ADDED_eventHandler(type) {
    this.colors[type] = {
      light: randomColor({
        luminosity: "light",
        seed: type
      }),
      bright: randomColor({
        luminosity: "bright",
        seed: type
      }),
      dark: randomColor({
        luminosity: "dark",
        seed: type
      })
    };
  }

  CREATE_NODE_eventHandler(node) {
    // this.activeNodes[node.id] = {
    //   id: node.id
    // };
  }

  DELETE_NODE_eventHandler(nodeId) {
    delete this.activeNodes[nodeId];

    requestAnimationFrame(this.draw);
  }
}
