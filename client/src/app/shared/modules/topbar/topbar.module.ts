import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { TopbarComponent } from './component/topbar.component';

@NgModule({
  imports: [CommonModule],
  declarations: [TopbarComponent],
  exports: [TopbarComponent],
})
export class TopbarModule {}
