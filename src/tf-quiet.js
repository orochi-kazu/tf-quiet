clearInput = e => noDefault(e, () => {
  clearContents('#tf-plan')
})
clearOutput = e => noDefault(e, () => {
  clearContents('#summary')
  clearContents('#quiet')
})

quieten = e => noDefault(e, () => {
  clearOutput()
  const planEl = find('#tf-plan')
  const lines = trimEnds(planEl.value.split('\n'))

  const summary = summaryFromLines(lines)
  setSummary(summary)

  const tree = tfPlanLinesToTree(lines)
  const res = resourcesFromTree(tree.children)
  res.forEach(el => add('#quiet', el))
})

const noDefault = (e, f) => {
  if (e) { e.preventDefault() }
  return f()
}

const setSummary = summary => {
  clearContents('#summary');
  ['add', 'change', 'destroy'].forEach(op => {
    const el = create('div', `summary ${op}`, `${summary[op]} to ${op}`)
    add('#summary', el)
  })
}

const classForLine = line => ({
  '+': 'add',
  '~': 'change',
  '-': 'destroy',
  '#': 'comment'
})[line.trim()[0]] || (line.includes('->') ? 'translate' : '')

const trimEnds = lines => {
  const start = indexOfFirstLine(lines)
  const end = indexOfLastLine(lines)
  return [...lines].slice(start, end)
}

const indexOfFirstLine = lines =>
  lines.findIndex(line => line.startsWith('Terraform will perform the following actions:'))

const indexOfLastLine = lines =>
  -[...lines].reverse().findIndex(line => line.startsWith('Plan:'))

const summaryFromLines = lines => {
  const parts = lines[lines.length - 1].slice('Plan: '.length, -1).split(', ')
  return parts.reduce((acc, curr) => {
    const [num, op] = curr.split(' to ')
    acc[op] = parseInt(num)
    return acc
  }, {})
}

const lineElement = line => {
  if (typeof line !== 'string') { return line }

  const classes = classForLine(line)
  return create('pre', `${classes} tf-line`, line)
}
const resourceElement = lines => {
  const head = [lineElement(lines[0])]
  const body = [...lines].slice(1).map(it => lineElement(it))
  const el = document.createElement('collapsible-block')
  el.appendChild(slotSpan('head', head))
  el.appendChild(slotSpan('body', body))
  return el
}
const slotSpan = (slotName, children) => {
  const el = document.createElement('span')
  el.setAttribute('slot', slotName)
  children.forEach(it => el.appendChild(it))
  return el
}

const treeStreamBuilder = () => {
  const node = (content = null, parent = null) => ({ parent, children: [], content })
  const root = node()
  let currentParent = root
  return {
    beginChild: () => {
      currentParent = currentParent.children[currentParent.children.length - 1]
    },
    endChild: () => {
      currentParent = currentParent.parent
    },
    add: (content = null) => {
      currentParent.children.push(node(content, currentParent))
    },
    build: () => root
  }
}

const tfPlanLinesToTree = lines => {
  const b = treeStreamBuilder()
  lines.forEach(it => {
    if (it.endsWith('{')) {
      b.add()
      b.beginChild()
      b.add(it)
    } else if (it.trim().startsWith('}')) {
      b.add(it)
      b.endChild()
    } else {
      b.add(it)
    }
  })
  return b.build()
}

const resourcesFromTree = (children, indent = 0) => children.reduce((acc, it) => {
  if (it.content) { // line
    acc.push(lineElement(it.content))
  } else if (it.children.length > 0) { // resource
    const res = resourcesFromTree(it.children, indent + 1)
    if (indent === 0) { // root level
      acc.push(resourceElement(res))
    } else { // non-root level
      acc = acc.concat(res)
    }
  }
  return acc
}, [])
