import { Subscription } from 'rxjs/Subscription';
import { routerTransition, listAnimation } from './../../animations/animations';
import { CityService } from './../../services/city.service';
import { Component, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { FirebaseListObservable } from 'angularfire2/database';
import 'rxjs/add/operator/take';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

@Component({
    selector: 'app-library',
    templateUrl: './library.component.html',
    styleUrls: ['./library.component.scss'],
    animations: [routerTransition, listAnimation],
    host: {'[@routerTransition]': ''},
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class LibraryComponent implements OnDestroy {
    // cities$: FirebaseListObservable<any[]>;
    cities = [];
    hasNoCities: boolean = false;
    subscription: Subscription;

    constructor(private cityService: CityService, private ref: ChangeDetectorRef) {
        this.subscription = this.cityService.getAll().subscribe(cities => {
            this.cities = cities;
            this.hasNoCities = (cities.length) ? false : true;
            this.ref.detectChanges();
        });
    }

    deleteCity(city, id, name) {
        this.cityService.delete(city, id, name);
    }

    countCityPlaces(city) {
        return Object.keys(city.places).length;
    }

    getNextVisit(city) {
        return this.cityService.getCityTrips(city).map(trips => {
            let filtered = trips.filter(trip => trip.countedStart > new Date().getTime());
            return filtered.length ? filtered : null;
        });
    }

    getPrevVisit(city) {
        return this.cityService.getCityTrips(city).map(trips => {
            let filtered = trips.filter(trip => trip.countedStart < new Date().getTime());
            return filtered.length ? filtered : null;
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
