import {Routes, RouterModule} from '@angular/router';

import {environment} from '@environments/environment';

import {AdminHomeComponent} from './admin-home';
import {HomeComponent} from './home';
import {LoginComponent} from './login';
import {RegisterComponent} from './register';
import {NotFoundComponent} from './not-found';
import {ManualComponent} from './manual';
import {UserProfileComponent} from './user-profile';
import {UserSettingComponent} from './user-setting';
import {AdminEditorComponent} from './admin-editor';
import {AdminSettingComponent} from './admin-setting';

import {CharacterFrameComponent} from './character/character-frame.component';
import {CharacterFormComponent} from './character/form/character-form.component';
import {CharacterFormSectionComponent} from './character/form/character-form-section.component';
import {CharacterAttributesComponent} from './character/attributes/character-attributes.component';
import {CharacterMessagesComponent} from './character/messages/character-messages.component';
import {CharacterResourcesComponent} from './character/resources/character-resources.component';
import {CharacterSkillsComponent} from './character/skills/character-skills.component';
import {CharacterHeaderComponent} from './character/header/character-header.component';
import { LoggedOutCharacterComponent } from './logged-out-character/logged-out-character.component';

// import {AuthGuard} from './_guards';


const appRoutes: Routes = [
  // { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  {path: '', redirectTo: '/home', pathMatch: 'full'},
  // {path: '', component: HomeComponent},
  {path: 'home', component: HomeComponent},
  {path: 'user/profile', component: UserProfileComponent},
  {path: 'user/setting', component: UserSettingComponent},
  {path: 'admin/home', component: AdminHomeComponent},
  {path: 'admin/editor', component: AdminEditorComponent},
  {path: 'admin/setting', component: AdminSettingComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'character', redirectTo: '/character/form', pathMatch: 'full'},
  {
    path: 'character', component: CharacterFrameComponent, children: [
      {path: 'form', component: CharacterFormComponent},
      {path: 'attributes', component: CharacterAttributesComponent},
      {path: 'skills', component: CharacterSkillsComponent},
      {path: 'resources', component: CharacterResourcesComponent},
      {path: 'messages', component: CharacterMessagesComponent},
    ]
  },
  {path: 'newcharacter', component: LoggedOutCharacterComponent},
  {path: 'manual', component: ManualComponent},
  {path: 'manual/:documentName', component: ManualComponent},
  // otherwise redirect to home
  // { path: '**', redirectTo: '' }
  {path: '**', component: NotFoundComponent}
];

export const AppRouting = RouterModule.forRoot(appRoutes, {enableTracing: environment.enableRouteTracing});
