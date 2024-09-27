import {
  Component,
  ViewEncapsulation,
  ViewChild,
  ContentChild,
  TemplateRef,
} from '@angular/core';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { ActivatedRoute, Router } from '@angular/router';
import { Location, NgTemplateOutlet } from '@angular/common';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import { TeamsFacadeService } from '@vmsl/shared/facades/teams-facade.service';
import { Queue } from '@vmsl/shared/model/queue.model';
import { PubNubAngular } from 'pubnub-angular2';
import {
  NbMenuService,
  NbDialogService,
  NbDialogRef,
  NbDialogModule,
} from '@nebular/theme';
import { filter, map } from 'rxjs/operators';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { Permission } from '@vmsl/core/auth/permission-key.enum';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@vmsl/env/environment';
import { SchedulerInterfaceComponent } from '@sourcefuse/ngx-scheduler';
import { CalendarService } from '../calendar/calendar.service';
import { CalendarConfig } from '../calendar/calendar.config';
import { QuickNotes } from '../calendar/models/quick-notes-templates.model';
import * as moment from 'moment';
import { MeetingDetailsComponent } from '../meeting-details/meeting-details.component';
import { Helper } from '../calendar/shared/utils';
import { NgxPermissionsService } from 'ngx-permissions';
import { UserInfo } from '@vmsl/core/auth/models/user.model';
import { SchedulerEvent } from '@sourcefuse/ngx-scheduler/lib/types';
import { PubnubService } from '@vmsl/shared/facades/pubnub.service';
import { EventUpdateInfo } from '../calendar/models/event-update-info.model';
import { UserFacadeService } from '@vmsl/shared/facades/user-facade.service';
import { UserVisibility } from '@vmsl/core/enums/user-presence.enum';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DashboardComponent extends RouteComponentBase {
  @ViewChild('todaysCalendar')
  todaysCalendar: SchedulerInterfaceComponent;
  @ContentChild('quickInfoTemplatesContent')
  quickInfoTemplatesContent: TemplateRef<NgTemplateOutlet>;
  @ContentChild('quickInfoTemplatesHeader')
  quickInfoTemplatesHeader: TemplateRef<NgTemplateOutlet>;

  private readonly destroyed$: ReplaySubject<boolean> = new ReplaySubject(1);
  permissionKey = Permission;
  user = { name: 'ABC', title: 'title' };
  adHocConf = true;
  schedConf = false;
  todaysCalender = false;
  teams = [{ title: 'All', data: { id: 'all', name: 'All' } }];
  adhocQueue: Queue[] = [];
  adhocFilter = 'all';
  scheduleFilter = 'all';
  currentUser: UserInfo;
  currentEvent: SchedulerEvent;
  todaysEvents: SchedulerEvent[];
  calendarConfig = CalendarConfig;
  quickNotes: QuickNotes[] = [];
  isCurrentUserAnAttendee = false;
  showStartOrJoinMeetingButton = false;
  meetingLinkText = 'Join Meeting';
  quickColorBox: string;
  calendarFilters = {
    startDate: null,
    endDate: null,
  };
  calendarProperties = {
    startHour: '08:00',
  };
  isOnCall = false;
  selectedAdHocItem = 'All';
  selectedScheduleItem = 'All';
  showRsvp = false;
  scheduledQueue: Queue[] = [];
  newMeeting = [];
  newCall = [];
  moreDetailsDialog: NbDialogRef<NbDialogModule>;
  callerTone: HTMLAudioElement;
  pubnubListner: object;
  todaysDate: string = moment(Date.now()).format('LL');
  userVisibility = 0;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    protected readonly storeService: UserSessionStoreService,
    private readonly teamsFacade: TeamsFacadeService,
    private readonly pubnub: PubNubAngular,
    private readonly store: UserSessionStoreService,
    private readonly router: Router,
    private readonly menuService: NbMenuService,
    private readonly calendarService: CalendarService,
    private readonly toastrService: ToastrService,
    private readonly dialogService: NbDialogService,
    private readonly permissionsService: NgxPermissionsService,
    private readonly pubnubService: PubnubService,
    private readonly userFacade: UserFacadeService,
  ) {
    super(route, location);
    this.callerTone = new Audio();
    this.callerTone.autoplay = true;
  }

  onConfSelect(event) {
    if (event.value === 'adHocConf') {
      this.adHocConf = true;
      this.schedConf = false;
      this.todaysCalender = false;
    } else if (event.value === 'schedConf') {
      this.adHocConf = false;
      this.schedConf = true;
      this.todaysCalender = false;
    } else if (event.value === 'todaysCalender') {
      this.adHocConf = false;
      this.schedConf = false;
      this.todaysCalender = true;
    } else {
      this.adHocConf = true;
      this.schedConf = true;
      this.todaysCalender = true;
    }
  }

  async ngOnInit() {
    super.ngOnInit();
    this.currentUser = this.store.getUser();
    if (
      await this.permissionsService.hasPermission(Permission.CanViewDashboard)
    ) {
      this.getTeams();
      this.callListener();
      this.setCalendarEvents();
      this.calendarService.getQuickNotes().subscribe(resp => {
        this.quickNotes = resp;
      });
    } else if (
      await this.permissionsService.hasPermission(
        Permission.ViewTenantUserListing,
      )
    ) {
      this.router.navigate(['/main/user']);
    } else {
      this.router.navigate(['/main/calendar']);
    }
  }

  getTeams() {
    this.teamsFacade.getTeams().subscribe(res => {
      this.getAdhocQueue(this.adhocFilter);
      this.getScheduleQueue(this.scheduleFilter);
      const teams = res.map(ele => {
        return {
          title: ele.teamName,
          data: {
            id: ele.teamId,
            name: ele.teamName,
          },
        };
      });
      teams.forEach(ele => {
        this.teams.push(ele);
      });
    });

    this._subscriptions.push(
      this.menuService
        .onItemClick()
        .pipe(
          filter(({ tag }) => tag === 'adhoc-team-menu'),
          map(({ item: { data } }) => data),
        )
        .subscribe(data => {
          this.adhocFilter = data.id;
          this.selectedAdHocItem = data.name;
          this.getAdhocQueue(this.adhocFilter);
        }),
    );

    this._subscriptions.push(
      this.menuService
        .onItemClick()
        .pipe(
          filter(({ tag }) => tag === 'sched-team-menu'),
          map(({ item: { data } }) => data),
        )
        .subscribe(data => {
          this.scheduleFilter = data.id;
          this.selectedScheduleItem = data.name;
          this.getScheduleQueue(this.scheduleFilter);
        }),
    );
  }

  getAdhocQueue(teamId: string) {
    if (teamId === 'all') {
      this._subscriptions.push(
        this.teamsFacade.getAdhocQueue().subscribe(res => {
          this.filterQueue(res);
        }),
      );
    } else {
      this._subscriptions.push(
        this.teamsFacade.getTeamAdhocQueue(teamId).subscribe(res => {
          this.filterQueue(res);
        }),
      );
    }
  }

  getScheduleQueue(filterId: string) {
    this.scheduledQueue = [];
    if (filterId === 'all') {
      this._subscriptions.push(
        this.teamsFacade.getScheduleQueue().subscribe(res => {
          this.scheduledQueue = res;
        }),
      );
    } else {
      this._subscriptions.push(
        this.teamsFacade.getTeamScheduleQueue(filterId).subscribe(res => {
          this.scheduledQueue = res;
        }),
      );
    }
  }

  filterQueue(data) {
    const missedTime = 45;
    this.adhocQueue = [];
    this.userFacade.getUserVisibility().subscribe(resp => {
      data.forEach(call => {
        if (
          call.timeLeft.leftTime < missedTime &&
          resp.userVisibility === UserVisibility.Online
        ) {
          this.adhocQueue.push(call);
        }
      });
    });
  }

  acceptScheduleMeeting(call: Queue) {
    this._subscriptions.push(
      this.teamsFacade
        .acceptAssignTeamMeeting(call, this.store.getUser().id)
        .subscribe(),
    );
  }

  assignScheduleMeeting(call: Queue, id) {
    call.showTeamMembers = false;
    this._subscriptions.push(
      this.teamsFacade.acceptAssignTeamMeeting(call, id).subscribe(),
    );
  }

  callListener() {
    this.pubnubListner = {
      message: m => {
        const callData = JSON.parse(m.message);
        if (
          callData.notificationType === 'CALL' &&
          callData.notificationData.teamDetails
        ) {
          this.getUserVisibility(callData);
        } else if (
          callData.notificationType === 'TEAM_MEETING' &&
          callData.notificationData.teamDetails
        ) {
          this.scheduleCallListener(callData);
        } else if (callData.notificationType === 'SCHEDULED_MEETING') {
          this.updateEventRealTime(callData.notificationData);
        } else {
          // else block
        }
      },
      presence: e => {
        if (
          e.uuid === this.store.getUser().id &&
          e.action === 'state-change' &&
          e.state?.status === 'Busy'
        ) {
          this.isOnCall = true;
        }
        if (
          e.uuid === this.store.getUser().id &&
          e.action === 'state-change' &&
          e.state?.status !== 'Busy'
        ) {
          this.isOnCall = false;
        }
      },
    };
    this.pubnub.addListener(this.pubnubListner);
  }

  getUserVisibility(callData) {
    this.userFacade.getUserVisibility().subscribe(res => {
      this.userVisibility = res.userVisibility;
      this.adhocCallListener(callData);
    });
  }

  updateEventRealTime(eventInfo: EventUpdateInfo) {
    this.calendarService.getEventById(eventInfo.eventId).subscribe(res => {
      if (eventInfo.eventType === 'new') {
        const newEventIndex = this.todaysEvents.findIndex(
          e => (e.id as Object as string) === eventInfo.eventId,
        );
        if (newEventIndex !== -1) {
          return;
        }
      } else {
        this.todaysEvents = this.todaysEvents.filter(
          e => (e.id as Object as string) !== eventInfo.eventId,
        );
      }

      this.todaysEvents.push(res[0]);
      if (this.moreDetailsDialog?.componentRef?.instance) {
        this.moreDetailsDialog.componentRef.instance['meetingDetails'] = res[0];
      }
      if (
        this.currentEvent &&
        (this.currentEvent.id as Object as string) === eventInfo.eventId
      ) {
        this.currentEvent = res[0];
        this.updateStartJoinMeetingButton(
          eventInfo['notificationReason'] === 'startsin15Mins',
        );
      }

      const data = [...this.todaysEvents];
      this.todaysEvents = data;
      this.todaysCalendar.databind(this.todaysEvents);
    });
  }

  updateStartJoinMeetingButton(isFiveMinuteToStartOrOngoing = false) {
    var curr = moment(new Date());
    var start = moment(this.currentEvent.startTime);
    const meetingLinkShowTimeInMinutes = 15.2;
    var duration = moment.duration(start.diff(curr));
    isFiveMinuteToStartOrOngoing =
      isFiveMinuteToStartOrOngoing ||
      (duration.asMinutes() <= meetingLinkShowTimeInMinutes &&
        duration.asMinutes() >= 0) ||
      this.currentEvent['timeline'] === 'ongoing';

    this.showStartOrJoinMeetingButton =
      !this.currentEvent['isMsEvent'] &&
      !this.currentEvent['isBusyEvent'] &&
      (this.isCurrentUserAnAttendee ||
        this.store.getUser().permissions.includes('JoinAnyMeeting')) &&
      isFiveMinuteToStartOrOngoing &&
      !this.currentEvent.isCancelled;

    let currentUserAsAttendee;
    if (this.currentEvent.attendees?.length) {
      currentUserAsAttendee = this.currentEvent.attendees.find(
        a => a.id === this.currentUser.id,
      );
    }
    this.meetingLinkText = currentUserAsAttendee?.isOrganizer
      ? 'Start Meeting'
      : 'Join Meeting';
  }

  adhocCallListener(callData) {
    switch (callData.notificationData.callStatus) {
      case 'InitiateCall':
        if (
          callData.notificationData.teamDetails &&
          this.userVisibility === UserVisibility.Online
        ) {
          this.addToQueue(callData);
        }
        break;
      case 'MissedCall':
        this.adhocQueue.forEach(call => {
          if (
            call.queueId === callData.notificationData.teamDetails.teamQueueId
          ) {
            call.status = 'missed';
            this.removeAdhocCallFromView(
              callData.notificationData.teamDetails.teamQueueId,
            );
          }
        });
        this.removeFromNewCallList(
          callData.notificationData.teamDetails.teamQueueId,
        );
        break;
      case 'DisconnectedCall':
        this.adhocQueue.forEach(call => {
          if (
            call.queueId === callData.notificationData.teamDetails.teamQueueId
          ) {
            call.status = 'done';
            call.attendeeFirstName =
              callData.notificationData.calleeDetails?.firstName;
            call.attendeeLastName =
              callData.notificationData.calleeDetails?.lastName;
            this.removeAdhocCallFromView(
              callData.notificationData.teamDetails.teamQueueId,
            );
          }
        });
        this.removeFromNewCallList(
          callData.notificationData.teamDetails.teamQueueId,
        );
        break;
      case 'PickedCall':
        this.adhocQueue.forEach(call => {
          if (
            call.queueId === callData.notificationData.teamDetails.teamQueueId
          ) {
            call.status = 'done';
            call.attendeeFirstName =
              callData.notificationData.calleeDetails.firstName;
            call.attendeeLastName =
              callData.notificationData.calleeDetails.lastName;
            this.removeAdhocCallFromView(
              callData.notificationData.teamDetails.teamQueueId,
            );
          }
        });
        this.removeFromNewCallList(
          callData.notificationData.teamDetails.teamQueueId,
        );
        break;
    }
  }

  scheduleCallListener(callData) {
    switch (callData.notificationData.status) {
      case 'queued':
        this.addToScheduleQueue(callData.notificationData);
        break;
      case 'manager-escalation':
      case 'director-escalation':
      case 'missed':
      case 'cancelled':
        this.updateScheduleCallStatus(callData);
        break;
      case 'Accepted':
        for (const call of this.scheduledQueue) {
          if (call.queueId === callData.notificationData.teamQueueId) {
            call.status = 'accepted';
            call.attendeeFirstName =
              callData.notificationData.assigneeDetails.firstName;
            call.attendeeLastName =
              callData.notificationData.assigneeDetails.lastName;
            this.removescheduleCallFromView(
              callData.notificationData.teamQueueId,
            );
          }
        }
        this.removeFromNewMeetingList(callData.notificationData.teamQueueId);
        break;
      case 'Assigned':
        for (const call of this.scheduledQueue) {
          if (call.queueId === callData.notificationData.teamQueueId) {
            call.status = 'assigned';
            call.attendeeFirstName =
              callData.notificationData.assigneeDetails.firstName;
            call.attendeeLastName =
              callData.notificationData.assigneeDetails.lastName;
            this.removescheduleCallFromView(
              callData.notificationData.teamQueueId,
            );
          }
        }
        this.removeFromNewMeetingList(callData.notificationData.teamQueueId);
        break;
    }
  }

  updateScheduleCallStatus(callData) {
    for (const call of this.scheduledQueue) {
      if (call.queueId === callData.notificationData.teamQueueId) {
        if (
          callData.notificationData.status === 'missed' ||
          callData.notificationData.status === 'cancelled'
        ) {
          call.status = callData.notificationData.status;
          this.removescheduleCallFromView(
            callData.notificationData.teamQueueId,
          );
        } else if (callData.notificationData.status === 'director-escalation') {
          call.directorEscalated = true;
        } else {
          call.managerEscalated = true;
        }
      } else {
        if (
          callData.notificationData.status === 'missed' ||
          callData.notificationData.status === 'cancelled'
        ) {
          this.removeFromNewMeetingList(callData.notificationData.teamQueueId);
        }
      }
    }
  }

  addToScheduleQueue(callData) {
    const queuedCall = new Queue();
    queuedCall.callerFirstName = callData.creatorDetails.firstName;
    queuedCall.callerLastName = callData.creatorDetails.lastName;
    queuedCall.callerRoleName = callData.creatorDetails.roleName;
    queuedCall.teamName = callData.teamDetails.name;
    queuedCall.callerProfile = callData.creatorDetails.photoUrl;
    queuedCall.status = 'queued';
    queuedCall.createdOn = `Event created ${moment
      .utc(
        moment().diff(
          moment(callData.eventObject.createdOn).subtract(1, 'minute'),
        ),
      )
      .format('HH:mm')} hrs ago`;
    queuedCall.queueId = callData.teamQueueId;
    queuedCall.teamId = callData.teamDetails.id;
    queuedCall.eventId = callData.eventObject.id;
    queuedCall.callType = callData.callType;
    queuedCall.startTime = moment(callData.eventObject?.startDateTime).format(
      'LT',
    );
    queuedCall.endTime = moment(callData.eventObject?.endDateTime).format('LT');
    queuedCall.date = moment(callData.eventObject?.startDateTime).isSame(
      new Date(),
      'date',
    )
      ? 'Today'
      : moment(callData.eventObject?.startDateTime).format('MMM Do');
    if (
      this.scheduleFilter !== 'all' &&
      this.scheduleFilter !== queuedCall.teamId
    ) {
      this.newMeeting.push(queuedCall.queueId);
    }
    for (const team of this.store.getTeams()) {
      if (team.teamId === queuedCall.teamId) {
        queuedCall.members = team.allMembers.filter(
          item => item.user_id !== this.store.getUser().id,
        );
      }
    }
    if (
      this.scheduleFilter === 'all' ||
      this.scheduleFilter === callData.teamDetails.id
    ) {
      if (!this.checkIfAlreadyExists(queuedCall, this.scheduledQueue)) {
        this.scheduledQueue = [queuedCall, ...this.scheduledQueue];
      }
    }
  }

  addToQueue(callData) {
    const queuedCall = new Queue();
    queuedCall.callerFirstName =
      callData.notificationData.callerDetails.firstName;
    queuedCall.callerLastName =
      callData.notificationData.callerDetails.lastName;
    queuedCall.callerRoleName =
      callData.notificationData.callerDetails.roleName;
    queuedCall.teamName = callData.notificationData.teamDetails.name;
    queuedCall.callerProfile = callData.notificationData.teamDetails.photoUrl;
    queuedCall.status = this.userVisibility === 1 ? 'queued' : 'na';
    queuedCall.timeLeft = { leftTime: 45, format: 'mm:ss' };
    queuedCall.queueId = callData.notificationData.teamDetails.teamQueueId;
    queuedCall.teamId = callData.notificationData.teamDetails.id;
    queuedCall.callType = callData.notificationData.callType;
    if (this.adhocFilter !== 'all' && this.adhocFilter !== queuedCall.teamId) {
      this.newCall.push(queuedCall.queueId);
    }
    if (
      this.adhocFilter === 'all' ||
      this.adhocFilter === callData.notificationData.teamDetails.id
    ) {
      if (
        !this.checkIfAlreadyExists(queuedCall, this.adhocQueue) &&
        queuedCall.status === 'queued'
      ) {
        this.adhocQueue = [queuedCall, ...this.adhocQueue];
      }
    }
    if (this.userVisibility === 1) {
      this.playAudio();
    }
  }

  playAudio() {
    this.callerTone.src = `../../../assets/audio/simple_bell.mp3`;
    this.callerTone.loop = false;
    this.callerTone.play();
  }

  checkIfAlreadyExists(queuedCall, queue): boolean {
    for (const call of queue) {
      if (call.queueId === queuedCall.queueId) {
        return true;
      }
    }
    return false;
  }

  removeFromNewCallList(queueId: string) {
    this.newCall = this.newCall.filter(id => id !== queueId);
  }

  removeFromNewMeetingList(queueId: string) {
    this.newMeeting = this.newMeeting.filter(id => id !== queueId);
  }

  removeAdhocCallFromView(queueId: string) {
    const removeTime = 15000;
    setTimeout(() => {
      this.adhocQueue = this.adhocQueue.filter(
        item => item.queueId !== queueId,
      );
    }, removeTime);
  }

  removescheduleCallFromView(queueId: string) {
    const removeTime = 15000;
    setTimeout(() => {
      this.scheduledQueue = this.scheduledQueue.filter(
        item => item.queueId !== queueId,
      );
    }, removeTime);
  }

  acceptCall(callData: Queue) {
    const timeout = 30000;
    if (this.store.getCallTab()) {
      this.toastrService.info(
        'You appear to be on a call. Please wait for 30 seconds and try again.',
        'ATTENTION',
        {
          timeOut: environment.messageTimeout,
        },
      );
    } else {
      this.store.setCallTab(true);
      setTimeout(() => {
        this.pubnubService.removeCallTabIfNotBusy();
      }, timeout);
      window.open(
        `/main/meeting?teamFrom=${callData.teamId}&meetingType=${callData.callType}&queueId=${callData.queueId}`,
      );
    }
  }

  stopTimer(timeLeft, queue) {
    const removeTime = 15000;
    if (timeLeft.left === 0) {
      queue.status = 'done';
      setTimeout(() => {
        this.adhocQueue = this.adhocQueue.filter(
          item => item.queueId !== queue.queueId,
        );
      }, removeTime);
    }
  }

  setCalendarEvents(
    startDate?: string,
    endDate?: string,
    calendarComponent?: SchedulerInterfaceComponent,
  ) {
    const hoursInADay = 24; //in case if it changes
    this.calendarFilters.startDate =
      startDate || new Date(new Date().setHours(0, 0, 0, 0)).toJSON();
    this.calendarFilters.endDate =
      endDate || new Date(new Date().setHours(hoursInADay, 0, 0, 0)).toJSON();
    this.calendarService
      .getEventsByUserIds(this.calendarFilters, [this.store.getUser().id])
      .subscribe(response => {
        this.todaysEvents = response;
        if (calendarComponent) {
          calendarComponent.databind(response);
        }
        this.todaysCalendar.databind(response);
      });
  }

  onCalendarNavigation(event) { }
  onCloseClick(): void { }

  onEventClick = event => {
    this.currentEvent = event;
    this.currentEvent['timeline'] = Helper.getCurrentTimeLineOfEvent(
      this.currentEvent.startTime,
      this.currentEvent.endTime,
    );
    this.quickColorBox = `${event.status} ${event.eventBoxBorder}`;
    let currentUserAsAttendee;
    if (this.currentEvent.attendees?.length) {
      currentUserAsAttendee = this.currentEvent.attendees.find(
        a => a.id === this.currentUser.id,
      );
    }
    this.isCurrentUserAnAttendee = !!currentUserAsAttendee;
    if (currentUserAsAttendee) {
      this.showRsvp = this.getShowRsvp(currentUserAsAttendee);
    }
    this.updateStartJoinMeetingButton();
  };

  getShowRsvp(currentUserAsAttendee) {
    return (
      this.isCurrentUserAnAttendee &&
      currentUserAsAttendee.id !== this.currentEvent.userId &&
      currentUserAsAttendee.id !== this.currentEvent['createdBy'] &&
      this.currentEvent['timeline'] !== 'past' &&
      !this.currentEvent.isCancelled
    );
  }

  getStartOrJoinMeetingVisibility(isFiveMinuteToStartOrOngoing) {
    return (
      !this.currentEvent['isMsEvent'] &&
      !this.currentEvent['isBusyEvent'] &&
      (this.isCurrentUserAnAttendee ||
        this.store.getUser().permissions.includes('JoinAnyMeeting')) &&
      isFiveMinuteToStartOrOngoing &&
      !this.currentEvent.isCancelled
    );
  }
  onRsvpChange(value) {
    const attendee = this.currentEvent?.attendees?.find(
      a => a.id === this.currentUser.id,
    );
    const closebtn = document.querySelector('.e-close');
    if (closebtn) {
      (closebtn as HTMLElement).click();
    }
    if (attendee) {
      attendee.response = value;
      this.calendarService
        .sendRsvpResponse(attendee, this.currentEvent.id)
        .subscribe(res => {
          this.currentEvent['rsvp'] = value;
          this.toastrService.success(
            'Your RSVP response has been sent successfully.',
            'SUCCESS',
            {
              timeOut: environment.messageTimeout,
            },
          );
        });
    }
  }

  onNoteChange(params) {
    const attendeeId = this.currentEvent?.attendees?.find(
      a => a.id === this.currentUser.id,
    )?.attendeeId;
    this.calendarService
      .sendQuickResponse(
        this.quickNotes.find(q => q.id === params.id),
        this.currentEvent.id,
        attendeeId,
      )
      .subscribe(res => {
        this.toastrService.success(
          'Quick response sent successfully.',
          'SUCCESS',
          {
            timeOut: environment.messageTimeout,
          },
        );
      });
  }
  showMoreDetails(meetingDetails) {
    this.moreDetailsDialog = this.dialogService.open(MeetingDetailsComponent, {
      context: { meetingDetails, quickNotesData: this.quickNotes },
    });
  }

  joinMeeting(eventId: string) {
    const timeout = 30000;
    if (this.store.getCallTab()) {
      this.toastrService.info(
        'You appear to be on a call. Please wait for 30 seconds and try again.',
        'ATTENTION',
        {
          timeOut: environment.messageTimeout,
        },
      );
    } else {
      this.store.setCallTab(true);
      setTimeout(() => {
        this.pubnubService.removeCallTabIfNotBusy();
      }, timeout);
      window.open(`/main/meeting/${eventId}`);
    }
  }

  ngAfterViewInit() {
    const timer = 200;

    const interval = setInterval(() => {
      const currentTimeline = document.querySelector('.e-current-timeline');
      const timelineContainer = document.querySelector('.e-content-wrap');
      const calnboxheight = document.querySelector('.e-work-cells');
      if (currentTimeline && timelineContainer && calnboxheight) {
        timelineContainer.scrollTop = 0;

        currentTimeline.scrollIntoView(true);

        clearInterval(interval);
      }
    }, timer);
  }

  ngOnDestroy() {
    super.ngOnDestroy();
    this.pubnub.removeListener(this.pubnubListner);
  }

  navigateToCalendar() {
    this.router.navigate(['/main/calendar']);
  }
}
