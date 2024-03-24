import {Component} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {NbDialogRef} from '@nebular/theme';
import {SchedulerEvent} from '@sourcefuse/ngx-scheduler/lib/types';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {TeamsFacadeService} from '@vmsl/shared/facades/teams-facade.service';
import {Helper} from '../../calendar/shared/utils';
import {CalendarConfig} from '../../calendar/calendar.config';

@Component({
  selector: 'vmsl-request-meeting',
  templateUrl: './request-meeting.component.html',
  styleUrls: ['./request-meeting.component.scss'],
})
export class RequestMeetingComponent {
  currentUser: UserInfo = this.store.getUser();
  requestTeamId: string;
  loading = false;
  minStartTime: Date = new Date();
  callback;
  meetingDetails: SchedulerEvent = {
    startTime: null,
    endTime: null,
    attendees: [],
    meetingType: CalendarConfig.defaultMeetingType,
    status: null,
    userId: null,
    isBlock: null,
    attendeeIds: [],
    isCancelled: false,
    isEditFormReadonly: false,
    showProposeTimeField: false,
    canEdit: true,
    canDelete: true,
  };
  constructor(
    private readonly toastrService: ToastrService,
    private readonly store: UserSessionStoreService,
    private readonly teamFacadeService: TeamsFacadeService,
    protected dialogRef: NbDialogRef<RequestMeetingComponent>,
  ) {}

  ngOnInit(): void {
    this.minStartTime = Helper.getMinStartDate();
  }

  onStartTimeChange(params) {
    this.meetingDetails.endTime = this.getEndTimeBasisStartTime(
      new Date(params.value),
    );
  }

  getEndTimeBasisStartTime(startTime: Date) {
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);
    return endTime;
  }

  requestMeeting() {
    this.loading = true;
    const ownerName = `${this.currentUser.title} ${this.currentUser.firstName} ${this.currentUser.lastName}`;

    const details: SchedulerEvent = Object.assign(this.meetingDetails, {
      title: Helper.createTitleOfEvent(
        this.meetingDetails,
        ownerName,
        this.currentUser.id,
      ),
      extId: this.currentUser.tenantId,
      identifier: this.currentUser.id,
      teamId: this.requestTeamId,
    });

    this.teamFacadeService.scheduleTeamMeeting(details).subscribe(
      res => {
        this.dialogRef.close();
        if (typeof this.callback === 'function') {
          this.callback();
        }
        this.toastrService.success(
          'Meeting Requested Successfullly.',
          'SUCCESS',
          {
            timeOut: environment.messageTimeout,
          },
        );
      },
      err => (this.loading = false),
    );
  }

  close() {
    this.dialogRef.close();
  }

  onCreated() {
    this.getStartTimeObj()
      .element.querySelector('input')
      .addEventListener('keyup', this.onKeyUp.bind(this));
  }

  private getStartTimeObj() {
    const startTimeEle = document.querySelector('#startTime');
    return startTimeEle ? startTimeEle['ej2_instances'][0] : null;
  }

  onKeyUp() {
    const date = new Date(
      this.getStartTimeObj().element.querySelector('input').value,
    );
    if (!isNaN(date.getDate())) {
      const endTime = new Date(date);
      endTime.setHours(date.getHours() + 1);
      this.getEndTimeObj().value = endTime;
    }
  }

  getEndTimeObj() {
    return document.querySelector('#endTime')['ej2_instances'][0];
  }
}
