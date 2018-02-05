import { MessangerService } from './services/messanger.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { AuthService } from './services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    loggedin;

    constructor(
        private authService: AuthService,
        private router: Router,
        private messanger: MessangerService
    ) {}
    
    ngOnInit() {
        this.authService.user$.subscribe(user => {
            if (user) {
                this.loggedin = true;
            } else {
                this.loggedin = false;
            }

            const newlogin = localStorage.getItem('newlogin');
            if (newlogin) {
                localStorage.removeItem('newlogin');
                this.messanger.postMessage('You have been logged in succesfully.', 'success');
                this.router.navigate(['/']);
            }
        });
    }

    logout() {
        this.authService.logout();
        this.messanger.postMessage('You are now logged out.', 'success');
    }
}
