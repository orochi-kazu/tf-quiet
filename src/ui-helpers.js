const find = selector => document.querySelector(selector)
const findAll = selector => document.querySelectorAll(selector)

const add = (parentSelector, child) => {
  find(parentSelector).appendChild(child)
}
const create = (tag, classes, contents) => {
  const el = document.createElement(tag)
  el.className = classes
  el.innerHTML = contents
  return el
}

const clearContents = selector => {
  const el = find(selector)
  el.innerHTML = ''
  el.value = ''
}

export {
  find, findAll,
  add, create,
  clearContents
}
