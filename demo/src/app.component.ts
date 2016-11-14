import { Component, ViewChild, ElementRef, Input, OnInit } from '@angular/core';
import { OnMount } from '../../index';

@Component({
  selector: 'awesome-button',
  template: `<button (click)="onClick()" #innerContent><ng-content></ng-content></button>`,
})
export class AwesomeButtonComponent implements OnMount, OnInit {
  @Input() msg: string;
  @ViewChild('innerContent') innerContent: ElementRef;

  dynamicOnMount(attr: Map<string, string>, innerHTML: string, el: any) {
    this.msg = attr.get('msg');
    this.innerContent.nativeElement.innerHTML = innerHTML;
    console.log(`onMount: ${this.msg}`);
  }

  ngOnInit() {
    console.log(`onInit: ${this.msg}`);
  }

  onClick() {
    console.log('clicked');
  }
}

@Component({
  selector: 'my-app',
  template: `
    <header><h1>ng-dynamic</h1></header>
    <main>
      <dynamic-html [content]="content"></dynamic-html>
      <awesome-button msg="static">Static HTML</awesome-button>
    </main>
    <hr>
    <textarea [(ngModel)]="content" rows="20" cols="50"></textarea>
  `,
})
export class AppComponent {
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
      <awesome-button msg="dynamic">Dynamic HTML</awesome-button>
    </div>
  </article>`);
}