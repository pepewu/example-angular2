import { popupAnimation, popupBgAnimation } from './../../animations/animations';
import { Component, OnInit, ViewChild, Output, EventEmitter, Input } from '@angular/core';

interface DateObj {
    year: number,
    month: number,
    day?: number,
    hour?: number,
    min?: number
}

@Component({
    selector: 'datepicker',
    templateUrl: './datepicker.component.html',
    styleUrls: ['./datepicker.component.scss'],
    animations: [popupAnimation, popupBgAnimation]
})
export class DatepickerComponent implements OnInit {
    // month and year of currently selected month
    innerDate: DateObj;

    // currently picked date
    pickedDate: DateObj;

    isVisible: boolean = false;

    @ViewChild('month') monthEl;
    @ViewChild('firstFocus') firstFocus;
    @Input() ownerInput: HTMLInputElement;
    @Input() set initDate(val) {
        if (! val) return;
        this.setDateFromInput(val);
    };
    @Output() initDateChange = new EventEmitter();

    constructor() { }

    open() {
        this.ownerInput.blur();
        this.firstFocus.nativeElement.focus();
        this.isVisible = true;

        if (this.pickedDate) {
            this.innerDate = Object.assign({}, this.pickedDate);
            this.drawMonth();
        }
    }

    cancel() {
        this.isVisible = false;
    }

    ngOnInit() {
        if (! this.innerDate) {
            this.innerDate = {
                year: new Date().getFullYear(),
                month: new Date().getMonth(),
                day: new Date().getDate(),
                hour: 17,
                min: 0
            }
        }

        if (! this.pickedDate) {
            this.pickedDate = Object.assign({}, this.innerDate);
        }

        this.drawMonth();
    }

    setDateFromInput(date) {
        let _initDate = new Date(date);
        this.innerDate = {
            year: _initDate.getFullYear(),
            month: _initDate.getMonth(),
            day: _initDate.getDate(),
            hour: _initDate.getHours(),
            min: _initDate.getMinutes()
        }
        this.pickedDate = Object.assign({}, this.innerDate);
        this.drawMonth();
    }

    onMonthChange() {
        this.drawMonth();
    }

    onHourChange() {
        this.pickedDate.hour = this.innerDate.hour;
    }

    onMinChange() {
        this.pickedDate.min = this.innerDate.min;
    }

    selectDay($event) {
        if ($event.target.className != 'item') return;

        this.pickedDate = Object.assign({}, this.innerDate);
        this.pickedDate.day = +$event.target.innerText;

        let tdSelected = this.monthEl.nativeElement.querySelector('.selected');
        if (tdSelected) tdSelected.classList.remove('selected');
        $event.target.classList.add('selected');
    }

    prepareOutputString() {
        const
            monthNum = +this.pickedDate.month + 1,
            month = (monthNum < 10)
                ? ('0' + monthNum.toString())
                : monthNum,
            day = (+this.pickedDate.day < 10)
                ? ('0' + this.pickedDate.day.toString())
                : this.pickedDate.day,
            hour = (+this.pickedDate.hour < 10)
                ? ('0' + +this.pickedDate.hour.toString())
                : this.pickedDate.hour;
        
        if (!this.pickedDate.min || this.pickedDate.min > 59) this.pickedDate.min = 0;
        let min = (+this.pickedDate.min < 10)
            ? ('0' + +this.pickedDate.min.toString())
            : this.pickedDate.min;

        return `${this.pickedDate.year}-${month}-${day} ${hour}:${min}`;
    }

    donePicking() {
        this.initDateChange.emit(this.prepareOutputString());
        this.isVisible = false;
    }

    drawMonth() {
        const containsMatched = (this.innerDate.year == this.pickedDate.year && this.innerDate.month == this.pickedDate.month) ? true : false;

        const monthStartDate = new Date(+this.innerDate.year, +this.innerDate.month, 1),
            monthStart = monthStartDate.getTime(),
            firstDay = monthStartDate.getDay(),
            monthNext = new Date(+this.innerDate.year, +this.innerDate.month + 1, 1).getTime(),
            monthLength = Math.round((monthNext - monthStart) / (1000 * 60 * 60 * 24)),
            emptyCount = firstDay != 0 ? (firstDay - 1) : 6;

        let html = '<tr>',
            counter = 0;

        for (let c = 0; c < emptyCount; c++) {
            html += '<td class="empty"></td>';
            counter++;
        }

        for (let c = 1; c <= monthLength; c++) {
            let className = 'item';
            if (containsMatched && c == this.pickedDate.day) {
                className += ' selected';
            }
            html += `<td class="${className}">${c}</td>`;
            if (++counter % 7 == 0) {
                html += '</tr><tr>';
            }
        }
        
        html += '</tr>';
        this.monthEl.nativeElement.innerHTML = html;
    }
}
