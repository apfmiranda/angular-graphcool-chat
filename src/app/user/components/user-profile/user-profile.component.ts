import { ErrorService } from './../../../core/services/error.service';
import { take } from 'rxjs/operators';
import { Component, OnInit, HostBinding } from '@angular/core';
import { AuthService } from 'src/app/core/services/auth.service';
import { User } from 'src/app/core/models/user.model';
import { UserService } from 'src/app/core/services/user.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ImagePreviewComponent } from 'src/app/shared/components/image-preview/image-preview.component';

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
    private dialog: MatDialog,
    private errorService: ErrorService
  ) { }

  ngOnInit() {
    this.user = this.authService.authUser;
  }

  triggerInputFile(input: HTMLInputElement): void {
    input.click();
  }
  onSelectImage(event: Event): void {
    const input: HTMLInputElement = (event.target as HTMLInputElement);
    const file: File = input.files[0];
    const dialogRef = this.dialog.open<ImagePreviewComponent, { image: File }, {canSave: boolean, selectedImage: File}>(
      ImagePreviewComponent,
      {
        data: { image: file },
        panelClass: 'mat-dialog-no-padding',
        maxHeight: '80vh'
      }
    );

    dialogRef.afterClosed()
    .pipe(take(1))
    .subscribe(dialogData => {
      input.value = '';
      if (dialogData && dialogData.canSave) {
        this.isLoading = true;
        let message: string;
        this.userService.updateUserPhoto(
          dialogData.selectedImage,
          this.authService.authUser
        ).pipe(take(1)).subscribe(
          (user: User) => message = `Usuário: ${user.name},  Atualizado!`,
          (erro) => message = this.errorService.getErrorMessage(erro),
          () => {
            this.isLoading = false;
            this.showMessage(message);
          });
      }
    });
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
          this.isLoading = false;
          this.showMessage(message);
        });

  }

  private showMessage(message: string): void {
    this.snackBar.open(message, 'Ok', {
      duration: 4000,
      verticalPosition: 'top'
    });
  }

}
