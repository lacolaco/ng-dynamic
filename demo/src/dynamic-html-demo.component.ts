import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'dynamic-html-demo',
  template: `
    <h2>dynamic-html-demo</h2>
    <dynamic-html [content]="content"></dynamic-html>
    <awesome-button msg="static">Static HTML</awesome-button>
    <hr/>
    <textarea [(ngModel)]="content" rows="10" cols="50"></textarea>
  `,
})
export class DynamicHTMLDemoComponent {
  content: string;

  ngOnInit() {
    fetchAwesomeDocument().then(content => {
      this.content = content;
    });
  }
}

export function fetchAwesomeDocument() {
  return Promise.resolve(`<article>
    <h1>Awesome Document</h1>
    <div>
      <p>bla bla bla</p>
      <awesome-button msg="dynamic-html">Dynamic HTML</awesome-button>
    </div>
  </article>`);
}