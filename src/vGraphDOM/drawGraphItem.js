export const drawGraphItem = (
  { context, dpr, focusedNodes, startPoint, endPoint, theme, colors },
  { x, y, width, height, id, title, name, inputs, outputs, hitpoints }
) => {
  const {
    connectorRadius,
    borderRadius,
    backgroundColor,
    focusedBackgroundColor,
    fontFamily,
    fontSize,
    focusedOutlineWidth,
    focusedOutlineColor,
    titleColor,
    focusedTitleColor,
    textColor,
    focusedTextColor,
    connectorOutlineWidth,
    connectorFocusedOutlineWidth,
    outlineWidth,
    outlineColor,
    connectorOutlineColor,
    connectorFocusedOutlineColor
  } = theme.node;

  const nodeFocused = focusedNodes.findIndex(focused => focused.id === id) > -1;

  context.save();
  if (nodeFocused) {
    context.fillStyle = focusedBackgroundColor;
  } else {
    context.fillStyle = backgroundColor;
  }

  context.font = `${fontSize * dpr}px ${fontFamily}`;

  // context.shadowColor = "rgba(0,0,0,0.4)";
  // context.shadowBlur = 4;

  context.roundedRect(x, y, width * dpr, height * dpr, borderRadius * dpr);

  if (outlineWidth && outlineColor) {
    context.strokeStyle = outlineColor;
    context.lineWidth = outlineWidth * dpr;
    context.stroke();
  }

  context.fill();
  if (nodeFocused) {
    context.fillStyle = focusedTitleColor;
    context.strokeStyle = focusedOutlineColor;
    context.lineWidth = focusedOutlineWidth * dpr;
    context.stroke();
  } else {
    context.fillStyle = titleColor;
  }

  context.fillText(title || name, x + 0.5, y - 5 + 0.5);

  const inputKeys = Object.keys(inputs);
  const inputsLength = inputKeys.length;
  for (let i = 0; i < inputsLength; ++i) {
    const input = inputs[inputKeys[i]];
    const name = inputKeys[i];
    const { x, y } = hitpoints.points.find(({ id }) => id === input.id);

    context.fillStyle = colors[input.type].light;

    if (
      startPoint &&
      (startPoint.data.dataType === input.type ||
        startPoint.data.dataType === "any" ||
        input.type === "any")
    ) {
      context.globalAlpha = 1;
    } else if (!startPoint) {
      context.globalAlpha = 1;
    } else {
      context.globalAlpha = 0.5;
    }

    if (
      endPoint &&
      endPoint.data.connectorId === input.id &&
      startPoint &&
      (startPoint.data.dataType === "any" ||
        input.type === "any" ||
        startPoint.data.dataType === input.type)
    ) {
      context.strokeStyle = colors[input.type].dark;
      context.lineWidth = connectorFocusedOutlineWidth * dpr;
    } else {
      context.strokeStyle = connectorOutlineColor;
      context.lineWidth = connectorOutlineWidth * dpr;
    }

    context.beginPath();
    context.arc(x, y, connectorRadius * dpr, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.textBaseline = "middle";
    context.fillStyle = textColor;
    context.textAlign = "left";
    if (nodeFocused) {
      context.fillStyle = focusedTextColor;
    } else {
      context.fillStyle = textColor;
    }
    context.fillText(name, x + dpr * connectorRadius * 1.5 + 0.5, y + 0.5);
  }

  const outputsKeys = Object.keys(outputs);
  const outputsLength = outputsKeys.length;
  for (let i = 0; i < outputsLength; ++i) {
    const output = outputs[outputsKeys[i]];
    const name = outputsKeys[i];
    const { x, y } = hitpoints.points.find(({ id }) => id === output.id);

    context.fillStyle = colors[output.type].light;

    if (startPoint && startPoint.data.dataType !== output.type) {
      context.globalAlpha = 0.5;
    } else {
      context.globalAlpha = 1;
    }

    if (startPoint && output.id === startPoint.data.connectorId) {
      context.lineWidth = connectorFocusedOutlineWidth * dpr;
      context.strokeStyle = colors[output.type].dark;
    } else {
      context.strokeStyle = connectorOutlineColor;
      context.lineWidth = connectorOutlineWidth * dpr;
    }

    context.beginPath();
    context.arc(x, y, connectorRadius * dpr, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.textBaseline = "middle";
    context.fillStyle = textColor;
    context.textAlign = "right";
    if (nodeFocused) {
      context.fillStyle = focusedTextColor;
    } else {
      context.fillStyle = textColor;
    }
    context.fillText(name, x - dpr * connectorRadius * 1.5 + 0.5, y + 0.5);
  }

  context.restore();
};
