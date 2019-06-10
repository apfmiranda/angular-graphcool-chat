import { User } from './../../core/models/user.model';
import { BaseService } from 'src/app/core/services/base.service';
import { AuthService } from './../../core/services/auth.service';
import { AllChatsQuery, USER_CHATS_QUERY } from './chat.graphql';
import { Message } from './../models/message.model';
import { GET_CHAT_MESSAGES_QUERY, AllMessagesQuery, CREATE_MESSAGE_MUTATION } from './message.graphql';
import { Apollo } from 'apollo-angular';
import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { DataProxy } from 'apollo-cache';

@Injectable({
  providedIn: 'root'
})
export class MessageService extends BaseService {

  constructor(
    private apollo: Apollo,
    private authService: AuthService
  ) {
    super();
  }

  getChatMessages(chatId: string): Observable<Message[]> {
    return this.apollo
      .watchQuery<AllMessagesQuery>({
        query: GET_CHAT_MESSAGES_QUERY,
        variables: { chatId },
        fetchPolicy: 'network-only'
      }).valueChanges
      .pipe(
        map(res => res.data.allMessages),
        map(messages => messages.map(m => {
          const message = Object.assign({}, m);
          message.sender = new User(message.sender);
          return message;
        }))
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
            name: 'you',
            email: '',
            createdAt: '',
            photo: {
              __typename: 'File',
              id: '',
              secret: this.authService.authUser.photo && this.authService.authUser.photo.secret || ''
            }
          },
          chat: {
            __typename: 'Chat',
            id: message.chatId
          },
        },
      },
      update: (store: DataProxy, {data: {createMessage}}) => {

        this.readAndWriteQueryInApolloCache<Message>({
          store,
          newRecord: createMessage,
          query: GET_CHAT_MESSAGES_QUERY,
          queryName: 'allMessages',
          arrayOperation: 'push',
          variables: { chatId: message.chatId }
        });


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

