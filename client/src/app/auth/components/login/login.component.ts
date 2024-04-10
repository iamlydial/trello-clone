import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterRequestInterface } from '../../types/registerRequest.interface'; // Import the interface
import { HttpErrorResponse } from '@angular/common/http';
import { LoginRequestInterface } from '../../types/loginRequest.interface';
import { Router } from '@angular/router';

@Component({
  selector: 'auth-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
    errorMessage: string|null = null;

    form = this.fb.group({
        email: ['', Validators.required],
        password: ['', Validators.required],
    });

    constructor(private fb: FormBuilder, 
        private authService: AuthService,
        private router: Router) {}

    onSubmit(): void {
        const formValue = this.form.value as LoginRequestInterface; // Cast form value to RegisterRequestInterface
        this.authService.login(formValue).subscribe({
            next:(currentUser)=>{
                console.log('currentUser', currentUser);
                this.authService.setToken(currentUser);
                this.authService.setCurrentuser(currentUser);
                this.errorMessage = null;
                this.router.navigateByUrl('/');
            },
            error: (err: HttpErrorResponse) => {
                console.log('err', err.error);
                this.errorMessage = err.error.emailOrPassword;
            }
        })
    }
}
