import { routerTransition } from './../../animations/animations';
import { environment } from './../../../environments/environment';
import { PlaceViewComponent } from './../place-view/place-view.component';
import { ModalsService } from './../../services/modals.service';
import { MessangerService } from './../../services/messanger.service';
import { AuthService } from './../../services/auth.service';
import { Component } from '@angular/core';

@Component({
    selector: 'welcome',
    templateUrl: './welcome.component.html',
    styleUrls: ['./welcome.component.scss'],
    animations: [routerTransition],
    host: { '[@routerTransition]': '' }
})
export class WelcomeComponent {
    counter: number = 0;
    environment;
    eventDate = '2018-08-24 18:45';
    eventDate2;

    constructor(
        public auth: AuthService,
        private messanger: MessangerService,
        private modalsService: ModalsService
    ) {
        this.environment = environment;
    }

    logout() {
        this.auth.logout();
    }

    testMsg() {
        this.messanger.postMessage('Test message for animations ' + this.counter++, 'success')
    }

    testModal() {
        this.modalsService.popModal(PlaceViewComponent, { id: '-KvbP5DDO27JwFGdV1Ij'});
    }
}
