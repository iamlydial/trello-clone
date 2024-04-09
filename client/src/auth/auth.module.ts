import { NgModule } from '@angular/core';
import { AuthService } from './services/auth.service';
import { RegisterComponent } from './components/register/register.component';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

const routes: Routes = [
  {
    path: 'register',
    component: RegisterComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes), ReactiveFormsModule, CommonModule],
  providers: [AuthService],
  declarations: [RegisterComponent],
})
export class AuthModule {}
