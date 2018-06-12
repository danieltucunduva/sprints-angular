import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { MatDialog } from '@angular/material';
import { SprintDialogComponent } from '../sprint-dialog/sprint-dialog.component';
import { SprintService } from '../sprint.service';

@Component({
  selector: 'app-current-sprint',
  templateUrl: './current-sprint.component.html',
  styleUrls: ['./current-sprint.component.css']
})
export class CurrentSprintComponent implements OnInit {
  progressSpinnerValue = 0;
  timer = 0;
  @Output() sprintStop = new EventEmitter<void>();

  constructor(private dialog: MatDialog, private sprintService: SprintService) { }

  ngOnInit() {
    this.startOrResumeProgressTimer();
  }

  startOrResumeProgressTimer() {
    const shortSprint = this.sprintService.getRunningSprint().duration < 180 ? true : false;
    const percentStepSize = shortSprint ? 1 : 0.1;
    const timeFactor = shortSprint ? 10 : 1;

    // this.timer = window.setInterval(
    //       () => {
    //         if (this.progressSpinnerValue >= 100) {
    //           clearInterval(this.timer);
    //           this.sprintService.getRunningSprint().finishedAt = new Date();
    //           const dialogRef = this.dialog.open(SprintDialogComponent, {
    //             data: {
    //               type: 'sprint-finished',
    //               sprint: { ...this.sprintService.getRunningSprint() }
    //             }
    //           });
    //           if (this.sprintService.getRunningSprint().notify) {
    //             document.getElementsByTagName('audio')[0].play();
    //             const notification = new Notification('≡Sprint', {
    //               body: 'Your sprint is finished.',
    //               icon: './assets/logo_square_white.jpg',
    //               dir: 'auto'
    //             });
    //           }
    //           setTimeout(() => {
    //             this.sprintService.finishSprint(true, this.progressSpinnerValue);
    //           }, 2000);
    //         } else {
    //           this.progressSpinnerValue = Number.parseFloat((this.progressSpinnerValue + percentStepSize).toFixed(1));
    //         }
    //       }, this.sprintService.getRunningSprint().duration * timeFactor
    //     );




    this.timer = window.setInterval(
      () => {
        if (this.progressSpinnerValue >= 100) {
          clearInterval(this.timer);
          this.sprintService.finishSprint(true, this.progressSpinnerValue);
          const dialogRef = this.dialog.open(SprintDialogComponent, {
            data: {
              type: 'sprint-finished',
              sprint: this.sprintService.getRunningSprint()
            }
          });
          if (this.sprintService.getRunningSprint().notify) {
            const notification = new Notification('≡Sprint', {
              body: 'Your sprint is finished.',
              icon: './assets/logo_square_white.jpg',
              dir: 'auto'
            });
            setTimeout(function () {
              notification.close();
            }, 10000);
            document.getElementsByTagName('audio')[0].play();
          }
        } else {
          this.progressSpinnerValue = Number.parseFloat((this.progressSpinnerValue + percentStepSize).toFixed(1));
        }
      }, this.sprintService.getRunningSprint().duration * timeFactor
    );
  }

  onClickStopSprint() {
    clearInterval(this.timer);
    const dialogRef = this.dialog.open(SprintDialogComponent, { data: { type: 'cancel-sprint' } });
    dialogRef.afterClosed().subscribe(response => {
      if (response) {
        this.sprintService.finishSprint(false, this.progressSpinnerValue);
      } else {
        this.startOrResumeProgressTimer();
      }
    });
  }

}
