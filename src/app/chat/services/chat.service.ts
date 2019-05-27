import { AuthService } from './../../core/services/auth.service';
import { DataProxy } from 'apollo-cache';
import { Apollo } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { AllChatsQuery, USER_CHATS_QUERY, ChatQuery, CHAT_BY_ID_OR_BY_USERS_QUERY, CREATE_PRIVATE_CHAT_MUTATION } from './chat.graphql';
import { Chat } from '../models/chat.model';
import { Router, RouterEvent, NavigationEnd } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  chats$: Observable<Chat[]>;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private apollo: Apollo,
    private authService: AuthService
  ) { }

  startChatsMonitoring(): void {
    this.chats$ = this.getUserChats(this.authService.authUser.id);
    this.subscriptions.push(this.chats$.subscribe());
    this.router.events.subscribe((event: RouterEvent) => {
      if (event instanceof NavigationEnd && !this.router.url.includes('chat')) {
        this.onDestroy();
      }
    });
  }

  getUserChats(userId: string): Observable<Chat[]> {
    return this.apollo.watchQuery<AllChatsQuery>({
        query: USER_CHATS_QUERY,
        variables: {
          loggedUserId: userId
        }
      }).valueChanges
        .pipe(
          map(res => res.data.allChats),
          map((chats: Chat[]) => {
            const chatsToSort = chats.slice();
            return chatsToSort.sort((a, b) => {
              const valueA = (a.messages.length > 0)
                ? new Date(a.messages[0].createdAt).getTime()
                : new Date(a.createdAt).getTime();

              const valueB = (b.messages.length > 0)
                ? new Date(b.messages[0].createdAt).getTime()
                : new Date(b.createdAt).getTime();

              return valueB - valueA;
            });
          })
        );
  }

  getChatByIdOrUsers(chatOrUserId: string, loggedUserId: string): Observable<Chat> {
    return this.apollo.query<ChatQuery | AllChatsQuery>({
      query: CHAT_BY_ID_OR_BY_USERS_QUERY,
      variables: {
        chatId: chatOrUserId,
        targetUserId: chatOrUserId,
        loggedUserId
      }
    }).pipe(
      map(res =>  ((res.data as ChatQuery).Chat) ?
        (res.data as ChatQuery).Chat :
        (res.data as AllChatsQuery).allChats[0])
    );
  }

  createPriveChat(loggedUserId: string, targetUserId: string): Observable<Chat>  {
    return this.apollo
      .mutate({
        mutation: CREATE_PRIVATE_CHAT_MUTATION,
        variables: {loggedUserId, targetUserId},
        update: (store: DataProxy, {data: {createChat}}) => {
          // atualizando lista de chats de usuario logado
          const userChatsVariables = {loggedUserId};
          const userChatsData = store.readQuery<AllChatsQuery>({
            query: USER_CHATS_QUERY,
            variables: userChatsVariables
          });
          userChatsData.allChats = [createChat, ...userChatsData.allChats];
          store.writeQuery<AllChatsQuery>({
            query: USER_CHATS_QUERY,
            variables: userChatsVariables,
            data: userChatsData
          });

          const variables = {
            chatId: targetUserId,
            loggedUserId,
            targetUserId
          };
          const data = store.readQuery<AllChatsQuery>({
            query: CHAT_BY_ID_OR_BY_USERS_QUERY,
            variables
          });
          data.allChats = [createChat];
          store.writeQuery<AllChatsQuery>({
            query: CHAT_BY_ID_OR_BY_USERS_QUERY,
            variables,
            data
          });

        }
      }).pipe(
        map(res => res.data.createChat)
      );
  }

  private onDestroy(): void {
    this.subscriptions.forEach(s => s.unsubscribe());
    this.subscriptions = [];
  }

}
