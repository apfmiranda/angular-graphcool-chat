import { UserService } from 'src/app/core/services/user.service';
import { GraphQLModule } from './../../graphql.module';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, throwError, of } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { tap, map, catchError, mergeMap, take } from 'rxjs/operators';
import { Base64 } from 'js-base64';

import { AUTHENTICATE_USER_MUTATION, SIGNUP_USER_MUTATION, LoggedInUserQuery, LOGGED_IN_USER_QUERY } from './auth.graphql';
import { StorageKeys } from './../../storage-keys';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  authUser: User;
  redirectUrl: string;
  keepSigned: boolean;
  rememberMe: boolean;
  private _isAuthenticated = new ReplaySubject<boolean>(1);

  constructor(
    private apollo: Apollo,
    private graphQLModule: GraphQLModule,
    private router: Router,
    private userService: UserService
  ) {
    this.isAuthenticated.subscribe();
    this.init();
  }

  init(): void {
    this.keepSigned = JSON.parse(localStorage.getItem(StorageKeys.KEEP_SIGNED));
    this.rememberMe = JSON.parse(window.localStorage.getItem(StorageKeys.REMEMBER_ME));
  }

  get isAuthenticated(): Observable<boolean> {
    return this._isAuthenticated.asObservable();
  }

  signinUser(variables: {email: string, password: string}): Observable<{id: string, token: string}> {
    return this.apollo.mutate({
      mutation: AUTHENTICATE_USER_MUTATION,
      variables
    }).pipe(
      map(res => res.data.authenticateUser),
      tap(res => this.setAuthState({id: res && res.id, token: res && res.token, isAuthenticated: res != null })),
      catchError(err => {
        this.setAuthState({id: null, token: null, isAuthenticated: false});
        return throwError(err);
      })
    );
  }

  signupUser(variables: {name: string, email: string, password: string}): Observable<{id: string, token: string}> {
    return this.apollo.mutate({
      mutation: SIGNUP_USER_MUTATION,
      variables
    }).pipe(
      map(res => res.data.authenticateUser),
      tap(res => this.setAuthState({ id: res && res.id, token: res && res.token, isAuthenticated: res != null })),
      catchError(err => {
        this.setAuthState({ id: null, token: null, isAuthenticated: false });
        return throwError(err);
      })
    );
  }

  autoLogin(): Observable<void> {
    if (!this.keepSigned) {
      this.logout();
      return of();
    }

    return this.validateToken()
      .pipe(
        tap(authData => {
          const token = localStorage.getItem(StorageKeys.AUTH_TOKEN);
          this.setAuthState({ id: authData && authData.id, token, isAuthenticated: authData.isAuthenticated}, true);
        }),
        mergeMap(res => of()),
        catchError(error => {
          this.setAuthState({id: null, token: null, isAuthenticated: false});
          return throwError(error);
        })
      );
  }

  private validateToken(): Observable<{id: string, isAuthenticated: boolean}> {
    return this.apollo.query<LoggedInUserQuery>({
      query: LOGGED_IN_USER_QUERY,
      fetchPolicy: 'network-only'
    }).pipe(
      map(res => {
        const user = res.data.loggedInUser;
        return {
          id: user && user.id,
          isAuthenticated: user != null
        };
      }),
      mergeMap(authData => (authData.isAuthenticated) ? of(authData) : throwError('Token Inválido'))
    );
  }

  toggleKeepSigned(): void {
    this.keepSigned = !this.keepSigned;
    localStorage.setItem(StorageKeys.KEEP_SIGNED, this.keepSigned.toString());
  }

  toggleRememberMe(): void {
    this.rememberMe = !this.rememberMe;
    window.localStorage.setItem(StorageKeys.REMEMBER_ME, this.rememberMe.toString());
    if (!this.rememberMe) {
      window.localStorage.removeItem(StorageKeys.USER_EMAIL);
      window.localStorage.removeItem(StorageKeys.USER_PASSWORD);
    }
  }

  setRememberMe(user: { email: string, password: string }): void {
    if (this.rememberMe) {
      window.localStorage.setItem(StorageKeys.USER_EMAIL, Base64.encode(user.email));
      window.localStorage.setItem(StorageKeys.USER_PASSWORD, Base64.encode(user.password));
    }
  }

  getRememberMe(): { email: string, password: string } {
    if (!this.rememberMe) { return null; }

    const email = localStorage.getItem(StorageKeys.USER_EMAIL);
    const password = localStorage.getItem(StorageKeys.USER_PASSWORD);

    return {
      email: (email) ? Base64.decode(email) : '',
      password: (password) ? Base64.decode(password) : ''
    };
  }

  logout(): void {
    localStorage.removeItem(StorageKeys.AUTH_TOKEN);
    localStorage.removeItem(StorageKeys.KEEP_SIGNED);
    this.keepSigned = false;
    this.graphQLModule.closeSocketConnect();
    this.graphQLModule.cachePersistor.purge();
    this._isAuthenticated.next(false);
    this.apollo.getClient().resetStore();
    this.router.navigate(['/login']);
  }

  private setAuthUser(userId: string): Observable<User> {
    return this.userService.getUserById(userId)
      .pipe(
        take(1),
        tap((user: User) => this.authUser = user)
      );
  }

  private setAuthState(authData: { id: string, token: string, isAuthenticated: boolean}, isRefresh: boolean = false): void {
    if (authData.isAuthenticated) {
      localStorage.setItem(StorageKeys.AUTH_TOKEN, authData.token);
      this.setAuthUser(authData.id)
        .pipe(
          take(1),
          tap(() => this._isAuthenticated.next(authData.isAuthenticated))
        ).subscribe();
      if (!isRefresh) {
        this.graphQLModule.closeSocketConnect();
      }
    }
    this._isAuthenticated.next(authData.isAuthenticated);
  }
}
