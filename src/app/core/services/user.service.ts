import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { User } from '../models/user.model';
import { ALL_USERS_QUERY, AllUsersQuery, UserQuery, GET_USER_BY_ID_QUERY } from './user.graphql';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
    private apollo: Apollo
  ) { }

  allUsers(idToExclude: string): Observable<User[]> {
    return this.apollo
      .query<AllUsersQuery>({
        query: ALL_USERS_QUERY,
        variables: { idToExclude }
      }).pipe(
        map(res => res.data.allUsers)
      );
  }

  getUserById(userId: string) {
    return this.apollo
      .query<UserQuery>({
        query: GET_USER_BY_ID_QUERY,
        variables: { userId }
      }).pipe(
        map(res => res.data.User)
      );
  }

}
