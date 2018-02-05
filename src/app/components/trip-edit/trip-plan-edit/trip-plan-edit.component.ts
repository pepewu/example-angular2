import { AppdataService } from './../../../services/appdata.service';
import { CostEditComponent } from './../cost-edit/cost-edit.component';
import { UtilsService } from './../../../services/utils.service';
import { EventEditComponent } from './../event-edit/event-edit.component';
import { ModalsService } from './../../../services/modals.service';
import { TripService } from './../../../services/trip.service';
import { GooglemapService } from './../../../services/googlemap.service';
import { MarkersData } from './../../../models/markersdata';
import { PlaceService } from './../../../services/place.service';
import { Component, OnInit, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { modalData } from '../../../models/modal-component';
import { Subscription } from 'rxjs/Subscription';

@Component({
    selector: 'trip-plan-edit',
    templateUrl: './trip-plan-edit.component.html',
    styleUrls: ['./trip-plan-edit.component.scss']
})
export class TripPlanEditComponent implements OnInit, OnDestroy {
    cityPlaces = [];
    selectedPlaces = [];
    placeTypes: any;
    markersData: MarkersData = {
        markers: [],
        options: {
            selectClicked: true
        }
    };

    modalDataSubscription: Subscription;

    @Input() tripId: string;
    @Input() chapterId: string;
    @Input() cityId: string;
    @Input() chapterData: any = {};

    @Output() done = new EventEmitter();

    constructor(
        private placesService: PlaceService,
        private mapService: GooglemapService,
        private tripService: TripService,
        private modalsService: ModalsService,
        private appdata: AppdataService,
        private utils: UtilsService,
        private ref: ChangeDetectorRef
    ) {}

    ngOnInit() {
        this.placesService.getAllFromCity(this.cityId).take(1).subscribe(places => {
            this.cityPlaces = places;
            this.placeTypes = this.appdata.appdata.placeTypes
            this.setupMapData();
            this.prepareSelectedPlaces();
        });

        this.chapterData.places = this.chapterData.places || [];
        this.chapterData.events = this.chapterData.events || [];
        this.chapterData.costs = this.chapterData.costs || [];


        this.modalDataSubscription = this.modalsService.modalData$.subscribe((data: modalData) => {
            this.handleDataFromModal(data);
        });
    }

    //#region places

    private prepareSelectedPlaces() {
        this.selectedPlaces = this.chapterData.places.map(placeId => {
            return this.cityPlaces.find(place => place.$key == placeId);
        });
    }

    private setupMapData() {
        let markers = this.cityPlaces.map(place => {
            return {
                id: place.$key,
                lat: place.lat,
                lng: place.lng,
                name: place.name,
                type: place.type,
                selected: this.checkIfMarkerSelected(place.$key)
            }
        });

        this.markersData = {
            markers: markers,
            options: {
                selectClicked: true
            }
        }
    }

    private checkIfMarkerSelected(id) {
        if (! this.chapterData.places) return false;
        return this.chapterData.places.some(place => place == id);
    }

    handleMarkerClick($event) {
        this.chapterData.places = this.mapService.markers
            .filter(marker => marker.selected)
            .map(marker => marker.id);
        this.prepareSelectedPlaces();
        this.ref.detectChanges();
    }

    private removePlace(id) {
        let markerIndex = this.mapService.markers.findIndex(marker => marker.id == id);
        if (markerIndex) {
            this.mapService.clickMarker(markerIndex);
        }
    }

    //#endregion

    //#region events and costs

    popEventModal(event) {
        let data = {};
        if (typeof event === 'object') {
            data['event'] = event;
        }
        this.modalsService.popModal(EventEditComponent, data);
    }

    popCostModal(cost) {
        let data = {};
        if (typeof cost === 'object') {
            data['cost'] = cost;
        }
        this.modalsService.popModal(CostEditComponent, data);
    }

    private handleDataFromModal(modalData: modalData) {
        if (! modalData.data) return;
        
        if (modalData.component == 'EventEditComponent') {
            this.chapterData.events ? this.chapterData.events : [];

            if (modalData.data.id) {
                let index = this.chapterData.events.findIndex(event => event.id == modalData.data.id);
                this.chapterData.events[index] = this.utils.removeEmptyProperties(modalData.data);
            } else {
                modalData.data.id = new Date().getTime();
                this.chapterData.events.push(this.utils.removeEmptyProperties(modalData.data));
            }

            // sort events
            if (this.chapterData.events.length) {
                this.chapterData.events = this.tripService.sortEventsByHour(this.chapterData.events);
            }
        }

        if (modalData.component == 'CostEditComponent') {
            this.chapterData.costs ? this.chapterData.costs : [];

            if (modalData.data.id) {
                let index = this.chapterData.costs.findIndex(cost => cost.id == modalData.data.id);
                this.chapterData.costs[index] = this.utils.removeEmptyProperties(modalData.data);
            } else {
                modalData.data.id = new Date().getTime();
                this.chapterData.costs.push(this.utils.removeEmptyProperties(modalData.data));
            }
        }
    }

    private removeEvent(id) {
        let index = this.chapterData.events.findIndex(event => event.id == id);
        this.chapterData.events.splice(index, 1);
    }

    private removeCost(id) {
        let index = this.chapterData.costs.findIndex(cost => cost.id == id);
        this.chapterData.costs.splice(index, 1);
    }

    //#endregion

    doneEditing() {
        this.tripService.calculateAssignedBudget(this.tripId);
        this.done.emit();
    }

    updateChapter() {
        this.tripService.updateChapter(this.tripId, this.chapterId, this.chapterData);
        this.doneEditing();
    }

    ngOnDestroy() {
        this.modalDataSubscription.unsubscribe();
    }
}
