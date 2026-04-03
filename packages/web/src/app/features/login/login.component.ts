import { NgClass } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormField, form, validateStandardSchema } from '@angular/forms/signals';
import { LoginRequestBodySchema, loginModel } from '../../shared/schemas/auth.schema';
import { AuthService } from '../../shared/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormField, NgClass],
  templateUrl: './login.component.html',
})
export default class LoginComponent {
  private readonly authService = inject(AuthService);

  loginForm = form(loginModel, (schema) => {
    validateStandardSchema(schema, LoginRequestBodySchema);
  });

  async onLogin() {
    if (this.loginForm().invalid()) return;

    await this.authService.login(this.loginForm().value());
  }

  passwordInputType: 'password' | 'text' = 'password';
  togglePasswordInputType() {
    this.passwordInputType = this.passwordInputType === 'password' ? 'text' : 'password';
  }
}
