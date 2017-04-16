import { NgModule, ModuleWithProviders, Compiler, COMPILER_OPTIONS, CompilerOptions } from '@angular/core';
import { JitCompilerFactory } from '@angular/compiler';
import { DynamicComponentDirective } from './dynamic-component.directive';
import { DynamicComponentOptions } from './options';

export function createJitCompiler(options: CompilerOptions[]) {
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
                    provide: Compiler, useFactory: createJitCompiler, deps: [COMPILER_OPTIONS]
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
