import GraphItem from "./GraphItem";

export class Node extends GraphItem {
  constructor(graph, x, y, options, id) {
    super(graph, x, y, options, id);

    this.graph = graph;

    const { theme, dpr } = this.graph.vGraph;

    this._widgetOutputUpdate = null;

    if (options.widget) {
      const domElement = options.widget({
        setOutput: (name, value) => {
          this.outputs[name].value = value;
        },

        outputUpdate: callback => {
          this._widgetOutputUpdate = callback;
        }
      });

      if (domElement && this.graph.vGraph._hasDom) {
        domElement.id = this.id;
        domElement.style.padding = `${theme.node.padding}px`;
        domElement.style.top = `${y / dpr}px`;
        domElement.style.left = `${x / dpr}px`;
        this.domElement = domElement;
        this.graph.vGraph.widgetOverlay.appendChild(domElement);

        if (this.height < domElement.clientHeight - theme.node.padding * 2) {
          this.height +=
            domElement.clientHeight +
            theme.node.padding * 2 -
            this.height * dpr;
        }
      }
    }

    this.hitpoint = graph.hitpoints.add(
      "node",
      { nodeId: this.id },
      x,
      y,
      x + this.width * dpr,
      y + this.height * dpr
    );

    this.itemHitpoints.push(this.hitpoint.id);
    this.calculateSize();
  }

  set position(vector) {
    super.position = vector;
    const {
      x,
      y,
      graph: { vGraph }
    } = this;
    const { dpr } = vGraph;

    if (this.domElement && vGraph._hasDom) {
      this.domElement.style.left = `${x / dpr}px`;
      this.domElement.style.top = `${y / dpr}px`;
    }
  }

  destroy() {
    super.destroy();

    if (this.domElement) {
      this.domElement.remove();
    }
  }

  calculateSize() {
    super.calculateSize();

    const { dpr } = this.graph.vGraph;
    const { hitpoint } = this;

    const x1 = hitpoint.x1;
    const x2 = x1 + this.width * dpr;
    const y1 = hitpoint.y1;
    const y2 = y1 + this.height * dpr;

    this.parent.hitpoints.update(this.hitpoint.id, {
      x2,
      y2
    });
  }
}
