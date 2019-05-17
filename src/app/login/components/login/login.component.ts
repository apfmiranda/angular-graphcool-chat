import { ErrorService } from './../../../core/services/error.service';
import { Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

import { AuthService } from './../../../core/services/auth.service';
import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';

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
  private alive = true;

  constructor(
    private authService: AuthService,
    private errorService: ErrorService,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.createForm();
  }

  createForm(): void {
    this.loginForm = this.fb.group({
      email:    ['', [ Validators.required, Validators.email ]],
      password: ['', [ Validators.required, Validators.minLength(4)]]
    });
  }

  onSubmit() {
    console.log(this.loginForm.value);

    this.configs.isLoading = true;

    const operation =
      (this.configs.isLogin)
        ? this.authService.signinUser(this.loginForm.value)
        : this.authService.signupUser(this.loginForm.value);

    operation
    .pipe(
      takeWhile(() => this.alive)
    ).subscribe(
      res => {
        console.log('redirecting...', res);
        this.configs.isLoading = false;
      },
      error => {
        console.log(error);
        this.configs.isLoading = false;
        this.snackBar.open(this.errorService.getErrorMessage(error), 'ok', {duration: 5000, verticalPosition: 'top'});
      },
      () => console.log('Observable completado!')
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

  ngOnDestroy(): void {
    this.alive = false;
  }

}
