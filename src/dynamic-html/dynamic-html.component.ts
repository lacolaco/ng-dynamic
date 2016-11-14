import {
  Component,
  ElementRef,
  Inject,
  Input,
  SimpleChanges,
  ViewContainerRef,
  OnChanges,
  OnDestroy,
  DoCheck,
} from '@angular/core';

import { DynamicHTMLRenderer, DynamicHTMLRef } from './renderer';

/**
 * ComponentOutlet is a directive to create dynamic component.
 *
 * Example:
 *
 * ```ts
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <dynamic-html [content]="content"></dynamic-html>
 *   `
 * })
 * export class AppComponent {
 *   content = `
 *   <article>
 *     <h1>Awesome Document</h1>
 *     <div>
 *       <p>bla bla bla</p>
 *       <my-button></my-button>
 *     </div>
 *   </article>
 *   `;
 * }
 * ```
 *
 */
@Component({
  selector: 'dynamic-html',
  template: '',
})
export class DynamicHTMLComponent implements DoCheck, OnChanges, OnDestroy {
  @Input() content: string;

  private ref: DynamicHTMLRef;

  constructor(
    private renderer: DynamicHTMLRenderer,
    private elementRef: ElementRef,
  ) { }

  ngOnChanges(_: SimpleChanges) {
    if (this.content && this.elementRef) {
      this.ref = this.renderer.renderInnerHTML(this.elementRef, this.content);
    }
  }

  ngDoCheck() {
    this.ref && this.ref.check();
  }

  ngOnDestroy() {
    this.ref && this.ref.destroy();
  }
}
