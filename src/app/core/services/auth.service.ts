import { StorageKeys } from './../../storage-keys';
import { AUTHENTICATE_USER_MUTATION, SIGNUP_USER_MUTATION, LoggedInUserQuery, LOGGED_IN_USER_QUERY } from './auth.graphql';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  redirectUrl: string;
  keepSigned: boolean;
  private _isAuthenticated = new ReplaySubject<boolean>(1);

  constructor(private apollo: Apollo) {
    this.isAuthenticated.subscribe(is => console.log(is));
    this.init();
    this.validateToken()
      .subscribe(
        res => console.log('Res:', res),
        err => console.log('Err:', err)
      );
  }

  init(): void {
    this.keepSigned = JSON.parse(localStorage.getItem(StorageKeys.KEEP_SIGNED));
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
      tap(res => this.setAuthState({token: res && res.token, isAuthenticated: res != null})),
      catchError(err => {
        this.setAuthState({token: null, isAuthenticated: false});
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
      tap(res => this.setAuthState({token: res && res.token, isAuthenticated: res != null})),
      catchError(err => {
        this.setAuthState({token: null, isAuthenticated: false});
        return throwError(err);
      })
    );
  }

  validateToken(): Observable<{id: string, isAuthenticated: boolean}> {
    return this.apollo.query<LoggedInUserQuery>({
      query: LOGGED_IN_USER_QUERY
    }).pipe(
      map(res => {
        const user = res.data.loggedInUser;
        return {
          id: user && user.id,
          isAuthenticated: user != null
        };
      })
    );
  }

  toggleKeepSigned(): void {
    this.keepSigned = !this.keepSigned;
    localStorage.setItem(StorageKeys.KEEP_SIGNED, this.keepSigned.toString());
  }

  private setAuthState(authData: { token: string, isAuthenticated: boolean}): void {
    if (authData.isAuthenticated) {
      localStorage.setItem(StorageKeys.AUTH_TOKEN, authData.token);
    }
    this._isAuthenticated.next(authData.isAuthenticated);
  }
}
