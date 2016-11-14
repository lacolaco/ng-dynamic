import { NgModule, ModuleWithProviders, Compiler } from '@angular/core';
import { RuntimeCompiler } from '@angular/compiler';
import { DynamicComponentDirective } from './dynamic-component.directive';
import { DynamicComponentOptions } from './options';

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
@NgModule({
    declarations: [DynamicComponentDirective],
    exports: [DynamicComponentDirective],
})
export class DynamicComponentModule {
    static forRoot(metadata: NgModule): ModuleWithProviders {
        return {
            ngModule: DynamicComponentModule,
            providers: [
                {
                    provide: Compiler, useExisting: RuntimeCompiler,
                },
                {
                    provide: DynamicComponentOptions, useValue: {
                        ngModuleMetadata: metadata,
                    }
                },
            ],
        };
    }
}
