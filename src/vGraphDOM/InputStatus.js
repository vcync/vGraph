import { v4 as uuidv4 } from "uuid";

function getInputCoords(e) {
  if (typeof e.clientX === "number") {
    return [e.clientX, e.clientY];
  }

  if (e.touches && e.touches.length) {
    return [e.touches[0].clientX, e.touches[0].clientY];
  }
}

export class InputStatus {
  constructor(vGraph, element = window) {
    this.vGraph = vGraph;
    this.element = element;

    this.mousedownWatchers = {};
    this.mousemoveWatchers = {};
    this.mouseupWatchers = {};
    this.keydownWatchers = {};
    this.keyupWatchers = {};

    this.shiftPressed = false;
    this.altPressed = false;
    this.ctrlPressed = false;
    this.metaPressed = false;

    this.keysDown = [];
    this.heldWithMeta = [];

    this.lastUp = -1;
    this.lastDown = -1;
    this.lastMove = -1;
    this.lastX = -1;
    this.lastY = -1;
    this.lastUnscaledX = -1;
    this.lastUnscaledY = -1;

    this.resetValues();

    window.addEventListener("keydown", this.keydown.bind(this));
    window.addEventListener("keyup", this.keyup.bind(this));
    element.addEventListener("mousedown", this.mousedown.bind(this));
    element.addEventListener("mousemove", this.mousemove.bind(this));
    element.addEventListener("mouseup", this.mouseup.bind(this));
  }

  destroy() {
    window.removeEventListener("keydown", this.keydown.bind(this));
    window.removeEventListener("keyup", this.keyup.bind(this));
    this.element.removeEventListener("mousedown", this.mousedown.bind(this));
    this.element.removeEventListener("mousemove", this.mousemove.bind(this));
    this.element.removeEventListener("mouseup", this.mouseup.bind(this));
  }

  resetValues() {
    this.unscaledX = -1;
    this.unscaledY = -1;
    this.x = -1;
    this.y = -1;
    this.deltaX = -1;
    this.deltaY = -1;

    this.downX = -1;
    this.downY = -1;

    this.isDown = false;
    this.isUp = true;
    this.action = null;

    this.button = -1;
  }

  createWatcher(expression, action) {
    let expr = expression;
    if (typeof expression === "string") {
      // eslint-disable-next-line
      expr = new Function(
        `const {
          x,
          y,
          deltaX,
          deltaY,
          downX,
          downY,
          lastDown,
          lastUp,
          lastMove,
          lastX,
          lastY,
          lastUnscaledX,
          lastUnscaledY,
          isDown,
          isUp,
          action,
          shiftPressed,
          ctrlPressed,
          altPressed,
          metaPressed,
          keysDown,
          button,
        } = this

        return ${expression}`
      ).bind(this);
    }

    return {
      expression: expr,
      action
    };
  }

  watch(event) {
    const argsLength = arguments.length;

    const id = uuidv4();

    // if (!this[`${event}Watchers`]) {
    //   this[`${event}Watchers`] = {}
    // }

    if (argsLength > 2) {
      const [event, expression, action] = arguments;
      this[`${event}Watchers`][id] = this.createWatcher(expression, action);
    } else {
      const [event, action] = arguments;
      this[`${event}Watchers`][id] = this.createWatcher(false, action);
    }

    return id;
  }

  unwatch(event, id) {
    delete this[`mouse${event}Watchers`][id];
  }

  scale(x, y) {
    const {
      dpr,
      canvas: { width, height },
      scale,
      scaleOffsetX,
      scaleOffsetY
    } = this.vGraph;

    return [
      (x * dpr - scaleOffsetX * width) / scale,
      (y * dpr - scaleOffsetY * height) / scale
    ];
  }

  keydown(e) {
    const { keyCode, repeat } = e;
    if (repeat) {
      return;
    }

    const index = this.keysDown.indexOf(keyCode);
    if (index < 0) {
      this.keysDown.push(keyCode);
    }

    // Shift
    if (keyCode === 16) {
      this.shiftPressed = true;
    }

    // Ctrl
    if (keyCode === 17) {
      this.ctrlPressed = true;
    }

    // Alt
    if (keyCode === 18) {
      this.altPressed = true;
    }

    // Super
    if (keyCode === 91 || keyCode === 92) {
      this.metaPressed = true;
    }

    if ((e.metaKey && keyCode !== 91) || keyCode !== 92) {
      const index = this.heldWithMeta.indexOf(keyCode);
      if (index < 0) {
        this.heldWithMeta.push(keyCode);
      }
    }

    this.checkKeydown(e);
  }

