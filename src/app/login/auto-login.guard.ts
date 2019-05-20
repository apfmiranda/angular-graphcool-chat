import { AuthService } from './../core/services/auth.service';
import { Observable, of } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';

@Injectable()
export class AutoLoginGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return of(true);
    return this.authService.isAuthenticated
      .pipe(
        tap(isAuthenticated => (isAuthenticated) ? this.router.navigate(['/dashboard']) : null),
        // Se estiver autenticado(true) retorna false e não navega para rota da guarda
        map(isAuthenticated => !isAuthenticated)
      );
  }
}
