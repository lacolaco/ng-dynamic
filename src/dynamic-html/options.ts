import { Type } from '@angular/core';

/**
 * defines dynamic-projectable components 
 * 
 * ```ts
 * @Component({
 *     selector: 'child-cmp',
 *     template: `<p>child:{{text}}</p>`,
 * })
 * class ChildCmp { 
 *     @Input() text: string;
 * }
 * 
 * DynamicHTMLModule.forRoot({
 *   components: [
 *     { component: ChildCmp, selector: 'child-cmp' } },
 *   ]
 * })
 * ```
 */
export interface ComponentWithSelector {
    /**
     * component's selector
     */
    selector: string;
    /**
     * component's type
     */
    component: Type<any>;
}

/**
 * options for DynamicHTMLModule
 */
export class DynamicHTMLOptions {
    /**
     * identifies components projected in dynamic HTML.
     */
    components: Array<ComponentWithSelector>;
}
