import { AUTHENTICATE_USER_MUTATION } from './auth.graphql';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private apollo: Apollo) {
    this.signinUser({email: 'deadpool@gmail.com', password: '123456'})
    .subscribe(response => console.log(response));
   }

  signinUser(variables: {email: string, password: string}): Observable<{id: string, token: string}> {
    return this.apollo.mutate({
      mutation: AUTHENTICATE_USER_MUTATION,
      variables
    });

  }
}
