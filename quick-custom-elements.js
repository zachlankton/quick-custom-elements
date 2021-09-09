(() => {
	void async function fetchAllTemplates() {
		const templates = document.querySelectorAll("template[src]")
		for (let i = 0; i < templates.length; i++) {
			let t = templates[i];
			const src = t.getAttribute("src")
			const html = await (await fetch(src)).text();
			t.innerHTML = html
		}
		setupCustomElements()
	}()

	function setupCustomElements() {
		const templates = document.querySelectorAll("template[id]")
		templates.forEach(t => setupCustomElement(t))
		const event = new Event('qce-loaded');
		document.dispatchEvent(event);
	}

	function setupCustomElement(template) {
		const templateContent = template.content;
		const scrAC = templateContent.querySelector("script[attribute-changed]")
		const attrs = scrAC ? scrAC.getAttribute("attribute-changed") : ""
		const name = template.id;
		const _name = name.replace("-", "_");
		const src = template.getAttribute("src")

		// debugging helper
		let sourceFile = `//@ sourceURL=${name}`
		if (src) sourceFile = `//@ sourceURL=${src}`

		class newElm extends HTMLElement {
			static get observedAttributes() {
				return eval(attrs);
			}
			constructor() {
				super();
				const shadow = this.attachShadow({
					mode: 'open'
				})
				shadow.appendChild(templateContent.cloneNode(true));

				const shadowRoot = this.shadowRoot;
				const scriptConstructor = shadowRoot.querySelector("script[constructor]")
				const scriptConnected = shadowRoot.querySelector("script[connected]")
				const scriptDisconnected = shadowRoot.querySelector("script[disconnected]")
				const scriptAdopted = shadowRoot.querySelector("script[adopted]")
				const scriptAttributeChange = shadowRoot.querySelector("script[attribute-changed]")

				if (scriptConstructor) this.qce_constructor = prepareScript(scriptConstructor)
				if (scriptConnected) this.qce_connected = prepareScript(scriptConnected)
				if (scriptDisconnected) this.qce_disconnected = prepareScript(scriptDisconnected)
				if (scriptAdopted) this.qce_adopted = prepareScript(scriptAdopted)
				if (scriptAttributeChange) this.qce_attr_changed = prepareScript(scriptAttributeChange, "attributeName, oldValue, newValue")

				this.qce_constructor && this.qce_constructor()

			}
			connectedCallback() {
				this.qce_connected && this.qce_connected();
			}
			disconnectedCallback() {
				this.qce_disconnected && this.qce_disconnected();
			}
			adoptedCallback() {
				this.qce_adopted && this.qce_adopted();
			}
			attributeChangedCallback(attributeName, oldValue, newValue) {
				this.qce_attr_changed && this.qce_attr_changed(attributeName, oldValue, newValue)
			}
		}
		customElements.define(name, newElm);

		function prepareScript(script, args = "") {
			// We prepare the script to include the entire commented out template for easier debugging
			// this helps preserve line numbers (at least when templates are included as a separate file)

			// comment out the entire template (also handle comments inside the template by replacing */ with /*)
			const outerTemplate = `/* ${template.outerHTML.replace("*/", "/*")} */`

			// uncomment the inner script text so it will execute when called
			const newScript = outerTemplate.replace(script.innerText, `*/ ${script.innerText} ${sourceFile} \n /*`)

			// remove this script from the shadowDOM so that it does not execute when connected to real DOM
			script.remove();

			// return the new encapsulated function
			return eval(`[function ${_name}(${args}){ ${newScript} }][0]`);
		}
	}


})()
