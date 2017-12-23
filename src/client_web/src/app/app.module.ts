import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';


import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CharacterComponent } from './character/character.component';
import { LoreComponent } from './lore/lore.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    CharacterComponent,
    LoreComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
