import { popupAnimation, popupBgAnimation } from './../../../animations/animations';
import { ModalsDirective } from './../../../directives/modals.directive';
import { ModalsService } from './../../../services/modals.service';
import { Component, ViewChild, ComponentFactoryResolver, AfterViewInit, Input, ElementRef, ViewContainerRef } from '@angular/core';
import { modalData } from '../../../models/modal-component';

/* https://angular.io/guide/dynamic-component-loader */

@Component({
    selector: 'modal-container',
    template: `
        <div class="modal" (click)="unload($event)" [@popup]="popupVisible ? 'poppedIn' : 'poppedOut'">
            <div class="modal__body contentBox">
                <div class="modal__topBar">
                    <button class="closeModal">
                        <i class="icon-cancel"></i>
                    </button>
                </div>
                <div class="modal__content">
                    <ng-template appModals></ng-template>
                </div>
            </div>
        </div>
        <div class="modalBackground" [@popupBg]="popupVisible ? 'poppedIn' : 'poppedOut'"></div>
    `,
    animations: [popupAnimation, popupBgAnimation]
})
export class ModalContainerComponent implements AfterViewInit {
    @ViewChild(ModalsDirective) modalsHost: ModalsDirective;
    item;
    viewContainerRef: ViewContainerRef;
    popupVisible: boolean = false;
    htmlEl;
    
    constructor(
        private modalsService: ModalsService,
        private componentFactoryResolver: ComponentFactoryResolver,
        private el: ElementRef
    ) {
        this.htmlEl = document.querySelector('html');
    }
    
    ngAfterViewInit() {
        this.modalsService.modals$.subscribe(item => {
            this.item = item;
            this.loadComponent(item);
            // this.el.nativeElement.style.display = 'block';
        });

        this.modalsService.modalData$.subscribe( (data: modalData) => {
            console.log('modal data');
            console.log(data);
            this.htmlEl.classList.add('modalOpen');
            if (data.closeModal) {
                this.unload(null);
            }
            if (data.popupReady) {
                this.popupVisible = true;
            }
        });

        this.modalsService.modalClose$.subscribe(() => this.unload(null));
    }

    loadComponent(item) {
        let componentFactory = this.componentFactoryResolver.resolveComponentFactory(item.component);

        this.viewContainerRef = this.modalsHost.viewContainerRef;
        this.viewContainerRef.clear();

        let componentRef = this.viewContainerRef.createComponent(componentFactory);
        if (item.data) {
            Object.assign(componentRef.instance, item.data);
        }
        // this.popupVisible = true;
    }

    unload($event) {
        if ($event) {
            let tgt: HTMLElement = $event.target;
            if (!tgt.classList.contains('modal') && !tgt.classList.contains('closeModal') && !tgt.classList.contains('icon-cancel')) return;
        }

        this.popupVisible = false;
        this.htmlEl.classList.remove('modalOpen');
        // this.el.nativeElement.style.display = 'none';

        if (this.viewContainerRef) {
            // this.viewContainerRef.clear();
        }
    }
}
