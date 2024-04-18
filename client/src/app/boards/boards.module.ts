import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { BoardsComponent } from "./boards.component";
import { RouterModule, Routes } from "@angular/router";
import { AuthGuardService } from "../auth/services/authGuard.service";
import { BoardsService } from "../shared/services/boards.service";

const routes: Routes = [
    {
        path: 'boards',
        component: BoardsComponent, 
        canActivate: [AuthGuardService]
    }
]

@NgModule({
    imports: [CommonModule, RouterModule.forChild(routes)],
    declarations:[BoardsComponent],
    providers: [BoardsService]
})
export class BoardsModule{

}