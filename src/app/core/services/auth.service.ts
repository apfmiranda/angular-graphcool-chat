import { StorageKeys } from './../../storage-keys';
import { AUTHENTICATE_USER_MUTATION, SIGNUP_USER_MUTATION } from './auth.graphql';
import { Injectable } from '@angular/core';
import { Observable, ReplaySubject, throwError } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { tap, map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  redirectUrl: string;
  private _isAuthenticated = new ReplaySubject<boolean>(1);

  constructor(private apollo: Apollo) {
    this.isAuthenticated.subscribe(is => console.log(is));
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

  private setAuthState(authData: { token: string, isAuthenticated: boolean}): void {
    if (authData.isAuthenticated) {
      localStorage.setItem(StorageKeys.AUTH_TOKEN, authData.token);
    }
    this._isAuthenticated.next(authData.isAuthenticated);
  }
}
