import { ModalsService } from './modals.service';
import { TripService } from './trip.service';
import { MessangerService } from './messanger.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Place } from './../models/place';
import { AngularFireDatabase } from 'angularfire2/database';
import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/filter';

@Injectable()
export class PlaceService {
    uid: string = null;
    path: string;

    constructor(
        private auth: AuthService,
        private db: AngularFireDatabase,
        private router: Router,
        private messanger: MessangerService,
        private tripService: TripService,
        private modalsService: ModalsService
    ) {
        this.uid = auth.uid;
        this.path = '/users/' + this.uid + '/places';
    }

    /*
     Creates new place entry in /places and in /users/$user/places
    */
    create(place: Place) {
        if (!this.uid) this.goHome();

        // set this place ownership to user of uid
        place.uid = this.uid;
        
        // create empty place with $key, it is needed because we are going to push it into 2 locations in db
        // one is in /places, which contains description, second is in user object
        let newPlaceKey = this.db.database.ref().push().key;

        // we want to store full place object (with description) in /places and simplified version
        // (without decription) in user data; for the second we create a clone of place with no desc.
        let placeFull = Object.assign({}, place);

        // next we want to get rid of description from main place
        delete place.description;

        // create firebase object with to locations, that will be passed to update method
        let placePost = {};
        placePost['places/' + newPlaceKey] = placeFull;
        placePost[this.path + '/' + newPlaceKey] = place;

        // create post in two plaes set below
        this.db.database.ref().update(placePost)
            .then(() => placePost = place = null);

        // also update city object to contain referencece in its 'places' property
        // it can be used to quickly count number of places in that city
        this.db.object('/users/' + this.uid + '/cities/' + place.city + '/places/' + newPlaceKey).set(true);
    }

    /*
     Update place in 2 locations: in /places, and in /user data (with no description)
    */
    update(id: string, place: Place) {
        // update in places
        this.db.object('/places/' + id).update(place);

        // update in user data
        delete place.description;
        this.db.object(this.path + '/' + id).update(place);
    }

    /*
     Get full place object (with description) from /places
    */
    get(id: string) {
        return this.db.object('/places/' + id);
    }

    /*
     Get all places from /user data (with no description)
    */
    getAll() {
        if (!this.uid) this.goHome();
        return this.db.list(this.path);
    }

    /*
     @deprecated - this should be removed
     */
    getTypes() {
        return this.db.list('/appData/placeTypes');
    }

    getAllFromCity(cityId: string) {
        // return this.db.list(this.path, {
        //     query: {
        //         orderByChild: 'city',
        //         equalTo: cityId
        //     }
        // });
        return this.db.list(this.path)
            .map(places => {
                return places
                    .filter(place => place.city == cityId)
                    .sort((placeA, placeB) => {
                        if (placeA.name < placeB.name) return -1;
                        if (placeA.name > placeB.name) return 1;
                        return 0;
                    });
            });
    }

    remove(placeObj: Place) {
        this.db.object(this.path + '/' + placeObj['$key']).remove().then(() => {
            this.messanger.postMessage(`${placeObj.name} has been removed.`, 'success');
        });
        this.db.object('/places/' + placeObj['$key']).remove();
        this.db.object('/users/' + this.uid + '/cities/' + placeObj.city + '/places/' + placeObj['$key']).remove();
    }

    removeFromAll(placeObj: Place) {
        this.tripService.getAll().take(1).subscribe(trips => {
            let data = trips
                .filter(trip => typeof trip.chapters == 'object')
                .reduce((mem, trip) => {
                    Object.keys(trip.chapters).forEach(key => {
                        let hasMatch = false;
                        try {
                            if (! trip.chapters[key].places.some(place => place.placeId == placeObj['$key'])) return;
                            hasMatch = true;
                        } catch(err) {}

                        if (! hasMatch) return;
                        mem.push({
                            tripId: trip.id,
                            chapterId: key,
                            chapter: trip.chapters[key]
                        });
                    });
                    return mem;
                }, []);

            this.modalsService.popAlert('<h3>You are going to delete this place</h3>').take(1).subscribe(result => {
                if (!result) return;

                data.forEach(item => {
                    let index = item.chapter.places.findIndex(place => place.placeId == placeObj['$key']);
                    item.chapter.places.splice(index, 1);

                    this.tripService.updateChapter(item.tripId, item.chapterId, item.chapter);
                });

                this.remove(placeObj);
                this.modalsService.emitCloseEvent();
            });

        });
    }

    private goHome() {
        this.router.navigate(['/']);
    }
}
