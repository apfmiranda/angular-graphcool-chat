import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from '../models/user.model';
import {
  AllUsersQuery,
  ALL_USERS_QUERY,
  GET_USER_BY_ID_QUERY,
  NEW_USERS_SUBSCRIPTON,
  UserQuery,
  UPDATE_USER_MUTATION} from './user.graphql';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users$: Observable<User[]>;
  private queryRef: QueryRef<AllUsersQuery>;
  private userSubscription: Subscription;

  constructor(
    private apollo: Apollo,
  ) { }

  startUsersMonitoring(idToExclude: string): void {
    if (!this.users$) {
      this.users$ = this.allUsers(idToExclude);
      this.userSubscription = this.users$.subscribe();
    }
  }

  stopUsersMonitoring() {
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
      this.userSubscription = null;
      this.users$ = null;
    }
  }

  allUsers(idToExclude: string): Observable<User[]> {

    this.queryRef =  this.apollo
      .watchQuery<AllUsersQuery>({
        query: ALL_USERS_QUERY,
        variables: { idToExclude },
        fetchPolicy: 'network-only'
      });

    this.queryRef.subscribeToMore({
      document: NEW_USERS_SUBSCRIPTON,
      updateQuery: (previous: AllUsersQuery, {subscriptionData}): AllUsersQuery => {

        const newUser: User = (subscriptionData.data as any).User.node;
        return {
          ...previous,
          allUsers: ([ newUser, ...previous.allUsers ]).sort((uA, uB) => {
            if (uA.name < uB.name) { return -1; }
            if (uA.name > uB.name) { return 1; }
            return 0;
          })
        };

      }
    });

    return this.queryRef.valueChanges
      .pipe(
        map(res => res.data.allUsers)
      );
  }

  getUserById(userId: string): Observable<User>  {
    return this.apollo
      .query<UserQuery>({
        query: GET_USER_BY_ID_QUERY,
        variables: { userId }
      }).pipe(
        map(res => res.data.User)
      );
  }

  updateUser(user: User): Observable<User> {
    return this.apollo
    .mutate({
      mutation: UPDATE_USER_MUTATION,
      variables: {userId: user.id, name: user.name, email: user.email}
    }).pipe(
      map(res => res.data.updateUser)
    );
  }

}
