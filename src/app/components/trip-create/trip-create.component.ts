import { ModalComponent, modalData } from './../../models/modal-component';
import { UtilsService } from './../../services/utils.service';
import { ModalsService } from './../../services/modals.service';
import { Trip } from './../../models/trip';
import { TripService } from './../../services/trip.service';
import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-trip-create',
    templateUrl: './trip-create.component.html',
    styleUrls: ['./trip-create.component.scss']
})
export class TripCreateComponent implements OnInit, ModalComponent {
    @Input() trip: Trip = {name:''};

    constructor(
        private tripService: TripService,
        private modalsService: ModalsService,
        private utilsService: UtilsService
    ) {}

    ngOnInit() {
        this.postDataToModalsService({
            component: 'TripCreateComponent',
            closeModal: false,
            popupReady: true,
            // data: null
        });
    }

    submit(data) {
        this.utilsService.removeEmptyProperties(data);
        if (this.trip.id) {
            data.id = this.trip.id;
            this.tripService.update(data);
        } else {
            this.tripService.create(data);
        }
        this.modalsService.emitCloseEvent();
    }

    postDataToModalsService(popupData: modalData) {
        this.modalsService.emitData(popupData);
    }
}
