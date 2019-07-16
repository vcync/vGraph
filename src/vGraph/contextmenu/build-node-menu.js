import { Menu, MenuItem } from '../../nwjs-menu-browser'

export default function buildNodeMenu(vGraph) {
  const menu = new Menu()
  const nodeGroups = {}
  Object.values(vGraph.availableNodes)
    .sort((a, b) => a.name.localeCompare(b.name))
    .forEach(node => {
      if (!node.group) {
        menu.append(
          new MenuItem({
            label: node.name,
            click: function() {
              let { x, y } = this.parentMenu.topmostMenu

              x =
                (x * vGraph.dpr - vGraph.scaleOffsetX * vGraph.canvas.width) /
                vGraph.scale

              y =
                (y * vGraph.dpr - vGraph.scaleOffsetY * vGraph.canvas.height) /
                vGraph.scale

              vGraph.createNode(node.name, x, y)
            }
          })
        )
      }

      if (!node.group) {
        return
      }

      if (!nodeGroups[node.group]) {
        nodeGroups[node.group] = new Menu()
      }

      nodeGroups[node.group].append(
        new MenuItem({
          label: node.name,
          click: function() {
            let { x, y } = this.parentMenu.topmostMenu

            x =
              (x * vGraph.dpr - vGraph.scaleOffsetX * vGraph.canvas.width) /
              vGraph.scale

            y =
              (y * vGraph.dpr - vGraph.scaleOffsetY * vGraph.canvas.height) /
              vGraph.scale

            vGraph.createNode(node.name, x, y)
          }
        })
      )
    })

  menu.append(new MenuItem({ type: 'separator' }))

  Object.keys(nodeGroups)
    .sort((a, b) => a.localeCompare(b))
    .forEach(menuKey => {
      const submenu = nodeGroups[menuKey]
      menu.append(
        new MenuItem({
          label: menuKey,
          submenu
        })
      )
    })

  return menu
}
