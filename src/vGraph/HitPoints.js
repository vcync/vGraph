import uuid4 from 'uuid/v4'

import isIntersectPoint from './util/is-intersect-point'
import isIntersectRect from './util/is-intersect-rect'

export default class HitPoints {
  points = []

  groups = {}

  add(group, data, x1, y1, x2, y2) {
    if (!group) {
      throw new Error('Hit Point must have a group')
    }

    const point = {
      id: uuid4(),
      group,
      data
    }

    if (arguments.length < 6) {
      point.type = 'radial'
      point.x = x1
      point.y = y1
      point.radius = x2
    } else {
      point.type = 'area'
      point.x1 = x1
      point.y1 = y1
      point.x2 = x2
      point.y2 = y2
    }

    const index = this.points.push(point) - 1

    if (!this.groups[group]) {
      this.groups[group] = []
    }

    this.groups[group].push(index)

    return point
  }

  update(id, newData) {
    const index = this.points.findIndex(point => point.id === id)
    const point = this.points[index]
    if (!point) {
      return false
    }

    this.points[index] = Object.assign(point, newData)
    return this.points[index]
  }

  remove(id) {
    const index = this.points.findIndex(point => point.id === id)
    const point = this.points[index]

    if (index > -1) {
      const groupIndex = this.groups[point.group].indexOf(index)

      this.groups[point.group].splice(groupIndex, 1)
      this.points.splice(index, 1)

      Object.values(this.groups).forEach(arr => {
        for (let i = 0; i < arr.length; ++i) {
          const groupIndex = arr[i]
          if (groupIndex > index) {
            arr[i] -= 1
          }
        }
      })
    }
  }

  hasIntersect(group, x, y) {
    if (!this.groups[group]) {
      return false
    }

    const groupLength = this.groups[group].length
    let intersectedPoint
    let intersectedIndex

    for (let i = 0; i < groupLength; ++i) {
      const index = this.groups[group][i]
      const point = this.points[index]

      let intersect = false

      if (point.type === 'radial') {
        intersect = isIntersectPoint({ x, y }, point)
      } else {
        intersect = isIntersectRect({ x, y }, point)
      }

      if (intersect) {
        intersectedPoint = point
        intersectedIndex = index
        break
      }
    }

    if (intersectedPoint && typeof intersectedIndex !== 'undefined') {
      return {
        point: intersectedPoint,
        index: intersectedIndex
      }
    }

    return false
  }
}
