import { popupAnimation, popupBgAnimation } from './../../animations/animations';
import { ModalsService } from './../../services/modals.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'alert',
    templateUrl: './alert.component.html',
    styleUrls: ['./alert.component.scss'],
    animations: [popupAnimation, popupBgAnimation]
})
export class AlertComponent {
    visible: boolean = false;
    msg: string = null;
    
    constructor(
        private modalsService: ModalsService
    ) {
        this.modalsService.alerts$.subscribe(alertData => {
            this.visible = alertData[0];
            this.msg = alertData[1];
        });
    }
    
    private hide() {
        this.visible = false;
        // this.msg = null;
    }

    yes() {
        this.hide();
        this.modalsService.alertState$.next(true);
    }

    godno() {
        this.hide();
        this.modalsService.alertState$.next(false);
    }
}
