import {Component} from '@angular/core';
import {ToastrService} from 'ngx-toastr';
import {NbDialogRef} from '@nebular/theme';
import {SchedulerEvent} from '@sourcefuse/ngx-scheduler/lib/types';
import {UserInfo} from '@vmsl/core/auth/models/user.model';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {TeamInfo} from '../../teams-management/shared/models/team-info.model';
import {Helper} from '../shared/utils';
import * as moment from 'moment';
import {CalendarService} from '../calendar.service';
import {CalendarConfig} from '../calendar.config';

@Component({
  selector: 'vmsl-busy-event',
  templateUrl: './busy-event.component.html',
  styleUrls: ['./busy-event.component.scss'],
})
export class BusyEventComponent {
  currentUser: UserInfo = this.store.getUser();
  requestTeam: TeamInfo;
  currentUserId: string;
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
  callback;
  constructor(
    private readonly toastrService: ToastrService,
    private readonly store: UserSessionStoreService,
    private readonly calendarService: CalendarService,
    protected dialogRef: NbDialogRef<BusyEventComponent>,
  ) {}

  ngOnInit(): void {
    const aheadTime = 31;
    if (!this.meetingDetails?.startTime) {
      this.meetingDetails.startTime = moment().add(aheadTime, 'm').toDate();
      this.meetingDetails.endTime = moment(this.meetingDetails.startTime)
        .add(1, 'h')
        .toDate();
    }

    this.minStartTime = Helper.getMinStartDate();
    this.currentUserId = this.store.getUser().id;
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

  validateTime() {
    const startTime = this.getStartTimeObj().value;
    const endTime = this.getEndTimeObj().value;
    if (startTime > endTime) {
      this.toastrService.error(
        `Start time should be less than end time`,
        'Error',
        {
          timeOut: environment.messageTimeout,
        },
      );
      return false;
    } else if (startTime < Date.now() || endTime < Date.now()) {
      this.toastrService.error(
        `Cannot create busy event for past time`,
        'Error',
        {
          timeOut: environment.messageTimeout,
        },
      );
      return false;
    } else {
      //do nothing
    }
    return true;
  }

  createEvent() {
    this.calendarService.createEvent(this.meetingDetails).subscribe(res2 => {
      if (typeof this.callback === 'function') {
        this.callback();
      }
      this.toastrService.success('Event Created Successfully.', 'SUCCESS', {
        timeOut: environment.messageTimeout,
      });
      this.dialogRef.close();
    });
  }

  updateEvent(details) {
    this.calendarService
      .updateEvent(
        {startTime: details.startTime, endTime: details.endTime},
        details['id'],
      )
      .subscribe(res1 => {
        this.dialogRef.close();
        if (typeof this.callback === 'function') {
          this.callback();
        }
        this.toastrService.success('Event Updated Successfully.', 'SUCCESS', {
          timeOut: environment.messageTimeout,
        });
      });
  }

  save() {
    if (!this.validateTime()) {
      return;
    }
    const details = Object.assign(this.meetingDetails, {
      title: 'Busy',
      extId: this.currentUser.tenantId,
      isBusyEvent: true,
      userId: this.currentUser.id,
    });

    this.calendarService
      .getUserFreeBusyStatus(this.meetingDetails)
      .subscribe(res => {
        if (this.meetingDetails.id) {
          this.updateEvent(details);
        } else {
          this.createEvent();
        }
      });
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
