import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicHTMLModule, OnMount } from '../index';

@Component({
    selector: 'child-cmp',
    template: `<p>child:{{text}}</p>`,
})
class ChildCmp implements OnMount {
    static selector = 'child-cmp';

    @Input() text: string;

    dynamicOnMount(attr: Map<string, string>) {
        this.text = attr.get('text');
    }
}

@Component({
    selector: 'child-to-cmp',
    template: `<p *ngIf="show">child:{{text}}</p>`,
})
class ChildWithTimeoutCmp implements OnMount {
    static selector = 'child-to-cmp';

    @Input() text: string;

    show = true;

    dynamicOnMount(attr: Map<string, string>) {
        this.text = attr.get('text');
    }

    ngOnInit() {
        setTimeout(() => {
            this.show = false;
        }, 500);
    }
}

@Component({
    template: `<dynamic-html [content]="content"></dynamic-html>`,
})
class TestCmp {
    content = '';
}

@Component({
    template: `
    <ng-container *ngFor="let content of list">
        <dynamic-html [content]="content"></dynamic-html>
    </ng-container>
    `,
})
class MultipleCmp {
    list = [
        `<div>1:<child-cmp text="dynamic"></child-cmp></div>`,
        `<div>2:<child-cmp text="dynamic"></child-cmp></div>`,
    ];
}

describe('DynamicHTMLComponent', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                DynamicHTMLModule.forRoot({
                    components: [
                        { selector: ChildCmp.selector, component: ChildCmp },
                        { selector: ChildWithTimeoutCmp.selector, component: ChildWithTimeoutCmp },
                    ]
                }),
            ],
            schemas: [CUSTOM_ELEMENTS_SCHEMA],
            declarations: [MultipleCmp, TestCmp, ChildCmp, ChildWithTimeoutCmp],
        });
    });

    it('should project a simple content', async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(TestCmp);
            fixture.componentInstance.content = `<div><p>dynamic</p><child-cmp text="dynamic"></child-cmp></div>`;
            fixture.detectChanges();
            const dynamicHTML = fixture.nativeElement.querySelector('dynamic-html');
            console.info(dynamicHTML.innerHTML);
            expect(dynamicHTML.innerHTML).toBe('<div><p>dynamic</p><child-cmp text="dynamic"><p>child:dynamic</p></child-cmp></div>');
        });
    }));

    it('should project multiple content', async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(MultipleCmp);
            fixture.detectChanges();
            const dynamicHTMLs = fixture.nativeElement.querySelectorAll('dynamic-html');
            expect(dynamicHTMLs.length).toBe(2);
            Array.prototype.forEach.call(dynamicHTMLs, (dynamicHTML: Element, index: number) => {
                console.info(dynamicHTML.innerHTML);
                expect(dynamicHTML.textContent).toBe(`${index + 1}:child:dynamic`);
            });
        });
    }));

    it('should detect changes', fakeAsync(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(TestCmp);
            fixture.componentInstance.content = `<div><p>dynamic</p><child-to-cmp text="dynamic"></child-to-cmp></div>`;
            {
                fixture.detectChanges();
                const dynamicHTML = fixture.nativeElement.querySelector('dynamic-html');
                console.info(dynamicHTML.innerHTML);
                expect(dynamicHTML.textContent).toBe('dynamicchild:dynamic');
            }
            tick(500);
            {
                fixture.detectChanges();
                const dynamicHTML = fixture.nativeElement.querySelector('dynamic-html');
                console.info(dynamicHTML.innerHTML);
                expect(dynamicHTML.textContent).toBe('dynamic');
            }
        });
    }));

    it('with custom-element', async(() => {
        TestBed.overrideComponent(TestCmp, {
            set: {
                template: `<dynamic-html [content]="content"></dynamic-html>`
            }
        });
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(TestCmp);
            const now = Date.now();
            fixture.componentInstance.content = `<unknown-element>${now}</unknown-element>`;

            fixture.detectChanges();
            console.info(fixture.nativeElement.innerHTML);
            expect(fixture.nativeElement.textContent).toBe(`${now}`);
        });
    }));
});
