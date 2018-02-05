import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {

    public removeEmptyProperties(obj) {
        Object.keys(obj).forEach(key => {
            if (!obj[key]) {
                delete obj[key];
            }
        });
        return obj;
    }

}
