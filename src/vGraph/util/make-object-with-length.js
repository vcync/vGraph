export default function makeObjectWithLength(
  obj = {},
  enumerable = false,
  varName = '$length'
) {
  Object.defineProperty(obj, varName, {
    enumerable,
    writable: true,
    value: 0
  })

  return new Proxy(obj, {
    set(obj, prop, value) {
      obj[prop] = value
      obj.$length += 1
      return true
    },

    deleteProperty(obj, prop) {
      delete obj[prop]
      obj.$length -= 1
      return true
    }
  })
}
