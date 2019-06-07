import { ErrorService } from './../../../core/services/error.service';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Component, OnInit, HostBinding } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {

  user: User;
  isEditing = false;
  isLoading = false;
  @HostBinding('class.app-user-profile') private applyHostClass = true;

  constructor(
    private authService: AuthService,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    this.user = JSON.parse(JSON.stringify(this.authService.authUser));
  }

  onSave(): void {
    let message: string;
    this.isLoading = true;
    this.isEditing = false;
    this.userService.updateUser(this.user)
      .pipe(take(1))
      .subscribe(
        (user: User) => message = `Usuário: ${user.name},  Atualizado!`,
        (erro) => message = this.errorService.getErrorMessage(erro),
        () => {
          this.snackBar.open(message, 'Ok', {
            duration: 4000,
            verticalPosition: 'top'
          });
          this.isLoading = false;
        });

  }

}
