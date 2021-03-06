import { User } from './../../core/models/user.model';
import { Message } from './../models/message.model';
import { AuthService } from './../../core/services/auth.service';
import { Injectable } from '@angular/core';
import { DataProxy } from 'apollo-cache';
import { Apollo, QueryRef } from 'apollo-angular';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  USER_MESSAGES_SUBSCRIPTION,
  AllMessagesQuery,
  GET_CHAT_MESSAGES_QUERY } from './message.graphql';
import {
  AllChatsQuery,
  USER_CHATS_QUERY,
  ChatQuery,
  CHAT_BY_ID_OR_BY_USERS_QUERY,
  CREATE_PRIVATE_CHAT_MUTATION,
  USER_CHATS_SUBSCRIPTION,
  CREATE_GROUP_MUTATION} from './chat.graphql';

import { Chat } from '../models/chat.model';
import { BaseService } from 'src/app/core/services/base.service';

@Injectable({
  providedIn: 'root'
})
export class ChatService extends BaseService {

  chats$: Observable<Chat[]>;
  private queryRef: QueryRef<AllChatsQuery>;
  private subscriptions: Subscription[] = [];

  constructor(
    private apollo: Apollo,
    private authService: AuthService
  ) {
    super();
   }

  startChatsMonitoring(loggedUserId: string): void {
    if (!this.chats$) {
      this.chats$ = this.getUserChats(loggedUserId);
      this.subscriptions.push(this.chats$.subscribe());
    }
  }

  stopChatsMonitoring(): void {
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(s => s.unsubscribe());
      this.subscriptions = [];
      this.chats$ = null;
    }
  }

  getUserChats(userId: string): Observable<Chat[]> {
    this.queryRef = this.apollo.watchQuery<AllChatsQuery>({
      query: USER_CHATS_QUERY,
      variables: {
        loggedUserId: userId
      },
      fetchPolicy: 'network-only'
    });

    this.queryRef.subscribeToMore({
      document: USER_CHATS_SUBSCRIPTION,
      variables: { loggedUserId: userId },
      updateQuery: (previous: AllChatsQuery, { subscriptionData }): AllChatsQuery => {

        const newChat: Chat = (subscriptionData.data as any).Chat.node;

        if (previous.allChats.every(chat => chat.id !== newChat.id)) {
          return {
            ...previous,
            allChats: [newChat, ...previous.allChats]
          };
        }

        return previous;
      }
    });

    this.queryRef.subscribeToMore({
      document: USER_MESSAGES_SUBSCRIPTION,
      variables: { loggedUserId: userId },
      updateQuery: (previous: AllChatsQuery, { subscriptionData }): AllChatsQuery => {

        const newMessage: Message = (subscriptionData.data as any).Message.node;
        try {
          if (newMessage.sender.id !== userId) {
            const apolloClient = this.apollo.getClient();

            const chatMessagesVariables = { chatId: newMessage.chat.id };

            const chatMessagesData = apolloClient.readQuery<AllMessagesQuery>({
              query: GET_CHAT_MESSAGES_QUERY,
              variables: chatMessagesVariables
            });

            chatMessagesData.allMessages = [...chatMessagesData.allMessages, newMessage];

            apolloClient.writeQuery({
              query: GET_CHAT_MESSAGES_QUERY,
              variables: chatMessagesVariables,
              data: chatMessagesData
            });
          }

        } catch (e) {
          console.log('allMessagesQuery not found!');
        }



        const chatToUpdateIndex: number =
        (previous.allChats)
          ? previous.allChats.findIndex(chat => chat.id === newMessage.chat.id)
          : -1;

        if (chatToUpdateIndex > -1) {
          const newAllChats = [...previous.allChats];
          const chatToUpdate: Chat = Object.assign({}, newAllChats[chatToUpdateIndex]);
          chatToUpdate.messages = [newMessage];
          newAllChats[chatToUpdateIndex] = chatToUpdate;
          return {
            ...previous,
            allChats: newAllChats
          };
        }
        return previous;
      }
    });

    return this.queryRef.valueChanges
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
        }),
        map(chats => chats.map(c => {
          const chat = new Chat(c);
          chat.users = chat.users.map(u => new User(u));
          return chat;
        }))
      );
  }

  getChatByIdOrByUsers(chatOrUserId: string, loggedUserId: string): Observable<Chat> {
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
        update: (store: DataProxy, {data:  { createChat }  }) => {

          this.updateUserChatsQuery(store, createChat, loggedUserId);

          this.readAndWriteQueryInApolloCache<Chat>({
            store,
            newRecord: createChat,
            query: CHAT_BY_ID_OR_BY_USERS_QUERY,
            queryName: 'allChats',
            arrayOperation: 'sigleRecord',
            variables: {
              chatId: targetUserId,
              loggedUserId,
              targetUserId
            }
          });

        }
      }).pipe(
        map(res => res.data.createChat)
      );
  }

  createGroup(variables: { title: string, userIds: string[], loggedUserId: string, photoId: string }): Observable<Chat> {

    variables.userIds.push(this.authService.authUser.id);

    return this.apollo.mutate({
      mutation: CREATE_GROUP_MUTATION,
      variables,
      optimisticResponse: {
        __typename: 'Mutation',
        createChat: {
          __typename: 'Chat',
          id: '',
          title: variables.title,
          createdAt: new Date().toISOString(),
          isGroup: true,
          photo: {
            __typename: 'File',
            id: '',
            secret: ''
          },
          users: [
            {
              __typename: 'User',
              id: '',
              name: '',
              email: '',
              createdAt: new Date().toISOString(),
              photo: {
                __typename: 'File',
                id: '',
                secret: ''
              }
            }
          ],
          messages: []
        }
      },
      update: (store: DataProxy, {data: {createChat}}) => {

        this.updateUserChatsQuery(store, createChat, variables.loggedUserId);
      }

    }).pipe(
      map(res => res.data.createChat)
    );
  }

  private updateUserChatsQuery(store: DataProxy, createChat: any, loggedUserId: string ) {
    this.readAndWriteQueryInApolloCache<Chat>({
      store,
      newRecord: createChat,
      query: USER_CHATS_QUERY,
      queryName: 'allChats',
      arrayOperation: 'unshift',
      variables: { loggedUserId }
    });
  }

}
