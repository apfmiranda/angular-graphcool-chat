import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { StorageKeys } from './storage-keys';
import { NgModule, Inject } from '@angular/core';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from './../environments/environment';
import { onError } from 'apollo-link-error';
import { ApolloLink, Operation } from 'apollo-link';
import { CachePersistor } from 'apollo-cache-persist';
import { WebSocketLink } from 'apollo-link-ws';
import { getOperationAST } from 'graphql';

import { GRAPHCOOL_CONFIG, GraphcoolConfig } from './core/providers/graphcool-config.provider';
import { SubscriptionClient } from 'subscriptions-transport-ws';

@NgModule({
  imports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {
  cachePersistor: CachePersistor<any>;
  private subscriptionClient: SubscriptionClient;

  constructor(
    apollo: Apollo,
    @Inject(GRAPHCOOL_CONFIG) private graphcoolConfig: GraphcoolConfig,
    httpLink: HttpLink
  ) {

    // ##################### configuração de Captura de Erro ###############################
    const linkError = onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors) {
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
          ),
        );
      }
      if (networkError) {
        console.log(`[Network error]: ${networkError}`);
      }
    });

    // ##################### configuração do cabeçalho de autenticação ########################
    const authMiddleware: ApolloLink = new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: new HttpHeaders({
          Authorization: `Bearer  ${this.getAuthToken()}`
        })
      });
      return forward(operation);
    });

    // ##################### configuração do WebSocket ###############################
    const client = new SubscriptionClient(this.graphcoolConfig.subscriptionsAPI,
      {
        reconnect: true,
        timeout: 30000,
        lazy: false,
        connectionParams: () => ({ Authorization: `Bearer ${this.getAuthToken()}` })
      });
    const ws = new WebSocketLink(client);
    this.subscriptionClient = client;
    this.logSubscriptionClient(client, false);

    // ##################### configuração do cache ###############################
    const cache = new InMemoryCache();

    this.cachePersistor = new CachePersistor({
      cache,
      storage: window.localStorage
    });

    const uri = this.graphcoolConfig.simpleAPI; // <-- add the URL of the GraphQL server here
    const http = httpLink.create({ uri });

    apollo.create({
      link: ApolloLink.from([
        linkError,
        ApolloLink.split(
          (operation: Operation) => {
            const operationAST = getOperationAST(operation.query, operation.operationName);
            return !!operationAST && operationAST.operation === 'subscription';
          },
          ws,
          authMiddleware.concat(http)
        )
      ]),
      cache,
      connectToDevTools: !environment.production
    });

  }

  closeSocketConnect(): void {
    this.subscriptionClient.close(true, true);
  }

  private getAuthToken(): string {
    return localStorage.getItem(StorageKeys.AUTH_TOKEN);
  }

  private logSubscriptionClient(client: SubscriptionClient, islog: boolean = false) {

    if (islog) {
      client.on('connecting', () => {
        console.log('connecting');
      });
      client.on('connected', () => {
        console.log('connected');
      });
      client.on('reconnecting', () => {
        console.log('reconnecting');
      });
      client.on('reconnected', () => {
        console.log('reconnected');
      });
      client.on('disconnected', () => {
        console.log('disconnected');
      });
    }

  }

}

