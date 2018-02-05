import { routerTransition } from './../../animations/animations';
import { MessangerService } from './../../services/messanger.service';
import { Router } from '@angular/router';
import { AuthService } from './../../services/auth.service';
import { Component, OnInit, ViewChild } from '@angular/core';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss'],
    animations: [routerTransition],
    host: { '[@routerTransition]': '' }
})
export class LoginComponent {
    loginError;
    regError;

    regVisible: boolean = false;

    valDigit1: number;
    valDigit2: number;
    valDigitR: number;

    constructor(
        private auth: AuthService,
        private router: Router,
        private messanger: MessangerService
    ) {
        this.setValidationDigits();
    }

    loginWithGoogle() {
        this.auth.loginWithGoogle();
    }

    logout() {
        this.auth.logout();
    }

    loginWithEmailAndPassword(formData) {
        this.loginError = null;

        try {
            this.auth.loginWithEmailAndPassword(formData.value)
                .then(() => {
                    this.messanger.postMessage('You have been logged in succesfully. Welcome again!', 'success');
                    this.router.navigate(['/']);
                })
                .catch((error) => {
                    this.loginError = error['code'];
                });
        } catch(error) {
            this.loginError = 'general';
        }
        
    }

    private setValidationDigits() {
        this.valDigit1 = Math.ceil(Math.random() * 100);
        this.valDigit2 = Math.ceil(Math.random() * 100);
        this.valDigitR = this.valDigit1 + this.valDigit2;
    }

    registerWithEmailAndPassword(formData) {
        this.regError = null;

        if (formData.value.password != formData.value.password2) {
            this.regError = 'passwordMismatch';
            return;
        }

        if (formData.value.human != this.valDigitR) {
            this.regError = 'wrongHuman';
            return;
        }

        try {
            this.auth.registerWithEmailAndPassword(formData.value)
                .then((data) => {
                    this.messanger.postMessage('Your account has been created and you are now logged in. Welcome!', 'success');
                    this.router.navigate(['/']);
                })
                .catch((error) => {
                    this.regError = error['code'];
                });
        } catch(error) {
            this.regError = 'general';
        };
    }

    toggleRegistration() {
        this.regVisible = ! this.regVisible;
    }
}
