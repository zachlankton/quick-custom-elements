# Quick Custom Elements

## Introduction
Quick Custom Elements (QCE) is as simple as its name. It allows you to quickly and easily create custom HTML elements and components using browser supported built in <template> tags. No need to create a custom element class or write constructors or mess with attaching the shadowDOM. QCE does this for you.

Quick Custom Elements was designed to be as small and light weight as possible while exposing the full power and features of Web Components Standards. This project was developed with these key features in mind:

- Small (less than 100 Lines of Code)
- Fast (smallest hit to page speed possible)
- Easy to use and easy to learn
- Thinnest Layer of Abstraction Possible
- Style and Script Encapsulation
  
### [Try in Repl.it](https://replit.com/@ZachLankton/Quick-Custom-Element-Demo-One)

``` html
  Basic Usage: 

  <head>

      <template id="custom-elm">
          <h1> <slot> </slot> </h1>
      </template>

      <script src="quick-custom-elements.js"></script>

  </head>

  <body>
      <!-- This will render an <h1> Hello World </h1> on the page -->
      <custom-elm> Hello World </custom-elm>
  </body>
```
  
## Installation
Installation is very simple, just need to include the script at the bottom of your head tag or your body tag. Including in the head tag will help to reduce any flash of unstyled content and will help ensure your components are ready before the page renders, but will block rendering of the page. 
  
To improve user experience you can write your page to show basic content and styles right away and then defer loading of non critical components to be rendered later. In this case including at the bottom of your body tag (and even adding the 'defer' attribute) will help page speed.

You can obtain the script source from this github repo.
  
``` html
  <body>
      ... other tags

      ... more tags

      <script src="quick-custom-elements.min.js"></script>

  </body>
  
```
  
# Basic Template
QCE uses template tag 'id' attribute as the name of the custom element. (Remember that custom elements need a '-' in them to be legal.) Slot Elements (including named slots) can be used just as you would expect. For more info read here: [Web Components | MDN](https://developer.mozilla.org/en-US/docs/Web/Web_Components)

QCE automatically attaches templates to the shadow DOM which gives us the power of scoped styles by default. See the code below and try it out in Repl.it to see it in action
  
### [Try in Repl.it](https://replit.com/@ZachLankton/QSE-basic-template#index.html)
  
``` html
  <template id="my-card">
      <style> 
          /* These styles are scoped only to the html inside this template */
          #card {
              border-radius: 5px;
              border: 1px solid black;
              padding: 5px;
              margin: 5px;
              max-width: 250px;
          }
      </style>

      <div id="card">
          <h1> <slot name="title"></slot> </h1>
          <p> <slot name="content"></slot> </p>
      </div>
  </template>
  
```
  
  
# Template 'src' Attribute
As you can imagine, cluttering up your head tag with 1000's of lines of template tags will become unbearable. Luckily, QCE looks for template tags with the 'src' attribute and fetchs templates from separate files. This allows you to organize your code the way you want. 
  
Keep in mind that templates loaded this way are loaded asynchronously. This means the component may not be ready before the page starts to render. To help with this QCE provides a 'qce-loaded' event that fires on the document once all templates are loaded.

Using the 'my-card' element from the previous example above we can separate the template into a file called 'my-card.html' and just point the template src attribute to it. And just like we don't wrap our js files with script tags, we do not need to wrap our template files with template tags.
  
``` html
  
  =======================
  head tag of index.html
  =======================

  <head>

      ... other head tags

      <template id="my-card" src="my-card.html"></template>
      <script src="quick-custom-elements.js"></script>

  </head>




  ===================
  file: my-card.html
  ===================

  <style> 
    /* These styles are scoped only to the html inside this template */
    #card {
      border-radius: 5px;
      border: 1px solid black;
      padding: 5px;
      margin: 5px;
      max-width: 250px;
    }

  </style>

  <div id="card">
      <h1> <slot name="title"></slot> </h1>
      <p> <slot name="content"></slot> </p>
  </div>
  
```
  
# Template Scripts
In addition to styles, scripts can also be scoped to the template. Regular script tags in your template are in fact global as you might expect (and not recommended), but add a supported attribute to your script tag and QCE provides a scoped script for you. Complete with a working reference to "this", which is a reference to the specific instance of one of your custom elements attached to the DOM.

QCE supports multiple script tags in a single template. You can hook into any of the [Custom Element Life Cycle Callbacks](https://developer.mozilla.org/en-US/docs/Web/Web_Components/Using_custom_elements#using_the_lifecycle_callbacks) with a simple attribute on your script tag. QCE supports the following life cycle callbacks:

- <script constructor>
- <script connected>
- <script disconnected>
- <script adopted>
- <script attribute-changed="[ 'id', 'custom-attribute' ]">
  
### [Try in Repl.it](https://replit.com/@ZachLankton/QCE-Template-Scripts)
  
``` html
  ==================
  File: my-card.html
  ==================

  <div id="card">
      <h1> <slot name="title"></slot> </h1>
      <p> <slot name="content"></slot> </p>
  </div>

  <script connected>

    // get the h1 element for the title slot (template html above)
    const h1 = this.shadowRoot.querySelector("h1")

    // get the span element for the title slot (body html below)
    const title = this.querySelector("[slot='title']")

    // setup click handler -> alerts "Test Title"
    h1.addEventListener( "click", e => alert(title.innerHTML) )

  </script>


  =====================
  In body of index.html
  =====================
  <my-card>
    <span slot="title">Test Title</span>
    <span slot="content">Test Content</span>
  </my-card>
  
```
  
  
# Attribute Changed
The Attribute Changed life cycle callback can be helpful for giving your component dynamic attributes that control the functionality and appearance of your element. This lets you watch for changes on these attributes and respond to them.
  
[Try in Repl.it](https://replit.com/@ZachLankton/QCE-Attribute-Changed)
  
``` html
  <div id="card">
      <h1> <slot name="title"></slot> </h1>
      <p> <slot name="content"></slot> </p>
  </div>

  <script attribute-changed="['color', 'bg']">
    // the value of attribute-changed must be
    // a string representation of an array
    // this event only fires when an attribute 
    // listed in the array changes

    // arguments exposed in this scope
    // 'attributeName' is the name of the attribute
    // 'oldValue' is the old value of the attribute
    // 'newValue' is the new value of the attribute

    const h1 = this.shadowRoot.querySelector("h1")

    if (attributeName == "color") h1.style.color = newValue

    if (attributeName == "bg") h1.style.backgroundColor = newValue

  </script>
  
```
  
