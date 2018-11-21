import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule }    from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// used to create fake backend
// import { fakeBackendProvider } from './_helpers';

import {MatButtonModule} from '@angular/material/button';
import {MatMenuModule} from '@angular/material/menu';
import {MatSelectModule} from '@angular/material/select';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatTooltipModule} from '@angular/material/tooltip';
import {MatSnackBarModule} from '@angular/material/snack-bar';

import { CharacterFrameComponent } from './character/character-frame.component';
import { CharacterFormComponent } from './character/form/character-form.component';
import { CharacterFormSectionComponent } from './character/form/character-form-section.component';
import { CharacterAttributesComponent } from './character/attributes/character-attributes.component';
import { CharacterMessagesComponent } from './character/messages/character-messages.component';
import { CharacterResourcesComponent } from './character/resources/character-resources.component';
import { CharacterSkillsComponent } from './character/skills/character-skills.component';
import { CharacterHeaderComponent } from './character/header/character-header.component';

import { AppComponent }  from './app.component';
import { routing }        from './app.routing';

import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { AlertComponent } from './_components';
import { JwtInterceptor, ErrorInterceptor } from './_helpers';
import { HomeComponent } from './home';
import { LoreComponent } from './lore/lore.component';
import { ManualComponent } from './manual/manual.component';
import { DynamicSectionComponent } from './dynamic-section/dynamic-section.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { LoginComponent } from './login';
import { RegisterComponent } from './register';

@NgModule({
    imports: [
        FormsModule,
        BrowserModule,
        MatMenuModule,
        MatButtonModule,
        MatSelectModule,
        MatInputModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatSnackBarModule,
        BrowserAnimationsModule,
        ReactiveFormsModule,
        HttpClientModule,
        routing
    ],
    declarations: [
        AppComponent,
        AlertComponent,
        CharacterFrameComponent,
        CharacterFormComponent,
        CharacterFormSectionComponent,
        CharacterAttributesComponent,
        CharacterMessagesComponent,
        CharacterResourcesComponent,
        CharacterSkillsComponent,
        CharacterHeaderComponent,
        HomeComponent,
        LoreComponent,
        ManualComponent,
        DynamicSectionComponent,
        NotFoundComponent,
        NavMenuComponent,
        LoginComponent,
        RegisterComponent
    ],
    providers: [
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },

        // provider used to create fake backend
        // fakeBackendProvider
    ],
    bootstrap: [AppComponent]
})

export class AppModule { }
