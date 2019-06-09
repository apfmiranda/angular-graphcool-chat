import { FileModel } from './../models/file.model';
import { FileService } from './file.service';
import { Injectable } from '@angular/core';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { map, mergeMap } from 'rxjs/operators';
import { User } from '../models/user.model';
import {
  AllUsersQuery,
  ALL_USERS_QUERY,
  GET_USER_BY_ID_QUERY,
  USERS_SUBSCRIPTON,
  UserQuery,
  UPDATE_USER_MUTATION,
  getUpdateUserPhotoMutation} from './user.graphql';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  users$: Observable<User[]>;
  private queryRef: QueryRef<AllUsersQuery>;
  private userSubscription: Subscription;

  constructor(
    private apollo: Apollo,
    private fileService: FileService
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
      document: USERS_SUBSCRIPTON,
      updateQuery: (previous: AllUsersQuery, {subscriptionData}): AllUsersQuery => {

        const subscriptionUser: User = (subscriptionData.data as any).User.node;
        const newAllUsers: User[] = [...previous.allUsers];


        switch ((subscriptionData.data as any).User.mutation) {
          case 'CREATED':
            newAllUsers.unshift(subscriptionUser);
            break;
          case 'UPDATED':
            const userToUpdateIndex: number = newAllUsers.findIndex(u => u.id === subscriptionUser.id);
            if (userToUpdateIndex > -1) {
              newAllUsers[userToUpdateIndex] = subscriptionUser;
            }
            break;
        }

        return {
          ...previous,
          allUsers: newAllUsers.sort((uA, uB) => {
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

  updateUserFile(file: File, user: User): Observable<User> {
    return this.fileService.upload(file)
      .pipe(
        mergeMap((newPhoto: FileModel) => {
          return this.apollo.mutate({
            mutation: getUpdateUserPhotoMutation(!!user.photo),
            variables: {
              loggedUserId: user.id,
              newPhotoId: newPhoto.id,
              oldPhotoId: (user.photo) ? user.photo.id : null
            }
          }).pipe(
            map(res => res.data.updateUser)
          );
        })
      );
  }

}
