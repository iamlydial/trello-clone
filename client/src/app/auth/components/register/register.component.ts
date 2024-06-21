import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { RegisterRequestInterface } from '../../types/registerRequest.interface'; // Import the interface
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { SocketService } from '../../../shared/services/socket.service';

@Component({
  selector: 'auth-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  errorMessage: string | null = null;

  form = this.fb.group({
    email: ['', Validators.required],
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private socketService: SocketService
  ) {}

  onSubmit(): void {
    const formValue = this.form.value as RegisterRequestInterface; // Cast form value to RegisterRequestInterface
    this.authService.register(formValue).subscribe({
      next: (currentUser) => {
        console.log('currentUser', currentUser);
        this.authService.setToken(currentUser);
        this.socketService.setupSocketConnection(currentUser);
        this.authService.setCurrentuser(currentUser);
        this.router.navigateByUrl('/');
      },
      error: (err: HttpErrorResponse) => {
        console.log('err', err.error);
        this.errorMessage = err.error.join(', ');
      },
    });
  }
}
