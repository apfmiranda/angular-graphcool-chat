import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';
import { environment } from './../environments/environment';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  users: any[];
  loading = true;
  error: any;

  private querySubscription: Subscription;

  constructor(
    private http: HttpClient,
    private apollo: Apollo) {}

  ngOnInit() {
    this.querySubscription = this.apollo
      .watchQuery<any>({
        query: gql`query {
                allUsers {
                  id
                  email
                  name
                }
              }`,
      })
      .valueChanges.subscribe(result => {
        this.users = result.data.allUsers;
        this.loading = result.loading;
      }, err => {this.error = err; });
  }

  ngOnDestroy(): void {
    this.querySubscription.unsubscribe();
  }

  allUsers(): void {
    const body = {
      query : `query {
                allUsers {
                  id
                  email
                  name
                }
              }`
    };

    this.http.post(environment.API_URL, body)
      .subscribe(res => console.log('Query: ', res));

  }

  createUser(): void {
    const body = {
      query: `
        mutation CreateNewUser($name: String!, $email: String!, $password: String!){
          createUser(name: $name, email: $email, password: $password){
            id
            name
            email
          }
        }
        `,
        variables: {
          name: 'José Manuel',
          email: 'jose@gmail.com',
          password: '123'
        }
    };

    this.http.post(environment.API_URL, body)
      .subscribe(res => console.log('Mutation: ', res));
  }
}
