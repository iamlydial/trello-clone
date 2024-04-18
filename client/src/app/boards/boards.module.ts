import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BoardsComponent } from "./boards.component";
import { RouterModule, Routes } from "@angular/router";

const routes: Routes = [
    {
        path: 'boards',
        component: BoardsComponent
    }
]

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes)],
    declarations:[BoardsComponent],
})
export class BoardsModule{

}