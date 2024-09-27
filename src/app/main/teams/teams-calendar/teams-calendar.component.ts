import {
  Component,
  ViewChild,
  ViewEncapsulation,
  ContentChild,
  TemplateRef,
  HostListener,
} from '@angular/core';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import {
  SchedulerEvent,
  AttendeeInfo,
  UserInfo as ScheduleUser,
  UserInfo,
  CustomItemModel,
  StartTimeConfigModel,
} from '@sourcefuse/ngx-scheduler/lib/types';
import { SchedulerInterfaceComponent } from '@sourcefuse/ngx-scheduler';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { ActivatedRoute } from '@angular/router';
import { Location, NgTemplateOutlet } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@vmsl/env/environment';
import * as moment from 'moment';
import { NbDialogService } from '@nebular/theme';
import { forkJoin } from 'rxjs';
import { Helper } from '../../calendar/shared/utils';
import { MeetingDetailsComponent } from '../../meeting-details/meeting-details.component';
import { CalendarService } from '../../calendar/calendar.service';
import { QuickNotes } from '../../calendar/models/quick-notes-templates.model';
import { CalendarConfig } from '../../calendar/calendar.config';
import { TeamsCalendarService } from './teams-calendar-service';
import { PubnubService } from '@vmsl/shared/facades/pubnub.service';
import { Permission } from '@vmsl/core/auth/permission-key.enum';
import { GetAddressBookUserAdapter } from '../../calendar/adapters/get-addressbook-user-adapter.service';
import { TeamsFacadeService } from '@vmsl/shared/facades/teams-facade.service';
import { PubNubAngular } from 'pubnub-angular2';
import { RequestMeetingComponent } from '../request-meeting/request-meeting.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { RoleType } from '@vmsl/core/enums';
@Component({
  selector: 'vmsl-calendar',
  templateUrl: './teams-calendar.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./teams-calendar.component.scss'],
})
export class TeamsCalendarComponent extends RouteComponentBase {
  @ViewChild('calendarObj')
  schedulerInterfaceComponent: SchedulerInterfaceComponent;
  mainTeamMembers: ScheduleUser[] = [];
  visibleMembersOnView: ScheduleUser[] = [];
  userId: string;
  selectedTeamId: string;
  lastTeamId: string;
  loggedInUser;
  selectedEventStatus: string;
  teamName: string;
  possibleOwners: UserInfo[];
  quickColorBox: string;
  showAllocationClass: string;
  pubnubListner: object;
  allTeams;
  readonly tentativeEventsGroupId = 'tentativeEvents';
  isMobileScreen = false;
  isLegendsDropdown = false;
  readonly maxMemOnView = 10;
  constructor(
    protected route: ActivatedRoute,
    protected location: Location,
    private readonly ngxLoader: NgxUiLoaderService,
    private readonly calendarService: CalendarService,
    private readonly toastrService: ToastrService,
    private readonly store: UserSessionStoreService,
    private readonly pubnub: PubNubAngular,
    private readonly dialogService: NbDialogService,
    private readonly teamsCalendarService: TeamsCalendarService,
    private readonly pubnubService: PubnubService,
    private readonly userAdapter: GetAddressBookUserAdapter,
    private readonly teamsFacadeService: TeamsFacadeService,
  ) {
    super(route, location);
    this.lastTeamId = this.selectedTeamId = this.getRouteParam('id');
    this.teamName = this.getRouteParam('name');
    this.selectedEventStatus = this.getQueryParam('eventStatus');
    this.isAllocationView = this.getQueryParam('isAllocationView') === 'true';
    if (this.isAllocationView) {
      this.availableViews = ['Day'];
      this.showGroupedView = true;
    } else {
      this.availableViews = ['Day', 'Week', 'Month'];
      this.showGroupedView = false;
    }
    this.loggedInUser = this.store.getUser();
  }
  isAllocationView = false;
  showGroupedView = false;
  prevMembers = 0;
  nextMembers = this.maxMemOnView;
  eventStartTimeConfig: StartTimeConfigModel = {
    startEndTimeIntervalInMinutes: 60,
    changeEndTimeOn: 'keyUp',
  };
  validateDate = args => {
    const inputDate = new Date(args.value);
    return inputDate >= new Date();
  };
  formValidation = {
    startTime: {
      required: true,
      range: [this.validateDate, 'Please select a valid date in future'],
    },
    endTime: {
      required: true,
      range: [this.validateDate, 'Please select a valid date in future'],
    },
  };
  minStartDate: Date;
  canChangeOwner = false;
  permissionKey = Permission;
  @HostListener('click', ['$event'])
  onClick(event) {
    if (event.target.id !== 'legendsBtnRef') {
      this.isLegendsDropdown = false;
    }
  }
  ngOnInit() {
    this.canChangeOwner = this.store
      .getUser()
      .permissions.includes('ChangeOwner');
    if (this.canChangeOwner) {
      this.loadOwners();
    }
    this.callListener();
    this.minStartDate = Helper.getMinStartDate();
    this.getTeams();
    const allocationButtonModel = {
      align: 'Left',
      cssClass: 'e-custom-item',
    };
    this.customHeaderItems.push(allocationButtonModel);
    this.calendarService.getQuickNotes().subscribe(resp => {
      this.quickNotes = resp;
    });
    if (this.store.getUser().role === '9' && this.store.getJrHcpLogin()) {
      this.toastrService.info(
        'Your account is yet to be approved by the Organisation Admin',
        'Attention',
        {
          timeOut: environment.messageTimeout,
        },
      );
      this.store.removeJrHcpLogin();
    }
    // check if site load in mobile devices
    this.mobileDevicesCheck();
  }
  getTeams() {
    this.allTeams = this.store.getTeams();
    if (!this.allTeams?.length) {
      this.teamsFacadeService.getTeams().subscribe(resp => {
        this.allTeams = resp;
      });
    }
  }
  @ContentChild('quickInfoTemplatesContent')
  quickInfoTemplatesContent: TemplateRef<NgTemplateOutlet>;
  @ContentChild('customFieldsTemplate')
  customFieldsTemplate: TemplateRef<NgTemplateOutlet>;
  showMeetingType = true;
  quickNotes: QuickNotes[] = [];
  isCurrentUserAnAttendee = false;
  isHcp = this.store.getUser().role === '7';
  showRsvp = false;
  currentEvent: SchedulerEvent;
  timezone = '';
  showCellQuickInfo = false;
  showStartOrJoinMeetingButton = false;
  meetingLinkText = 'Join Meeting';
  scheduleData: SchedulerEvent[] = [];
  participants: ScheduleUser[] = [];
  calendarConfig = CalendarConfig;
  contactName = '';
  meetingDetailsPage = '/main/meeting-details';
  existingEventData: SchedulerEvent;
  selectedView = 'Day';
  availableViews = ['Day'];
  eventStatusTypes = [
    {
      text: 'Tentative',
      value: 'tentative',
    },
    {
      text: 'Confirmed',
      value: 'confirmed',
    },
    {
      text: 'Completed',
      value: 'completed',
    },
    {
      text: 'Missed',
      value: 'missed',
    },
  ];
  getStartTimeOfNewEVent = (startDate: Date) => {
    const aheadTime = 31;
    return moment().add(aheadTime, 'm').toDate();
  };
  onNoteChange(params) {
    const attendeeId = this.currentEvent?.attendees?.find(
      a => a.id === this.loggedInUser.id,
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
  onRsvpChange(value) {
    const attendee = this.currentEvent?.attendees?.find(
      a => a.id === this.loggedInUser.id,
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
          this.loadEvents();
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
  openRequestMeetingDialog(requestTeamId) {
    this.dialogService.open(RequestMeetingComponent, {
      context: { requestTeamId },
    });
  }
  onEditEvent = (args, isCreate) => {
    if (this.currentEvent && this.currentEvent['isMsEvent']) {
      args.cancel = true;
    }
    if (isCreate && this.isHcp) {
      args.cancel = true;
      args.data.attendees = [];
      args.data.meetingType = 'audio';
      this.dialogService.open(RequestMeetingComponent, {
        context: {
          requestTeamId: this.lastTeamId,
          meetingDetails: args.data,
          callback: this.loadEvents.bind(this),
        },
      });
      return;
    }
    if (
      moment(args.data.startTime).format('YYYY-MM-DD') >=
      moment(Date.now()).format('YYYY-MM-DD') &&
      isCreate
    ) {
      args.cancel = true;
    } else if (args.data.endTime < new Date()) {
      this.toastrService.info(
        'Events cannot be created or edited in past',
        'Info',
        {
          timeOut: environment.messageTimeout,
        },
      );
    } else if (args.data.isCancelled) {
      args.cancel = true;
    } else if (this.currentEvent.userId === this.userId) {
      args.data.canDelete = true;
    } else if (this.currentEvent.userId !== this.userId) {
      args.data.canDelete = false;
    } else {
      //do nothing
    }
  };
  customHeaderItems: CustomItemModel[] = [];
  addAllocationViewButtonToHeader = () => {
    if (Number(this.store.getUser().role) !== RoleType.hcp) {
      const allocationViewBtn: HTMLElement = document.querySelector(
        '.e-custom-item button',
      );
      allocationViewBtn.classList.add('e-tbtn-txt');
      if (this.isAllocationView) {
        this.showAllocationClass = 'allocation-view-active';
        allocationViewBtn.innerHTML = 'Go back to team view';
        allocationViewBtn.onclick = function () {
          const queryString = this.selectedEventStatus
            ? `?eventStatus=${this.selectedEventStatus}&isAllocationView=false`
            : '?isAllocationView=false';
          window.location.href = `/main/teams/teams-calendar/${this.lastTeamId}/${this.teamName}${queryString}`;
        }.bind(this);
      } else {
        this.showAllocationClass = 'allocation-view-in-active';
        allocationViewBtn.innerHTML = 'Allocation View';
        allocationViewBtn.onclick = function () {
          const queryString = this.selectedEventStatus
            ? `?eventStatus=${this.selectedEventStatus}&isAllocationView=true`
            : '?isAllocationView=true';
          window.location.href = `/main/teams/teams-calendar/${this.lastTeamId}/${this.teamName}${queryString}`;
        }.bind(this);
      }
      return true;
    } else {
      return false;
    }
  };
  showNextTeamMembers() {
    this.scheduleData = [];
    this.prevMembers = this.nextMembers;
    this.nextMembers = this.nextMembers + this.maxMemOnView;
    this.showMembersOnAllocationView(this.mainTeamMembers);
    this.loadEventsForTeamUsers();
  }
  showPrevTeamMembers() {
    this.scheduleData = [];
    this.nextMembers = this.prevMembers;
    this.prevMembers = this.prevMembers - this.maxMemOnView;
    this.showMembersOnAllocationView(this.mainTeamMembers);
    this.loadEventsForTeamUsers();
  }
  showMembersOnAllocationView(allTeamMembers: ScheduleUser[]) {
    this.visibleMembersOnView = [];
    const totalMembers = allTeamMembers.length;
    let j = 0;
    for (let i = this.prevMembers; i < totalMembers; i++) {
      if (i < this.nextMembers) {
        this.visibleMembersOnView[j] = allTeamMembers[i];
        j++;
      } else {
        break;
      }
    }
    this.schedulerInterfaceComponent.bindResources(this.visibleMembersOnView);
  }
  loadEventsForTeamUsers(startTime: Date = null, endTime: Date = null) {
    const dateFilter = this.getCurrentDateFilter(startTime, endTime);
    const userIds = this.visibleMembersOnView.map(data => data.id);
    this.scheduleData = [];
    this.calendarService
      .getEventsByUserIds(
        { startDate: dateFilter.startTime, endDate: dateFilter.endTime },
        userIds,
        '',
        true,
      )
      .subscribe(res => {
        if (res.length) {
          this.scheduleData = res;
          this.scheduleData.forEach(event => {
            if (!event.attendees.length) {
              const id = [event.userId];
              event.attendeeIds = id;
            }
          });
          if (this.selectedEventStatus) {
            this.eventsFilterBasedOnStatus(this.selectedEventStatus);
          } else {
            this.schedulerInterfaceComponent.databind(this.scheduleData);
          }
        }
      });
  }
  loadParticipants() {
    this.teamsCalendarService.getTeamMembers(this.lastTeamId).subscribe(res => {
      this.participants = res;
      this.mainTeamMembers = [...res];
      this.participants.forEach(p => {
        p.role = p['userTitle'];
      });
      Helper.sortList(this.mainTeamMembers);
      if (this.isAllocationView) {
        this.showMembersOnAllocationView(this.mainTeamMembers);
        this.loadEventsForTeamUsers();
      }
      if (this.store.getUser().permissions.includes('JoinAnyMeeting')) {
        this.participants.push(
          this.userAdapter.adaptToModel(this.store.getUser()),
        );
      }
      Helper.sortList(this.participants);
    });
  }
  onEventClick = event => {
    this.currentEvent = this.scheduleData.find(ev => ev.id === event.id);
    this.currentEvent['timeline'] = Helper.getCurrentTimeLineOfEvent(
      this.currentEvent.startTime,
      this.currentEvent.endTime,
    );
    this.quickColorBox = `${event.status} ${event.eventBoxBorder}`;
    let currentUserAsAttendee;
    if (this.currentEvent.attendees?.length) {
      currentUserAsAttendee = this.currentEvent.attendees.find(
        a => a.id === this.loggedInUser.id,
      );
    }
    this.isCurrentUserAnAttendee = !!currentUserAsAttendee;
    if (currentUserAsAttendee) {
      this.showRsvp =
        this.isCurrentUserAnAttendee &&
        currentUserAsAttendee.id !== this.currentEvent.userId &&
        currentUserAsAttendee.id !== this.currentEvent['createdBy'] &&
        this.currentEvent['timeline'] !== 'past' &&
        !this.currentEvent.isCancelled;
    }
    var curr = moment(new Date());
    var start = moment(this.currentEvent.startTime);
    const meetingLinkShowTimeInMinutes = 15;
    var duration = moment.duration(start.diff(curr));
    const isFiveMinuteToStartOrOngoing =
      (duration.asMinutes() <= meetingLinkShowTimeInMinutes &&
        duration.asMinutes() >= 0) ||
      this.currentEvent['timeline'] === 'ongoing';
    this.showStartOrJoinMeetingButton =
      !this.currentEvent['isMsEvent'] &&
      this.isCurrentUserAnAttendee &&
      isFiveMinuteToStartOrOngoing &&
      !this.currentEvent.isCancelled;
    this.meetingLinkText =
      currentUserAsAttendee?.isOrganizer && this.showStartOrJoinMeetingButton
        ? 'Start Meeting'
        : 'Join Meeting';
  };
  createTitleOfEvent(event) {
    const hcp = event?.attendees?.find(
      at => at.extMetadata?.userDetails?.userTenantId === event.createdBy,
    );
    return Helper.createTitleOfEvent(
      event,
      `${hcp['title'] ?? ''} ${hcp?.name}`,
      hcp?.id,
    );
  }
  onNavigation = (startTime, endTime) => {
    this.loadEvents(startTime, endTime);
  };
  onSchedulerCreated = () => {
    const startEndDateObj =
      this.schedulerInterfaceComponent.getStartAndEndDateOfCalendar();
    setTimeout(() => {
      this.showHideCreateIcon();
      this.loadParticipants();
      if (!this.isAllocationView) {
        this.loadEvents(
          startEndDateObj['startDate'],
          startEndDateObj['endDate'],
        );
      }
    });
  };
  showHideCreateIcon() {
    // sonarignore:start
    const ele = document.querySelector('.e-toolbar-item.e-add') as HTMLElement;
    // sonarignore:end
    if (ele && !this.isHcp) {
      ele.classList.add('d-none');
    }
  }
  eventsFilterBasedOnStatus(status) {
    this.ngxLoader.start();
    if (status) {
      const filterEvents = [];
      this.scheduleData.forEach(event => {
        if (event.status === status) {
          filterEvents.push(event);
        }
      });
      this.schedulerInterfaceComponent.databind(filterEvents);
    } else {
      this.schedulerInterfaceComponent.databind(this.scheduleData);
    }
    this.ngxLoader.stop();
  }
  loadEvents(startTime = null, endTime = null) {
    if (this.isAllocationView) {
      this.loadEventsForTeamUsers(startTime, endTime);
      return;
    }
    const filters = this.getCurrentDateFilter(startTime, endTime);
    this.teamsCalendarService
      .getTeamEventsById(this.lastTeamId, filters)
      .subscribe(res => {
        const currentDateFilter = this.getCurrentDateFilter();
        if (
          currentDateFilter.startTime === filters.startTime &&
          currentDateFilter.endTime === filters.endTime
        ) {
          this.scheduleData = [...res];
          this.scheduleData.forEach(e => {
            if (
              e.attendeeIds &&
              (e.status === 'tentative' || e.status === 'missed')
            ) {
              e.attendeeIds.push(this.tentativeEventsGroupId);
            }
          });
          if (this.selectedEventStatus) {
            this.eventsFilterBasedOnStatus(this.selectedEventStatus);
          } else {
            this.schedulerInterfaceComponent.databind(this.scheduleData);
          }
        }
      });
  }
  showEditorPopUpOnCreate(event, timeout?) {
    const defaultTimeout = 500;
    const openPopUpTimeout = timeout || defaultTimeout;
    setTimeout(() => {
      this.existingEventData = event;
      delete event.id; //as scheduler library adds an event id of its own
      this.schedulerInterfaceComponent.openEditorPopUp(event, 'Add', false);
    }, openPopUpTimeout);
  }
  showEditorPopUpOnEdit(event, timeout?) {
    const defaultTimeOut = 200;
    const openPopUpTimeout = timeout || defaultTimeOut;
    setTimeout(() => {
      this.existingEventData = event;
      this.schedulerInterfaceComponent.openEditorPopUp(event, 'Save', false);
    }, openPopUpTimeout);
  }
  processFreebusyResponse(res) {
    const busyUserNames = [];
    for (const calendar of res.calendars) {
      const userId = Object.getOwnPropertyNames(calendar)[0];
      if (calendar[userId]?.busy.length > 0) {
        const userDetail = this.participants.find(p => p.id === userId);
        if (userDetail) {
          busyUserNames.push(userDetail.name);
        }
      }
    }
    if (busyUserNames?.length) {
      this.toastrService.error(
        `User(s) busy on the selected time: ${busyUserNames.join(', ')}`,
        'Error',
        {
          timeOut: environment.messageTimeout,
        },
      );
      return true;
    }
    return false;
  }
  onBeforeEventUpdation = (event: SchedulerEvent, formObj) => {
    if (!event) {
      return;
    }
    formObj.cancel = true;
    if (!event.attendees?.length) {
      this.toastrService.error(`Please add atleast one attendee`, 'Error', {
        timeOut: environment.messageTimeout,
      });
      const timeout = 500;
      this.showEditorPopUpOnEdit(event, timeout);
      return;
    }
    const originalEvent = this.scheduleData.find(e => e.id === event.id);
    const changedEvent = event;
    if (!event.isEditFormReadonly) {
      const updatedEvenPropertiesObj = this.getUpdatedEventObj(
        originalEvent,
        changedEvent,
      );
      const changedEventProperties = Object.getOwnPropertyNames(
        updatedEvenPropertiesObj,
      );
      if (changedEventProperties.includes('userId')) {
        this.setIsOrganiserForNewOwner(originalEvent, changedEvent);
      }
      const newAttendees = this.getNewlyCreatedAttendees(
        originalEvent,
        changedEvent,
      );
      const updatedOrDeletedAttendees = this.getUpdatedOrDeletedAttendees(
        originalEvent,
        changedEvent,
      );
      if (
        changedEventProperties.includes('startTime') ||
        changedEventProperties.includes('endTime') ||
        newAttendees?.length
      ) {
        //call free busy API
        this.calendarService
          .getUserFreeBusyStatus(changedEvent)
          .subscribe(res => {
            if (!this.processFreebusyResponse(res)) {
              // Update all the event and attendees in the API response
              this.executeAllEventEditOperations(
                newAttendees,
                updatedOrDeletedAttendees,
                updatedEvenPropertiesObj,
                changedEvent,
              );
            } else {
              this.showEditorPopUpOnEdit(changedEvent);
            }
          });
      } else {
        // Update all the event and attendees in the API response
        this.executeAllEventEditOperations(
          newAttendees,
          updatedOrDeletedAttendees,
          updatedEvenPropertiesObj,
          changedEvent,
        );
      }
      this.checkAndProposeNewTime(changedEvent);
    } else {
      this.checkAndProposeNewTime(changedEvent);
    }
  };
  setIsOrganiserForNewOwner(originalEvent, changedEvent) {
    for (const attendee of changedEvent.attendees) {
      if (attendee.id === changedEvent.userId) {
        attendee.isOrganizer = true;
        attendee.response = 'accepted';
      } else {
        attendee.isOrganizer = false;
      }
    }
  }
  getUpdatedEventObj(originalEvent, changedEvent) {
    const changedEventValues = this.getDifference(originalEvent, changedEvent);
    if (this.isAnyAttendeeAddedOrDeleted) {
      changedEventValues['title'] = this.createTitleOfEvent(changedEvent);
    }
    const changedProperties = Object.getOwnPropertyNames(changedEventValues);
    const validProperties = changedProperties.filter(x =>
      Object.getOwnPropertyNames(Helper.eventFieldMapper).includes(x),
    );
    if (validProperties.length > 0) {
      if (validProperties.includes('userId') && !changedEventValues['userId']) {
        delete changedEventValues['userId'];
      }
      const invalidProperties = changedProperties.filter(
        x => !Object.getOwnPropertyNames(Helper.eventFieldMapper).includes(x),
      );
      // delete the properties which are not valid
      if (invalidProperties?.length) {
        invalidProperties.forEach(p => delete changedEventValues[p]);
      }
      return changedEventValues;
    } else {
      return {};
    }
  }
  private isAnyAttendeeAddedOrDeleted(originalEvent, changedEvent) {
    const newAttendees = this.getNewlyCreatedAttendees(
      originalEvent,
      changedEvent,
    );
    const deletedAttendees = this.getDeletedAttendees(
      originalEvent,
      changedEvent,
    );
    return newAttendees?.length || deletedAttendees?.length;
  }
  loadOwners() {
    this.teamsCalendarService.getOwners(this.lastTeamId).subscribe(res => {
      this.possibleOwners = res;
    });
  }
  getDeletedAttendees(
    originalEvent: SchedulerEvent,
    changedEvent: SchedulerEvent,
  ) {
    return originalEvent.attendees.filter(a => {
      return (
        !changedEvent.attendees ||
        !changedEvent.attendees.find(newAttendee => newAttendee.id === a.id)
      );
    });
  }
  getDifference(originalObj, newObj) {
    const changedObj = {};
    if (!originalObj || !newObj) {
      return changedObj;
    }
    Object.getOwnPropertyNames(originalObj).forEach(prop => {
      if (newObj[prop] instanceof Date) {
        if (originalObj[prop] !== newObj[prop].toJSON()) {
          changedObj[prop] = newObj[prop];
        }
      } else if (typeof originalObj[prop] === 'boolean') {
        if (!!originalObj[prop] !== !!newObj[prop]) {
          changedObj[prop] = newObj[prop];
        }
      } else {
        if (originalObj[prop] !== newObj[prop]) {
          changedObj[prop] = newObj[prop];
        }
      }
    });
    return changedObj;
  }
  onBeforeEventDeletion = (event, formObj) => {
    formObj.cancel = true;
    this.calendarService.deleteEvent(event.id).subscribe(
      res => {
        this.loadEvents();
        this.toastrService.success(
          'Event cancelled successfullly.',
          'SUCCESS',
          {
            timeOut: environment.messageTimeout,
          },
        );
      },
      error => {
        this.loadEvents();
      },
    );
  };
  getNewlyCreatedAttendees(
    originalEvent: SchedulerEvent,
    newEvent: SchedulerEvent,
  ) {
    let newAttendees = [];
    if (newEvent.attendees?.length) {
      newAttendees = newEvent.attendees.filter(a => {
        return (
          !originalEvent.attendees ||
          !originalEvent.attendees.find(
            originalAttendee => originalAttendee.id === a.id,
          )
        );
      });
    }
    return newAttendees;
  }
  getUpdatedOrDeletedAttendees(
    originalEvent: SchedulerEvent,
    changedEvent: SchedulerEvent,
  ) {
    if (changedEvent.attendees && originalEvent.attendees?.length) {
      let updatedAttendees = this.getUpdatedAttendees(
        originalEvent,
        changedEvent,
      );
      const deletedAttendees = this.getDeletedAttendees(
        originalEvent,
        changedEvent,
      );
      updatedAttendees = updatedAttendees.concat(
        deletedAttendees.map(a => {
          return {
            deleted: true,
            id: a.id,
            attendeeId: a.attendeeId,
          };
        }),
      );
      return updatedAttendees;
    } else {
      return [];
    }
  }
  executeAllEventEditOperations(
    newAttendees,
    updatedOrDeletedAttendees,
    changedEventValues,
    newEvent,
  ) {
    const listOfOperationObservables = [];
    if (newAttendees?.length) {
      listOfOperationObservables.push(
        this.calendarService.createAttendees(newAttendees, newEvent.id),
      );
    }
    if (updatedOrDeletedAttendees?.length) {
      listOfOperationObservables.push(
        this.calendarService.updateAttendees(
          updatedOrDeletedAttendees,
          newEvent.id,
        ),
      );
    }
    if (Object.getOwnPropertyNames(changedEventValues).length > 0) {
      listOfOperationObservables.push(
        this.calendarService.updateEvent(changedEventValues, newEvent.id),
      );
    }
    if (listOfOperationObservables?.length) {
      forkJoin(...listOfOperationObservables).subscribe(
        res => {
          this.loadEvents();
          this.toastrService.success(
            'Event updated successfullly.',
            'SUCCESS',
            {
              timeOut: environment.messageTimeout,
            },
          );
        },
        error => {
          this.showEditorPopUpOnEdit(newEvent);
        },
      );
    }
  }
  userSearchFuntion(term: string, item: ScheduleUser) {
    return `${item.username} ${item.name} ${item.email}`
      .toLowerCase()
      .includes(term.toLowerCase());
  }
  getCurrentDateFilter(startTime: Date = null, endTime: Date = null) {
    if (!startTime && !endTime) {
      const startEndDateObj =
        this.schedulerInterfaceComponent.getStartAndEndDateOfCalendar();
      startTime = startEndDateObj.startDate;
      endTime = startEndDateObj.endDate;
    }
    const hoursInADay = 24;
    endTime = new Date(endTime);
    endTime.setHours(hoursInADay, 0, 0, 0);

    return {
      startTime: startTime?.toJSON(),
      endTime: endTime?.toJSON(),
    };
  }
  onFindTimeOpen = (userIds: string[], startTime: Date) => {
    if (!userIds?.length) {
      return;
    }
    startTime.setHours(0, 0, 0, 0);
    const hoursInADay = 24;
    const endTime = new Date(startTime);
    endTime.setHours(hoursInADay, 0, 0, 0);
    const filters = this.getCurrentDateFilter(startTime, endTime);
    this.calendarService
      .getEventsByUserIds(
        {
          startDate: filters.startTime,
          endDate: filters.endTime,
        },
        userIds,
      )
      .subscribe((events: SchedulerEvent[]) => {
        if (events?.length > 0) {
          events.forEach(event => {
            event.attendeeIds = event.attendees?.map(a => a.id);
          });
        }
        this.schedulerInterfaceComponent.databind(events, true);
      });
  };
  checkAndProposeNewTime(changedEvent) {
    const currentUserAsAttendee = changedEvent.attendees.find(
      a => a.id === this.userId,
    );
    if (
      currentUserAsAttendee?.extMetadata &&
      currentUserAsAttendee.extMetadata['proposedTime']
    ) {
      this.calendarService
        .proposeNewTime(
          currentUserAsAttendee.extMetadata['proposedTime'],
          changedEvent.id,
          currentUserAsAttendee.attendeeId,
        )
        .subscribe(res => {
          this.toastrService.success(
            'New time proposed successfully',
            'SUCCESS',
            {
              timeOut: environment.messageTimeout,
            },
          );
        });
    }
  }
  getUpdatedAttendees(
    originalEvent: SchedulerEvent,
    changedEvent: SchedulerEvent,
  ) {
    const updatedAttendees = [];
    for (const originalAttendee of originalEvent.attendees) {
      const changedAttendee = changedEvent.attendees?.find(
        this.isMatchingAttendee,
        { originalAttendee: originalAttendee },
      );
      if (changedAttendee) {
        const changedPropertiesObj = this.getDifference(
          originalAttendee,
          changedAttendee,
        );
        const validAttendeePropertiesThatCanChange = [
          'isOrganizer',
          'response',
        ];
        const changedProperties =
          Object.getOwnPropertyNames(changedPropertiesObj);
        const validProperties = changedProperties.filter(x =>
          validAttendeePropertiesThatCanChange.includes(x),
        );
        if (validProperties.length === 0) {
          continue;
        }
        const invalidProperties = changedProperties.filter(
          x => !validAttendeePropertiesThatCanChange.includes(x),
        );
        // delete the properties which are not valid
        if (invalidProperties?.length) {
          invalidProperties.forEach(p => delete changedPropertiesObj[p]);
        }
        const updatedAttendee = changedPropertiesObj as AttendeeInfo;
        updatedAttendee.id = changedAttendee.id;
        updatedAttendee.attendeeId = originalAttendee.attendeeId;
        updatedAttendees.push(updatedAttendee);
      }
    }
    return updatedAttendees;
  }
  isMatchingAttendee(changedattendee) {
    return changedattendee.id === this['originalAttendee'].id;
  }
  showMoreDetails(meetingDetails) {
    this.dialogService.open(MeetingDetailsComponent, {
      context: { meetingDetails, quickNotesData: this.quickNotes },
    });
  }
  joinMeeting(id) {
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
      window.open(`/main/meeting/${id}`);
    }
  }
  callListener() {
    this.pubnubListner = {
      message: m => {
        const eventData = JSON.parse(m.message);
        if (eventData.notificationType === 'SCHEDULED_MEETING') {
          this.loadEvents();
        } else if (
          eventData.notificationType === 'rsvp_event' &&
          eventData.notificationData?.rsvpStatus === 'Declined'
        ) {
          this.updateDeclineEvent(eventData);
        } else {
          // empty else
        }
      },
    };
    this.pubnub.addListener(this.pubnubListner);
  }

  updateDeclineEvent(eventData) {
    const newEventIndex = this.scheduleData.findIndex(
      e => (e.id as Object as string) === eventData.notificationData.eventId,
    );
    if (newEventIndex === -1) {
      return;
    }
    const newEvent = this.scheduleData[newEventIndex];
    let newEventStatus = 'tentative';
    let removeAttnIndexInArr;
    const attendeeId = eventData.notificationData.declinedBy.attendeeId;
    newEvent.attendees.forEach((attnInfo, index) => {
      if (attnInfo.attendeeId === attendeeId) {
        removeAttnIndexInArr = index;
      }
      if (
        attnInfo.attendeeId !== attendeeId &&
        !attnInfo.isOrganizer &&
        attnInfo.response === 'accepted'
      ) {
        newEventStatus = 'confirmed';
      }
    });
    const EventRef = { ...newEvent };
    EventRef.attendees.splice(removeAttnIndexInArr, 1);
    const newTitle = Helper.createTitleOfEvent(EventRef);
    const obj = {
      deleted: true,
      id: eventData.notificationData.declinedBy.userId,
      attendeeId: eventData.notificationData.declinedBy.attendeeId,
    };
    this.executeAllEventEditOperations(
      [],
      [obj],
      { title: newTitle, status: newEventStatus },
      newEvent,
    );
  }

  onOwnerChange(params) {
    this.schedulerInterfaceComponent.addAttendee(params.id);
  }
  onTeamChange(params) {
    if (params?.teamId) {
      this.lastTeamId = params.teamId;
      this.ngxLoader.start();
      this.lastTeamId = this.selectedTeamId = params.teamId;
      const queryString = this.selectedEventStatus
        ? `?eventStatus=${this.selectedEventStatus}`
        : '';
      window.location.href = `/main/teams/teams-calendar/${params.teamId}/${params.teamName}${queryString}`;
    }
  }
  mobileDevicesCheck() {
    const isMobile = {
      android: () => navigator.userAgent.match(/Android/i),
      blackBerry: () => navigator.userAgent.match(/BlackBerry/i),
      iOS: () => navigator.userAgent.match(/iPhone|iPad|iPod/i),
      opera: () => navigator.userAgent.match(/Opera Mini/i),
      windows: () =>
        navigator.userAgent.match(/IEMobile/i) ||
        navigator.userAgent.match(/WPDesktop/i),
      any: () => {
        return (
          isMobile.android() ||
          isMobile.blackBerry() ||
          isMobile.iOS() ||
          isMobile.opera() ||
          isMobile.windows()
        );
      },
    };
    if (isMobile.any()) {
      this.isMobileScreen = true;
    } else {
      this.isMobileScreen = false;
    }
  }
  isLegends() {
    this.isLegendsDropdown = !this.isLegendsDropdown;
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
    this.pubnub.removeListener(this.pubnubListner);
  }
}
