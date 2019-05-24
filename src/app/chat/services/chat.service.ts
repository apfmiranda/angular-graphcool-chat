import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { AllChatsQuery, USER_CHATS_QUERY, ChatQuery, CHAT_BY_ID_OR_BY_USERS_QUERY, CREATE_PRIVATE_CHAT_MUTATION } from './chat.graphql';
import { Chat } from '../models/chat.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {

  constructor(
    private apollo: Apollo
  ) { }

  getUserChats(userId: string): Observable<Chat[]> {
    return this.apollo
      .query<AllChatsQuery>({
        query: USER_CHATS_QUERY,
        variables: {
          userId
        }
      }).pipe(
        map(res => res.data.allChats)
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
        variables: {loggedUserId, targetUserId}
      }).pipe(
        map(res => res.data.createChat)
      );
  }

}
