import { Subject } from 'rxjs/Subject';
import { Injectable } from '@angular/core';
import { modalData } from '../models/modal-component';

@Injectable()
export class ModalsService {
    modals$;
    modalData$;
    modalClose$;

    // sends info that new alert is requested
    alerts$;

    // return alert result from html component
    alertState$;

    constructor() {
        this.modals$ = new Subject();
        this.modalData$ = new Subject();
        this.modalClose$ = new Subject();
        this.alerts$ = new Subject();
        this.alertState$ = new Subject();
    }

    popModal(componentName, componentData) {
        this.modals$.next({
            component: componentName,
            data: componentData
        });
    }

    emitData(data: modalData) {
        this.modalData$.next(data);
    }

    /*
     Simple message that popup should be closed without passing any data from it to invoking component.
     (Cases when popup content does necessary things by itself)
    */
    emitCloseEvent() {
        this.modalClose$.next();
    }

    popAlert(msg) {
        this.alerts$.next([true, msg]);
        return this.alertState$;
    }
}
