import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule, Routes } from '@angular/router';

import { TabMenuModule } from 'primeng/primeng';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CharacterComponent } from './character/character.component';
import { LoreComponent } from './lore/lore.component';
import { ManualComponent } from './manual/manual.component';
import { NotFoundComponent } from './not-found/not-found.component';
import { HeaderComponent } from './header/header.component';

const appRoutes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'lore', component: LoreComponent },
  { path: 'character', component: CharacterComponent },
  { path: 'manual', component: ManualComponent },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CharacterComponent,
    LoreComponent,
    ManualComponent,
    NotFoundComponent,
    HeaderComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    RouterModule.forRoot(appRoutes),

    TabMenuModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
