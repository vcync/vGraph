export default {
  name: "modV/module/grid",
  group: "modV/module",
  title: "Grid",
  inputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      default: undefined
    },
    texture: {
      type: "texture",
      default: undefined
    },
    tilesX: {
      type: "number",
      default: 2
    },
    tilesY: {
      type: "number",
      default: 2
    }
  },
  outputs: {
    context: {
      type: "renderContext",
      connectionRequired: true,
      default: undefined
    }
  },
  exec({ inputs, outputs }) {
    const renderContext = inputs.context.value;
    const texture = inputs.texture.value;

    if (renderContext && texture) {
      const { canvas, context } = renderContext;
      const { width, height } = canvas;
      const tilesX = inputs.tilesX.value;
      const tilesY = inputs.tilesY.value;

      const tileWidth = width / tilesX;
      const tileHeight = height / tilesY;

      for (let x = 0; x < tilesX; ++x) {
        for (let y = 0; y < tilesY; ++y) {
          context.drawImage(
            texture,
            x * tileWidth,
            y * tileHeight,
            tileWidth,
            tileHeight
          );
        }
      }
    }

    outputs.context.value = renderContext;
  }
};
