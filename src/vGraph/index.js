import EventEmitter from "eventemitter3";
import { Graph } from "./Graph";
import { Node } from "./Node";

/**
 * @param {number} delta
 * @param {Graph} graph
 */
function doTraversal(delta, graph) {
  const {
    activeNodesExecOrder,
    activeNodesExecOrder: { length: activeNodesExecOrderLength },
    activeNodes
  } = graph;

  const inputCheck = {};

  /**
   * @param {Node} node
   */
  const traverseTree = node => {
    const inputs = node.inputs;

    if (inputs.$connected && !inputCheck[node.id]) {
      inputCheck[node.id] = 1;
    } else if (inputs.$connected) {
      inputCheck[node.id] += 1;
    }

    if (
      inputs.$length &&
      inputs.$connected &&
      (inputCheck[node.id] < inputs.$connected ||
        inputCheck[node.id] > inputs.$connected)
    ) {
      return;
    }

    if (node.exec) {
      let canExec = true;
      if (node.outputs.$required.length) {
        canExec = node.outputs.$required.every(
          outputName => node.outputs[outputName].connections.length
        );
      }

      if (canExec) {
        try {
          node.exec({
            inputs: node.inputs,
            outputs: node.outputs,
            delta
          });
        } catch (e) {
          console.error(e);
        }
      }
    }

    if (node.isSubgraph) {
      doTraversal(delta, node.graph);
    }

    const outputs = Object.values(node.outputs);

    for (let i = 0; i < outputs.length; ++i) {
      const outputConnections = outputs[i].connections;

      for (let j = 0; j < outputConnections.length; ++j) {
        const toNode = node.parent.activeNodes[outputConnections[j][0]];
        const inputName = outputConnections[j][1];
        toNode.inputs[inputName].value = node.outputs[outputs[i].key].value;

        traverseTree(toNode);
      }
    }
  };

  for (let i = 0; i < activeNodesExecOrderLength; ++i) {
    const nodeId = activeNodesExecOrder[i];
    traverseTree(activeNodes[nodeId]);
  }
}

/**
 * @typedef InputDefinition
 *
 * @prop {string} type
 * @prop {boolean} connectionRequired
 * @prop {any} default
 */

/**
 * @typedef OutputDefinition
 *
 * @prop {string} type
 * @prop {boolean} connectionRequired
 * @prop {any} default
 */

/**
 * @typedef NodeInput
 * @extends InputDefinition
 * @prop {any} value
 */

/**
 * @typedef NodeOutput
 * @extends OutputDefinition
 * @prop {any} value
 */

/**
 * @typedef ExecCallbackContext
 * @prop {Object<string, NodeInput>} inputs
 * @prop {Object<string, NodeOutput>} outputs
 */

/**
 * @callback ExecCallback
 * @param {ExecCallbackContext} args
 */

/**
 * @typedef NodeDefinition
 *
 * @prop {String} name
 * @prop {String} description
 * @prop {Object<string, InputDefinition>} inputs
 * @prop {Object<string, OutputDefinition>} outputs
 * @prop {ExecCallback} exec
 */

export class vGraph extends EventEmitter {
  types = new Set();

  events = {
    REGISTER_NODE: Symbol("REGISTER_NODE"),
    CREATE_NODE: Symbol("CREATE_NODE"),
    DELETE_NODE: Symbol("DELETE_NODE"),
    TYPE_ADDED: Symbol("TYPE_ADDED")
  };

  constructor() {
    super();

    this.graph = new Graph(this);

    this.addType("any");

    this.graphToEdit = this.graph;
  }

  /**
   *
   * @param {string} type
   */
  addType(type) {
    if (this.types.has(type)) {
      return;
    }

    this.types.add(type);
    this.emit(this.events.TYPE_ADDED, type);
  }

  get editingSubGraph() {
    return this.graphToEdit !== this;
  }

  /**
   * Adds a Node Definition to vGraph
   * @param {NodeDefinition} nodeDefinition
   */
  registerNode(nodeDefinition) {
    /* @todo Optimise this */
    [
      ...Object.values(nodeDefinition.outputs || {}),
      ...Object.values(nodeDefinition.inputs || {})
    ].forEach(connection => {
      this.addType(connection.type);
    });

    this.emit(this.events.REGISTER_NODE, nodeDefinition);
  }

  /**
   * @param {string} name
   */
  createNode(name) {
    const newNode = this.graphToEdit.createNode(name);

    this.emit(this.events.CREATE_NODE, newNode);
    return newNode;
  }

