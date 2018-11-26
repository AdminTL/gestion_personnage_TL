import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';

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
// import {Routing} from './app.routing';

import {NavMenuComponent} from './nav-menu';
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

const appRoutes: Routes = [
  // { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  {path: 'home', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
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
  // otherwise redirect to home
  // { path: '**', redirectTo: '' }
  {path: '**', component: NotFoundComponent}
];

@NgModule({
  imports: [
    FormsModule,
    BrowserModule,
    SharedModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes, { enableTracing: true })
    // Routing
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
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},

    { provide: 'BASE_URL', useValue: 'http://localhost:8000/' }

    // provider used to create fake backend
    // fakeBackendProvider
  ],
  bootstrap: [AppComponent]
})

export class AppModule {
}
