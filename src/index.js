import "./nwjs-menu-browser/nwjs-menu-browser.css";
import "./styles.css";
import { vGraph as VGraph } from "./vGraph";
import SubGraph from "./vGraph/nodes/SubGraph";
import mathNodes from "./vGraph/nodes/math";
import meydaNodes from "./vGraph/nodes/meyda";
import modVModuleNodes from "./vGraph/nodes/modv/modules";
import modVNodes from "./vGraph/nodes/modv";
import inputNodes from "./vGraph/nodes/input";
import outputNodes from "./vGraph/nodes/output";
import numberNodes from "./vGraph/nodes/number";
import logicNodes from "./vGraph/nodes/logic";
import { Menu, MenuItem } from "./nwjs-menu-browser";
import { vGraphDOM } from "./vGraphDOM";

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
  vGraph = new VGraph();
  window.vGraph = vGraph;
  console.log(vGraph);

  const dom = new vGraphDOM();
  window.vGraphDOM = dom;
  dom.useGraph(vGraph);
  console.log(dom);

  // vGraph.debug.hitpoints = false;
  document.body.appendChild(output);
  document.body.appendChild(dom.canvas);
  document.body.appendChild(dom.widgetOverlay);

  window.addEventListener("resize", resize);
  resize();

  dom.registerNode(SubGraph);
  dom.registerNode(mathNodes);
  dom.registerNode(meydaNodes);
  dom.registerNode(modVNodes);
  dom.registerNode(modVModuleNodes);
  dom.registerNode(inputNodes);
  dom.registerNode(outputNodes);
  dom.registerNode(numberNodes);
  dom.registerNode(logicNodes);

  dom.registerNode({
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

  dom.registerNode({
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

  dom.registerNode({
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

  saves = {
    nodeData: JSON.parse(
      '{"nodes":{"2c212a2a-3cae-4739-860b-c7f6dd5937af":{"id":"2c212a2a-3cae-4739-860b-c7f6dd5937af","name":"Number","x":347.91704462135385,"y":301.0987915687993,"outputs":{"x":{"id":"3a40b905-f945-4599-8575-7cde14fbc8f8","connections":[["fe1f4407-0677-445f-803a-1922288546bf","b"]],"value":3}},"inputs":{}},"e88e001b-3deb-4997-b4fb-ce0132b64cdd":{"id":"e88e001b-3deb-4997-b4fb-ce0132b64cdd","name":"Number","x":338.08600775994705,"y":456.00964037871694,"outputs":{"x":{"id":"4f36b07d-a068-4d22-9a0f-5bd99ac6248c","connections":[["f9a710e1-cafc-4839-91c4-01c55dc46498","strokeSize"]],"value":10}},"inputs":{}},"405d2561-aea5-44cd-bd26-9e28f9c267fa":{"id":"405d2561-aea5-44cd-bd26-9e28f9c267fa","name":"time","x":335.7513939815696,"y":525.8774688723187,"outputs":{"time":{"id":"be0fe32c-5a3c-4234-8bfb-18df62f00650","connections":[["10eac8b6-6281-48ce-88f7-a2cdcb309806","a"]],"value":16218516.069999984}},"inputs":{}},"da7607ae-d8eb-4648-8c42-97d03caacf2d":{"id":"da7607ae-d8eb-4648-8c42-97d03caacf2d","name":"Number","x":336.3178435600754,"y":561.7248329870322,"outputs":{"x":{"id":"2dc74ae5-b71b-4f3a-b4e3-de3126b792b2","connections":[["10eac8b6-6281-48ce-88f7-a2cdcb309806","b"]],"value":6000}},"inputs":{}},"f9a710e1-cafc-4839-91c4-01c55dc46498":{"id":"f9a710e1-cafc-4839-91c4-01c55dc46498","name":"modV/module/polygon","x":600.1680555100614,"y":210.0985476872769,"outputs":{"texture":{"id":"f1195282-4cd2-4a50-a0a7-5b032f1d928b","connections":[["7458d51a-efb4-4f26-a1c4-379d63128a1c","texture"]],"value":{}}},"inputs":{"radius":{"id":"f4a32323-3543-403f-94ae-c31ff63e7ef0","value":140},"sides":{"id":"f1ef0007-55a2-48b6-b489-c83a73a5ffc4","value":5},"strokeSize":{"id":"f3f57a71-c607-4ca7-ab4f-243e70635d3e","value":10},"rotation":{"id":"dc8af2f1-117f-41d9-9be8-d2286791817d","value":2703.086011666664}}},"10eac8b6-6281-48ce-88f7-a2cdcb309806":{"id":"10eac8b6-6281-48ce-88f7-a2cdcb309806","name":"math/operation/divide","x":597.0015546736743,"y":349.84792495340184,"outputs":{"a÷b":{"id":"a20311b3-d85a-46fe-a8f8-6dd5aa69f2f3","connections":[["f9a710e1-cafc-4839-91c4-01c55dc46498","rotation"]],"value":2703.086011666664}},"inputs":{"a":{"id":"37c42f8d-83cb-4930-9b0b-27b1bb23e8bf","value":16218516.069999984},"b":{"id":"42ec91bb-9c12-475c-93f2-5e2980e9e1d6","value":6000}}},"0ec5c30f-9ccf-42c6-82ed-24c6f8052416":{"id":"0ec5c30f-9ccf-42c6-82ed-24c6f8052416","name":"modV/module/squishy","x":539.5015552636735,"y":102.64044206230527,"outputs":{"context":{"id":"83928caa-5880-4d92-b64b-39df347edcad","connections":[["6a54d107-f370-4d76-8a25-11c32f60acf3","context"]],"value":{"canvas":{},"context":{},"delta":1562325766761}}},"inputs":{"context":{"id":"eb11b2ae-7773-4ff7-bcd5-5fa59465c836","value":{"canvas":{},"context":{},"delta":1562325766761}}}},"eb548fbf-6198-49a6-9ec8-92c5ea285523":{"id":"eb548fbf-6198-49a6-9ec8-92c5ea285523","name":"modV/module/blockColor","x":349.1592219320393,"y":71.46440764178064,"outputs":{"context":{"id":"dddc609b-2fd3-4dcf-bd87-c79176b5ea49","connections":[["0ec5c30f-9ccf-42c6-82ed-24c6f8052416","context"]],"value":{"canvas":{},"context":{},"delta":1562325766777}}},"inputs":{"context":{"id":"b827d1cf-1a0b-4f6d-a633-bc9314ccc191","value":{"canvas":{},"context":{},"delta":1562325766777}},"rgb":{"id":"5d0531ec-169c-43d5-b9bb-0201d209236b","value":"#000"},"a":{"id":"1162eafa-9627-47a6-afc2-1bb8068b4c67","value":0.1}}},"f961fa87-7b17-4663-91eb-d8ecc02b9e85":{"id":"f961fa87-7b17-4663-91eb-d8ecc02b9e85","name":"modV/visualInput","x":152.768731651356,"y":53.78915193017913,"outputs":{"context":{"id":"921a7a98-2623-4647-8ac8-eade1d8b2583","connections":[["eb548fbf-6198-49a6-9ec8-92c5ea285523","context"]],"value":{"canvas":{},"context":{},"delta":1562325766777}}},"inputs":{}},"fe1f4407-0677-445f-803a-1922288546bf":{"id":"fe1f4407-0677-445f-803a-1922288546bf","name":"math/operation/add","x":344.4755121484353,"y":344.40703572949036,"outputs":{"a+b":{"id":"e40f71a8-aa4f-4dd3-b140-3065b9473832","connections":[["f9a710e1-cafc-4839-91c4-01c55dc46498","sides"]],"value":4}},"inputs":{"a":{"id":"96460929-76ef-4a6b-9a9a-95140f564430","value":1},"b":{"id":"d3192bcc-487a-471a-8ff0-25d69c758c5d","value":3}}},"6fb038df-9fbc-4ac9-8237-bed64a2caee5":{"id":"6fb038df-9fbc-4ac9-8237-bed64a2caee5","name":"Number","x":329.3515496380503,"y":408.34956955533914,"outputs":{"x":{"id":"0dea1980-2c56-4bf7-bb32-e1fce66aa195","connections":[["f9a710e1-cafc-4839-91c4-01c55dc46498","radius"]],"value":140}},"inputs":{}},"26764281-1f60-4ff5-9930-8e590869f8c3":{"id":"26764281-1f60-4ff5-9930-8e590869f8c3","name":"meyda/energy","x":-137.49850698894727,"y":140.18338601150626,"outputs":{"energy":{"id":"f894215b-0ece-4ed0-9472-beb8a028dd18","connections":[["ae765c23-fee9-436d-b880-9730574b234c","a"]],"value":61.366323495436596}},"inputs":{}},"ae765c23-fee9-436d-b880-9730574b234c":{"id":"ae765c23-fee9-436d-b880-9730574b234c","name":"math/operation/divide","x":-34.44871889141973,"y":235.69294571165386,"outputs":{"a÷b":{"id":"4383ec19-51a7-42f1-97cd-be8680fca393","connections":[["17d56c37-01a1-4610-977d-89d02dc1d790","x"]],"value":1.2273264699087318}},"inputs":{"a":{"id":"b721806b-73a4-469b-aa0a-f450de60d68b","value":61.366323495436596},"b":{"id":"7ab710ca-2434-4b7b-8aea-0dd73cfbcba7","value":50}}},"17d56c37-01a1-4610-977d-89d02dc1d790":{"id":"17d56c37-01a1-4610-977d-89d02dc1d790","name":"math/function/floor","x":156.57040050887537,"y":259.57033563669063,"outputs":{"x":{"id":"fb7c86dc-1c00-4439-a4c9-cf17f00aca8f","connections":[["2629abda-853b-44df-8a60-1c88e8edfc7f","x"],["fe1f4407-0677-445f-803a-1922288546bf","a"]],"value":1}},"inputs":{"x":{"id":"c4bf3083-b093-4560-89cf-22765e17a9e4","value":1.2273264699087318}}},"eda27757-9e20-4fd3-b7b4-70d24b5585ce":{"id":"eda27757-9e20-4fd3-b7b4-70d24b5585ce","name":"Number","x":-132.47168805736058,"y":182.91134692999333,"outputs":{"x":{"id":"ec888439-714e-435d-ad2e-2609ba1a8b32","connections":[["ae765c23-fee9-436d-b880-9730574b234c","b"]],"value":50}},"inputs":{}},"6e93536c-186f-4434-9dee-45329ef5f950":{"id":"6e93536c-186f-4434-9dee-45329ef5f950","name":"Number","x":168.5229048016874,"y":133.5164277445757,"outputs":{"x":{"id":"27b77dd4-3f84-4412-ac7a-5bfc9b32429f","connections":[["eb548fbf-6198-49a6-9ec8-92c5ea285523","a"]],"value":0.1}},"inputs":{}},"52bc2b7d-d2a3-4569-b9eb-53c932820bb5":{"id":"52bc2b7d-d2a3-4569-b9eb-53c932820bb5","name":"meyda/energy","x":610.2408090845763,"y":454.35956923567574,"outputs":{"energy":{"id":"c14ffc57-9855-4ce9-80a7-d737100cb632","connections":[["dec81e42-4209-4140-8968-77de78a19067","a"]],"value":61.366323495436596}},"inputs":{}},"dec81e42-4209-4140-8968-77de78a19067":{"id":"dec81e42-4209-4140-8968-77de78a19067","name":"math/operation/divide","x":803.7733379506642,"y":449.33275030408913,"outputs":{"a÷b":{"id":"7305d46c-a3f0-4b3c-826f-3f0df2506f70","connections":[["01e18575-c746-4913-b096-8d0d8f069764","b"]],"value":0.01227326469908732}},"inputs":{"a":{"id":"4ce4957d-802e-4ec4-89eb-7afdd600540d","value":61.366323495436596},"b":{"id":"118374c7-fd2c-4587-b02b-7fd703edfcad","value":5000}}},"01e18575-c746-4913-b096-8d0d8f069764":{"id":"01e18575-c746-4913-b096-8d0d8f069764","name":"math/operation/add","x":895.5127834521219,"y":381.47069472766856,"outputs":{"a+b":{"id":"19214417-76d6-43bc-bb56-274bd78c6868","connections":[["6a54d107-f370-4d76-8a25-11c32f60acf3","scale"],["91c9659c-fb4c-472f-aea9-f774055ba56e","x"]],"value":1.0122732646990873}},"inputs":{"a":{"id":"dad6de46-90b2-45fd-9ad2-9ea0de581c14","value":1},"b":{"id":"2ca68732-1088-455a-bf65-970593a7fb4e","value":0.01227326469908732}}},"7458d51a-efb4-4f26-a1c4-379d63128a1c":{"id":"7458d51a-efb4-4f26-a1c4-379d63128a1c","name":"modV/module/grid","x":1112.910543610321,"y":141.17784630510064,"outputs":{"context":{"id":"c519a3fd-a925-47c5-a42d-715dd6fdcbd2","connections":[["bdd10258-13ad-4d40-8491-7d6a2f4de2ab","context"]],"value":{"canvas":{},"context":{},"delta":1562325766744}}},"inputs":{"context":{"id":"fb660805-8fdd-44be-b47e-e111b0283454","value":{"canvas":{},"context":{},"delta":1562325766744}},"texture":{"id":"480695bf-08b0-4727-b9ac-b1e885ee59a2","value":{}},"tilesX":{"id":"33dcc52f-3e31-473f-b856-23ab34f7e36f","value":5},"tilesY":{"id":"f386c61e-372e-4482-8609-46705224481f","value":5}}},"6a54d107-f370-4d76-8a25-11c32f60acf3":{"id":"6a54d107-f370-4d76-8a25-11c32f60acf3","name":"modV/module/scale","x":789.9495858888013,"y":104.99565349039925,"outputs":{"context":{"id":"b78a66f3-22de-4bd1-82e1-10186f9bdf22","connections":[["7458d51a-efb4-4f26-a1c4-379d63128a1c","context"]],"value":{"canvas":{},"context":{},"delta":1562325766744}}},"inputs":{"context":{"id":"b0bcf609-1150-4ea9-b093-23dfafbc3b31","value":{"canvas":{},"context":{},"delta":1562325766744}},"scale":{"id":"60106916-c94f-4638-b583-d8157a0836a2","value":1.0122732646990873}}},"b57e910c-d3c9-4e46-a15c-aa86fcc83672":{"id":"b57e910c-d3c9-4e46-a15c-aa86fcc83672","name":"Number","x":817.5970900125279,"y":323.6622770144214,"outputs":{"x":{"id":"edd7f34e-dfa2-497e-9a71-7ee1a0770817","connections":[["01e18575-c746-4913-b096-8d0d8f069764","a"]],"value":1}},"inputs":{}},"bb9e764a-1133-4b83-adc4-6965c4250b49":{"id":"bb9e764a-1133-4b83-adc4-6965c4250b49","name":"Number","x":612.7542185503694,"y":500.857644352853,"outputs":{"x":{"id":"906688e3-6e24-47ce-8814-019d2f025e7b","connections":[["dec81e42-4209-4140-8968-77de78a19067","b"]],"value":5000}},"inputs":{}},"3381e2e3-cfcf-4420-8b6f-628eac4b70e7":{"id":"3381e2e3-cfcf-4420-8b6f-628eac4b70e7","name":"Number","x":904.3097165824001,"y":208.04544158792652,"outputs":{"x":{"id":"a48518a6-8056-4644-9de1-acecb9e9a7ab","connections":[["7458d51a-efb4-4f26-a1c4-379d63128a1c","tilesX"],["7458d51a-efb4-4f26-a1c4-379d63128a1c","tilesY"]],"value":5}},"inputs":{}},"2629abda-853b-44df-8a60-1c88e8edfc7f":{"id":"2629abda-853b-44df-8a60-1c88e8edfc7f","name":"Value Display","x":344.33142725709246,"y":248.0748603473155,"outputs":{},"inputs":{"x":{"id":"c3d612db-7af2-4ea5-9512-fb7497d9cc7b","value":1}}},"91c9659c-fb4c-472f-aea9-f774055ba56e":{"id":"91c9659c-fb4c-472f-aea9-f774055ba56e","name":"Value Display","x":1073.96485552345,"y":401.5779704540154,"outputs":{},"inputs":{"x":{"id":"852e2a1a-c6c0-451f-ae45-4d4f5a4d43f7","value":1.0122732646990873}}},"bdd10258-13ad-4d40-8491-7d6a2f4de2ab":{"id":"bdd10258-13ad-4d40-8491-7d6a2f4de2ab","name":"modV/visualOutput","x":1307.173466341665,"y":159.398112184879,"outputs":{},"inputs":{"context":{"id":"ff4732a1-ba2a-4c58-b8e4-f1d5ad70b218","value":{"canvas":{},"context":{},"delta":1562325766729}}}}},"order":["2c212a2a-3cae-4739-860b-c7f6dd5937af","e88e001b-3deb-4997-b4fb-ce0132b64cdd","405d2561-aea5-44cd-bd26-9e28f9c267fa","da7607ae-d8eb-4648-8c42-97d03caacf2d","f9a710e1-cafc-4839-91c4-01c55dc46498","10eac8b6-6281-48ce-88f7-a2cdcb309806","0ec5c30f-9ccf-42c6-82ed-24c6f8052416","eb548fbf-6198-49a6-9ec8-92c5ea285523","f961fa87-7b17-4663-91eb-d8ecc02b9e85","fe1f4407-0677-445f-803a-1922288546bf","6fb038df-9fbc-4ac9-8237-bed64a2caee5","26764281-1f60-4ff5-9930-8e590869f8c3","ae765c23-fee9-436d-b880-9730574b234c","17d56c37-01a1-4610-977d-89d02dc1d790","eda27757-9e20-4fd3-b7b4-70d24b5585ce","6e93536c-186f-4434-9dee-45329ef5f950","52bc2b7d-d2a3-4569-b9eb-53c932820bb5","dec81e42-4209-4140-8968-77de78a19067","01e18575-c746-4913-b096-8d0d8f069764","7458d51a-efb4-4f26-a1c4-379d63128a1c","6a54d107-f370-4d76-8a25-11c32f60acf3","b57e910c-d3c9-4e46-a15c-aa86fcc83672","bb9e764a-1133-4b83-adc4-6965c4250b49","3381e2e3-cfcf-4420-8b6f-628eac4b70e7","2629abda-853b-44df-8a60-1c88e8edfc7f","91c9659c-fb4c-472f-aea9-f774055ba56e","bdd10258-13ad-4d40-8491-7d6a2f4de2ab"]}'
    ),

    anachronous: JSON.parse(
      '{"nodes":{"909c20dd-17da-4183-a4dd-f227ab59ee36":{"id":"909c20dd-17da-4183-a4dd-f227ab59ee36","name":"modV/visualInput","x":169,"y":47,"outputs":{"context":{"id":"bb056ed1-cf5b-470d-90f4-cf66d5e79205","connections":[["6b7dfc59-fc3c-4334-aad4-aab6eb020dda","context"]],"value":{"canvas":{},"context":{},"delta":1562514040693}}},"inputs":{}},"2385dc5d-7ae0-441d-b2b1-96367a4032d8":{"id":"2385dc5d-7ae0-441d-b2b1-96367a4032d8","name":"math/operation/add","x":411,"y":404,"outputs":{"a+b":{"id":"d883a337-fe18-4227-8b3a-b2f71a7b0e9f","connections":[["ece421df-b9b3-4536-b2ce-834faee5256c","scale"]],"value":1.0015216070665771}},"inputs":{"a":{"id":"7b04b558-aa30-4a83-afff-ce638e71407d","value":0.0015216070665772061},"b":{"id":"825684cc-e140-44fa-8069-028df60649aa","value":1}}},"88bd7ac0-c444-4769-84d7-6c9bd9d5d97a":{"id":"88bd7ac0-c444-4769-84d7-6c9bd9d5d97a","name":"Number","x":195,"y":423,"outputs":{"x":{"id":"9454a497-2f3c-425f-bbda-f375d277d6d9","connections":[["2385dc5d-7ae0-441d-b2b1-96367a4032d8","b"]],"value":1}},"inputs":{}},"a35aa997-2633-4f33-8f2a-9fcedfa520ac":{"id":"a35aa997-2633-4f33-8f2a-9fcedfa520ac","name":"meyda/energy","x":98,"y":315,"outputs":{"energy":{"id":"499daf84-3db6-430d-ae98-6c8a8a1da5e5","connections":[["0853c13e-24df-44f7-8525-d393a4190e08","a"]],"value":1.5216070665772061}},"inputs":{}},"f209b82e-bce8-43e4-ba45-331e92eef2f6":{"id":"f209b82e-bce8-43e4-ba45-331e92eef2f6","name":"Number","x":96,"y":364,"outputs":{"x":{"id":"1ddf5aef-31c4-4807-9609-a8405587161c","connections":[["0853c13e-24df-44f7-8525-d393a4190e08","b"]],"value":1000}},"inputs":{}},"0853c13e-24df-44f7-8525-d393a4190e08":{"id":"0853c13e-24df-44f7-8525-d393a4190e08","name":"math/operation/divide","x":283,"y":327,"outputs":{"a÷b":{"id":"bfc648cc-f458-433b-b4e0-56a3a732fb59","connections":[["2385dc5d-7ae0-441d-b2b1-96367a4032d8","a"]],"value":0.0015216070665772061}},"inputs":{"a":{"id":"1a70541d-1759-4613-a017-79032d6ba1ba","value":1.5216070665772061},"b":{"id":"39393cc5-e945-40f7-b447-5f34f943e5ba","value":1000}}},"137a2987-1b57-42e8-bb60-0c99636b2a04":{"id":"137a2987-1b57-42e8-bb60-0c99636b2a04","name":"modV/module/circle","x":954,"y":77,"outputs":{"context":{"id":"5b8d0b61-b8ce-4a5b-8785-088f17a0b092","connections":[],"value":{"canvas":{},"context":{},"delta":1562513476327}}},"inputs":{"context":{"id":"370691b4-847e-4499-93ff-57fbd9b418bf"},"circleSize":{"id":"eebf7a2a-6a65-43d6-9db4-3cad7e71b0dd","value":150},"strokeSize":{"id":"bed40cab-73c3-47f3-81c7-91f86c6ece7e","value":50},"startAngle":{"id":"fee3acd8-93b9-45ee-8ecb-c12cf7cbe2db","value":0},"endAngle":{"id":"ab40c06e-0191-4274-8ad6-d718994480ac","value":6.283185307179586}}},"1cce01b3-6f1d-446a-af82-75599536e5ad":{"id":"1cce01b3-6f1d-446a-af82-75599536e5ad","name":"Number","x":716,"y":111,"outputs":{"x":{"id":"91e9da39-f8d3-459a-a209-4d35938c1622","connections":[["137a2987-1b57-42e8-bb60-0c99636b2a04","circleSize"]],"value":150}},"inputs":{}},"198f7817-6d9c-4f77-9455-cda2db339a3c":{"id":"198f7817-6d9c-4f77-9455-cda2db339a3c","name":"Number","x":716,"y":158,"outputs":{"x":{"id":"da6eebe4-b80b-419e-b13d-9a26595fbb87","connections":[["137a2987-1b57-42e8-bb60-0c99636b2a04","strokeSize"]],"value":50}},"inputs":{}},"6b7dfc59-fc3c-4334-aad4-aab6eb020dda":{"id":"6b7dfc59-fc3c-4334-aad4-aab6eb020dda","name":"modV/module/blockColor","x":351,"y":30,"outputs":{"context":{"id":"a89ac186-dbfb-48f2-a709-cee66310d5a5","connections":[["2032b6ff-649a-4455-a5e2-aa1c7e99893c","context"]],"value":{"canvas":{},"context":{},"delta":1562514040693}}},"inputs":{"context":{"id":"f5adeab1-2e7f-44fd-b94a-367ffa2eaaad","value":{"canvas":{},"context":{},"delta":1562514040693}},"rgb":{"id":"c07698d4-e6d1-4e2b-b060-6ba9f8645374","value":"#000"},"a":{"id":"612bebc3-53e8-4cf5-b966-cdac9f19b3a7","value":0.2}}},"2032b6ff-649a-4455-a5e2-aa1c7e99893c":{"id":"2032b6ff-649a-4455-a5e2-aa1c7e99893c","name":"modV/module/squishy","x":749,"y":31,"outputs":{"context":{"id":"08e576f4-3ce3-48e3-ae13-f5da8bb7d406","connections":[["ece421df-b9b3-4536-b2ce-834faee5256c","context"]],"value":{"canvas":{},"context":{},"delta":1562514040693}}},"inputs":{"context":{"id":"c5374f26-06cc-420e-91dd-3ccaca983685","value":{"canvas":{},"context":{},"delta":1562514040693}},"intensity":{"id":"f42742f3-5542-482b-9253-0e417d1198bd","value":1}}},"51301437-c42f-4c4c-97ea-7260a94291c5":{"id":"51301437-c42f-4c4c-97ea-7260a94291c5","name":"Number","x":593,"y":675,"outputs":{"x":{"id":"fe7ab079-08c8-4035-9882-08d9f6b064d4","connections":[["a9827efe-5071-45ef-9e70-ba6ded2b9185","strokeSize"]],"value":2}},"inputs":{}},"a1d777c6-5498-4506-ad64-2fed135893c7":{"id":"a1d777c6-5498-4506-ad64-2fed135893c7","name":"Text","x":596,"y":764,"outputs":{"x":{"id":"d59e6b68-6f94-4954-80c6-bd0d0318b632","connections":[["a9827efe-5071-45ef-9e70-ba6ded2b9185","weight"]],"value":"bold"}},"inputs":{}},"b274a68f-0246-4d8d-8838-3ee770c88d3c":{"id":"b274a68f-0246-4d8d-8838-3ee770c88d3c","name":"Checkbox","x":598,"y":807,"outputs":{"x":{"id":"7756320d-6805-4284-99ba-e7f054267cd3","connections":[["a9827efe-5071-45ef-9e70-ba6ded2b9185","fill"]],"value":true}},"inputs":{}},"6152ffac-8dc3-48d4-975d-1eb023197e71":{"id":"6152ffac-8dc3-48d4-975d-1eb023197e71","name":"Text","x":592,"y":720,"outputs":{"x":{"id":"05d7098b-bf5a-4a47-ba74-f66f24ddd7ac","connections":[["a9827efe-5071-45ef-9e70-ba6ded2b9185","font"]],"value":"Proxima Nova"}},"inputs":{}},"662c0f3d-bdea-4c4d-a1b4-d5e63b23bbe3":{"id":"662c0f3d-bdea-4c4d-a1b4-d5e63b23bbe3","name":"Checkbox","x":597,"y":905,"outputs":{"x":{"id":"d4323bf2-19be-41c2-9741-d19bd009fb29","connections":[["a9827efe-5071-45ef-9e70-ba6ded2b9185","stroke"]],"value":true}},"inputs":{}},"250044de-3ad6-47d0-bb52-c2307745a7bd":{"id":"250044de-3ad6-47d0-bb52-c2307745a7bd","name":"Number","x":607,"y":230,"outputs":{"x":{"id":"199d0900-4f54-4a37-b04d-170b6ad8aea1","connections":[["aa4d92f1-7f66-4fb2-8362-c50a0b44eea2","a"]],"value":1}},"inputs":{}},"fa34ca80-107a-4b27-8181-97d4061cd4e1":{"id":"fa34ca80-107a-4b27-8181-97d4061cd4e1","name":"math/operation/add","x":1285,"y":297,"outputs":{"a+b":{"id":"5aaa4ed8-5f2c-4a8d-a21a-e36d3c029486","connections":[["ba7fbdbb-dd26-477f-bd1b-b2529bb37cb9","slicesX"]],"value":62.312762386496104}},"inputs":{"a":{"id":"7a3247af-49e2-4c7b-a6b5-c8406057f602","value":50},"b":{"id":"90424e4e-9429-4a77-bab1-c6ac33e983d9","value":12.312762386496104}}},"06d55720-cb13-4941-ba68-7d3a63e94fc5":{"id":"06d55720-cb13-4941-ba68-7d3a63e94fc5","name":"math/operation/multiply","x":1080,"y":275,"outputs":{"a×b":{"id":"e2eca667-61d1-4dac-af28-35941dc8cabf","connections":[["fa34ca80-107a-4b27-8181-97d4061cd4e1","b"]],"value":12.384589047591305}},"inputs":{"a":{"id":"d3d53deb-607d-4601-9e79-5855786bda7c","value":120},"b":{"id":"8717e1d9-92d9-4a75-8733-dffe7cc72d32","value":0.10320490872992755}}},"b44e0c48-f1f6-459e-85ec-bcc6b00addfc":{"id":"b44e0c48-f1f6-459e-85ec-bcc6b00addfc","name":"math/operation/divide","x":886,"y":255,"outputs":{"a÷b":{"id":"62022204-8a97-494e-a3cb-2c1764a447da","connections":[["06d55720-cb13-4941-ba68-7d3a63e94fc5","b"]],"value":0.10385514510506078}},"inputs":{"a":{"id":"953742a3-6c34-4502-959a-bcfd44903d47","value":0.20771029021012155},"b":{"id":"32ba32e4-0fb5-4c0b-83da-83434f2813d4","value":2}}},"da6c9faf-f41b-415f-acd1-938ce18d2533":{"id":"da6c9faf-f41b-415f-acd1-938ce18d2533","name":"Number","x":828,"y":215,"outputs":{"x":{"id":"d48e9100-c340-457b-912f-582e876e1112","connections":[["b44e0c48-f1f6-459e-85ec-bcc6b00addfc","b"]],"value":2}},"inputs":{}},"59f09550-cbbd-43d5-91c1-a7f05f37efd3":{"id":"59f09550-cbbd-43d5-91c1-a7f05f37efd3","name":"time","x":689,"y":386,"outputs":{"time":{"id":"9a967521-c625-451f-9b14-08380ba5209a","connections":[["46affbba-0657-491e-b347-b95975e56c0f","a"]],"value":1651444.4999999832}},"inputs":{}},"46affbba-0657-491e-b347-b95975e56c0f":{"id":"46affbba-0657-491e-b347-b95975e56c0f","name":"math/operation/divide","x":860,"y":397,"outputs":{"a÷b":{"id":"da91a04d-363e-4a04-8450-a9ef67c35145","connections":[["80a1a2ab-351a-4a2f-b1d8-8a00731dac6b","x"]],"value":206.4305624999979}},"inputs":{"a":{"id":"26c0451c-2b5f-492b-b38e-4b4c1f1a5946","value":1651444.4999999832},"b":{"id":"a36a1775-2559-4240-80ee-62d15ea9c018","value":8000}}},"80a1a2ab-351a-4a2f-b1d8-8a00731dac6b":{"id":"80a1a2ab-351a-4a2f-b1d8-8a00731dac6b","name":"math/function/sin","x":598,"y":343,"outputs":{"x":{"id":"086a37d8-aaf4-4359-b192-c690bdcadb49","connections":[["aa4d92f1-7f66-4fb2-8362-c50a0b44eea2","b"]],"value":-0.7922897097898784}},"inputs":{"x":{"id":"eb3e69f2-02d8-4558-b67b-c012223679f5","value":206.4305624999979}}},"aa4d92f1-7f66-4fb2-8362-c50a0b44eea2":{"id":"aa4d92f1-7f66-4fb2-8362-c50a0b44eea2","name":"math/operation/add","x":680,"y":271,"outputs":{"a+b":{"id":"e7e6575c-b4f4-4f33-afdb-b26b3565b70c","connections":[["b44e0c48-f1f6-459e-85ec-bcc6b00addfc","a"]],"value":0.20771029021012155}},"inputs":{"a":{"id":"d761a8fb-2845-4b3d-94ac-7ace070a87a3","value":1},"b":{"id":"4461a710-b4ac-46e6-8b1c-5e536335abdf","value":-0.7922897097898784}}},"53a6d614-9976-445a-a815-aaee71dc51dc":{"id":"53a6d614-9976-445a-a815-aaee71dc51dc","name":"Number","x":1034,"y":221,"outputs":{"x":{"id":"9e2cfd9b-b6b9-48d1-82d3-c5948e052887","connections":[["06d55720-cb13-4941-ba68-7d3a63e94fc5","a"]],"value":120}},"inputs":{}},"ece421df-b9b3-4536-b2ce-834faee5256c":{"id":"ece421df-b9b3-4536-b2ce-834faee5256c","name":"modV/module/scale","x":429,"y":245,"outputs":{"context":{"id":"1f4889e8-66e4-4be2-877a-a88356cb6633","connections":[["a9827efe-5071-45ef-9e70-ba6ded2b9185","context"]],"value":{"canvas":{},"context":{},"delta":1562514040693}}},"inputs":{"context":{"id":"f6ddc970-cf0d-41c1-ab97-b7d235512477","value":{"canvas":{},"context":{},"delta":1562514040693}},"scale":{"id":"aff43b78-e703-4ab2-9ca5-b2805322e889","value":1.0038101014056942}}},"59a4b764-f200-433a-afda-67519263a5e2":{"id":"59a4b764-f200-433a-afda-67519263a5e2","name":"Number","x":164,"y":93,"outputs":{"x":{"id":"9092e8b0-c95e-4e46-8ae1-333e3581763a","connections":[["6b7dfc59-fc3c-4334-aad4-aab6eb020dda","a"]],"value":0.2}},"inputs":{}},"c4a174f8-3b5e-4122-886a-8cbf33f008a2":{"id":"c4a174f8-3b5e-4122-886a-8cbf33f008a2","name":"Number","x":1237,"y":226,"outputs":{"x":{"id":"43294d5a-095f-4add-b6f8-41a35f09ba0f","connections":[["fa34ca80-107a-4b27-8181-97d4061cd4e1","a"]],"value":50}},"inputs":{}},"49fa5580-ca34-4b43-afd6-70e6df35a4f5":{"id":"49fa5580-ca34-4b43-afd6-70e6df35a4f5","name":"Text","x":594,"y":576,"outputs":{"x":{"id":"88c18f0a-9536-4849-9d79-8560a5ff4dfe","connections":[["a9827efe-5071-45ef-9e70-ba6ded2b9185","text"]],"value":"ANACHRONOUS"}},"inputs":{}},"fad2429b-719e-40fe-8193-34207f4993b9":{"id":"fad2429b-719e-40fe-8193-34207f4993b9","name":"Number","x":593,"y":624,"outputs":{"x":{"id":"ab6d3e0d-b569-4d60-8e90-518eab4d6de2","connections":[["a9827efe-5071-45ef-9e70-ba6ded2b9185","size"]],"value":110}},"inputs":{}},"e704f627-ed53-49dd-952c-50c0204171de":{"id":"e704f627-ed53-49dd-952c-50c0204171de","name":"Color","x":598,"y":858,"outputs":{"rgb":{"id":"48de85bb-3b90-40d0-8e43-98abf8d931f6","connections":[["a9827efe-5071-45ef-9e70-ba6ded2b9185","fillColor"]],"value":"#e53503"}},"inputs":{}},"987d83db-338e-41ec-a703-5d5a06cd6238":{"id":"987d83db-338e-41ec-a703-5d5a06cd6238","name":"Color","x":591,"y":954,"outputs":{"rgb":{"id":"25606b13-3f0b-4fb6-825e-a63128ac09e7","connections":[["a9827efe-5071-45ef-9e70-ba6ded2b9185","strokeColor"]],"value":"#000000"}},"inputs":{}},"a9827efe-5071-45ef-9e70-ba6ded2b9185":{"id":"a9827efe-5071-45ef-9e70-ba6ded2b9185","name":"modV/module/text","x":833,"y":577,"outputs":{"context":{"id":"9a8ddfec-9018-4f7c-80f2-1b0fef72e19d","connections":[["ba7fbdbb-dd26-477f-bd1b-b2529bb37cb9","context"]],"value":{"canvas":{},"context":{},"delta":1562514040693}}},"inputs":{"context":{"id":"fc2961db-6dbd-47d9-af19-421204e6be2d","value":{"canvas":{},"context":{},"delta":1562514040693}},"text":{"id":"17d4a09c-a6f6-4670-b828-3e576c58ac7e","value":"ANACHRONOUS"},"size":{"id":"b18af2b7-6a06-4960-b13e-b8cbea9f88c5","value":110},"positionX":{"id":"de7758e2-2a27-454d-99a0-77973f9a0a52","value":0.5},"positionY":{"id":"358e3b45-2cbd-424b-acc9-9c4c89f3126a","value":0.5},"strokeSize":{"id":"8135957b-a3b9-469a-9fbd-5e74ffab467e","value":2},"font":{"id":"08083407-6987-4d7c-8560-edae8220ecbd","value":"Proxima Nova"},"weight":{"id":"a656f454-cd7f-4b26-a90e-6899cba82236","value":"bold"},"fill":{"id":"9790e1e4-065f-4506-9d34-0796ad04e023","value":true},"fillColor":{"id":"a1627881-1ded-432e-bb83-a958fac891f6","value":"#e53503"},"stroke":{"id":"c7ecd2f3-e3cb-435f-a46d-8a61ef4dfbd1","value":true},"strokeColor":{"id":"624194b5-460e-444d-83aa-f449ac065e3f","value":"#000000"}}},"ba7fbdbb-dd26-477f-bd1b-b2529bb37cb9":{"id":"ba7fbdbb-dd26-477f-bd1b-b2529bb37cb9","name":"modV/module/GridStretch","x":1165,"y":406,"outputs":{"context":{"id":"e0b68377-a58e-437a-ac68-29a481ebeadf","connections":[["582fbf40-7ea2-4718-9bed-66b6ff110aff","context"]],"value":{"canvas":{},"context":{},"delta":1562514040693}}},"inputs":{"context":{"id":"9813f044-45ac-41d6-bd29-d391ea185bab","value":{"canvas":{},"context":{},"delta":1562514040693}},"slicesX":{"id":"0ee4c53c-27c8-498e-85d1-7c06a1c66f64","value":62.23335864196652},"slicesY":{"id":"50b1b2d5-06b2-4c36-b797-2c5a25e430af","value":1},"scale":{"id":"2da85272-6697-4a18-8c33-63495123b3ae","value":60}}},"0ed94eea-5c9f-43f1-a875-c113c322d05a":{"id":"0ed94eea-5c9f-43f1-a875-c113c322d05a","name":"Number","x":690,"y":428,"outputs":{"x":{"id":"efda7eae-037e-46e8-b505-3e27c8aac7bf","connections":[["46affbba-0657-491e-b347-b95975e56c0f","b"]],"value":8000}},"inputs":{}},"49a4f7cc-8d46-4715-9fd3-5169b55033e6":{"id":"49a4f7cc-8d46-4715-9fd3-5169b55033e6","name":"Number","x":1049,"y":543,"outputs":{"x":{"id":"85876686-5959-4752-979e-b061cfe7f25a","connections":[["ba7fbdbb-dd26-477f-bd1b-b2529bb37cb9","scale"]],"value":60}},"inputs":{}},"5eb4e930-d722-491a-bbef-3d9975bf5e18":{"id":"5eb4e930-d722-491a-bbef-3d9975bf5e18","name":"Number","x":954,"y":478,"outputs":{"x":{"id":"7635705c-d21c-4af2-808d-ea74bfc16823","connections":[["ba7fbdbb-dd26-477f-bd1b-b2529bb37cb9","slicesY"]],"value":1}},"inputs":{}},"582fbf40-7ea2-4718-9bed-66b6ff110aff":{"id":"582fbf40-7ea2-4718-9bed-66b6ff110aff","name":"modV/visualOutput","x":1344,"y":386,"outputs":{},"inputs":{"context":{"id":"4bac2b3d-fbfa-429d-b332-84de2de4ed06","value":{"canvas":{},"context":{},"delta":1562514040693}}}}},"order":["909c20dd-17da-4183-a4dd-f227ab59ee36","2385dc5d-7ae0-441d-b2b1-96367a4032d8","88bd7ac0-c444-4769-84d7-6c9bd9d5d97a","a35aa997-2633-4f33-8f2a-9fcedfa520ac","f209b82e-bce8-43e4-ba45-331e92eef2f6","0853c13e-24df-44f7-8525-d393a4190e08","137a2987-1b57-42e8-bb60-0c99636b2a04","1cce01b3-6f1d-446a-af82-75599536e5ad","198f7817-6d9c-4f77-9455-cda2db339a3c","6b7dfc59-fc3c-4334-aad4-aab6eb020dda","2032b6ff-649a-4455-a5e2-aa1c7e99893c","51301437-c42f-4c4c-97ea-7260a94291c5","a1d777c6-5498-4506-ad64-2fed135893c7","b274a68f-0246-4d8d-8838-3ee770c88d3c","6152ffac-8dc3-48d4-975d-1eb023197e71","662c0f3d-bdea-4c4d-a1b4-d5e63b23bbe3","250044de-3ad6-47d0-bb52-c2307745a7bd","fa34ca80-107a-4b27-8181-97d4061cd4e1","06d55720-cb13-4941-ba68-7d3a63e94fc5","b44e0c48-f1f6-459e-85ec-bcc6b00addfc","da6c9faf-f41b-415f-acd1-938ce18d2533","59f09550-cbbd-43d5-91c1-a7f05f37efd3","46affbba-0657-491e-b347-b95975e56c0f","80a1a2ab-351a-4a2f-b1d8-8a00731dac6b","aa4d92f1-7f66-4fb2-8362-c50a0b44eea2","53a6d614-9976-445a-a815-aaee71dc51dc","ece421df-b9b3-4536-b2ce-834faee5256c","59a4b764-f200-433a-afda-67519263a5e2","c4a174f8-3b5e-4122-886a-8cbf33f008a2","49fa5580-ca34-4b43-afd6-70e6df35a4f5","fad2429b-719e-40fe-8193-34207f4993b9","e704f627-ed53-49dd-952c-50c0204171de","987d83db-338e-41ec-a703-5d5a06cd6238","a9827efe-5071-45ef-9e70-ba6ded2b9185","ba7fbdbb-dd26-477f-bd1b-b2529bb37cb9","0ed94eea-5c9f-43f1-a875-c113c322d05a","49a4f7cc-8d46-4715-9fd3-5169b55033e6","5eb4e930-d722-491a-bbef-3d9975bf5e18","582fbf40-7ea2-4718-9bed-66b6ff110aff"]}'
    )
  };

  menuBar.append(
    new MenuItem({
      label: "File",
      submenu: fileMenu,
      click() {
        openMenu = new Menu();

        // const saveData = localStorage.getItem("vgraph-saves");
        // saves = JSON.parse(saveData || "{}");

        const filenames = Object.keys(saves);
        if (filenames.length) {
          filenames.forEach(label =>
            openMenu.append(
              new MenuItem({
                label,
                click() {
                  vGraph.reset();
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

  const debugMenu = new Menu();
  debugMenu.append(
    new MenuItem({
      label: "Hitpoints",
      type: "checkbox",
      click() {
        dom.debug.hitpoints = !dom.debug.hitpoints;
        dom.redraw();
      }
    })
  );

  debugMenu.append(
    new MenuItem({
      label: "Execution Order",
      type: "checkbox",
      click() {
        dom.debug.executionOrder = !dom.debug.executionOrder;
        dom.redraw();
      }
    })
  );

  debugMenu.append(
    new MenuItem({
      label: "Beziers",
      type: "checkbox",
      click() {
        dom.debug.beziers = !dom.debug.beziers;
        dom.redraw();
      }
    })
  );

  menuBar.append(
    new MenuItem({
      label: "Debug",
      submenu: debugMenu,
      click() {}
    })
  );
}
