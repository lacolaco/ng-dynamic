import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DynamicHTMLModule, DynamicComponentModule } from '../../index';

import { AppComponent } from './app.component';
import { DynamicHTMLDemoComponent } from './dynamic-html-demo.component';
import { DynamicCmpDemoComponent } from './dynamic-cmp-demo.component';
import { AwesomeButtonComponent } from './awesome-button.component';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [
    AwesomeButtonComponent
  ],
  exports: [
    AwesomeButtonComponent
  ]
})
export class SharedModule { }

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    SharedModule,
    DynamicHTMLModule.forRoot({
      components: [
        { component: AwesomeButtonComponent, selector: 'awesome-button' },
      ]
    }),
    DynamicComponentModule.forRoot({
      imports: [SharedModule]
    }),
  ],
  declarations: [
    AppComponent,
    DynamicHTMLDemoComponent,
    DynamicCmpDemoComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}