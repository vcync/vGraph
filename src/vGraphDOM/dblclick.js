import { vGraphDOM } from ".";

/** @this vGraphDOM */
export function dblclick(e) {
  const { dpr, graphToEdit } = this;
  const hitpoints = this.graphHitpoints[graphToEdit.id];

  const { point } = hitpoints.hasIntersect(
    "node",
    this.inputStatus.lastX / dpr,
    this.inputStatus.lastY / dpr
  );

  const { activeNodes } = graphToEdit;

  if (point && activeNodes[point.data.nodeId].isSubgraph) {
    this.graphToEdit = activeNodes[point.data.nodeId].graph;
  } else if (!point) {
    if (graphToEdit.parent && graphToEdit.parent.id) {
      this.focusedNodes.push(graphToEdit.parent.id);
    } else {
      this.focusedNodes.push(graphToEdit);
    }

    this.graphToEdit = graphToEdit.parent || this.vGraphCore.graph;
  }

  this.redraw();
}
