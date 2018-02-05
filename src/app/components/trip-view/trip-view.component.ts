import { AppdataService } from './../../services/appdata.service';
import { AuthService } from './../../services/auth.service';
import { listAnimation, routerTransition } from './../../animations/animations';
import { Observable } from 'rxjs/Observable';
import { CityService } from './../../services/city.service';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';
import { TripService } from './../../services/trip.service';
import { Component, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/combineLatest';

@Component({
    selector: 'trip-view',
    templateUrl: './trip-view.component.html',
    styleUrls: ['./trip-view.component.scss'],
    animations: [routerTransition, listAnimation],
    host: { '[@routerTransition]': '' }
})
export class TripViewComponent implements OnDestroy {
    tripId;
    trip: any = {};
    chapters: any[] = [];
    subscription: Subscription;
    citiesData = {};
    hasNoContent: boolean = false;
    travelTypes = {};

    constructor(
        private route: ActivatedRoute,
        private tripService: TripService,
        private cityService: CityService,
        private authService: AuthService,
        private appdata: AppdataService
    ) {
        this.tripId = this.route.snapshot.paramMap.get('id');
        
        this.subscription = Observable.combineLatest(
            this.tripService.getTrip(this.tripId),
            this.cityService.getAll(),
            this.appdata.get()
        ).subscribe(values => {
            if (values[0].$value === null) {
                this.authService.checkOwnerShip(0);
                return false;
            }

            this.trip = values[0];

            this.chapters = values[0].chapters
                ? this.tripService.prepareTripChaptersList(values[0].chapters)
                : [];
                
            values[1].forEach(city => this.citiesData[city.$key] = city);

            this.travelTypes = values[2].travelTypes;

            if (! this.chapters.length) this.hasNoContent = true;

            this.sortEvents();
        });
    }

    sortEvents() {
        this.chapters.forEach(chapter => {
            if (chapter.type != 'flanering') return;
            if (typeof chapter.events != 'object') return;

            chapter.events.sort((prev, next) => {
                let prevTime = (prev.start) ? prev.start.replace(':', '') : 2500;
                let nextTime = (next.start) ? next.start.replace(':', '') : 2500;
                console.log(+prevTime, +nextTime);
                return +prevTime > +nextTime;
            });
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
