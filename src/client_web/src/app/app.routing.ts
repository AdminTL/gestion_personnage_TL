import {Routes, RouterModule} from '@angular/router';

import {HomeComponent} from './home';
import {LoginComponent} from './login';
import {RegisterComponent} from './register';
import {NotFoundComponent} from './not-found';
import {AuthGuard} from './_guards';

const appRoutes: Routes = [
  // { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},

  // otherwise redirect to home
  // { path: '**', redirectTo: '' }
  {path: '**', component: NotFoundComponent}
];

export const AppRoutingModule = RouterModule.forRoot(appRoutes);
