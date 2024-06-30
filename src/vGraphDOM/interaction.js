import { vGraphDOM } from ".";
import isIntersectRect from "./util/is-intersect-rect";

/** @this vGraphDOM */
export function interaction() {
  this.inputStatus.watch(
    "mousedown",
    "(Date.now() - lastDown) < 250 && button === 0",
    e => {
      this.touchScaling = true;
      return "touchscaling";
    }
  );

  this.inputStatus.watch("mousemove", e => {
    const { dpr } = this;
    const { point } = this.graphHitpoints[this.graphToEdit.id].hasIntersect(
      "connector",
      e.x / dpr,
      e.y / dpr
    );

    if (point) {
      this.tooltip = point.data.dataType;
      this.redraw();
      return;
    } else if (this.tooltip) {
      this.tooltip = "";
      this.redraw();
      return;
    }

    if (e.action) {
      this.redraw();
    }
  });

  this.inputStatus.watch("mousemove", 'action === "touchscaling"', e => {
    const unscaledDeltaY = e.unscaledY - e.lastUnscaledY;
    this.setScale(unscaledDeltaY / 200);
  });

  this.inputStatus.watch(
    "mousemove",
    "isDown && !shiftPressed && !action && button === 0",
    e => {
      this.selectionDrawing = true;
      return "selectiondrawing";
    }
  );

  this.inputStatus.watch(
    "mousemove",
    "(button === 0 && isDown && shiftPressed) || (button === 1 && isDown)",
    e => {
      if (e.action === "panning") {
        this.panScale.pan({
          x: this.inputStatus.x - this.inputStatus.downX,
          y: this.inputStatus.y - this.inputStatus.downY
        });

        this.redraw();
      } else if (!e.action) {
        return "panning";
      }
    }
  );

  this.inputStatus.watch("mousedown", "!action && button === 0", e => {
    const { dpr } = this;

    const { point } = this.graphHitpoints[this.graphToEdit.id].hasIntersect(
      "connector",
      e.x / dpr,
      e.y / dpr
    );

    if (point && point.data.output) {
      this.startPoint = point;
      this.lineDrawing = true;
      this.redraw();
      return "linedrawing";
    } else if (point && "output" in point.data && !point.data.output) {
      this.disconnect(point.data.nodeId, point.data.name);
      this.redraw();
      return "disconnectnode";
    }
  });

  this.inputStatus.watch(
    "mousemove",
    'action === "linedrawing" && isDown',
    e => {
      const { dpr, startPoint } = this;
      this.tooltip = startPoint.data.dataType;

      const { point } = this.graphHitpoints[this.graphToEdit.id].hasIntersect(
        "connector",
        e.x / dpr,
        e.y / dpr
      );

      if (startPoint && point && point.data.nodeId !== startPoint.data.nodeId) {
        this.endPoint = point;
        this.tooltip = this.endPoint.data.dataType;
      } else {
        this.endPoint = false;
      }
    }
  );

  this.inputStatus.watch("mousedown", "!action", e => {
    const { dpr } = this;
    const { activeNodes, activeNodeDrawOrder } = this.graphToEdit;
    const hitpoints = this.graphHitpoints[this.graphToEdit.id];

    let newFocusedNode = false;
    let focusedNodeClicked = false;

    const { point } = this.graphHitpoints[this.graphToEdit.id].hasIntersect(
      "node",
      e.x / dpr,
      e.y / dpr
    );

    if (point) {
      const node = activeNodes[point.data.nodeId];

      if (node) {
        this.nodeMoving = true;
        newFocusedNode = node;

        if (
          this.focusedNodes.findIndex(focused => focused.id === node.id) > -1
        ) {
          focusedNodeClicked = true;
        }
      }
    }

    if (!e.shiftPressed && !focusedNodeClicked) {
      this.focusedNodes.splice(0, this.focusedNodes.length);
    }

    if (newFocusedNode && !focusedNodeClicked) {
      const focusedNodesLength = this.focusedNodes.push(newFocusedNode);

      if (
        focusedNodesLength &&
        activeNodeDrawOrder.length !== focusedNodesLength
      ) {
        this.focusedNodes.forEach(node => {
          const index = activeNodeDrawOrder.indexOf(node.id);

          if (index > -1) {
            activeNodeDrawOrder.splice(index, 1);
            activeNodeDrawOrder.push(node.id);
          }
        });
      }
    }

    this.redraw();
  });

  this.inputStatus.watch("mousedown", "!action", e => {
    const { dpr } = this;

    const { point } = this.graphHitpoints[this.graphToEdit.id].hasIntersect(
      "node",
      e.x / dpr,
      e.y / dpr
    );

    if (point) {
      return "nodemoving";
    }
  });

  this.inputStatus.watch("mousemove", 'action === "nodemoving"', e => {
    const {
      dpr,
      focusedNodes,
      focusedNodes: { length: focusedNodesLength }
    } = this;

    for (let i = 0; i < focusedNodesLength; ++i) {
      const focusedNode = focusedNodes[i];
      const nodeSize = this.activeNodes[focusedNode.id];

      this.moveNode(
        focusedNode.id,
        nodeSize.x + e.deltaX / dpr,
        nodeSize.y + e.deltaY / dpr
      );
    }

    return "nodemoving";
  });

  this.inputStatus.watch("mouseup", 'action === "selectiondrawing"', e => {
    const { dpr } = this;
    const {
      activeNodes,
      activeNodeDrawOrder,
      activeNodeDrawOrder: { length: activeNodeDrawOrderLength }
    } = this.graphToEdit;

    const nodesToFocus = [];

    for (let i = 0; i < activeNodeDrawOrderLength; ++i) {
      const node = activeNodes[activeNodeDrawOrder[i]];
      const nodeSize = this.activeNodes[node.id];

      const intersect = isIntersectRect(
        {
          x: nodeSize.x + nodeSize.width / 2,
          y: nodeSize.y + nodeSize.height / 2
        },
        {
          x1: Math.min(e.downX / dpr, e.x / dpr),
          y1: Math.min(e.downY / dpr, e.y / dpr),
          x2: Math.max(e.downX / dpr, e.x / dpr),
          y2: Math.max(e.downY / dpr, e.y / dpr)
        }
      );

      if (intersect) {
        nodesToFocus.push(node);
      }
    }

    if (e.shiftPressed) {
      this.focusedNodes = this.focusedNodes.concat(nodesToFocus);
    } else {
      this.focusedNodes = nodesToFocus;
    }

    this.focusedNodes.forEach(node => {
      const index = activeNodeDrawOrder.indexOf(node.id);

      if (index > -1) {
        activeNodeDrawOrder.splice(index, 1);
        activeNodeDrawOrder.push(node.id);
      }
    });

    this.redraw();
  });

  this.inputStatus.watch("mouseup", 'action === "linedrawing"', e => {
    const { activeNodes } = this.graphToEdit;

    if (this.startPoint && this.endPoint) {
      const startNode = activeNodes[this.startPoint.data.nodeId];
      const endNode = activeNodes[this.endPoint.data.nodeId];

      this.connect(
        startNode,
        this.startPoint.data.name,
        endNode,
        this.endPoint.data.name
      );
    }

    this.startPoint = false;
    this.endPoint = false;

    this.redraw();
  });

  this.inputStatus.watch(
    "keydown",
    "metaPressed && keysDown.indexOf(65) > -1 && !vGraph.widgetOverlay.contains(document.activeElement)",
    e => {
      e.event.preventDefault();
      this.focusedNodes = Object.values(this.graph.activeNodes);
      this.redraw();
    }
  );
}
