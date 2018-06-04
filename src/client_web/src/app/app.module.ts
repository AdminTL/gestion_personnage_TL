import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { TabMenuModule } from 'primeng/primeng';

import { AppComponent } from './app/app.component';
import { NavMenuComponent } from './navmenu/navmenu.component';
import { HomeComponent } from './home/home.component';
import { CharacterFrameComponent } from './character/frame/characterframe.component';
import { CharacterFormComponent } from './character/form/characterform.component';
import { LoreComponent } from './lore/lore.component';
import { ManualComponent } from './manual/manual.component';
import { DynamicSectionComponent } from './dynamicsection/dynamicsection.component';

@NgModule({
    declarations: [
        AppComponent,
        NavMenuComponent,
        CharacterFrameComponent,
        CharacterFormComponent,
        HomeComponent,
        LoreComponent,
        DynamicSectionComponent,
        ManualComponent
    ],
    imports: [
        CommonModule,
        HttpModule,
        FormsModule,
        RouterModule.forRoot([
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', component: HomeComponent },
            { path: 'character', component: CharacterFrameComponent },
            { path: 'lore', component: LoreComponent },
            { path: 'manual', component: ManualComponent },
            { path: '**', component: NotFoundComponent}
        ]),
        SkillTreeModule
    ]
})
export class AppModule { }
