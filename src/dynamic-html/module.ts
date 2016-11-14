import { NgModule, ModuleWithProviders, ANALYZE_FOR_ENTRY_COMPONENTS } from '@angular/core';
import { DynamicHTMLComponent } from './dynamic-html.component';
import { DynamicHTMLOptions } from './options';
import { DynamicHTMLRenderer } from './renderer';

/**
 * Setup for DynamicHTMLDirective
 * 
 * ```ts
 * @NgModule({
 *   imports: [
 *     DynamicHTMLModule.forRoot({
 *       components: [
 *         { component: MyButtonComponent, selector: 'my-button' },
 *       ]
 *     })
 *   ],
 *   declarations: [AppComponent, MyButtonComponent],
 *   bootstrap: [AppComponent]
 * })
 * export class AppModule {
 * }
 * ```
 */
@NgModule({
    declarations: [DynamicHTMLComponent],
    exports: [DynamicHTMLComponent],
})
export class DynamicHTMLModule {
    static forRoot(options: DynamicHTMLOptions): ModuleWithProviders {
        return {
            ngModule: DynamicHTMLModule,
            providers: [
                DynamicHTMLRenderer,
                { provide: DynamicHTMLOptions, useValue: options },
                { provide: ANALYZE_FOR_ENTRY_COMPONENTS, useValue: options.components, multi: true },
            ],
        };
    }
}
