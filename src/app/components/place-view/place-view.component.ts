import { AppdataService } from './../../services/appdata.service';
import { ModalComponent, modalData } from './../../models/modal-component';
import { ModalsService } from './../../services/modals.service';
import { PlaceService } from './../../services/place.service';
import { Component, OnInit, Input } from '@angular/core';
import 'rxjs/add/operator/take';

@Component({
    selector: 'place-view',
    templateUrl: './place-view.component.html',
    styleUrls: ['./place-view.component.scss']
})
export class PlaceViewComponent implements ModalComponent {
    @Input() set id(placeId) {
        if (! placeId) return;

        this.setupPlace(placeId);
    };
    place: any = {};
    placeData: any = {};

    constructor(
        private placeService: PlaceService,
        private modalsService: ModalsService,
        private appdata: AppdataService
    ) {}

    private setupPlace(id) {
        this.placeService.get(id)
            .take(1)
            .subscribe(place => {
                this.place = place;
                this.placeData = this.appdata.appdata.placeTypes[this.place.type];
                // console.log(this.place);
                // console.log(this.appdata.appdata);
                this.postDataToModalsService({
                    component: '',
                    closeModal: false,
                    popupReady: true,
                    data: null
                })
            });
    }

    postDataToModalsService(popupData: modalData) {
        this.modalsService.emitData(popupData);
    }

    closeModal() {
        this.modalsService.emitCloseEvent();
    }

    deletePlace(placeObj) {
        this.placeService.removeFromAll(placeObj);
    }
}
