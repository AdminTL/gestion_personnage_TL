import {Routes, RouterModule} from '@angular/router';

import {environment} from '@environments/environment';

import {HomeComponent} from './home';
import {LoginComponent} from './login';
import {RegisterComponent} from './register';
import {NotFoundComponent} from './not-found';
import {ManualComponent} from './manual';

import {CharacterFrameComponent} from './character/character-frame.component';
import {CharacterFormComponent} from './character/form/character-form.component';
import {CharacterFormSectionComponent} from './character/form/character-form-section.component';
import {CharacterAttributesComponent} from './character/attributes/character-attributes.component';
import {CharacterMessagesComponent} from './character/messages/character-messages.component';
import {CharacterResourcesComponent} from './character/resources/character-resources.component';
import {CharacterSkillsComponent} from './character/skills/character-skills.component';
import {CharacterHeaderComponent} from './character/header/character-header.component';

// import {AuthGuard} from './_guards';


const appRoutes: Routes = [
  // { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  // {path: '', component: HomeComponent},
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
  {path: 'manual', component: ManualComponent},
  {path: 'manual/:documentName', component: ManualComponent},
  // otherwise redirect to home
  // { path: '**', redirectTo: '' }
  {path: '**', component: NotFoundComponent}
];

export const AppRouting = RouterModule.forRoot(appRoutes, {enableTracing: environment.enableRouteTracing});
