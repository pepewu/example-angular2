import { ModalsService } from './../../../services/modals.service';
import { ModalComponent, modalData } from './../../../models/modal-component';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'event-edit',
    templateUrl: './event-edit.component.html'
})
export class EventEditComponent implements OnInit, ModalComponent {
    event: any = {};
    constructor(private modalsService: ModalsService) { }

    ngOnInit() {
        this.postDataToModalsService({
            component: 'EventEditComponent',
            closeModal: false,
            popupReady: true,
            data: null
        });
    }

    submit() {
        this.postDataToModalsService({
            component: 'EventEditComponent',
            closeModal: true,
            data: this.event
        });
    }

    postDataToModalsService(formData: modalData) {
        this.modalsService.emitData(formData);
    }
}
