import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterRequestInterface } from '../../types/registerRequest.interface'; // Import the interface
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'auth-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
    error: string|null = null;

    form = this.fb.group({
        email: ['', Validators.required],
        username: ['', Validators.required],
        password: ['', Validators.required],
    });

    constructor(private fb: FormBuilder, private authService: AuthService) {}

    onSubmit(): void {
        const formValue = this.form.value as RegisterRequestInterface; // Cast form value to RegisterRequestInterface
        this.authService.register(formValue).subscribe({
            next:(currentUser)=>{
                console.log('currentUser', currentUser);
                this.authService.setToken(currentUser);
                this.authService.setCurrentuser(currentUser);
            },
            error: (err: HttpErrorResponse) => {
                console.log('err', err.error);
                this.error = err.error.join(', ');
            }
        })
    }
}
