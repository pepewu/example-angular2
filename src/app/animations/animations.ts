import { trigger, state, transition, style, animate, stagger, query } from '@angular/animations';

export const popupAnimation = trigger('popup', [
    state('poppedOut', style({
        opacity: 0,
        transform: 'scale(0.95) translate3d(0, 20px, 0)',
        visibility: 'hidden'
    })),

    state('poppedIn', style({
        opacity: 1,
        transform: 'scale(1) translate3d(0, 0, 0)',
        visibility: 'visible'
    })),

    transition('poppedOut => poppedIn', [
        animate('200ms ease-out')
    ]),

    transition('poppedIn => poppedOut', [
        animate('150ms ease-in')
    ])
]);

export const popupBgAnimation = trigger('popupBg', [
    state('poppedOut', style({
        opacity: 0,
        visibility: 'hidden'
    })),

    state('poppedIn', style({
        // opacity: 1,
        visibility: 'visible'
    })),

    transition('poppedOut => poppedIn', [
        animate('250ms ease-out')
    ]),

    transition('poppedIn => poppedOut', [
        animate('300ms ease-in')
    ])
]);

export const routerTransition = trigger('routerTransition', [
    state('void', style({ opacity: 0, transform: 'translate3d(50px,0,0)'})),
    state('*', style({opacity: 1})),
    transition('void => *', [
        animate('.25s ease-out')
    ])
]);

export const listAnimation = trigger('listAnimation', [
    transition('void => *', [
        query('.animitem', [
            style({ opacity: 0, transform: 'translate3d(25px,0,0)' }),
            stagger(100, [
                animate('0.25s ease-out', style({ opacity: 1, transform: 'translate3d(0,0,0)' }))
            ])
        ], {optional: true})
    ])
]);

export const slideUpDownAnimation = trigger('slideUpDown', [
    transition('void => *', [
        style({
            opacity: 0,
            height: 0,
        }),
        animate('200ms ease-out', style({
            height: '*',
            opacity: 1
        }))
    ]),

    transition('* => void', [
        style({
            opacity: 1,
            height: '*'
        }),
        animate('200ms ease-in', style({
            height: 0,
            opacity: 0
        }))
    ])
]);