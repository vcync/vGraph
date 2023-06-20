import { Menu, MenuItem } from "../../nwjs-menu-browser";

export function buildNodeMenu(vGraphDOM) {
  const menu = new Menu();
  const nodeGroups = {};

  const {
    canvas,
    scale,
    dpr,
    scaleOffsetX,
    scaleOffsetY,
    availableNodes
  } = vGraphDOM;

  Object.values(availableNodes)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(node => {
      if (!node.group) {
        menu.append(
          new MenuItem({
            label: node.name,
            click: function() {
              let { x, y } = this.parentMenu.topmostMenu;

              x = (x * dpr - scaleOffsetX * canvas.width) / scale;

              y = (y * dpr - scaleOffsetY * canvas.height) / scale;

              vGraphDOM.createNode(node.name, x, y);
            }
          })
        );
      }

      if (!node.group) {
        return;
      }

      if (!nodeGroups[node.group]) {
        nodeGroups[node.group] = new Menu();
      }

      nodeGroups[node.group].append(
        new MenuItem({
          label: node.name,
          click: function() {
            let { x, y } = this.parentMenu.topmostMenu;

            x = (x * dpr - scaleOffsetX * canvas.width) / scale;

            y = (y * dpr - scaleOffsetY * canvas.height) / scale;

            vGraphDOM.createNode(node.name, x, y);
          }
        })
      );
    });

  menu.append(new MenuItem({ type: "separator" }));

  Object.keys(nodeGroups)
    .sort((a, b) => a.localeCompare(b))
    .forEach(menuKey => {
      const submenu = nodeGroups[menuKey];
      menu.append(
        new MenuItem({
          label: menuKey,
          submenu
        })
      );
    });

  return menu;
}
