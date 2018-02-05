import { AuthService } from './../../services/auth.service';
import { Observable } from 'rxjs/Observable';
import { routerTransition } from './../../animations/animations';
import { GooglemapService } from './../../services/googlemap.service';
import { PlaceViewComponent } from './../place-view/place-view.component';
import { ModalsService } from './../../services/modals.service';
import { AppdataService } from './../../services/appdata.service';
import { CityService } from './../../services/city.service';
import { MarkersData } from './../../models/markersdata';
import { PlaceService } from './../../services/place.service';
import { Subscription } from 'rxjs/Subscription';
import { TripService } from './../../services/trip.service';
import { ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/combineLatest';

@Component({
    selector: 'chapter-view',
    templateUrl: './chapter-view.component.html',
    styleUrls: ['./chapter-view.component.scss'],
    animations: [routerTransition],
    host: { '[@routerTransition]': '' }
})
export class ChapterViewComponent implements OnDestroy {
    chapterId;
    tripId;
    subscription: Subscription;
    innerSubscription: Subscription;
    chapter: any = {};
    chapterPlaces: any = [];
    places: any = [];
    city: any = {}
    placeTypes: any = {};

    markersData: MarkersData = this.setupMarkersData([]);

    constructor(
        private route: ActivatedRoute,
        private tripService: TripService,
        private placesService: PlaceService,
        private cityService: CityService,
        private appdataService: AppdataService,
        private modalsService: ModalsService,
        private mapService: GooglemapService,
        private authService: AuthService
    ) {
        this.tripId = this.route.snapshot.paramMap.get('id');
        this.chapterId = this.route.snapshot.paramMap.get('chapterId');

        //TODO: this is ugly, how to refactor it?
        this.subscription = this.tripService.getChapter(this.tripId, this.chapterId).subscribe(chapter => {
            if (chapter.$value === null) {
                this.authService.checkOwnerShip(0);
                return false;
            }
            
            this.chapter = chapter;

            this.innerSubscription = Observable.combineLatest(
                this.placesService.getAllFromCity(chapter.travelCity),
                this.cityService.get(chapter.travelCity),
                this.appdataService.get()
            ).take(1).subscribe(values => {
                // value 0
                if (this.chapter.places) {
                    this.chapterPlaces = this.chapter.places.map(id => {
                        return values[0].find(place => place.$key == id);
                    });
                    this.setupMapData();
                } else {
                    this.chapterPlaces = [];
                    this.setupMapData();
                }

                // value 1
                this.city = values[1];

                // value 2
                this.placeTypes = values[2].placeTypes
                // console.log(this.placeTypes);
            });
        });
    }

    //TODO: this is the same as in city view, needs to be refactored
    private setupMarkersData(markers) {
        return {
            markers: markers,
            options: {
                selectClicked: false
            }
        }
    }
    
    //TODO: this is the same as in city view, needs to be refactored
    private setupMapData() {
        if (!this.chapterPlaces) return;
        
        let md = this.chapterPlaces.map(place => {
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
    
    //TODO: this is the same as in city view, needs to be refactored
    modalPlaceView(id) {
        this.modalsService.popModal(PlaceViewComponent, { id: id });
    }

    private zoomToMarker(place) {
        this.mapService.zoomToCoords(place.lat, place.lng);
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        if (this.innerSubscription) {
            this.innerSubscription.unsubscribe();
        }
    }

}
