import GraphItem from "./GraphItem";

export class Node extends GraphItem {
  constructor(graph, options, id) {
    super(graph, options, id);

    this.graph = graph;
  }

  destroy() {
    super.destroy();

    if (this.domElement) {
      this.domElement.remove();
    }
  }
}
