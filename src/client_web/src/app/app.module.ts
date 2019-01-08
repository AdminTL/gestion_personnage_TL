import {BrowserModule} from '@angular/platform-browser';
import {NgModule, Compiler} from '@angular/core';
import {HttpClientModule, HTTP_INTERCEPTORS} from '@angular/common/http';
import {HttpModule} from '@angular/http';
import {FormsModule} from '@angular/forms';
import {ReactiveFormsModule} from '@angular/forms';
import {NgbModule} from '@ng-bootstrap/ng-bootstrap';

import {environment} from '@environments/environment';

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
import {HomeComponent} from './home/home.component';
import {JwtInterceptor, ErrorInterceptor} from './_helpers';
import {ManualComponent} from './manual/manual.component';
import {DynamicSectionComponent} from './dynamic-section/dynamic-section.component';
import {LarpemEditorComponent} from './larpem-editor/larpem-editor.component';
import {LarpemSettingComponent} from './larpem-setting/larpem-setting.component';
import {UserProfileComponent} from './user-profile/user-profile.component';
import {UserSettingComponent} from './user-setting/user-setting.component';
import {NotFoundComponent} from './not-found/not-found.component';
import {LoginComponent} from './login/login.component';
import {SocialLoginComponent} from './social-login/social-login.component';
import {RegisterComponent} from './register/register.component';
import {SharedModule} from './shared';

@NgModule({
  imports: [
    HttpClientModule,
    HttpModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserModule,
    SharedModule,
    AppRouting,
    NgbModule
  ],
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
    DynamicSectionComponent,
    LarpemEditorComponent,
    LarpemSettingComponent,
    UserProfileComponent,
    UserSettingComponent,
    ManualComponent,
    NotFoundComponent,
    AppComponent,
    AlertComponent,
    LoginComponent,
    SocialLoginComponent,
    RegisterComponent,
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true},
    {provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(private compiler: Compiler) {
    if (environment.clearCacheOnInit) {
      compiler.clearCache();
    }
  }
}
