import { environment } from './../environments/environment';
import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { variable } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private http: HttpClient) {}

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
      .subscribe(res => console.log(res));

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
      .subscribe(res => console.log(res));
  }
}
