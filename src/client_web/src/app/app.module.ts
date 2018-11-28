import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpModule} from '@angular/http';

// used to create fake backend
// import { fakeBackendProvider } from './_helpers';

import {CharacterFrameComponent} from './character/character-frame.component';
import {CharacterFormComponent} from './character/form/character-form.component';
import {CharacterFormSectionComponent} from './character/form/character-form-section.component';
import {CharacterAttributesComponent} from './character/attributes/character-attributes.component';
import {CharacterMessagesComponent} from './character/messages/character-messages.component';
import {CharacterResourcesComponent} from './character/resources/character-resources.component';
import {CharacterSkillsComponent} from './character/skills/character-skills.component';
import {CharacterHeaderComponent} from './character/header/character-header.component';

import {AppComponent} from './app.component';
import {AppRouting} from './app.routing';

import {AlertComponent} from './_components';
import {JwtInterceptor, ErrorInterceptor} from './_helpers';
import {HomeComponent} from './home';
import {LoreComponent} from './lore';
import {ManualComponent} from './manual';
import {DynamicSectionComponent} from './dynamic-section';
import {NotFoundComponent} from './not-found';
import {SharedModule} from './shared';
import {LoginComponent} from './login';
import {RegisterComponent} from './register';

@NgModule({
  imports: [
    FormsModule,
    BrowserModule,
    HttpClientModule,
    HttpModule,
    SharedModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    AppRouting
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
    LoginComponent,
    RegisterComponent
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},

    {provide: 'BASE_URL', useValue: 'http://localhost:8000/'}

    // provider used to create fake backend
    // fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
