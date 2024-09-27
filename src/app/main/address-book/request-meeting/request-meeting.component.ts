import {Component} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {NbDialogRef} from '@nebular/theme';
import {SchedulerEvent} from '@sourcefuse/ngx-scheduler/lib/types';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {CalendarService} from '../../calendar/calendar.service';
import {Helper} from '../../calendar/shared/utils';
import {CalendarConfig} from '../../calendar/calendar.config';

@Component({
  selector: 'vmsl-request-meeting',
  templateUrl: './request-meeting.component.html',
  styleUrls: ['./request-meeting.component.scss'],
})
export class RequestMeetingComponent {
  currentUser: UserInfo = this.store.getUser();
  requestUser: UserInfo;
  loading = false;
  minStartTime: Date = new Date();
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
    private readonly calendarService: CalendarService,
    private readonly toastrService: ToastrService,
    private readonly store: UserSessionStoreService,
    protected dialogRef: NbDialogRef<RequestMeetingComponent>,
  ) {}

  ngOnInit(): void {
    this.meetingDetails.startTime = Helper.getStartTimeOfNewEVent(new Date());
    this.meetingDetails.endTime = this.getEndTimeBasisStartTime(
      new Date(this.meetingDetails.startTime),
    );
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
    const details: SchedulerEvent = Object.assign(this.meetingDetails, {
      extId: this.currentUser.tenantId,
      identifier: this.currentUser.id,
      attendees: [
        {
          id: this.requestUser.id,
          extId: this.currentUser.tenantId,
        },
        {
          id: this.currentUser.id,
          extId: this.currentUser.tenantId,
          isOrganizer: true,
        },
      ],
    });
    const ownerName = `${this.currentUser.title} ${this.currentUser.firstName} ${this.currentUser.lastName}`;
    details.title = Helper.createTitleOfEvent(
      details,
      ownerName,
      this.currentUser.id,
    );

    this.calendarService.getUserFreeBusyStatus(details).subscribe(
      res => {
        const busyNames: string[] = this.findBusyNames(res.calendars);
        if (busyNames && busyNames.length) {
          this.toastrService.error(
            `${busyNames.join(' and ')} ${
              busyNames.length > 1 || busyNames.includes('you') ? 'are' : 'is'
            } busy on the selected time`,
            'Error',
            {
              timeOut: environment.messageTimeout,
            },
          );
          this.loading = false;
          return;
        }

        this.calendarService.createEvent(details).subscribe(
          eventRes => {
            this.loading = false;
            this.toastrService.success(
              'Meeting Requested Successfullly.',
              'SUCCESS',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.dialogRef.close();
          },
          error => {
            this.loading = false;
          },
        );
      },
      error => {
        this.loading = false;
      },
    );
  }

  findBusyNames(calendars) {
    const busyNames = [];
    calendars.forEach(calendar => {
      const [{busy}] = Object.values(calendar);
      if (busy && busy.length) {
        busyNames.push(
          Object.keys(calendar)[0] === this.currentUser.id
            ? 'you'
            : `${this.requestUser.fullName}`,
        );
      }
    });

    return busyNames;
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
