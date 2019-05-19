import { AuthService } from './core/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
  `,
})
export class AppComponent implements OnInit{

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.autoLogin()
      .pipe(take(1))
      .subscribe();
  }

}
