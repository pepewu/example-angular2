import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'nl2br'
})
export class Nl2brPipe implements PipeTransform {

    transform(value: string, args?: any): any {
        if (! value) return null;
        return value.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '<br>');
    }

}
