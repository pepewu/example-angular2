import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
    selector: '[appModals]'
})
export class ModalsDirective {
    constructor(public viewContainerRef: ViewContainerRef) { }
}
