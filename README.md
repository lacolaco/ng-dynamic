# ng-dynamic

## Since Angular 4.0, AoT compiler cannot coexist with JiT compiler. If you want to use DynamicComponentModule, you cannot use AoT compilation.

Dynamic Content Projection in Angular 2+ 

[![npm version](https://badge.fury.io/js/ng-dynamic.svg)](https://badge.fury.io/js/ng-dynamic)
[![CircleCI](https://circleci.com/gh/laco0416/ng-dynamic/tree/master.svg?style=svg)](https://circleci.com/gh/laco0416/ng-dynamic/tree/master)

```
$ npm install --save ng-dynamic
```

**Live Demo**: [Plunker](https://plnkr.co/edit/uzcYiN?p=preview)

---

## 'dynamic' means...

We often need to project some _dynamic contents_ into your Angular app. For example, if you make a markdown editor, you want to display the rendererd preview.

```ts
@Component({
  selector: 'html-preview',
  template: '<div [innerHTML]="html"></div>',
})
export class HTMLPreviewComponent {
  @Input() html: string;
}
```

This code has some problems:

- `[innerHTML]` will sanitize its value and strip some elements.
- in innerHTML, any Angular components like `<my-button>` don't work.

**ng-dynamic** can solve these problems by using standard Angular APIs and some _hacks_.

### `<dynamic-html [content]="html">`

`<dynamic-html>` is a component to render given HTML string and **mount** components in the HTML.

Example: 

```ts
@Component({
  selector: 'my-button',
  template: `<button (click)="onClick()">Click Me</button>`
})
export class MyButtonComponent {
  onClick() {
  }
}

@Component({
  selector: 'my-app',
  template: `
    <dynamic-html [content]="content"></dynamic-html>
  `
})
export class AppComponent {
  content = `
  <article>
    <h1>Awesome Document</h1>
    <div>
      <p>bla bla bla</p>
      <my-button></my-button>
    </div>
  </article>
  `;
}

@NgModule({
  imports: [
    DynamicHTMLModule.forRoot({
      components: [
        { component: MyButtonComponent, selector: 'my-button' },
      ]
    })
  ],
  declarations: [AppComponent, MyButtonComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

Result: 

```html
<my-app>
    <dynamic-html>
      <article>
        <h1>Awesome Document</h1>
        <div>
          <p>bla bla bla</p>
          <my-button>Click Me</my-button>
        </div>
      </article>
    </dynamic-html>
</my-app>
```

`<my-button>` is resolved as `MyButtonComponent`.

#### `DynamicHTMLModule`

To use `<dynamic-html>`, you have to import `DynamicHTMLModule` with `forRoot` static method.
Its argument is a `DynamicHTMLOptions` object:

```ts
/**
 * defines dynamic-projectable components 
 * 
 * ```ts
 * @Component({
 *     selector: 'child-cmp',
 *     template: `<p>child:{{text}}</p>`,
 * })
 * class ChildCmp { 
 *     @Input() text: string;
 * }
 * 
 * DynamicHTMLModule.forRoot({
 *   components: [
 *     { component: ChildCmp, selector: 'child-cmp' } },
 *   ]
 * })
 * ```
 */
export interface ComponentWithSelector {
    /**
     * component's selector
     */
    selector: string;
    /**
     * component's type
     */
    component: Type<any>;
}

/**
 * options for DynamicHTMLModule
 */
export class DynamicHTMLOptions {
    /**
     * identifies components projected in dynamic HTML.
     */
    components: Array<ComponentWithSelector>;
}
```

#### `OnMount` Lifecycle method

```ts
/**
 * Lifecycle hook that is called after instantiation the component. 
 * This method is called before ngOnInit.
 */
export abstract class OnMount {
    abstract dynamicOnMount(attrs?: Map<string, string>, innerHTML?: string, element?: Element): void;
}
```

`OnMount` allows you to create component has _hybrid content projection_.
_hybrid content projection_ means that the component can project its content from even _static_ template or _dynamic_ HTML. 

See also demo.

```ts
@Component({
  selector: 'awesome-button',
  template: `<button (click)="onClick()" #innerContent><ng-content></ng-content></button>`,
})
export class AwesomeButtonComponent implements OnMount, OnInit {
  @Input() msg: string;
  @ViewChild('innerContent') innerContent: ElementRef;

  dynamicOnMount(attr: Map<string, string>, content: string) {
    this.msg = attr.get('msg');
    this.innerContent.nativeElement.innerHTML = content;
    console.log(`onMount: ${this.msg}`);
  }

  ngOnInit() {
    console.log(`onInit: ${this.msg}`);
  }

  onClick() {
    console.log('clicked');
  }
}
```

#### `<dynamic-html>` Constraints

- `[content]` is **not a template**. so it cannot resolve `{{foo}}`, `*ngIf` and any template syntax.

### `*dynamicComponent="template"`

`dynamicComponent` is a directive to create dynamic component which has the template.

Example: 

```ts
@Component({
  selector: 'dynamic-cmp-demo',
  template: `
    <div *dynamicComponent="template; context: {text: text};"></div>
  `,
})
export class DynamicCmpDemoComponent {
  template = `
  <article>
    <h1>Awesome Document</h1>
    <div>
      <p>{{text}}</p>
      <my-button></my-button>
    </div>
  </article>
  `;

  text = 'foo';
}

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    MyComponent
  ],
  exports: [
    MyComponent
  ]
})
export class SharedModule { }

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    SharedModule,
    DynamicComponentModule.forRoot({
      imports: [SharedModule]
    }),
  ],
  declarations: [
    AppComponent,
    DynamicCmpDemoComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
```

Result: 

```html
<my-app>
    <ng-component>
      <article>
        <h1>Awesome Document</h1>
        <div>
          <p>foo</p>
          <my-button>Click Me</my-button>
        </div>
      </article>
    </ng-component>
</my-app>
```

`<my-button>` is resolved as `MyButtonComponent`.

#### `DynamicComponentModule`

To use `dynamicComponent`, you have to import `DynamicComponentModule` with `forRoot` static method.
Its argument is a `NgModule` metadata object:

```ts
/**
 * Setup for DynamicComponentDirective
 * 
 * ```ts
 * @NgModule({
 *   imports: [
 *     DynamicComponentModule.forRoot({
 *       imports: [CommonModule]
 *     })
 *   ],
 * })
 * class AppModule {}
 * ```
 */
```

#### `dynamicComponent` Constraints

`dynamicComponent` needs `JitCompiler`. You cannot use AoT compilation with DynamicComponentModule.

## License
MIT

## Developing

```
npm i && npm run demo # and open http://localhost:8080
```

Contributions welcome!