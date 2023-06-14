import { v4 as uuidv4 } from "uuid";
import { makeObjectWithLength } from "./util/make-object-with-length";

import { Node } from "./Node";
import { SubGraph } from "./SubGraph";

export class Graph {
  activeNodeDrawOrder = [];
  activeNodesExecOrder = [];

  constructor(vGraph, id = uuidv4()) {
    this.vGraph = vGraph;
    this.id = id;

    this.activeNodes = new Proxy(makeObjectWithLength(), {
      set: (obj, prop, value) => {
        this.activeNodeDrawOrder.push(prop);
        obj[prop] = value;
        return true;
      },

      deleteProperty: (obj, prop) => {
        delete obj[prop];
        const index = this.activeNodeDrawOrder.indexOf(prop);
        if (index > -1) {
          this.activeNodeDrawOrder.splice(index, 1);
        }
        return true;
      }
    });
  }

  createNode(nodeDefinition, id) {
    let newNode;

    if (nodeDefinition.isSubgraph) {
      newNode = new SubGraph(this, nodeDefinition, id);
      newNode.isSubgraph = true;
      newNode.graph.parent = this;
      newNode.graph.parentNode = newNode;
      newNode.graph.parentId = this.id || "top";
    } else {
      newNode = new Node(this, nodeDefinition, id);
    }

    this.activeNodes[newNode.id] = newNode;

    return newNode;
  }

  connect(node1, outputName, node2, inputName) {
    if (node2.inputs[inputName].connection.length) {
      return;
    }

    node1.outputs[outputName].connections.push([node2.id, inputName]);
    node2.inputs[inputName].connection = [node1.id, outputName];

    this.updateExecOrder();
  }

  disconnect(nodeId, inputName, spliceOutput = true) {
    const { activeNodes } = this;

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
    this.updateExecOrder();
  }

  disconnectOutput(nodeId, outputName) {
    const { activeNodes } = this;

    const connections = activeNodes[nodeId].outputs[outputName].connections;

    connections.forEach(connection => {
      const [toNodeId, inputName] = connection;
      this.disconnect(toNodeId, inputName, false);
    });

    activeNodes[nodeId].outputs[outputName].connections = [];
  }

  isConnected(nodeId) {
    const { activeNodes } = this;

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

  updateExecOrder() {
    const activeNodesLength = this.activeNodeDrawOrder.length;
    const connected = [];

    for (let i = 0; i < activeNodesLength; ++i) {
      const node = this.activeNodes[this.activeNodeDrawOrder[i]];
      if (this.isConnected(node)) {
        connected.push(node);
      }
    }

    this.activeNodesExecOrder = connected
      .sort((nodeB, nodeA) => nodeA.outputs.$length - nodeB.outputs.$length)
      .map(node => node.id);
  }

  deleteNode(node) {
    if (Array.isArray(node)) {
      node.forEach(node => this.deleteNode(node));
      return;
    }

    const { activeNodes, activeNodesExecOrder, activeNodeDrawOrder } = this;

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

    delete activeNodes[node.id];
  }

  deleteNodeById(nodeId) {
    if (Array.isArray(nodeId)) {
      nodeId.forEach(node => this.deleteNodeById(nodeId));
      return;
    }

    this.deleteNode(this.activeNodes[nodeId]);
  }

  toJSON(outputJSON = true) {
    const {
      activeNodes,
      activeNodesExecOrder,
      activeNodesExecOrder: { length: activeNodesExecOrderLength }
    } = this;
    const out = { nodes: {}, order: activeNodesExecOrder };

    for (let i = 0; i < activeNodesExecOrderLength; ++i) {
      const id = activeNodesExecOrder[i];
      const fromNode = activeNodes[activeNodesExecOrder[i]];
      out.nodes[id] = fromNode.toJSON(false);
    }

    if (outputJSON) {
      return JSON.stringify(out);
    }

    return out;
  }

  fromJSON(json) {
    const data = JSON.parse(json);
    const {
      order,
      order: { length: orderLength },
      nodes
    } = data;

    const { activeNodes } = this;

    for (let i = 0; i < orderLength; ++i) {
      const node = nodes[order[i]];
      this.createNode(node.name, node.x, node.y, node.id);
    }

    for (let i = 0; i < orderLength; ++i) {
      const node = nodes[order[i]];

      const inputKeys = Object.keys(node.inputs);
      const inputKeysLength = inputKeys.length;

      for (let j = 0; j < inputKeysLength; ++j) {
        const inputName = inputKeys[j];
        const input = node.inputs[inputName];
        activeNodes[node.id].inputs[inputName].value = input.value;
      }

      const outputKeys = Object.keys(node.outputs);
      const outputKeysLength = outputKeys.length;

      for (let j = 0; j < outputKeysLength; ++j) {
        const outputName = outputKeys[j];
        const output = node.outputs[outputName];

        activeNodes[node.id].outputs[outputName].value = output.value;

        const connections = output.connections;
        const connectionsLength = connections.length;

        if (connectionsLength) {
          for (let k = 0; k < connectionsLength; ++k) {
            const connection = connections[k];
            const node1 = activeNodes[node.id];

            const node2 = activeNodes[connection[0]];
            const inputName = connection[1];
            this.connect(node1, outputName, node2, inputName);
          }
        }
      }
    }
  }
}
