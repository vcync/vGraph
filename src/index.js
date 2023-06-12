import "./nwjs-menu-browser/nwjs-menu-browser.css";
import "./styles.css";
import VGraph from "./vGraph";
import mathNodes from "./vGraph/nodes/math";
import meydaNodes from "./vGraph/nodes/meyda";
import modVModuleNodes from "./vGraph/nodes/modv/modules";
import modVNodes from "./vGraph/nodes/modv";
import inputNodes from "./vGraph/nodes/input";
import outputNodes from "./vGraph/nodes/output";
import numberNodes from "./vGraph/nodes/number";
import { Menu, MenuItem } from "./nwjs-menu-browser";

const output = document.createElement("canvas");
const outputContext = output.getContext("2d");

const bufferCanvas = document.createElement("canvas");
const bufferContext = bufferCanvas.getContext("2d");

function resize() {
  const { devicePixelRatio: dpr, innerWidth, innerHeight } = window;
  bufferCanvas.width = output.width = innerWidth * dpr;
  bufferCanvas.height = output.height = innerHeight * dpr;
}

let vGraph;
setup();

async function setup() {
  window.vGraph = new VGraph();
  vGraph = window.vGraph;
  // vGraph.debug.hitpoints = false;
  document.body.appendChild(output);
  document.body.appendChild(vGraph.canvas);
  document.body.appendChild(vGraph.widgetOverlay);

  window.addEventListener("resize", resize);
  resize();
  console.log(vGraph);

  vGraph.registerNode(mathNodes);
  vGraph.registerNode(meydaNodes);
  vGraph.registerNode(modVNodes);
  vGraph.registerNode(modVModuleNodes);
  vGraph.registerNode(inputNodes);
  vGraph.registerNode(outputNodes);
  vGraph.registerNode(numberNodes);

  vGraph.registerNode({
    name: "modV/visualInput",
    group: "modV",
    title: "Visual Input",
    outputs: {
      context: {
        type: "renderContext",
        default: {
          canvas: bufferCanvas,
          context: bufferContext,
          delta: Date.now()
        }
      }
    },
    exec({ outputs }) {
      // if (
      //   outputs[0] &&
      //   outputs[0].links &&
      //   !outputs[0].links.length
      // ) {
      //   return
      // }

      outputs.context.value = {
        canvas: bufferCanvas,
        context: bufferContext,
        delta: Date.now()
      };
    }
  });

  vGraph.registerNode({
    name: "modV/visualOutput",
    group: "modV",
    title: "Visual Output",
    inputs: {
      context: {
        type: "renderContext",
        connectionRequired: true,
        default: undefined
      }
    },
    exec({ inputs }) {
      const renderContext = inputs.context.value;
      if (!renderContext) {
        return;
      }

      outputContext.clearRect(0, 0, output.width, output.height);
      outputContext.drawImage(renderContext.canvas, 0, 0);
    }
  });

  const visualMonitorCanvas = document.createElement("canvas");
  const visualMonitorContext = visualMonitorCanvas.getContext("2d");

  vGraph.registerNode({
    name: "modV/visualMonitor",
    group: "modV",
    title: "Visual Monitor",
    inputs: {
      context: {
        type: "renderContext",
        connectionRequired: true,
        default: undefined
      }
    },
    widget() {
      const out = visualMonitorCanvas;

      return out;
    },
    exec({ inputs }) {
      visualMonitorContext.drawImage(
        inputs.context.value.canvas,
        0,
        0,
        visualMonitorCanvas.width,
        visualMonitorCanvas.height
      );
    }
  });

  const loop = delta => {
    requestAnimationFrame(loop);
    // bufferContext.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height)
    if (vGraph) {
      vGraph.updateTree(delta);
    }
  };

  await document.fonts.load('10pt "IBM Plex Mono"');
  requestAnimationFrame(loop);
}

let saves = [];

const menuBar = new Menu({ type: "menubar" });

const fileMenu = new Menu();
let openMenu = new Menu();

fileMenu.append(
  new MenuItem({
    label: "Open",
    submenu: openMenu
  })
);

// fileMenu.append(
//   new MenuItem({
//     label: 'Save'
//   })
// )

menuBar.append(
  new MenuItem({
    label: "File",
    submenu: fileMenu,
    click() {
      openMenu = new Menu();

      const saveData = localStorage.getItem("vgraph-saves");

      saves = JSON.parse(saveData || "{}");

      const filenames = Object.keys(saves);
      if (filenames.length) {
        filenames.forEach(label =>
          openMenu.append(
            new MenuItem({
              label,
              click() {
                vGraph.loadData(saves[label]);
              }
            })
          )
        );
      } else {
        openMenu.append(
          new MenuItem({
            label: "No saved graphs",
            enabled: false
          })
        );
      }

      fileMenu.removeAt(0);
      fileMenu.insert(
        new MenuItem({
          label: "Open",
          submenu: openMenu
        })
      );
    }
  })
);
