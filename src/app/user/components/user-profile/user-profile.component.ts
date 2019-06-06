import { Observable } from 'rxjs';
import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  user: User;
  isEditing = false;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.user = JSON.parse(JSON.stringify(this.authService.authUser));
  }

  onSave(): void {
    console.log('user: ', this.user);
  }

}
