import { HttpClientModule, HttpHeaders } from '@angular/common/http';
import { StorageKeys } from './storage-keys';
import { NgModule, Inject } from '@angular/core';
import { ApolloModule, Apollo } from 'apollo-angular';
import { HttpLink, HttpLinkModule } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { environment } from './../environments/environment';
import { onError } from 'apollo-link-error';
import { ApolloLink } from 'apollo-link';

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

    apollo.create({
      link: ApolloLink.from([
        linkError,
        authMiddleware.concat(http)
      ]),
      cache: new InMemoryCache(),
      connectToDevTools: !environment.production
    });

  }

  private getAuthToken(): string {
    return localStorage.getItem(StorageKeys.AUTH_TOKEN);
  }

}
