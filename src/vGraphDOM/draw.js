import { drawGraphItem } from "./drawGraphItem";

export function draw() {
  const {
    canvas: { width, height },
    colors,
    context,
    startPoint,
    dpr,
    scale,
    theme,
    graphToEdit,
    scaleOffsetX,
    scaleOffsetY
  } = this;

  const {
    activeNodes,
    activeNodeDrawOrder,
    activeNodeDrawOrder: { length: activeNodeDrawOrderLength }
  } = graphToEdit;

  const hitpoints = this.graphHitpoints[graphToEdit.id];
  const { points } = hitpoints;

  const { connectionWidth } = theme;

  context.restore();
  context.clearRect(0, 0, width, height);
  context.fillStyle = theme.backgroundColor;
  context.globalAlpha = theme.backgroundOpacity;
  context.fillRect(0, 0, width, height);
  context.globalAlpha = 1;

  context.font = `${14 * dpr}px ${theme.font}`;
  context.fillStyle = theme.tooltip.textColor;

  context.save();
  context.translate(scaleOffsetX * width, scaleOffsetY * height);
  context.scale(scale, scale);

  context.save();
  context.lineCap = "round";
  context.lineWidth = connectionWidth * dpr;

  for (let i = 0; i < activeNodeDrawOrderLength; ++i) {
    const node = activeNodes[activeNodeDrawOrder[i]];

    const outputs = Object.values(node.outputs);
    for (let j = 0; j < outputs.length; ++j) {
      const { connections, type, id: outputId } = outputs[j];

      const { x: x1, y: y1 } = hitpoints.points.find(
        ({ id }) => id === outputId
      );

      for (let k = 0; k < connections.length; ++k) {
        const [nodeId, inputName] = connections[k];
        const endNode = activeNodes[nodeId];
        const input = endNode.inputs[inputName];
        const { type: endType, id: inputId } = input;

        const { x: x2, y: y2 } = hitpoints.points.find(
          ({ id }) => id === inputId
        );

        let brightColor = colors[type].bright;
        let lightColor = colors[type].light;
        if (type !== endType) {
          brightColor = context.createLinearGradient(x1, y1, x2, y2);
          lightColor = context.createLinearGradient(x1, y1, x2, y2);

          brightColor.addColorStop(0, colors[type].bright);
          brightColor.addColorStop(1, colors[endType].bright);

          lightColor.addColorStop(0, colors[type].light);
          lightColor.addColorStop(1, colors[endType].light);
        }

        const isBehindStart = x2 < x1;
        const factor = isBehindStart ? 0.7 : 0.5;

        context.strokeStyle = colors[type].bright;
        context.beginPath();
        context.moveTo(x1 + 0.5, y1 + 0.5);
        context.bezierCurveTo(
          x1 + Math.abs(x2 - x1) * factor,
          y1,
          x2 - Math.abs(x2 - x1) * factor,
          y2,
          x2 + 0.5,
          y2 + 0.5
        );
        context.strokeStyle = brightColor;
        context.lineWidth = connectionWidth + 2 * dpr;
        context.stroke();

        context.strokeStyle = lightColor;
        context.lineWidth = connectionWidth * dpr;
        context.stroke();

        if (this.debug.beziers) {
          context.fillRect(x1 + Math.abs(x2 - x1) * factor, y1, 10, 10);
          context.fillRect(x2 - Math.abs(x2 - x1) * factor, y2, 10, 10);
        }
      }
    }
  }

  context.restore();

  if (this.inputStatus.action === "linedrawing") {
    const x = startPoint.x;
    const y = startPoint.y;

    const isBehindStart = this.inputStatus.x < x;
    const factor = isBehindStart ? 0.7 : 0.5;

    context.save();
    context.lineCap = "round";
    context.lineWidth = 4 * dpr;
    context.beginPath();
    context.moveTo(x + 0.5, y + 0.5);
    context.bezierCurveTo(
      x + Math.abs(this.inputStatus.x - x) * factor,
      y,
      this.inputStatus.x - Math.abs(this.inputStatus.x - x) * factor,
      this.inputStatus.y,
      this.inputStatus.x + 0.5,
      this.inputStatus.y + 0.5
    );

    context.strokeStyle = colors[startPoint.data.dataType].bright;
    context.lineWidth = connectionWidth + 2 * dpr;
    context.stroke();

    context.strokeStyle = colors[startPoint.data.dataType].light;
    context.lineWidth = connectionWidth * dpr;
    context.stroke();

    if (this.debug.beziers) {
      context.fillRect(
        x + Math.abs(this.inputStatus.x - x) * factor,
        y,
        10,
        10
      );
      context.fillRect(
        this.inputStatus.x - Math.abs(this.inputStatus.x - x) * factor,
        this.inputStatus.y,
        10,
        10
      );
    }

    context.restore();
  }

  for (let i = 0; i < activeNodeDrawOrderLength; ++i) {
    const { focusedNodes, startPoint, endPoint, theme, colors } = this;
    const node = activeNodes[activeNodeDrawOrder[i]];
    const { id, name, title, inputs, outputs } = node;

    // Get the positional data from vGraphDOM
    const { x, y, width, height } = this.activeNodes[id];

    const hitpoints = this.graphHitpoints[this.graphToEdit.id];

    drawGraphItem(
      { context, dpr, focusedNodes, startPoint, endPoint, theme, colors },
      { x, y, width, height, id, title, name, inputs, outputs, hitpoints }
    );
  }

  if (this.inputStatus.action === "selectiondrawing") {
    context.lineWidth = (1 * dpr) / scale;
    context.beginPath();
    context.rect(
      this.inputStatus.downX + 0.5,
      this.inputStatus.downY + 0.5,
      this.inputStatus.x - this.inputStatus.downX,
      this.inputStatus.y - this.inputStatus.downY
    );
    context.stroke();
  }

  this.widgetTransformArea.style.transform = `scale(${scale})`;
  const widgets = this.widgetTransformArea.children;
  const widgetsLength = widgets.length;

  for (let i = 0; i < widgetsLength; ++i) {
    const widget = widgets[i];
    const node = activeNodes[widget.id];
    if (!node) {
      widget.style.display = "none";
    } else {
      const nodeSize = this.activeNodes[widget.id];
      const x = (nodeSize.x + (scaleOffsetX * width) / scale) / dpr;
      const y = (nodeSize.y + (scaleOffsetY * height) / scale) / dpr;

      widget.style.transform = `translate(${x}px, ${y}px)`;
      widget.style.display = "flex";
    }
  }

  context.fillStyle = theme.tooltip.textColor;

  if (this.tooltip.length) {
    context.fillText(
      this.tooltip,
      this.inputStatus.x + 16 * dpr,
      this.inputStatus.y + 16 * dpr
    );
  }

  if (this.debug.hitpoints) {
    context.strokeStyle = "red";
    context.fillStyle = "rgba(255,0,0,0.1)";

    points.forEach(point => {
      const { x, y, radius, x1, y1, x2, y2, type } = point;

      if (type === "radial") {
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2);
        context.fill();
        context.stroke();
      } else {
        context.beginPath();
        context.rect(x1 - 0.5, y1 - 0.5, x2 - x1, y2 - y1);
        context.fill();
        context.stroke();
      }
    });
  }

  if (this.debug.executionOrder) {
    context.fillStyle = "#f2bd09";
    for (let i = 0; i < this.graphToEdit.activeNodesExecOrder.length; ++i) {
      const nodeId = this.graphToEdit.activeNodesExecOrder[i];
      const { x1, y1 } = this.graphHitpoints[this.graphToEdit.id].points.find(
        ({ id }) => id === nodeId
      );

      context.fillText(i, x1, y1 - 14 * dpr);
    }
  }

  context.restore();
  let graphPath = "Main ";
  let currentGraph = graphToEdit;
  while (currentGraph.parent) {
    graphPath += `> ${graphToEdit.name} `;
    currentGraph = currentGraph.parent;
  }

  context.fillText(`Path: ${graphPath}`, 10 * dpr, 42 * dpr, width);
}
