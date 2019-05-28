import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { StorageKeys } from './storage-keys';
import { NgModule, Inject } from '@angular/core';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from './../environments/environment';
import { onError } from 'apollo-link-error';
import { ApolloLink, Operation } from 'apollo-link';
import { persistCache } from 'apollo-cache-persist';
import { WebSocketLink } from 'apollo-link-ws';
import { getOperationAST } from 'graphql';

import { GRAPHCOOL_CONFIG, GraphcoolConfig } from './core/providers/graphcool-config.provider';

@NgModule({
  imports: [
    HttpClientModule,
    ApolloModule,
    HttpLinkModule
  ]
})
export class GraphQLModule {

  constructor(
    apollo: Apollo,
    @Inject(GRAPHCOOL_CONFIG) private graphcoolConfig: GraphcoolConfig,
    httpLink: HttpLink
  ) {
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

    const authMiddleware: ApolloLink = new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: new HttpHeaders({
          Authorization: `Bearer  ${this.getAuthToken()}`
        })
      });
      return forward(operation);
    });

    const uri = this.graphcoolConfig.simpleAPI; // <-- add the URL of the GraphQL server here
    const http = httpLink.create({ uri });

    const ws = new WebSocketLink({
      uri: this.graphcoolConfig.subscriptionsAPI,
      options: {
        reconnect: true,
        timeout: 30000
      }
    });

    const cache = new InMemoryCache();
    persistCache({
      cache,

      storage: window.localStorage,
    }).catch(err => console.log('Erro ao persistir o cache', err));

    apollo.create({
      link: ApolloLink.from([
        linkError,
        ApolloLink.split(
          (operation: Operation) => {
            const operationAST = getOperationAST(operation.query, operation.operationName);
            return !!operationAST  && operationAST.Operation === 'subscription';
          },
          ws,
          authMiddleware.concat(http)
        )
      ]),
      cache,
      connectToDevTools: !environment.production
    });

  }

  private getAuthToken(): string {
    return localStorage.getItem(StorageKeys.AUTH_TOKEN);
  }

}
