import {
  Component,
  ComponentRef,
  Compiler,
  Directive,
  Input,
  NgModule,
  SimpleChanges,
  Type,
  ViewContainerRef,
  ReflectiveInjector,
  OnDestroy
} from '@angular/core';

import { DynamicComponentOptions } from './options';

/**
 * DynamicComponent is a directive to create dynamic component.
 *
 * Example:
 *
 * ```ts
 * @Component({
 *   selector: 'my-app',
 *   template: `
 *     <div *dynamicComponent="template; context: self; selector:'my-component'"></div>
 *   `
 * })
 * export class AppComponent {
 *   self = this;
 *
 *   template = `
 *   <div>
 *     <p>Dynamic Component</p>
 *   </div>`;
 * }
 * ```
 *
 * Result:
 *
 * ```html
 * <my-component>
 *    <div>
 *      <p>Dynamic Component</p>
 *    </div>
 * </my-component>
 * ```
 *
 */
@Directive({
  selector: '[dynamicComponent]',
})
export class DynamicComponentDirective implements OnDestroy {
  @Input('dynamicComponent') template: string;
  @Input('dynamicComponentSelector') selector: string;
  @Input('dynamicComponentContext') context: any;

  private component: ComponentRef<any>;
  private moduleType: any;
  private cmpType: any;

  constructor(
    private options: DynamicComponentOptions,
    private vcRef: ViewContainerRef,
    private compiler: Compiler
  ) { }

  private createComponentType(): Type<any> {
    const metadata = new Component({
      selector: this.selector,
      template: this.template,
    });
    const cmpClass = class _ {
    };
    return Component(metadata)(cmpClass);
  }

  private createNgModuleType(componentType: Type<any>) {
    const declarations = [].concat(this.options.ngModuleMetadata.declarations || []);
    declarations.push(componentType);
    const moduleMeta: NgModule = {
      imports: this.options.ngModuleMetadata.imports,
      providers: this.options.ngModuleMetadata.providers,
      schemas: this.options.ngModuleMetadata.schemas,
      declarations: declarations
    };
    return NgModule(moduleMeta)(class _ { });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.template) {
      return;
    }
    this.cmpType = this.createComponentType();
    this.moduleType = this.createNgModuleType(this.cmpType);
    const injector = ReflectiveInjector.fromResolvedProviders([], this.vcRef.parentInjector);
    this.compiler.compileModuleAndAllComponentsAsync<any>(this.moduleType)
      .then(factory => {
        let cmpFactory: any;
        for (let i = factory.componentFactories.length - 1; i >= 0; i--) {
          if (factory.componentFactories[i].componentType === this.cmpType) {
            cmpFactory = factory.componentFactories[i];
            break;
          }
        }
        return cmpFactory;
      }, error => {
      })
      .then(cmpFactory => {
        if (cmpFactory) {
          this.vcRef.clear();
          this.component = this.vcRef.createComponent(cmpFactory, 0, injector);

          if (this.context !== null && this.context !== undefined) {
            Object.assign(this.component.instance, this.context);

            const proto = Object.getPrototypeOf(this.context);
            // don't copy default functions from plain objects
            if (proto !== undefined && proto !== null && proto !== Object.prototype) {

              const func = Object
                  .getOwnPropertyNames(proto)
                  .filter((entry) => typeof this.context[entry] === 'function' && entry !== 'constructor');

              let funcMap: any = {};
              func.forEach((funcName) => funcMap[funcName] = this.context[funcName].bind(this.context));
              Object.assign(this.component.instance, funcMap);
            }
          }

          this.component.changeDetectorRef.detectChanges();
        }
      });
  }

  ngOnDestroy() {
    if (this.component) {
      this.component.destroy();
    }

    if (this.compiler) {
      if (this.cmpType) {
        this.compiler.clearCacheFor(this.cmpType);
      }
      if (this.moduleType) {
        this.compiler.clearCacheFor(this.moduleType);
      }
    }
  }
}
