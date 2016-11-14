import { Component } from '@angular/core';

@Component({
  selector: 'my-app',
  template: `
    <header><h1>ng-dynamic</h1></header>
    <main>
      <hr/>
      <dynamic-html-demo></dynamic-html-demo>
      <hr/>
      <dynamic-cmp-demo></dynamic-cmp-demo>
    </main>
  `,
})
export class AppComponent {
}