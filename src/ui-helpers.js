find = selector => document.querySelector(selector)
findAll = selector => document.querySelectorAll(selector)

add = (parentSelector, child) => {
  find(parentSelector).appendChild(child)
}
create = (tag, classes, contents) => {
  const el = document.createElement(tag)
  el.className = classes
  el.innerHTML = contents
  return el
}

clearContents = selector => {
  const el = find(selector)
  el.innerHTML = ''
  el.value = ''
}
