export default [
  {
    name: "Average",
    group: "number",
    inputs: {
      x: {
        type: "number",
        default: 0
      },
      length: {
        type: "number",
        default: 10
      }
    },
    outputs: {
      x: {
        type: "number",
        default: 0
      }
    },
    data: {
      cache: []
    },
    exec({ inputs, outputs }) {
      const length = inputs.length.value;
      const { cache } = this.data;
      cache.push(inputs.x.value);
      if (cache.length > length) {
        cache.splice(0, cache.length - length);
      }

      outputs.x.value = cache.reduce((a, b) => a + b) / cache.length;
    }
  }
];
