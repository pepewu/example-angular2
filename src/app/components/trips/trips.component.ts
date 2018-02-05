import { Subscription } from 'rxjs/Subscription';
import { routerTransition, listAnimation } from './../../animations/animations';
import { TripCreateComponent } from './../trip-create/trip-create.component';
import { ModalsService } from './../../services/modals.service';
import { TripService } from './../../services/trip.service';
import { Component, OnInit, HostBinding, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/take';

@Component({
    selector: 'app-trips',
    templateUrl: './trips.component.html',
    styleUrls: ['./trips.component.scss'],
    animations: [routerTransition, listAnimation],
    host: { '[@routerTransition]': '' }
})
export class TripsComponent implements OnDestroy {
    @HostBinding('class.pageRow') true;
    trips = [];
    subscription: Subscription;
    hasNoTrips: boolean = false;

    constructor(
        private tripsService: TripService,
        private modalService: ModalsService
    ) {
        this.subscription = tripsService.getAll().subscribe(trips => {
            console.log(trips);
            this.trips = trips.sort((prev, next) => {
                return next.countedStart - prev.countedStart;
            });
            if (! trips.length) {
                this.hasNoTrips = true;
            }
        });
    }

    modalCreateTrip() {
        this.modalService.popModal(TripCreateComponent, {});
    }

    removeTrip(id) {
        console.log('remove trip');
        this.modalService.popAlert('You are going to delete your trip.').take(1).subscribe(result => {
            if (!result) return;
            this.tripsService.remove(id);
        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
    }
}
