import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatIconModule,
  MatMenuModule,
  MatSidenavModule,
  MatExpansionModule,
  MatListModule,
  MatSelectModule,
  MatInputModule,
  MatFormFieldModule,
  MatTooltipModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
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

    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatExpansionModule,
    MatListModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,

    FlexLayoutModule,

    AccordionModule,
    PanelModule,

    FontAwesomeModule,
  ],
  exports: [
    CommonModule,

    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatIconModule,
    MatMenuModule,
    MatSidenavModule,
    MatExpansionModule,
    MatListModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatProgressSpinnerModule,

    FlexLayoutModule,

    AccordionModule,
    PanelModule,

    FontAwesomeModule,
  ],
})
export class SharedModule {
}
