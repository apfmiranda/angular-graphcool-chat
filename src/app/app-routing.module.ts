import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NotFoundComponent } from './core/components/not-found/not-found.component';
import { AuthenticatedPreloadingStrategy } from './core/strategy/authenticated-preloading.strategy';
import { AuthGuard } from './login/auth.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    loadChildren: './dashboard/dashboard.module#DashboardModule',
    canActivate: [ AuthGuard ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: AuthenticatedPreloadingStrategy
    })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
