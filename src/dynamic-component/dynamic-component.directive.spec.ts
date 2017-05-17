import { TestBed, async } from '@angular/core/testing';
import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DynamicComponentModule } from './index';

@Component({
    template: `<div *dynamicComponent="template; context: context; selector:'my-component'"></div>`
})
class TestCmp {
    context = {
        flag: true,
        text: 'Dynamic'
    };
    template = `<div><p *ngIf="flag">{{text}}</p></div>`;
}

@Component({
    template: `
    <ng-container *ngFor="let cmp of list">
        <div *dynamicComponent="cmp.template; context: cmp.context; selector:cmp.selector"></div>
    </ng-container>
    `
})
class MultipleCmp {
    list = [
        {
            template: `<div>{{text}}</div>`,
            context: {
                text: 'Dynamic-1'
            },
            selector: 'my-component'
        },
        {
            template: `<div>{{text}}</div>`,
            context: {
                text: 'Dynamic-2'
            },
            selector: 'my-component'
        }
    ];
}

@Component({
    template: `<div *dynamicComponent="template; context: this;"></div>`
})
class ButtonComponent {
    template = `<div><button (click)="onButtonClicked($event)">Click me</button></div>`;

    onButtonClicked() {
        console.log('button clicked');
    }
}

describe('dynamicComponent', () => {

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [
                DynamicComponentModule.forRoot({
                    imports: [CommonModule],
                    schemas: [CUSTOM_ELEMENTS_SCHEMA],
                    declarations: [] // for issue #27
                })
            ],
            declarations: [MultipleCmp, TestCmp, ButtonComponent],
        });
    });

    it('simple', async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(TestCmp);
            fixture.detectChanges();
            fixture.ngZone.onStable.subscribe(() => {
                const dynamicCmp = fixture.debugElement.query(el => el.name === 'my-component');
                console.log(dynamicCmp.nativeElement.innerHTML);
                expect(dynamicCmp.nativeElement.textContent).toBe('Dynamic');
            });
        });
    }));

    it('multiple', async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(MultipleCmp);
            fixture.detectChanges();
            fixture.ngZone.onStable.subscribe(() => {
                const dynamicCmps = fixture.debugElement.queryAll(el => el.name === 'my-component');
                expect(dynamicCmps.length).toBe(2);
                dynamicCmps.forEach((dynamicCmp, index) => {
                    console.log(dynamicCmp.nativeElement.innerHTML);
                    expect(dynamicCmp.nativeElement.textContent).toBe(`Dynamic-${index + 1}`);
                });
            });
        });
    }));

    it('without context/selector', async(() => {
        TestBed.overrideComponent(TestCmp, {
            set: {
                template: `<div *dynamicComponent="template"></div>`
            }
        });
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(TestCmp);
            const now = Date.now();
            fixture.componentInstance.template = `<div><p>${now}</p></div>`;
            fixture.detectChanges();
            fixture.ngZone.onStable.subscribe(() => {
                console.log(fixture.nativeElement.innerHTML);
                expect(fixture.nativeElement.textContent).toBe(`${now}`);
            });
        });
    }));

    it('with custom-element', async(() => {
        TestBed.overrideComponent(TestCmp, {
            set: {
                template: `<div *dynamicComponent="template"></div>`
            }
        });
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(TestCmp);
            const now = Date.now();
            fixture.componentInstance.template = `<unknown-element>${now}</unknown-element>`;
            fixture.detectChanges();
            fixture.ngZone.onStable.subscribe(() => {
                console.log(fixture.nativeElement.innerHTML);
                expect(fixture.nativeElement.textContent).toBe(`${now}`);
            });
        });
    }));

    it('button clicked', async(() => {
        TestBed.compileComponents().then(() => {
            const fixture = TestBed.createComponent(ButtonComponent);
            const component = fixture.componentInstance;
            spyOn(component, 'onButtonClicked');

            fixture.detectChanges();
            fixture.ngZone.onStable.subscribe(() => {
                let button = fixture.debugElement.nativeElement.querySelector('button');
                button.click();
                console.log(fixture.nativeElement.innerHTML);
                expect(component.onButtonClicked).toHaveBeenCalled();
            });
        });
    }));
});
