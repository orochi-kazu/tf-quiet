class CollapsibleBlock extends HTMLElement {
  constructor () {
    super()
    this.collapsed = false

    const shadow = this.attachShadow({ mode: 'open' })
    shadow.innerHTML = `
      <style>
        .collapse-header {
          border: 0.1rem solid lightgrey;
          border-radius: 0.2rem;
          cursor: pointer;
        }
        .collapse-header.collapsed::after {
          content: "...";
          padding: 0 1rem;
          display: block;
          color: gray;
        }
        .collapse-header.collapsed:hover::after { background-color: #fafafa; }

        .collapse-body {}
        .collapse-body.collapsed { display: none; }
      </style>
      <div class="collapse-header"><slot name="head"/></div>
      <div class="collapse-body"><slot name="body"/></div>
    `
    shadow.querySelector('div.collapse-header').onclick = this.toggleCollapsed.bind(this)
    this.elements = shadow.querySelectorAll('div')
  }

  toggleCollapsed () {
    this.collapsed = !this.collapsed
    this.refreshDisplay()
  }

  collapse () {
    this.collapsed = true
    this.refreshDisplay()
  }

  expand () {
    this.collapsed = false
    this.refreshDisplay()
  }

  refreshDisplay () {
    const action = this.collapsed ? 'add' : 'remove'
    this.elements.forEach(it => { it.classList[action]('collapsed') })
  }
}

customElements.define('collapsible-block', CollapsibleBlock)
