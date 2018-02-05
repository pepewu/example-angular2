import { MessangerService } from './../../services/messanger.service';
import { Component } from '@angular/core';
import { trigger, state, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'messanger',
    templateUrl: './messanger.component.html',
    styleUrls: ['./messanger.component.scss'],
    animations: [
        trigger('fade', [
            state('void', style({ opacity: 0 })),
            
            transition('void => *', [
                animate(500)
            ]),

            transition('* => void', [
                animate(500)
            ])
        ])
    ]
})
export class MessangerComponent {
    messages$;
    constructor(private messangerService: MessangerService) {
        this.messages$ = this.messangerService.strem$;
    }

}
