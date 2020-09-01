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
addDiv = (parentSelector, classes, contents) => {
  add(parentSelector, create('div', classes, contents))
}
addPre = (parentSelector, classes, contents) => {
  add(parentSelector, create('pre', `${classes} tf-line`, contents))
}

clearContents = selector => {
  find(selector).innerHTML = ''
}
