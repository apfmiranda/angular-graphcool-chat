import { Apollo } from 'apollo-angular';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';

import { AllChatsQuery, USER_CHATS_QUERY, ChatQuery, CHAT_BY_ID_OR_BY_USERS_QUERY } from './chat.graphql';
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

}
