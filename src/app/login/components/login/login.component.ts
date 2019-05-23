import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { takeWhile } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

import { AuthService } from './../../../core/services/auth.service';
import { ErrorService } from './../../../core/services/error.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit, OnDestroy {


  loginForm: FormGroup;
  configs = {
    isLogin: true,
    actionText: 'Login',
    buttonActionText: 'Criar uma conta',
    isLoading: false
  };

  private nameControl = new FormControl('', [ Validators.required, Validators.minLength(5)]);
  private componentAlive = true;

  constructor(
    public authService: AuthService,
    private errorService: ErrorService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit() {
    this.createForm();

    const userData = this.authService.getRememberMe();
    if (userData) {
      this.email.setValue(userData.email);
      this.password.setValue(userData.password);
    }
  }

  createForm(): void {
    this.loginForm = this.fb.group({
      email:    ['', [ Validators.required, Validators.email ]],
      password: ['', [ Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit() {
    this.configs.isLoading = true;

    const operation =
      (this.configs.isLogin)
        ? this.authService.signinUser(this.loginForm.value)
        : this.authService.signupUser(this.loginForm.value);

    operation
    .pipe(
      takeWhile(() => this.componentAlive)
    ).subscribe(res => {
        this.authService.setRememberMe(this.loginForm.value);
        const redirect = this.authService.redirectUrl || '/dashboard';

        this.authService.isAuthenticated
          .pipe(takeWhile(() => this.componentAlive))
          .subscribe((is: boolean) => {
            if (is) {
              console.log('redirecting: ', redirect);
              this.router.navigate([redirect]);
              this.authService.redirectUrl = null;
              this.configs.isLoading = false;
            }
          });
      },
      error => {
        this.configs.isLoading = false;
        this.snackBar.open(this.errorService.getErrorMessage(error), 'ok', {duration: 5000, verticalPosition: 'top'});
      }
      // () => console.log('Observable completado!')
    );
  }

  changeAction(): void {
    this.configs.isLogin = !this.configs.isLogin;
    this.configs.actionText = !this.configs.isLogin ? 'Cadastrar' : 'Login';
    this.configs.buttonActionText = !this.configs.isLogin ? 'Já tenho uma conta' : 'Criar uma conta';
    !this.configs.isLogin ? this.loginForm.addControl('name', this.nameControl) : this.loginForm.removeControl('name');
  }

  get name(): FormControl { return  this.loginForm.get('name') as FormControl; }
  get email(): FormControl { return  this.loginForm.get('email') as FormControl; }
  get password(): FormControl { return  this.loginForm.get('password') as FormControl; }

  onKeepSigned(): void {
    this.authService.toggleKeepSigned();
  }

  onRememberMe(): void {
    this.authService.toggleRememberMe();
  }

  ngOnDestroy(): void {
    this.componentAlive = false;
  }

}
