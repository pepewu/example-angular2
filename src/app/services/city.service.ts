import { ModalsService } from './modals.service';
import { TripService } from './trip.service';
import { PlaceService } from './place.service';
import { MessangerService } from './messanger.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { City } from './../models/city';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/take';

@Injectable()
export class CityService {
    uid: string = null;
    private path: string;
    
    constructor(
        private auth: AuthService,
        private db: AngularFireDatabase,
        private router: Router,
        private messanger: MessangerService,
        private placesService: PlaceService,
        private tripService: TripService,
        private modalsService: ModalsService
    ) {
        this.uid = auth.uid;
        this.path = '/users/' + this.uid + '/cities';
    }

    create(city: City) {
        if (! this.uid) this.goHome();

        city.uid = this.uid;
        this.db.list(this.path).push(city).then(() => {
            this.messanger.postMessage('City ' + city.name + ' has been created.', 'success');
        });
    }

    update(id: string, city: City) {
        this.db.object(this.path + '/' + id).update(city).then(() => {
            this.messanger.postMessage('City ' + city.name + ' has been updated.', 'success');
        });
    }

    get(id: string) {
        return this.db.object(this.path + '/' + id);
    }

    getAll() {
        if (!this.uid) this.goHome();
        console.log(this.uid);
        return this.db.list(this.path);
    }


    getCityTrips(city) {
        const filterTrips = (trips) => {
            return trips.filter(trip => {
                if (!trip.chapters) return false;

                let chapters = Object.keys(trip.chapters);
                let toCity = chapters.some(chapter => {
                    return (trip.chapters[chapter].travelCity == city.$key) ? true : false;
                });
                return toCity ? true : false;
            });
        }

        return this.tripService.getAll().map(trips => {
            return filterTrips(trips);
        });
    }


    delete(city, id: string, name: string) {
        // compose alert message from selected places and trips that are going to be deleted
        const composeMsg = (places, cityTrips) => {
            let msg = `<h3>You are going to delete ${name}.</h3>`;
            
            if (places.length) {
                msg += `<p>This city contains <strong>${places.length}</strong> places - they will all be removed.</p>`
            }

            if (cityTrips.length) {
                let titles = cityTrips.map(trip => trip.name).join(', ');
                msg += `<p>All trips that are connected to this city will also be removed:<br><strong>${titles}</strong>.</p>`;
            }

            return msg;
        }

        // prepare data and fire confirmation
        const dataCallback = (cityTrips) => {
            let places = Object.keys(city.places),
                msg = composeMsg(places, cityTrips);

            // fire confirmation popup with composed msg
            this.modalsService.popAlert(msg).take(1).subscribe(result => {
                if (!result) return;

                doDelete(places, cityTrips);
            });
        }

        // actually delete collected data
        const doDelete = (places, cityTrips) => {
            if (places.length) {
                places.forEach(place => {
                    this.placesService
                        .get(place)
                        .take(1)
                        .subscribe(plc => this.placesService.remove(plc));
                });
            }
            if (cityTrips.length) {
                cityTrips.forEach(trip => this.tripService.remove(trip.$key, trip.name));
            }

            this.db.object(this.path + '/' + id).remove().then(() => {
                this.messanger.postMessage(`${name} has been deleted.`, 'success');
            });
        }

        this.getCityTrips(city).take(1).subscribe(trips => dataCallback(trips));
    }

    private goHome() {
        this.router.navigate(['/']);
    }
}
