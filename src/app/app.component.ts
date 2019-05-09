import { Component, OnDestroy, OnInit } from '@angular/core';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';
import { Subscription } from 'rxjs';
import { NetworkStatus } from 'apollo-client';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {

  u = {
    name: 'Fulano de Tal',
    email: 'fulano@gmail.com',
    password: '123456'
  };

  users: any[];
  loading = false;
  error: any;
  texto = '';
  form: FormGroup;

  private querySubscription: Subscription;
  private mutationSubscription: Subscription;

  constructor(private apollo: Apollo, private fb: FormBuilder) {
    }

  ngOnDestroy(): void {
    this.querySubscription.unsubscribe();
    this.mutationSubscription.unsubscribe();
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: [null, [Validators.required, Validators.minLength(3)]],
      email: [null, [Validators.required, Validators.email]],
      password: [null, [Validators.required, Validators.minLength(3)]],
      hideRequired: false,
      floatLabel: 'auto',
    });
  }


  async changetexto(status: number) {
    switch (status) {
      case NetworkStatus.loading:
        this.texto = 'Carregando...';
        break;
      case NetworkStatus.setVariables:
        this.texto = 'setVariables';
        break;
      case NetworkStatus.fetchMore:
        this.texto = 'fetchMore';
        break;
      case NetworkStatus.refetch:
        this.texto = 'refetch';
        break;
      case NetworkStatus.poll:
        this.texto = 'poll';
        break;
      case NetworkStatus.ready:
        this.texto = 'ready';
        break;
      case NetworkStatus.error:
        this.texto = 'error';
        break;
    }
    console.log(this.texto);
  }

  allUsers(): void {
    this.loading = true;
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
        this.changetexto(result.networkStatus);
        console.log(result);
      }, err => {this.error = err; });
  }

  createUser(): void {
    this.u.name = this.form.get('name').value;
    this.u.email = this.form.get('email').value;
    this.u.password = this.form.get('password').value;

    this.mutationSubscription = this.apollo.mutate({
      mutation: gql`
        mutation CreateNewUser($name: String!, $email: String!, $password: String!){
          createUser(name: $name, email: $email, password: $password){
            id
            name
            email
          }
        }
        `,
        variables: {
          name: this.u.name,
          email: this.u.email,
          password: this.u.password
        }
    }).subscribe(res => console.log('Mutation: ', res));
  }

}
