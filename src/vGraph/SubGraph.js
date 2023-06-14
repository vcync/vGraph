import { Node } from "./Node";
import { Graph } from "./Graph";

export class SubGraph extends Node {
  constructor(graph, options, id) {
    super(graph, options, id);

    this.graph = new Graph(graph.vGraph);
    this.graph.name = options.name;
  }

  toJSON(outputJSON = true) {
    const data = super.toJSON(false);
    data.isSubgraph = true;
    data.graph = this.graph.toJSON(false);
    if (outputJSON) {
      return JSON.stringify(data);
    }

    return data;
  }
}
