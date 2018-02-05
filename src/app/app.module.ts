import { AuthGuard } from './guards/auth.guard';
import { AppdataService } from './services/appdata.service';
import { UtilsService } from './services/utils.service';
import { TripChapterEditComponent } from './components/trip-edit/trip-chapter-edit/trip-chapter-edit.component';
import { TripService } from './services/trip.service';
import { MessangerService } from './services/messanger.service';
import { PlaceService } from './services/place.service';
import { GooglemapService } from './services/googlemap.service';
import { } from '@types/googlemaps';
import { CityService } from './services/city.service';
import { AuthService } from './services/auth.service';
import { environment } from './../environments/environment';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule, Route } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AppComponent } from './app.component';

import { AngularFireModule } from 'angularfire2';
import { AngularFireDatabaseModule } from 'angularfire2/database';
import { AngularFireAuthModule } from 'angularfire2/auth';
import { WelcomeComponent } from './components/welcome/welcome.component';
import { LoginComponent } from './components/login/login.component';
import { LibraryComponent } from './components/library/library.component';
import { CityEditComponent } from './components/library/city-edit/city-edit.component';
import { MapAddmarkerComponent } from './components/maps/map-addmarker/map-addmarker.component';
import { PlaceEditComponent } from './components/place-edit/place-edit.component';
import { MessangerComponent } from './components/messanger/messanger.component';
import { CityViewComponent } from './components/city-view/city-view.component';
import { MapViewmarkersComponent } from './components/maps/map-viewmarkers/map-viewmarkers.component';
import { PlaceViewComponent } from './components/place-view/place-view.component';
import { TripsComponent } from './components/trips/trips.component';
import { TripEditComponent } from './components/trip-edit/trip-edit.component';
import { TripCreateComponent } from './components/trip-create/trip-create.component';
import { SettingsComponent } from './components/settings/settings.component';
import { ModalContainerComponent } from './components/modals/modal-container/modal-container.component';
import { ModalsService } from './services/modals.service';
import { ModalsDirective } from './directives/modals.directive';
import { TripPlanEditComponent } from './components/trip-edit/trip-plan-edit/trip-plan-edit.component';
import { EventEditComponent } from './components/trip-edit/event-edit/event-edit.component';
import { CostEditComponent } from './components/trip-edit/cost-edit/cost-edit.component';
import { TripViewComponent } from './components/trip-view/trip-view.component';
import { AlertComponent } from './components/alert/alert.component';
import { ChapterViewComponent } from './components/chapter-view/chapter-view.component';
import { DatepickerComponent } from './components/datepicker/datepicker.component';
import { Nl2brPipe } from './pipes/nl2br.pipe';
import { CountdownComponent } from './components/countdown/countdown.component';
import { AboutComponent } from './components/about/about.component';


const routes: Route[] = [
    {
        path: '',
        component: WelcomeComponent
    },
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: 'about',
        component: AboutComponent
    },
    {
        path: 'library/cityview/:id',
        component: CityViewComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'library/cityedit/:id',
        component: CityEditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'library/cityedit',
        component: CityEditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'library/placeedit/:id',
        component: PlaceEditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'library/placeedit',
        component: PlaceEditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'library',
        component: LibraryComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'trips/tripview/:id/:chapterId',
        component: ChapterViewComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'trips/tripview/:id',
        component: TripViewComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'trips/tripedit/:id',
        component: TripEditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'trips/planedit/:id',
        component: TripPlanEditComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'trips',
        component: TripsComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'settings',
        component: SettingsComponent,
        canActivate: [AuthGuard]
    }
];


@NgModule({
    declarations: [
        AppComponent,
        WelcomeComponent,
        LoginComponent,
        LibraryComponent,
        CityEditComponent,
        MapAddmarkerComponent,
        PlaceEditComponent,
        MessangerComponent,
        CityViewComponent,
        MapViewmarkersComponent,
        PlaceViewComponent,
        TripsComponent,
        TripEditComponent,
        TripCreateComponent,
        SettingsComponent,
        TripChapterEditComponent,
        ModalContainerComponent,
        ModalsDirective,
        TripPlanEditComponent,
        EventEditComponent,
        CostEditComponent,
        TripViewComponent,
        AlertComponent,
        ChapterViewComponent,
        DatepickerComponent,
        Nl2brPipe,
        CountdownComponent,
        AboutComponent
    ],
    imports: [
        BrowserModule,
        FormsModule,
        BrowserAnimationsModule,
        AngularFireDatabaseModule,
        AngularFireAuthModule,
        AngularFireModule.initializeApp(environment.firebase),
        RouterModule.forRoot(routes)
    ],
    providers: [
        AuthService,
        CityService,
        PlaceService,
        GooglemapService,
        MessangerService,
        TripService,
        ModalsService,
        UtilsService,
        AppdataService,
        AuthGuard
    ],
    entryComponents: [
        PlaceViewComponent,
        EventEditComponent,
        CostEditComponent,
        TripCreateComponent,
        TripChapterEditComponent
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
