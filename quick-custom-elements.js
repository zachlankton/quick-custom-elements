void async function () {
  var templates = document.querySelectorAll("template[src]")
  
  for (let i = 0; i < templates.length; i++) {
    let t = templates[i];
    const src = t.getAttribute("src")
    const html = await (await fetch(src)).text();
    t.innerHTML = html
  }
  
  setupCustomElements()

}()

function setupCustomElements() {
  var templates = document.querySelectorAll("template[id]")
  templates.forEach( (t) => {
    setupCustomElement(t)
  } )
}

function setupCustomElement(t) {
  const name = t.id;
  customElements.define(name,
    class extends HTMLElement {

      constructor() {
        super();
        let templateContent = t.content;

        const shadowRoot = this.attachShadow({ mode: 'open' })
          .appendChild(templateContent.cloneNode(true));
      }

      connectedCallback() {
        const shadowRoot = this.shadowRoot;
        const script = shadowRoot.querySelector("script[connected]")
        if (script){
          this.templateScript = new Function(script.innerText)
          script.remove();
          this.templateScript();
          
        }
        
      }
    }
  );
}