  /**
   * @param {number} delta
   */
  updateTree(delta) {
    doTraversal(delta, this.graph);
  }

  /**
   * @param {Node} node1
   * @param {string} outputName
   * @param {Node} node2
   * @param {string} inputName
   */
  connect(node1, outputName, node2, inputName) {
    if (node2.inputs[inputName].connection.length) {
      return;
    }

    node1.outputs[outputName].connections.push([node2.id, inputName]);
    node2.inputs[inputName].connection = [node1.id, outputName];

    this.graphToEdit.updateExecOrder();
  }

  /**
   * @param {string} nodeId
   * @param {string} inputName
   * @param {bool} spliceOutput
   */
  disconnect(nodeId, inputName, spliceOutput = true) {
    const { activeNodes } = this.graphToEdit;

    const connected = activeNodes[nodeId].inputs[inputName].connection;
    if (!connected.length) {
      return;
    }

    const [outputNodeId, outputName] = connected;
    const outputNode = activeNodes[outputNodeId];

    const outputIndex = outputNode.outputs[outputName].connections.findIndex(
      connection => connection[0] === nodeId && connection[1] === inputName
    );

    if (outputIndex > -1 && spliceOutput) {
      outputNode.outputs[outputName].connections.splice(outputIndex, 1);
    }
    activeNodes[nodeId].inputs[inputName].connection = [];
    this.graphToEdit.updateExecOrder();
  }

  /**
   * @param {string} nodeId
   * @param {string} outputName
   */
  disconnectOutput(nodeId, outputName) {
    const { activeNodes } = this.graphToEdit;

    const connections = activeNodes[nodeId].outputs[outputName].connections;

    connections.forEach(connection => {
      const [toNodeId, inputName] = connection;
      this.disconnect(toNodeId, inputName, false);
    });

    activeNodes[nodeId].outputs[outputName].connections = [];
  }

  /**
   * @param {string} nodeId
   */
  isConnected(nodeId) {
    const { activeNodes } = this.graphToEdit;

    const node = typeof nodeId === "string" ? activeNodes[nodeId] : nodeId;
    let hasConnection = false;
    const outputs = Object.values(node.outputs);

    if (outputs.length) {
      hasConnection = outputs.some(output => output.connections.length);
    }

    if (hasConnection) {
      return hasConnection;
    }

    const inputs = Object.values(node.inputs);
    if (inputs.length) {
      hasConnection = inputs.some(input => input.connection.length);
    }

    return hasConnection;
  }

  /**
   * @param {Node} node
   */
  deleteNode(node) {
    if (Array.isArray(node)) {
      node.forEach(node => this.deleteNode(node));
      return;
    }

    const {
      activeNodes,
      activeNodesExecOrder,
      activeNodeDrawOrder
    } = this.graphToEdit;

    node.destroy();

    const acnoIndex = activeNodesExecOrder.indexOf(node.id);
    activeNodesExecOrder.splice(acnoIndex, 1);

    const acdoIndex = activeNodeDrawOrder.indexOf(node.id);
    activeNodeDrawOrder.splice(acdoIndex, 1);

    const inputKeys = Object.keys(node.inputs);
    const inputKeysLength = inputKeys.length;

    for (let i = 0; i < inputKeysLength; ++i) {
      const inputName = inputKeys[i];
      this.disconnect(node.id, inputName);
    }

    const outputKeys = Object.keys(node.outputs);
    const outputKeysLength = outputKeys.length;

    for (let i = 0; i < outputKeysLength; ++i) {
      const outputName = outputKeys[i];
      this.disconnectOutput(node.id, outputName);
    }

    this.emit(this.events.DELETE_NODE, node.id);

    delete activeNodes[node.id];
  }

  /**
   * @param {string} nodeId
   */
  deleteNodeById(nodeId) {
    if (Array.isArray(nodeId)) {
      nodeId.forEach(id => this.deleteNodeById(id));
      return;
    }

    this.deleteNode(this.graph.activeNodes[nodeId]);
  }

  reset() {
    this.deleteNodeById(Object.keys(this.graph.activeNodes));
  }

  toJSON() {
    const {
      activeNodes,
      activeNodesExecOrder,
      activeNodesExecOrder: { length: activeNodesExecOrderLength }
    } = this.graph;
    const output = {};

    for (let i = 0; i < activeNodesExecOrderLength; ++i) {
      const id = activeNodesExecOrder[i];
      const fromNode = activeNodes[activeNodesExecOrder[i]];
      output[id] = fromNode.toJSON(false);
    }

    return JSON.stringify({ nodes: output, order: activeNodesExecOrder });
  }
}
