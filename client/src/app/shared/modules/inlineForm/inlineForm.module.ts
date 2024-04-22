import { CommonModule } from "@angular/common";
import { EventEmitter, Input, NgModule, Output } from "@angular/core";
import { InlineFormComponent } from "./component/inlineForm.component";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";

@NgModule({
    imports: [CommonModule, ReactiveFormsModule],
    declarations: [InlineFormComponent],
    exports:[InlineFormComponent]
})
export class InlineFormModule{
    
}