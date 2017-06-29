import { Injectable, Injector, ElementRef, ComponentFactoryResolver, ComponentFactory, ComponentRef } from '@angular/core';
import { DynamicHTMLOptions } from './options';
import { OnMount } from './interfaces';

export interface DynamicHTMLRef {
    check: () => void;
    destroy: () => void;
}

function isBrowserPlatform() {
    return window != null && window.document != null;
}

@Injectable()
export class DynamicHTMLRenderer {

    private componentFactories = new Map<string, ComponentFactory<any>>();

    private componentRefs = new Map<any, Array<ComponentRef<any>>>();

    constructor(private options: DynamicHTMLOptions, private cfr: ComponentFactoryResolver, private injector: Injector) {
        this.options.components.forEach(({selector, component}) => {
            let cf: ComponentFactory<any>;
            cf = this.cfr.resolveComponentFactory(component);
            this.componentFactories.set(selector, cf);
        });
    }

    private closestComponent(el: Element): Element {
        el = el.parentElement;
        while (el && el.tagName !== 'DYNAMIC-HTML') { // browser upper-cases tag names
            for (const c of this.options.components) {
                if (el.matches(c.selector)) {
                    return el;
                }
            }
            el = el.parentElement;
        }
        return el;
    }

    renderInnerHTML(elementRef: ElementRef, html: string): DynamicHTMLRef {
        if (!isBrowserPlatform()) {
            throw new Error('dynamic-html supports only browser platform.');
        }
        elementRef.nativeElement.innerHTML = html;

        const componentRefs: Array<ComponentRef<any>> = [];
        this.options.components.forEach(({selector}) => {
            const elements = (elementRef.nativeElement as Element).querySelectorAll(selector);
            Array.prototype.forEach.call(elements, (el: Element) => {
                // We check that the component we found is not embedded in another component,
                // and we don't handle it if it is the case. The component would not be shown
                // anyway.
                if (this.closestComponent(el) !== elementRef.nativeElement) {
                    return;
                }

                const content = el.innerHTML;
                const cmpRef = this.componentFactories.get(selector).create(this.injector, [], el);
                // remove `ng-version` attribute
                el.removeAttribute('ng-version');
                if (cmpRef.instance.dynamicOnMount) {
                    const attrsMap = new Map<string, string>();
                    if (el.hasAttributes()) {
                        Array.prototype.forEach.call(el.attributes, (attr: Attr) => {
                            attrsMap.set(attr.name, attr.value);
                        });
                    }
                    (cmpRef.instance as OnMount).dynamicOnMount(attrsMap, content, el);
                }
                componentRefs.push(cmpRef);
            });
        });
        this.componentRefs.set(elementRef, componentRefs);
        return {
            check: () => componentRefs.forEach(ref => ref.changeDetectorRef.detectChanges()),
            destroy: () => {
                componentRefs.forEach(ref => ref.destroy());
                this.componentRefs.delete(elementRef);
            },
        };
    }
}
