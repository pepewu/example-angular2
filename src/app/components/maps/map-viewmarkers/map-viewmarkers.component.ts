import { PlaceService } from './../../../services/place.service';
import { MarkersData } from './../../../models/markersdata';
import { GooglemapService } from '../../../services/googlemap.service';
import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'map-viewmarkers',
    templateUrl: './map-viewmarkers.component.html',
    styleUrls: ['./map-viewmarkers.component.scss']
})
export class MapViewmarkersComponent implements OnInit {
    mapContainer: HTMLElement;
    mapInstance: HTMLElement;
    map: google.maps.Map;
    mapbounds: google.maps.LatLngBounds;
    placeTypes = [];

    @Input() set markersData(data: MarkersData) {
        if (! data.markers.length) return;

        this.placeService.getTypes().take(1).subscribe(types => {
            this.placeTypes = types
            this.drawMarkers(data);
        });
    };

    @Output() clickedMarker = new EventEmitter();

    constructor(
        private mapService: GooglemapService,
        private placeService: PlaceService
    ) {
        this.map = this.mapService.map;
        this.mapService.resetMap();
        this.placeService.getTypes().take(1).subscribe(types => this.placeTypes = types);
    }

    private drawMarkers(data: MarkersData) {
        this.mapService.resetMap();
        this.mapbounds = new google.maps.LatLngBounds();

        data.markers.forEach(markerData => {
            let typeDataIndex = this.placeTypes.findIndex(type => type.$key == markerData.type);
            let typeData = this.placeTypes[typeDataIndex];

            let latlng = new google.maps.LatLng(markerData.lat, markerData.lng);
            let marker = new google.maps.Marker({
                icon: {
                    path: 'M0-48c-9.8 0-17.7 7.8-17.7 17.4 0 15.5 17.7 30.6 17.7 30.6s17.7-15.4 17.7-30.6c0-9.6-7.9-17.4-17.7-17.4z',
                    fillColor: typeData.markerColor,
                    fillOpacity: 1,
                    strokeColor: '',
                    strokeWeight: 0,
                    labelOrigin: new google.maps.Point(0, -30)
                },
                position: latlng,
                draggable: false,
                map: this.map,
                title: markerData.name,
                label: {
                    color: typeData.iconColor,
                    fontFamily: 'fontello',
                    text: typeData.markerLabel,
                    fontSize: typeData.markerFontSize || '24px',
                }
            });
            // trick for typescipt complains about properties not being assignable
            marker['id'] = markerData.id;
            marker['selected'] = markerData.selected || false;

            if (markerData.selected) {
                marker.setOpacity(0.5);
            }

            marker.addListener('click', () => {
                if (! data.options.selectClicked) {
                    this.clickedMarker.emit(markerData.id);
                    return;
                }

                marker['selected'] = ! marker['selected'];
                
                if (marker['selected']) {
                    marker.setOpacity(0.5);
                } else {
                    marker.setOpacity(1.0);
                }
                this.clickedMarker.emit([markerData.id, markerData.name]);
            });

            this.mapbounds.extend(latlng);
            this.mapService.markers.push(marker);
        });

        this.map.fitBounds(this.mapbounds);
        setTimeout(() => this.map.fitBounds(this.mapbounds), 500);
    }


    ngOnInit() {
        this.mapContainer = document.getElementById('mapContainer');
        this.mapInstance = document.getElementById('mapInstance');
        this.mapService.drawMap(this.mapInstance);

        // to rozwala usuwanie komponentów z dom przy nawigacji :)
        // this.map.fitBounds(this.mapbounds);
    }

    ngOnDestroy() {
        this.mapbounds = null;
        this.mapService.detachMap(this.mapInstance);
    }

}
