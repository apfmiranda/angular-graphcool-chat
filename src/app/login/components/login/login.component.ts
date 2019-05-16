import { FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  configs = {
    isLogin: true,
    actionText: 'Login',
    buttonActionText: 'Criar uma conta'
  };

  private nameControl = new FormControl('', [ Validators.required, Validators.minLength(5)]);

  constructor(private fb: FormBuilder) { }

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

}
