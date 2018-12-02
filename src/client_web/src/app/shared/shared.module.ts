import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
// import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import {
  MatButtonModule,
  MatBadgeModule,
  MatCheckboxModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatListModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  MatSelectModule,
  MatSidenavModule,
  MatSnackBarModule,
  MatTooltipModule,
} from '@angular/material';
import {MatToolbarModule} from '@angular/material/toolbar';
import {FlexLayoutModule} from '@angular/flex-layout';

import {AccordionModule} from 'primeng/accordion';

import {PanelModule} from 'primeng/panel';

// Icon
import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';
import {library} from '@fortawesome/fontawesome-svg-core';
import {fas} from '@fortawesome/free-solid-svg-icons';
import {fab} from '@fortawesome/free-brands-svg-icons';
import {far} from '@fortawesome/free-regular-svg-icons';

library.add(fas, fab, far);

@NgModule({
  imports: [
    CommonModule,

    AccordionModule,

    FlexLayoutModule,

    FontAwesomeModule,

    MatButtonModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTooltipModule,

    MatToolbarModule,

    NoopAnimationsModule,
    // BrowserAnimationsModule,

    PanelModule,
  ],
  exports: [
    CommonModule,

    AccordionModule,

    FlexLayoutModule,

    FontAwesomeModule,

    MatButtonModule,
    MatBadgeModule,
    MatCheckboxModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatSidenavModule,
    MatSnackBarModule,
    MatTooltipModule,

    MatToolbarModule,

    NoopAnimationsModule,
    // BrowserAnimationsModule,

    PanelModule,
  ],
})
export class SharedModule {
}
