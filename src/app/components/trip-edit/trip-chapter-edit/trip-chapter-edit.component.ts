import { UtilsService } from './../../../services/utils.service';
import { ModalComponent, modalData } from './../../../models/modal-component';
import { ModalsService } from './../../../services/modals.service';
import { CityService } from './../../../services/city.service';
import { TripService } from '../../../services/trip.service';
import { TripChapter } from '../../../models/trip-chapter';
import { Component, Input, EventEmitter, Output, OnInit } from '@angular/core';
import 'rxjs/add/operator/take';

@Component({
    selector: 'trip-chapter-edit',
    templateUrl: './trip-chapter-edit.component.html',
})
export class TripChapterEditComponent implements OnInit, ModalComponent {
    chapter: TripChapter = {};
    travelTypes$;
    cities$;
    _chapterId: string = null;

    @Input() tripId: string;
    @Input() set chapterId(value) {
        this._chapterId = value;
        this.tripService.getChapter(this.tripId, value).take(1).subscribe(chapter => this.chapter = chapter);
    };
    @Output() done = new EventEmitter();
    
    constructor(
        private tripService: TripService,
        private cityService: CityService,
        private modalsService: ModalsService,
        private utils: UtilsService
    ) {}
    
    submit(chapter) {
        this.utils.removeEmptyProperties(chapter);
        
        if (chapter.startDate) {
            chapter.startTimestamp = new Date(chapter.startDate).getTime();
        }

        if (this._chapterId) {
            this.tripService.updateChapter(this.tripId, this._chapterId, chapter);
        } else {
            this.tripService.createChapter(this.tripId, chapter);
        }
        this.doneEditing();
    }
    
    ngOnInit() {
        this.travelTypes$ = this.tripService.getTravelTypes();
        this.cities$ = this.cityService.getAll();

        // setup for popup
        if (! this._chapterId) {
            this.postDataToModalsService({
                component: '',
                closeModal: false,
                popupReady: true,
                data: null
            })
        }
    }

    postDataToModalsService(popupData: modalData) {
        this.modalsService.emitData(popupData);
    }
    
    doneEditing() {
        this.tripService.calculateAssignedBudget(this.tripId);
        this.done.emit();
        this.modalsService.emitCloseEvent();
    }
}
