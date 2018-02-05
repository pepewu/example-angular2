import { MessangerService } from './../../services/messanger.service';
import { AuthService } from './../../services/auth.service';
import { routerTransition } from './../../animations/animations';
import { UtilsService } from './../../services/utils.service';
import { AppdataService } from './../../services/appdata.service';
import { CityService } from './../../services/city.service';
import { Place } from './../../models/place';
import { PlaceService } from './../../services/place.service';
import { GooglemapService } from '../../services/googlemap.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import 'rxjs/add/operator/take';

@Component({
    selector: 'place-edit',
    templateUrl: './place-edit.component.html',
    styleUrls: ['./place-edit.component.scss'],
    animations: [routerTransition],
    host: { '[@routerTransition]': '' }
})
export class PlaceEditComponent {
    lat: string;
    lng: string;
    id: string;
    place: any = {};
    cities$;
    cities = ['dummy'];
    types = [];

    @ViewChild('f') f;

    constructor(
        private placeService: PlaceService,
        private cityService: CityService,
        private appdataService: AppdataService,
        private router: Router,
        private route: ActivatedRoute,
        private ref: ChangeDetectorRef,
        private utils: UtilsService,
        private authService: AuthService,
        private messanger: MessangerService
    ) {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) {
            this.placeService.get(this.id).take(1).subscribe(place => {
                // check if user owns this place
                if (! this.authService.checkOwnerShip(place.uid)) return false;

                this.place = place;
            });
        }

        this.cityService.getAll().take(1).subscribe(cities => {
            this.cities = cities;
            console.log(this.cities);
        });
        // this.types$ = this.placeService.getTypes();

        this.appdataService.get().take(1).subscribe(appdata => {
            let keys = Object.keys(appdata['placeTypes']);
            let types = keys.map(key => {
                return {
                    slug: key,
                    ...appdata['placeTypes'][key]
                }
            });
            this.types = types;
        });
    }

    submit(place: Place) {
        place = this.utils.removeEmptyProperties(place);
        if (this.id) {
            this.placeService.update(this.id, place);
        } else {
            this.placeService.create(place);
        }
        this.router.navigate(['/library']);
    }

    setPlaceType(slug) {
        this.place.type = slug;
    }

    handleCoords($event) {
        this.place.lat = $event[0];
        this.place.lng = $event[1];

        // bez tego walidator zaskakuje z dużym opóźnieniem
        this.f.controls.lat.setValue($event[0]);
        this.f.controls.lat.updateValueAndValidity();

        // zwg na to że nie zmienia się cały obiekt tylko 2 wartości, trzeba ręcznie uruchomić detekcję zmian
        // łapie zmiany wartości pola i modelu do walidacji
        this.ref.detectChanges();
    }

    modelChange($event) {
        console.log('model change');
        console.log($event);
    }
}
