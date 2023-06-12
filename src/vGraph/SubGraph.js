import { Node } from "./Node";
import HitPoints from "./HitPoints";
import Graph from "./Graph";

export default class SubGraph extends Node {
  hitpoints = new HitPoints();

  constructor(graph, x, y, options, id) {
    super(graph, x, y, options, id);

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
