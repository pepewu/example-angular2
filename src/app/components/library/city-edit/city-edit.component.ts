import { MessangerService } from './../../../services/messanger.service';
import { AuthService } from './../../../services/auth.service';
import { UtilsService } from './../../../services/utils.service';
import { routerTransition } from './../../../animations/animations';
import { Observable } from 'rxjs/Observable';
import { AppdataService } from './../../../services/appdata.service';
import { GooglemapService } from './../../../services/googlemap.service';
import { Router, ActivatedRoute } from '@angular/router';
import { CityService } from './../../../services/city.service';
import { City } from './../../../models/city';
import { Component, ChangeDetectorRef, ViewChild } from '@angular/core';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/combineLatest';

@Component({
    selector: 'city-edit',
    templateUrl: './city-edit.component.html',
    styleUrls: ['./city-edit.component.scss'],
    animations: [routerTransition],
    host: { '[@routerTransition]': '' }
})
export class CityEditComponent {
    lat: string;
    lng: string;
    id: string;
    city: any = {};
    colors: any = [];

    @ViewChild('f') f;

    constructor(
        private authService: AuthService,
        private cityService: CityService,
        private router: Router,
        private route: ActivatedRoute,
        private appdataService: AppdataService,
        private ref: ChangeDetectorRef,
        private utils: UtilsService,
        private messanger: MessangerService
    ) {
        this.id = this.route.snapshot.paramMap.get('id');
        if (this.id) {
            Observable
                .combineLatest(
                    this.cityService.get(this.id),
                    this.appdataService.get()
                )
                .take(1)
                .subscribe((values) => {
                    // check if user owns this city
                    if (! this.authService.checkOwnerShip(values[0].uid)) return false;

                    this.city = values[0];
                    this.setupColors(values[1]['colors']);

                });
        } else {
            this.appdataService.get().take(1).subscribe(appdata => {
                this.setupColors(appdata['colors']);
            });
        }
    }

    private setupColors(colors) {
        Object.keys(colors).forEach(color => {
            this.colors.push({
                value: colors[color],
                active: (colors[color] == this.city.color) ? true : false
            });
        });
        console.log(this.colors);
    }

    private setColor(value) {
        console.log(value);
        this.colors.forEach(color => {color.active = false});
        let index = this.colors.findIndex(color => color.value == value);
        this.colors[index].active = true;
        this.city.color = value;
    }

    submit(city: City) {
        this.utils.removeEmptyProperties(city);
        if (this.id) {
            this.cityService.update(this.id, city);    
        } else {
            this.cityService.create(city);
        }
        this.router.navigate(['/library']);
    }

    handleCoords($event) {
        this.city.lat = $event[0];
        this.city.lng = $event[1];

        // bez tego walidator zaskakuje z dużym opóźnieniem
        this.f.controls.lat.setValue($event[0]);
        this.f.controls.lat.updateValueAndValidity();

        // zwg na to że nie zmienia się cały obiekt tylko 2 wartości, trzeba ręcznie uruchomić detekcję zmian
        // łapie zmiany wartości pola i modelu do walidacji
        this.ref.detectChanges();
    }
}
