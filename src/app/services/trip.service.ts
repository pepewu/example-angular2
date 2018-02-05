import { TripChapter } from './../models/trip-chapter';
import { Router } from '@angular/router';
import { Trip } from './../models/trip';
import { MessangerService } from './messanger.service';
import { AuthService } from './auth.service';
import { AngularFireDatabase } from 'angularfire2/database';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/take';

@Injectable()
export class TripService {
    uid: string;
    path: string;

    constructor(
        private db: AngularFireDatabase,
        private auth: AuthService,
        private messanger: MessangerService,
        private router: Router
    ) {
        this.uid = auth.uid;
        this.path = '/users/' + this.uid + '/trips';
    }

    create(trip: Trip) {
        trip.uid = this.uid;
        trip.countedStart = 0

        this.db.list(this.path)
            .push(trip)
            .then((item) => this.router.navigate(['/trips/tripedit/', item.key]))
            .then(() => this.messanger.postMessage('Trip "' + trip.name + '" created', 'success'));
    }

    update(trip: Trip) {
        this.db.object(this.path + '/' + trip.id)
            .update(trip)
            .then(() => this.messanger.postMessage('Trip details has been updated.', 'success'));
    }

    remove(tripId: string, name = "Trip") {
        this.db.object(this.path + '/' + tripId)
            .remove()
            .then(() => this.messanger.postMessage(`${name} has been removed`, 'success'));
    }

    createChapter(tripId: string, chapter: TripChapter) {
        // recount trip start date
        this.countStartDate(tripId, null);

        this.db.list(this.path + '/' + tripId + '/chapters')
            .push(chapter)
            .then(() => this.calculateAssignedBudget(tripId))
            .then(() => this.messanger.postMessage('Chapter added', 'success'));
    }

    updateChapter(tripId: string, chapterId: string, chapter: TripChapter) {
        // sort events
        if (typeof chapter.events == 'object') {
            chapter.events = this.sortEventsByHour(chapter.events);
        }

        this.db.object(this.path + '/' + tripId + '/chapters/' + chapterId)
            .update(chapter)
            .then(() => {
                // recount trip start date
                this.countStartDate(tripId, null);
            })
            .then(() => this.messanger.postMessage('Chapter updated', 'success'));
    }

    removeChapter(tripId: string, chapterId: string) {
        // recount trip start date
        this.countStartDate(tripId, null);

        this.db.object(this.path + '/' + tripId + '/chapters/' + chapterId)
            .remove()
            .then(() => this.calculateAssignedBudget(tripId))
            .then(() => this.messanger.postMessage('Chapter removed', 'success'));
    }

    getAll() {
        return this.db.list(this.path);
    }

    getTrip(tripId) {
        return this.db.object(this.path + '/' + tripId);
    }

    getChapter(tripId, chapterId) {
        return this.db.object(this.path + '/' + tripId + '/chapters/' + chapterId);
    }

    getChapters(tripId: string) {
        return this.db.list(this.path + '/' + tripId + '/chapters', {
            query: {
                orderByChild: 'startTimestamp'
            }
        });
    }

    getTravelTypes() {
        return this.db.list('/appData/travelTypes');
    }

    sortEventsByHour(events) {
        return events.sort((prev, next) => {
            let prevTime = (prev.start) ? prev.start.replace(':', '') : 2500;
            let nextTime = (next.start) ? next.start.replace(':', '') : 2500;
            return +prevTime > +nextTime;
        });
    }

    private countBudget(trip) {
        let budget: number = 0;
        if (! trip.chapters) {
            console.log('np chapters, budget is 0');
            return 0;
        }

        for (let chapterKey of Object.keys(trip.chapters)) {
            let chapter = trip.chapters[chapterKey];
            console.log(chapter);
            //TODO wyczyścić to
            if (chapter.type == 'flanering') {
                let chapterBudget = 0;

                if (typeof chapter.events == 'object') {
                    for (let event of chapter.events) {
                        if (event.cost) {
                            chapterBudget += +event.cost;
                        }
                    }
                }

                if (typeof chapter.costs == 'object') {
                    for (let cost of chapter.costs) {
                        if (cost.cost) {
                            chapterBudget += +cost.cost;
                        }
                    }
                }

                chapter.budget = chapterBudget;
                budget += chapterBudget;
            } else {
                budget += (chapter.budget) ? +chapter.budget : 0;
            }
        }
        console.log('counted budget: ' + budget);
        return budget;
    }

    calculateAssignedBudget(tripId) {
        this.db.object(this.path + '/' + tripId).take(1).subscribe(tripObj => {
            let budget = this.countBudget(tripObj);
            tripObj.budgetAssigned = budget;
            this.db.object(this.path + '/' + tripId).update(tripObj);
        });
    }

    prepareTripChaptersList(chaptersData) {
        let chapters = [];
        let curday;
        for (let chapterKey of Object.keys(chaptersData)) {
            chaptersData[chapterKey].id = chapterKey;
            chapters.push(chaptersData[chapterKey]);
        }
        chapters.sort((cur, next) => {
            return cur.startTimestamp - next.startTimestamp
        });

        for (let chapter of chapters) {
            let startDate = new Date(chapter.startTimestamp);
            let newday = startDate.getDate();

            if (newday == curday) continue;

            curday = newday;
            let index = chapters.indexOf(chapter);
            chapters.splice(index, 0, {
                type: 'dateHeader',
                startTimestamp: chapter.startTimestamp
            });
        }

        return chapters;
    }

    private countStartDate(_tripId, _trip) {
        function doIt(trip) {
            if (! trip.chapters) return;

            let timestamps = Object.keys(trip.chapters)
                .map(key => trip.chapters[key].startTimestamp)
                .sort((prev, next) => prev - next);

            this.update({
                id: trip.id,
                countedStart: timestamps[0]
            });
        }

        if (! _trip) {
            this.getTrip(_tripId).take(1).subscribe(trip => {
                doIt.call(this, trip);
            });
        } else {
            doIt.call(this, _trip);
        }
    }
}
