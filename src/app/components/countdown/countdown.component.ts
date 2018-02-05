import { Subscription } from 'rxjs/Subscription';
import { TripService } from './../../services/trip.service';
import { Component, OnInit, Input, OnDestroy } from '@angular/core';

@Component({
    selector: 'countdown',
    templateUrl: './countdown.component.html',
    styleUrls: ['./countdown.component.scss']
})
export class CountdownComponent implements OnInit, OnDestroy {
    title = 'Loading...';
    days: number = 0;
    hours: number = 0;
    subscription: Subscription;
    tickInterval;
    tripTimestamp;
    hasFutureTrips = false;

    constructor(
        private tripService: TripService
    ) {}

    ngOnInit() {
        this.subscription = this.tripService.getAll().subscribe(trips => {
            let now = new Date().getTime();
            let futureTrips = trips
                .filter(trip => +trip.countedStart > now)
                .sort((prev, next) => prev - next);
            
            if (futureTrips.length) {
                this.setupTick(futureTrips[0]);
            } else {
                this.hasFutureTrips = false;
            }
        });
    }

    setupTick(trip) {
        this.tripTimestamp = trip.countedStart;
        this.title = trip.name;

        this.tick();
        this.tickInterval = setInterval(() => {this.tick()}, 10000);
        this.hasFutureTrips = true;
    }

    tick() {
        let now = new Date().getTime();

        if (this.tripTimestamp - now < 0) {
            this.stopTick();
            return;
        }

        let days = (this.tripTimestamp - now) / (1000 * 60 * 60 * 24);
        let hours = days - Math.floor(days);
        this.days = Math.floor(days);
        this.hours = Math.ceil(hours * 24);
    }

    stopTick() {
        this.hasFutureTrips = false;
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        clearInterval(this.tickInterval);
        this.tickInterval = null;
    }
}
