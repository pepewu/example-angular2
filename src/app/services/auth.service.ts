import { MessangerService } from './messanger.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase';
import { Observable } from 'rxjs/Observable';
import { Router } from '@angular/router';
import 'rxjs/add/operator/take';

@Injectable()
export class AuthService {
    user$: Observable<firebase.User>;
    private _uid: string = null;

    constructor(
        private afAuth: AngularFireAuth,
        private db: AngularFireDatabase,
        private router: Router,
        private messanger: MessangerService
    ) {
        this.user$ = afAuth.authState;
        this.user$.subscribe(user => {
            if (! user) return;
            
            this._uid = user.uid;
            this.createIfNotExists(user);
        });
    }

    get uid() {
        let result = this._uid;
        if (! result) {
            let lskey = Object.keys(localStorage).find(item => {
                return item.startsWith('firebase:authUser');
            });
            if (lskey) {
                this._uid = JSON.parse(localStorage.getItem(lskey)).uid;
            }
            
        }
        return this._uid;
    }

    private createIfNotExists(user: firebase.User) {
        let dbuser = this.db.object('/users/' + user.uid).take(1).subscribe(x => {
            if (!x.$exists()) {
                console.log('not exists - creating with ' + user.uid);
                this.db.object('/users/' + user.uid + '/userData').set({
                    name: user.displayName,
                    email: user.email,
                    joinDate: new Date().getTime(),
                    lastLogin: new Date().getTime(),
                });
            } else {
                this.db.object('/users/' + user.uid + '/userData').update({
                    lastLogin: new Date().getTime()
                });
            }
        });
    }

    loginWithGoogle() {
        localStorage.setItem('newlogin', 'google');
        this.afAuth.auth.signInWithRedirect(new firebase.auth.GoogleAuthProvider());
    }

    loginWithEmailAndPassword(formData) {
        return this.afAuth.auth.signInWithEmailAndPassword(formData.email, formData.password);
    }

    registerWithEmailAndPassword(formData) {
        return this.afAuth.auth.createUserWithEmailAndPassword(formData.email, formData.password);
    }

    checkOwnerShip(checkedUid) {
        if (this.uid != checkedUid) {
            this.messanger.postMessage('You have tried to access content that do not belong to your account', 'danger');
            this.router.navigate(['/']);
            return false;
        }
        return true;
    }

    logout() {
        this.afAuth.auth.signOut();
        this.router.navigate(['/']);
        window.location.reload();
    }
}
