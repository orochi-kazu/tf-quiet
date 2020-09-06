class CollapsibleBlock extends HTMLElement {
  constructor () {
    super()

    this.attachShadow({ mode: 'open' }).innerHTML = `
      <style>
        .collapse-header {
          border: 0.1rem solid lightgrey;
          border-radius: 0.2rem;
        }
        .collapse-body {}
      </style>
      <div class="collapse-header"><slot name="head"/></div>
      <div class="collapse-body"><slot name="body"/></div>
    `
  }
}

customElements.define('collapsible-block', CollapsibleBlock)
