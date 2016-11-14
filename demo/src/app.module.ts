import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { DynamicHTMLModule } from '../../index';
import { AppComponent, AwesomeButtonComponent } from './app.component';

@NgModule({
  imports: [
    BrowserModule,
    FormsModule,
    DynamicHTMLModule.forRoot({
      components: [
        { component: AwesomeButtonComponent, selector: 'awesome-button' },
      ]
    })
  ],
  declarations: [AppComponent, AwesomeButtonComponent],
  bootstrap: [AppComponent]
})
export class AppModule {
}