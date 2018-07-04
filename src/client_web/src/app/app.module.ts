import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { HttpModule } from '@angular/http';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms'

import {MenubarModule} from 'primeng/menubar';

import { CharacterFrameComponent } from './character/character-frame.component';
import { CharacterFormComponent } from './character/form/character-form.component';
import { CharacterAttributesComponent } from './character/attributes/character-attributes.component';
import { CharacterMessagesComponent } from './character/messages/character-messages.component';
import { CharacterResourcesComponent } from './character/resources/character-resources.component';
import { CharacterSkillsComponent } from './character/skills/character-skills.component';
import { CharacterHeaderComponent } from './character/header/character-header.component';

import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { HomeComponent } from './home/home.component';
import { LoreComponent } from './lore/lore.component';
import { ManualComponent } from './manual/manual.component';
import { DynamicSectionComponent } from './dynamic-section/dynamic-section.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { AppComponent } from './app.component';

@NgModule({
    declarations: [
        CharacterFrameComponent,
        CharacterFormComponent,
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
        NavMenuComponent,
        AppComponent
    ],
    imports: [
        CommonModule,
        HttpClientModule,
        HttpModule,
        FormsModule,
        BrowserModule,
        MenubarModule,
        RouterModule.forRoot([
            { path: '', redirectTo: '/home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'character', redirectTo: '/character/form', pathMatch: 'full'},
            { path: 'character', component: CharacterFrameComponent, children:[
                { path: 'form', component: CharacterFormComponent },
                { path: 'attributes', component: CharacterAttributesComponent },
                { path: 'skills', component: CharacterSkillsComponent },
                { path: 'resources', component: CharacterResourcesComponent },
                { path: 'messages', component: CharacterMessagesComponent }
            ]},
            { path: 'lore', component: LoreComponent },
            { path: 'manual', component: ManualComponent },
            { path: '**', component: NotFoundComponent}
        ]),
    ],
    providers: [
      { provide: 'BASE_URL', useValue: 'http://localhost:8000/' }
    ],
    bootstrap: [ AppComponent ]
})
export class AppModule { }
