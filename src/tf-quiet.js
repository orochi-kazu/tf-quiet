const noDefault = (e, f) => {
  e.preventDefault()
  return f()
}

clearInput = e => noDefault(e, () => {
  clearContents('#tf-plan')
})
clearOutput = e => noDefault(e, () => {
  clearContents('#summary')
  clearContents('#quiet')
})

const setSummary = summary => {
  clearContents('#summary');
  ['add', 'change', 'destroy'].forEach(op => {
    addDiv('#summary', `summary ${op}`, `${summary[op]} to ${op}`)
  })
}

quieten = e => noDefault(e, () => {
  const planEl = find('#tf-plan')
  const lines = trimEnds(planEl.value.split('\n'))
  const summary = summaryFromLines(lines)
  setSummary(summary)
  lines.forEach(line => addPre('#quiet', classForLine(line), line))
})

const classForLine = line => ({
  '+': 'add',
  '~': 'change',
  '-': 'destroy'
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
