import { AuthService } from './../../core/services/auth.service';
import { AllChatsQuery, USER_CHATS_QUERY } from './chat.graphql';
import { Message } from './../models/message.model';
import { GET_CHAT_MESSAGES_QUERY, AllMessageQuery, CREATE_MESSAGE_MUTATION } from './message.graphql';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DataProxy } from 'apollo-cache';

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private apollo: Apollo,
    private authService: AuthService
  ) { }

  getChatMessages(chatId: string): Observable<Message[]> {
    return this.apollo
      .watchQuery<AllMessageQuery>({
        query: GET_CHAT_MESSAGES_QUERY,
        variables: { chatId }
      }).valueChanges
      .pipe(
        map(res => res.data.allMessages)
      );
  }

  createMessage(message: {text: string, chatId: string, senderId: string}): Observable<Message> {
    return this.apollo.mutate({
      mutation: CREATE_MESSAGE_MUTATION,
      variables: message,
      optimisticResponse: {
        __typename: 'Mutation',
        createMessage: {
          __typename: 'Message',
          id: '',
          text: message.text,
          createdAt: new Date().toISOString,
          sender: {
            __typename: 'User',
            id: message.senderId,
            name: '',
            email: '',
            createdAt: ''
          },
          chat: {
            __typename: 'Chat',
            id: message.chatId
          },
        },
      },
      update: (store: DataProxy, {data: {createMessage}}) => {
        try {
          // lendo query
          const data = store.readQuery<AllMessageQuery>({
            query: GET_CHAT_MESSAGES_QUERY,
            variables: { chatId: message.chatId }
          });
          // alterando query, colocando um novo item na lista
          data.allMessages = [...data.allMessages, createMessage];
          // colocando a nova lista no cache
          store.writeQuery({
            query: GET_CHAT_MESSAGES_QUERY,
            variables: { chatId: message.chatId },
            data
          });
        } catch (error) {
          console.log('allMessageQuery not found');
        }

        try {

          const userChatVariables = { loggedUserId: this.authService.authUser.id };

          const userChatsData = store.readQuery<AllChatsQuery>({
            query: USER_CHATS_QUERY,
            variables: userChatVariables
          });

          const newUserChatsList = [...userChatsData.allChats];

          newUserChatsList.map(c => {
            if (c.id === createMessage.chat.id) {
              c.messages = [createMessage];
            }
            return c;
          });

          userChatsData.allChats = newUserChatsList;

          store.writeQuery<AllChatsQuery>({
            query: USER_CHATS_QUERY,
            variables: userChatVariables,
            data: userChatsData
          });

        } catch (error) {
          console.log('allChatsQuery not found');
        }

      }

    }).pipe(
      map(res => res.data.createMessage)
    );
  }
}

