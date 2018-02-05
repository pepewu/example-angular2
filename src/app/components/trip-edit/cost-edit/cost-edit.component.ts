import { ModalsService } from './../../../services/modals.service';
import { ModalComponent, modalData } from './../../../models/modal-component';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'cost-edit',
    templateUrl: './cost-edit.component.html',
    styleUrls: ['./cost-edit.component.scss']
})
export class CostEditComponent implements OnInit, ModalComponent {
    cost: any = {};
    constructor(private modalsService: ModalsService) { }

    ngOnInit() {
        this.postDataToModalsService({
            component: 'CostEditComponent',
            closeModal: false,
            popupReady: true,
            data: null
        });
    }

    submit() {
        this.postDataToModalsService({
            component: 'CostEditComponent',
            closeModal: true,
            data: this.cost
        });
    }

    /*
     Method from ModalComponent interface.
     Emits data from modal in modalData format.
     Subscribers can identify data by component name passed as one of data properties.
     Modal component can close modal if closeModal property is set to true.
    */
    postDataToModalsService(formData: modalData) {
        this.modalsService.emitData(formData);
    }

}