  keyup(e) {
    const { keyCode } = e;

    const index = this.keysDown.indexOf(keyCode);
    if (index > -1) {
      this.keysDown.splice(index, 1);
    }

    // Shift
    if (keyCode === 16) {
      this.shiftPressed = false;
    }

    // Ctrl
    if (keyCode === 17) {
      this.ctrlPressed = false;
    }

    // Alt
    if (keyCode === 18) {
      this.altPressed = false;
    }

    // Super
    if (keyCode === 91 || keyCode === 92) {
      this.metaPressed = false;

      for (let i = 0; i < this.heldWithMeta.length; ++i) {
        const index = this.keysDown.indexOf(this.heldWithMeta[i]);
        if (index < 0) {
          this.keysDown.splice(index, 1);
        }
      }

      this.heldWithMeta = [];
    }

    this.checkKeyup(e);
  }

  mousedown(e) {
    const input = getInputCoords(e);
    const scale = this.scale(...input);

    this.x = scale[0];
    this.y = scale[1];
    this.unscaledX = input[0];
    this.unscaledY = input[1];

    this.downX = this.x;
    this.downY = this.y;

    this.isDown = true;
    this.isUp = false;

    this.button = e.button;

    this.checkDown(e);

    this.lastX = this.x;
    this.lastY = this.y;
    this.lastUnscaledX = this.unscaledX;
    this.lastUnscaledY = this.unscaledY;
    this.lastDown = Date.now();
  }

  mouseup(e) {
    this.isDown = false;
    this.isUp = true;

    this.checkUp(e);

    this.action = null;
    this.lastUp = Date.now();
    this.resetValues();
  }

  mousemove(e) {
    const input = getInputCoords(e);
    const scale = this.scale(...input);

    this.x = scale[0];
    this.y = scale[1];
    this.unscaledX = input[0];
    this.unscaledY = input[1];
    this.deltaX = this.x - this.lastX;
    this.deltaY = this.y - this.lastY;

    this.checkMove(e);

    this.lastMove = Date.now();
    this.lastX = this.x;
    this.lastY = this.y;
    this.lastUnscaledX = this.unscaledX;
    this.lastUnscaledY = this.unscaledY;
  }

  checkDown(e) {
    this.checkWatchers("mousedown", e);
  }

  checkUp(e) {
    this.checkWatchers("mouseup", e);
  }

  checkMove(e) {
    this.checkWatchers("mousemove", e);
  }

  checkKeydown(e) {
    this.checkWatchers("keydown", e);
  }

  checkKeyup(e) {
    this.checkWatchers("keyup", e);
  }

  checkWatchers(event, realEvent) {
    const keys = Object.keys(this[`${event}Watchers`]);
    const keysLength = keys.length;
    for (let i = 0; i < keysLength; ++i) {
      const watcher = this[`${event}Watchers`][keys[i]];

      let canAction = true;
      if (watcher.expression && !watcher.expression()) {
        canAction = false;
      }

      if (canAction) {
        this.action =
          watcher.action({
            event: realEvent,
            x: this.x,
            y: this.y,
            unscaledX: this.unscaledX,
            unscaledY: this.unscaledY,
            deltaX: this.deltaX,
            deltaY: this.deltaY,
            downX: this.downX,
            downY: this.downY,
            lastDown: this.lastDown,
            lastUp: this.lastUp,
            lastMove: this.lastMove,
            lastX: this.lastX,
            lastY: this.lastY,
            lastUnscaledX: this.lastUnscaledX,
            lastUnscaledY: this.lastUnscaledY,
            isDown: this.isDown,
            isUp: this.isUp,
            action: this.action,
            shiftPressed: this.shiftPressed,
            ctrlPressed: this.ctrlPressed,
            altPressed: this.altPressed,
            metaPressed: this.metaPressed,
            keysDown: this.keysDown,
            button: this.button
          }) ||
          this.action ||
          null;
      }
    }
  }
}
