import { Observable } from 'rxjs/Observable';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs/Subject';

@Injectable()
export class MessangerService {
    strem$;
    private counter: number = 0;

    private stack: any[] = [];

    constructor() {
        this.strem$ = new Subject();
    }

    postMessage(msg: string, type: string) {
        let id = ++this.counter;
        this.stack.push({
            id: id,
            msg: msg,
            type: type
        });

        this.strem$.next(this.stack);
        this.scheduleRemove(id);
    }

    private scheduleRemove(id) {
        setTimeout(() => {
            let msg = this.stack.find(item => item.id == id);
            if (msg) {
                this.stack.splice(this.stack.indexOf(msg), 1);
                this.strem$.next(this.stack);
            }
        }, 5000);
    }

}
