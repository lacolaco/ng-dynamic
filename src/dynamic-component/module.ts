import { NgModule, ModuleWithProviders, Compiler, COMPILER_OPTIONS, CompilerOptions, Optional } from '@angular/core';
import { JitCompilerFactory } from '@angular/platform-browser-dynamic';
import { DynamicComponentDirective } from './dynamic-component.directive';
import { DynamicComponentOptions } from './options';

export function createJitCompiler(options?: CompilerOptions[]) {
    options = options || [];
    return new JitCompilerFactory([{useDebug: false, useJit: true}]).createCompiler(options);
}

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
                    provide: Compiler, useFactory: createJitCompiler, deps: [[Optional(), COMPILER_OPTIONS]]
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
