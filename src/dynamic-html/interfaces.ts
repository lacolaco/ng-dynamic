/**
 * Lifecycle hook that is called after instantiation the component. 
 * This method is called before ngOnInit.
 */
export abstract class OnMount {
    abstract dynamicOnMount(attrs?: Map<string, string>, content?: string, element?: Element): void;
}