export default function draw() {
  if (!this._hasDom) {
    return;
  }

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
    activeNodeDrawOrder: { length: activeNodeDrawOrderLength },
    hitpoints: { points }
  } = graphToEdit;

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
  // context.shadowColor = 'rgba(0,0,0,0.4)'
  // context.shadowBlur = 15

  for (let i = 0; i < activeNodeDrawOrderLength; ++i) {
    const node = activeNodes[activeNodeDrawOrder[i]];

    const outputs = Object.values(node.outputs);
    for (let j = 0; j < outputs.length; ++j) {
      const {
        connections,
        hitpoint: { x: x1, y: y1 },
        type
      } = outputs[j];

      for (let k = 0; k < connections.length; ++k) {
        const [nodeId, inputName] = connections[k];
        const endNode = activeNodes[nodeId];
        const input = endNode.inputs[inputName];
        const {
          hitpoint: { x: x2, y: y2 },
          type: endType
        } = input;

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

        context.strokeStyle = colors[type].bright;
        context.beginPath();
        context.moveTo(x1 + 0.5, y1 + 0.5);
        context.bezierCurveTo(
          x1 + Math.abs(x2 - x1) / 2,
          y1,
          x2 - Math.abs(x2 - x1) / 2,
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
      }
    }
  }

  context.restore();

  if (this.inputStatus.action === "linedrawing") {
    const x = startPoint.x;
    const y = startPoint.y;

    context.save();
    context.lineCap = "round";
    context.lineWidth = 4 * dpr;
    context.beginPath();
    context.moveTo(x + 0.5, y + 0.5);
    context.bezierCurveTo(
      x + Math.abs(this.inputStatus.x - x) / 2,
      y,
      this.inputStatus.x - Math.abs(this.inputStatus.x - x) / 2,
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

    context.restore();
  }

  for (let i = 0; i < activeNodeDrawOrderLength; ++i) {
    activeNodes[activeNodeDrawOrder[i]].draw();
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

  this.widgetOverlay.style.transform = `scale(${scale})`;
  const widgets = this.widgetOverlay.children;
  const widgetsLength = widgets.length;

  for (let i = 0; i < widgetsLength; ++i) {
    const widget = widgets[i];
    const node = activeNodes[widget.id];
    if (!node) {
      widget.style.display = "none";
    } else {
      widget.style.top = `${(node.y + (scaleOffsetY * height) / scale) /
        dpr}px`;
      widget.style.left = `${(node.x + (scaleOffsetX * width) / scale) /
        dpr}px`;
      widget.style.display = "block";
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
    for (let i = 0; i < activeNodeDrawOrderLength; ++i) {
      context.fillText(
        i,
        activeNodes[this.activeNodesExecOrder[i]].hitpoint.x1,
        activeNodes[this.activeNodesExecOrder[i]].hitpoint.y1
      );
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
