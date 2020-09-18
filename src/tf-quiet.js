import {
  find, findAll,
  add, create,
  clearContents
} from './ui-helpers.js'

const clearInput = e => noDefault(e, () => {
  clearContents('#tf-plan')
})
const clearOutput = e => noDefault(e, () => {
  findAll('input#hide-unchanged,input#hide-comments').forEach(it => { it.checked = false })
  clearContents('#summary')
  clearContents('#quiet')
  setHidden(true, '#controls,#summary')
})
const quieten = e => noDefault(e, () => {
  clearOutput()

  const planEl = find('#tf-plan')
  const lines = trimEnds(planEl.value.split('\n'))

  const summary = summaryFromLines(lines)
  setSummary(summary)

  if (summary.noChange) {
    setHidden(false, '#summary')
  } else {
    setHidden(false, '#controls,#summary')

    const tree = tfPlanLinesToTree(lines)
    const res = resourcesFromTree(tree.children)
    res.forEach(el => add('#quiet', el))
  }
})
const collapseAll = e => noDefault(e, () => {
  findAll('collapsible-block').forEach(it => { it.collapse() })
})
const expandAll = e => noDefault(e, () => {
  findAll('collapsible-block').forEach(it => { it.expand() })
})

const onClick = {
  clearInput,
  clearOutput,
  quieten,
  collapseAll,
  expandAll
}

const hideUnchanged = e => noDefault(e, () => {
  const hidden = e.target.checked
  setHidden(hidden, '.no-change')
})
const hideComments = e => noDefault(e, () => {
  const hidden = e.target.checked
  setHidden(hidden, '.comment')
})

const setHidden = (hidden, classSelector) => {
  const action = hidden ? 'add' : 'remove'
  findAll(classSelector).forEach(it => { it.classList[action]('hidden') })
}

const onChange = {
  hideUnchanged,
  hideComments
}

const noDefault = (e, f) => {
  if (e) { e.preventDefault() }
  return f()
}

const setSummary = summary => {
  clearContents('#summary')
  const cells = summary.noChange
    ? [create('span', 'summary no-change', summary.noChange)]
    : summary.unknown
      ? [create('span', 'summary unknown', summary.unknown)]
      : ['add', 'change', 'destroy'].map(op =>
        create('span', `summary ${op}`, `${summary[op]} to ${op}`)
      )
  cells.forEach(it => { add('#summary', it) })
}

const classForLine = line => ({
  '+': 'add',
  '~': 'change',
  '-': 'destroy',
  '#': 'comment'
})[line.trim()[0]] || (
  line.includes('->') ? 'translate' :
  line.includes('<=') ? 'lookup' :
  'no-change'
)

const trimEnds = lines => {
  const start = Math.max(0, indexOfFirstLine(lines))
  const lastLine = indexOfLastLine(lines)
  const end = (lastLine > 0) ? lines.length : lastLine
  return [...lines].slice(start, end)
}

const indexOfFirstLine = lines =>
  lines.findIndex(line => line.startsWith('Terraform will perform the following actions:'))

const indexOfLastLine = lines =>
  -[...lines].reverse().findIndex(line => line.startsWith('Plan:') || line.startsWith('No changes.'))

const summaryFromLines = lines => {
  const summaryLine = lines[lines.length - 1]
  if (summaryLine.startsWith('No changes.')) {
    return { noChange: summaryLine }
  }
  const parts = summaryLine.slice('Plan: '.length, -1).split(', ')
  if (!parts || parts.length <= 1) {
    return { unknown: 'Cannot find plan summary line! :(' }
  }
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

export default { onClick, onChange }
export { onClick, onChange }
