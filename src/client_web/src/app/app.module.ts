import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {ReactiveFormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

import {CharacterFrameComponent} from './character/character-frame.component';
import {CharacterFormComponent} from './character/form/character-form.component';
import {CharacterFormSectionComponent} from './character/form/character-form-section.component';
import {CharacterAttributesComponent} from './character/attributes/character-attributes.component';
import {CharacterMessagesComponent} from './character/messages/character-messages.component';
import {CharacterResourcesComponent} from './character/resources/character-resources.component';
import {CharacterSkillsComponent} from './character/skills/character-skills.component';
import {CharacterHeaderComponent} from './character/header/character-header.component';

import {AlertComponent} from './_components';
import {JwtInterceptor, ErrorInterceptor} from './_helpers';

import {AppComponent} from './app.component';
import {HomeComponent} from './home/home.component';
import {LoreComponent} from './lore/lore.component';
import {ManualComponent} from './manual/manual.component';
import {DynamicSectionComponent} from './dynamic-section/dynamic-section.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {LoginComponent} from './login/login.component';
import {RegisterComponent} from './register';
import {SharedModule} from './shared';

@NgModule({
  declarations: [
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
    DynamicSectionComponent,
    ManualComponent,
    NotFoundComponent,
    AppComponent,
    RegisterComponent,
    AlertComponent,
    LoginComponent
  ],
  imports: [
    HttpClientModule,
    ReactiveFormsModule,
    BrowserModule,
    SharedModule,
    BrowserAnimationsModule,
    RouterModule.forRoot([
      {path: '', redirectTo: '/home', pathMatch: 'full'},
      {path: 'home', component: HomeComponent},
      {path: 'character', redirectTo: '/character/form', pathMatch: 'full'},
      {
        path: 'character', component: CharacterFrameComponent, children: [
          {path: 'form', component: CharacterFormComponent},
          {path: 'attributes', component: CharacterAttributesComponent},
          {path: 'skills', component: CharacterSkillsComponent},
          {path: 'resources', component: CharacterResourcesComponent},
          {path: 'messages', component: CharacterMessagesComponent}
        ]
      },
      {path: 'lore', component: LoreComponent},
      {path: 'manual', component: ManualComponent},
      {path: 'login', component: LoginComponent},
      {path: '**', component: NotFoundComponent}
    ]),
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
    {provide: 'BASE_URL', useValue: 'http://localhost:8000/'},
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
