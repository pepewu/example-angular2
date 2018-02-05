import { GooglemapService } from './../../../services/googlemap.service';
import { Component, OnInit, OnDestroy, Input, Output, ChangeDetectionStrategy } from '@angular/core';
import { EventEmitter } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'map-addmarker',
    templateUrl: './map-addmarker.component.html',
    styleUrls: ['./map-addmarker.component.scss']
})
export class MapAddmarkerComponent implements OnInit, OnDestroy {
    mapContainer: HTMLElement;
    mapInstance: HTMLElement;
    map: google.maps.Map;
    marker: google.maps.Marker;
    markerPlaced: boolean = false;
    firstRender: boolean = true;

    @Output() newCoords = new EventEmitter();
    // magic set keywords handles changes for this property
    @Input() set existingCoords(coords: number[]) {
        if (! coords[0]) return;

        let c = new google.maps.LatLng(coords[0], coords[1]);
        this.placeMarker(c);
        if (this.firstRender) {
            this.map.setCenter(c);
            this.firstRender = false;
        }
    }

    constructor(private mapService: GooglemapService) {
        this.map = this.mapService.map;
        this.mapService.resetMap();

        this.setup();
    }

    private setup() {
        // create empty marker
        this.marker = new google.maps.Marker({
            draggable: true,
            position: null,
            map: null,
        });

        // push marker reference to global markers array
        this.mapService.markers.push(this.marker);

        // handle click on map
        let clickEvent = this.map.addListener('click', (e) => {
            console.log('map clicked');
            this.publishCoords(e);
            this.placeMarker(e.latLng);
        });
        this.mapService.listeners.push(clickEvent);
        
        // handle marker drag
        this.marker.addListener('dragend', (e) => {
            this.publishCoords(e);
        });
    }
    
    private placeMarker(where) {
        if (!this.markerPlaced) {
            this.marker.setMap(this.map);
            this.markerPlaced = true;
        }
        this.marker.setPosition(where);
    }

    private publishCoords(e) {
        this.newCoords.emit([e.latLng.lat(), e.latLng.lng()]);
    }

    ngOnInit() {
        this.mapContainer = document.getElementById('mapContainer');
        this.mapInstance = document.getElementById('mapInstance');
        this.mapService.drawMap(this.mapInstance);
    }

    ngOnDestroy() {
        this.mapService.detachMap(this.mapInstance);
    }
}
