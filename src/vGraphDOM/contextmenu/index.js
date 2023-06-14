import getInputCoords from "../util/get-input-coords";
import { buildNodeMenu } from "./build-node-menu";
import { buildSubgraphMenuItems } from "./build-subgraph-menu-items";
import { MenuItem } from "../../nwjs-menu-browser";

let menu;

export default function contextmenu(e) {
  e.preventDefault();

  const { dpr, focusedNodes } = this;

  const input = getInputCoords(e);

  this.mouseX =
    (input[0] * dpr - this.scaleOffsetX * this.canvas.width) / this.scale;
  this.mouseY =
    (input[1] * dpr - this.scaleOffsetY * this.canvas.height) / this.scale;

  const clientCoords = {
    x: this.mouseX,
    y: this.mouseY
  };

  const hitpoints = this.graphHitpoints[this.graphToEdit.id];
  const { point } = hitpoints.hasIntersect(
    "node",
    clientCoords.x,
    clientCoords.y
  );

  if (menu) {
    menu.destroy();
  }
  menu = buildNodeMenu(this);

  if (point) {
    menu.insert(new MenuItem({ type: "separator" }), 0);
    menu.insert(
      new MenuItem({
        label: "Clone node(s)",
        click: () => {
          this.cloneNode(focusedNodes.map(node => node.id));
        }
      }),
      0
    );
  } else if (this.graphToEdit !== this.vGraphCore.graph) {
    menu.insert(new MenuItem({ type: "separator" }), 0);
    buildSubgraphMenuItems(this, input[0], input[1]).forEach(menuItem =>
      menu.insert(menuItem)
    );
  }

  if (menu) {
    menu.popup(input[0], input[1]);
  }
}
