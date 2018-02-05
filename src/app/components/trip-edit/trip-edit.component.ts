import { AppdataService } from './../../services/appdata.service';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './../../services/auth.service';
import { routerTransition, listAnimation, slideUpDownAnimation } from './../../animations/animations';
import { TripChapterEditComponent } from './trip-chapter-edit/trip-chapter-edit.component';
import { Trip } from './../../models/trip';
import { TripCreateComponent } from './../trip-create/trip-create.component';
import { ModalsService } from './../../services/modals.service';
import { Subscription } from 'rxjs/Subscription';
import { CityService } from './../../services/city.service';
import { TripService } from './../../services/trip.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/combineLatest';

@Component({
    selector: 'trip-edit',
    templateUrl: './trip-edit.component.html',
    styleUrls: ['./trip-edit.component.scss'],
    animations: [routerTransition, listAnimation, slideUpDownAnimation],
    host: { '[@routerTransition]': '' },
})
export class TripEditComponent implements OnDestroy {
    editingDetails = false;
    editingPlan = false;
    tripId: string;
    chapterId: string;
    cityId: string;
    citiesData = {};
    travelTypes = {};
    hasNoContent: boolean = false;
    
    chapters = [];
    trip: Trip = {name};

    subscription: Subscription;

    constructor(
        private route: ActivatedRoute,
        private tripService: TripService,
        private cityService: CityService,
        private modalsService: ModalsService,
        private authService: AuthService,
        private appdata: AppdataService
    ) {
        this.tripId = this.route.snapshot.paramMap.get('id');
        
        this.cityService.getAll().take(1).subscribe(cities => {
            cities.forEach(city => this.citiesData[city.$key] = city);
        });

        this.getTrip();
    }

    getTrip() {
        // this.subscription = this.tripService.getTrip(this.tripId).subscribe(trip => {
        //     if (trip.$value === null) {
        //         this.authService.checkOwnerShip(0);
        //         return false;
        //     }

        //     this.trip = trip;
        //     this.trip.id = trip.$key;
        //     this.chapters = trip.chapters
        //         ? this.tripService.prepareTripChaptersList(trip.chapters)
        //         : [];

        //     if (! this.chapters.length) this.hasNoContent = true;
        // });

        this.subscription = Observable.combineLatest(
            this.tripService.getTrip(this.tripId),
            this.appdata.get()
        ).subscribe(values => {
            // value 0
            if (values[0].$value === null) {
                this.authService.checkOwnerShip(0);
                return false;
            }

            this.trip = values[0];
            this.trip.id = values[0].$key;
            this.chapters = values[0].chapters
                ? this.tripService.prepareTripChaptersList(values[0].chapters)
                : [];

            if (!this.chapters.length) this.hasNoContent = true;

            // value 1
            this.travelTypes = values[1].travelTypes;
        });
    }

    editTripDetails() {
        this.modalsService.popModal(TripCreateComponent, {
            trip: this.trip
        });
    }

    createNewChapter() {
        this.modalsService.popModal(TripChapterEditComponent, {
            tripId: this.trip.id
        });
    }

    startEditingDetails(chapterId) {
        this.chapterId = chapterId ? chapterId : null;
        this.editingPlan = false;
        this.editingDetails = true;
    }

    startEditingPlan(chapter) {
        this.chapterId = chapter.id ? chapter.id : null;
        this.cityId = chapter.travelCity ? chapter.travelCity : null;
        this.editingPlan = true;
        this.editingDetails = false;
    }

    removeChapter(chapterId) {
        this.modalsService.popAlert('You are going to delete trip chapter.').take(1).subscribe(result => {
            if (! result) return;
            this.tripService.removeChapter(this.tripId, chapterId);
        });
    }

    doneEditing() {
        this.editingDetails = false;
        this.editingPlan = false;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
