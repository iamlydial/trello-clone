import { Component, HostBinding, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BoardService } from '../../services/board.service';
import {
  Observable,
  Subject,
  combineLatest,
  filter,
  map,
  take,
  takeUntil,
} from 'rxjs';
import { TaskInterface } from '../../../shared/types/tasks.interface';
import { FormBuilder } from '@angular/forms';
import { ColumnInterface } from '../../../shared/types/columns.interface';
import { TasksService } from '../../../shared/services/tasks.service';
import { SocketService } from '../../../shared/services/socket.service';
import { SocketEventEnum } from '../../../shared/types/socketEvents.enum';

@Component({
  selector: 'task-modal',
  templateUrl: './taskModal.component.html',
})
export class TaskModalComponent implements OnDestroy {
  @HostBinding('class') classes = 'task-modal';

  boardId: string;
  taskId: string;
  task$: Observable<TaskInterface>;
  data$: Observable<{ task: TaskInterface; columns: ColumnInterface[] }>;
  columnForm = this.fb.group({
    columnId: [null as string | null],
  });
  unsubscribe$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private boardService: BoardService,
    private fb: FormBuilder,
    private taskService: TasksService,
    private socketService: SocketService
  ) {
    const boardId = this.route.parent?.snapshot.paramMap.get('boardId');
    const taskId = this.route.snapshot.paramMap.get('taskId');
    if (!boardId) {
      throw new Error("Can't get boardId from URL");
    }
    if (!taskId) {
      throw new Error("Can't get taskId from URL");
    }

    this.taskId = taskId;
    this.boardId = boardId;
    this.task$ = this.boardService.tasks$.pipe(
      map((tasks) => tasks.find((task) => task.id === this.taskId)),
      filter(Boolean)
    );
    this.data$ = combineLatest([this.task$, this.boardService.columns$]).pipe(
      map(([task, columns]) => ({
        task,
        columns,
      }))
    );

    this.task$.pipe(takeUntil(this.unsubscribe$)).subscribe((task) => {
      this.columnForm.patchValue({
        columnId: task.columnId ?? null,
      });
    });

    combineLatest([this.task$, this.columnForm.get('columnId')!.valueChanges])
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(([task, columnId]) => {
        if (task.columnId !== columnId) {
          this.taskService.updateTask(this.boardId, task.id, {
            columnId: columnId ?? undefined,
          });
        }
      });

    this.socketService
      .listen<string>(SocketEventEnum.tasksDeleteSuccess)
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(()=>{
        this.goToBoard()
      });
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  goToBoard(): void {
    this.router.navigate(['boards', this.boardId]);
  }

  updateTaskName(taskName: string): void {
    console.log(['updateTaskName', taskName]);
    this.taskService.updateTask(this.boardId, this.taskId, {
      title: taskName,
    });
  }

  updateTaskDescription(taskDescription: string): void {
    console.log('updateTataskDescriptionskName', taskDescription);
    this.taskService.updateTask(this.boardId, this.taskId, {
      description: taskDescription,
    });
  }

  deleteTask() {
    this.taskService.deleteTask(this.boardId, this.taskId);
  }
}
