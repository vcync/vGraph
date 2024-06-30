import { vGraphDOM } from "..";
import { Menu, MenuItem } from "../../nwjs-menu-browser";

/**
 *
 * @param {vGraphDOM} vGraphDOM
 * @returns
 */
export function buildNodeMenu(vGraphDOM) {
  const menu = new Menu();
  const nodeGroups = {};

  const { dpr, availableNodes } = vGraphDOM;

  Object.values(availableNodes)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(node => {
      if (!node.group) {
        menu.append(
          new MenuItem({
            label: node.name,
            click: function() {
              const { x, y } = this.parentMenu.topmostMenu;
              const [x2, y2] = vGraphDOM.inputStatus.scale(x, y);

              vGraphDOM.createNode(node.name, x2 / dpr, y2 / dpr);
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
            const [x2, y2] = vGraphDOM.inputStatus.scale(x, y);

            vGraphDOM.createNode(node.name, x2 / dpr, y2 / dpr);
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
