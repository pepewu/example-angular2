import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/take';
import 'rxjs/add/observable/of';

@Injectable()
export class AppdataService {
    appdata = null;

    constructor(private db: AngularFireDatabase) {
        this.db.object('/appData').take(1).subscribe(appdata => this.appdata = appdata);
    }

    get() {
        if (this.appdata) {
            console.log('getting static appdata');
            return Observable.of(this.appdata);
        }

        console.log('getting appdata from db');
        return this.db.object('/appData');
    }
}
