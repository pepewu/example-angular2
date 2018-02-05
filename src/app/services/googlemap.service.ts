import { Injectable } from '@angular/core';
declare var google: any;

@Injectable()
export class GooglemapService {
    // google: any;
    public map: google.maps.Map = null;
    public markers: any[] = [];
    public listeners: any[] = [];

    private mapInited: boolean = false;
    private mapNode: HTMLElement;
    
    constructor() {
        console.log('INIT MAPS');
        this.initMap();
    }
    
    private initMap() {
        this.mapNode = document.createElement('div');
        this.mapNode.id = "mapInstance";
        this.map = new google.maps.Map(this.mapNode, {
            center: { lat: 50.061601, lng: 19.937624 },
            zoom: 4,
            mapTypeControl: false,
            streetViewControl: false,
            rotateControl: false,
        });
        this.mapInited = true;
    }

    drawMap(node: HTMLElement) {
        node.appendChild(this.mapNode);
        setTimeout(() => window.dispatchEvent(new Event('resize')), 0);
    }

    detachMap(mapInstance: HTMLElement) {
        this.mapNode = mapInstance.parentNode.removeChild(mapInstance);
    }

    resetMarkersSelection() {
        this.markers.forEach(marker => {
            marker.selected = false;
            marker.setOpacity(1.0);
        });
    }

    resetMap() {
        this.markers.forEach(marker => {
            google.maps.event.clearInstanceListeners(marker);
            marker.setMap(null);
            marker = null;
        });
        this.markers = [];

        this.listeners.forEach(listener => google.maps.event.removeListener(listener));
        this.listeners = [];
    }

    clickMarker(markerIndex) {
        google.maps.event.trigger(this.markers[markerIndex], 'click');
    }

    zoomToCoords(lat, lng) {
        this.map.panTo(new google.maps.LatLng(lat, lng));
        this.map.setZoom(17);
    }
}
