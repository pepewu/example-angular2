import { Subscription } from 'rxjs/Subscription';
import { MessangerService } from './../../services/messanger.service';
import { AuthService } from './../../services/auth.service';
import { routerTransition } from './../../animations/animations';
import { ModalsService } from './../../services/modals.service';
import { Observable } from 'rxjs/Observable';
import { AppdataService } from './../../services/appdata.service';
import { MarkersData } from './../../models/markersdata';
import { GooglemapService } from './../../services/googlemap.service';
import { PlaceService } from './../../services/place.service';
import { ActivatedRoute, Router } from '@angular/router';
import { City } from './../../models/city';
import { CityService } from './../../services/city.service';
import { Component, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/combineLatest';
import { PlaceViewComponent } from '../place-view/place-view.component';

@Component({
    selector: 'city-view',
    templateUrl: './city-view.component.html',
    styleUrls: ['./city-view.component.scss'],
    animations: [routerTransition],
    host: { '[@routerTransition]': '' }
})
export class CityViewComponent implements OnDestroy {
    city: any = {};
    id: string;
    places;
    filteredPlaces;
    types = [];
    availableTypes = [];
    viewData;
    hasNoPlaces: boolean = false;
    subscription: Subscription

    markersData: MarkersData = this.setupMarkersData([]);

    constructor(
        private cityService: CityService,
        private placesService: PlaceService,
        private route: ActivatedRoute,
        private router: Router,
        private mapService: GooglemapService,
        private appdataService: AppdataService,
        private modalsService: ModalsService,
        private authService: AuthService
    ) {
        this.id = this.route.snapshot.paramMap.get('id');
        if (! this.id) return;

        this.cityService.get(this.id).take(1).subscribe(city => {
            // check if user owns this city
            if (! this.authService.checkOwnerShip(city.uid)) return false;

            this.city = city;
        });

        this.subscription = Observable
            .combineLatest(
                this.placesService.getAllFromCity(this.id),
                this.appdataService.get()
            )
            .subscribe(values => {
                this.places = values[0];
                if (! this.places.length) this.hasNoPlaces = true;

                let typesObj = values[1]['placeTypes'];
                let types = [];
                Object.keys(typesObj).forEach(typeSlug => types.push(typesObj[typeSlug]));
                this.types = types;

                this.setup();
            });
        }
        
    private setup() {
        this.setupFilters();
        this.setupViewData();
        this.setupMapData();
    }

    private setupFilters() {
        this.availableTypes = this.types.filter(type => {
            return this.places.some(place => place.type == type.slug);
        });
    }

    private setupMarkersData(markers) {
        return {
            markers: markers,
            options: {
                selectClicked: false
            }
        }
    }

    private setupMapData() {
        if (! this.filteredPlaces) return;

        let md = this.filteredPlaces.map(place => {
            return {
                id: place.$key,
                lat: place.lat,
                lng: place.lng,
                name: place.name,
                type: place.type
            }
        });
        this.markersData = this.setupMarkersData(md);
    }

    private setupViewData() {
        this.filteredPlaces = [];
        let viewData = this.availableTypes
            .filter(type => ! type.inactive)
            .map(type => {
                return {
                    group: type,
                    places: this.places.filter(place => {
                        if (place.type == type.slug) {
                            this.filteredPlaces.push(place);
                        }
                        return place.type == type.slug;
                    })
                }
            });
        this.viewData = viewData;
    }

    private handleFilterClick(type) {
        function countInactives() {
            return this.availableTypes.filter(type => type.inactive).length;
        }

        let inactivesCount = countInactives.call(this);

        if (! inactivesCount) {
            this.availableTypes.forEach(type => type.inactive = true);
        }

        type.inactive = ! type.inactive;

        if (type.inactive && countInactives.call(this) == this.availableTypes.length) {
            this.availableTypes.forEach(type => type.inactive = false);
        }

        this.setupViewData();
        this.setupMapData();
    }

    private zoomToMarker(place) {
        this.mapService.zoomToCoords(place.lat, place.lng);
    }

    private modalPlaceView(id) {
        this.modalsService.popModal(PlaceViewComponent, { id: id });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        this.places = this.filteredPlaces = this.viewData = this.types = this.availableTypes = null;
    }
}
