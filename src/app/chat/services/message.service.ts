import { Message } from './../models/message.model';
import { GET_CHAT_MESSAGES_QUERY, AllMessageQuery } from './message.graphql';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private apollo: Apollo
  ) { }

  getChatMessages(chatId: string): Observable<Message[]> {
    return this.apollo
      .query<AllMessageQuery>({
        query: GET_CHAT_MESSAGES_QUERY,
        variables: { chatId }
      }).pipe(
        map(res => res.data.allMessages)
      );
  }
}
