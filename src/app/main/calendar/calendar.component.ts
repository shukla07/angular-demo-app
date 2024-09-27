import {
  Component,
  ViewChild,
  ViewEncapsulation,
  ContentChild,
  TemplateRef,
  HostListener,
} from '@angular/core';
import { CalendarService } from './calendar.service';
import { UserSessionStoreService } from '@vmsl/core/store/user-session-store.service';
import {
  SchedulerEvent,
  AttendeeInfo,
  UserInfo as ScheduleUser,
  StartTimeConfigModel,
} from '@sourcefuse/ngx-scheduler/lib/types';
import { SchedulerInterfaceComponent } from '@sourcefuse/ngx-scheduler';
import { RouteComponentBase } from '@vmsl/core/route-component-base';
import { ActivatedRoute } from '@angular/router';
import { Location, NgTemplateOutlet } from '@angular/common';
import { ToastrService } from 'ngx-toastr';
import { environment } from '@vmsl/env/environment';
import { GetAddressBookUserAdapter } from './adapters/get-addressbook-user-adapter.service';
import { CalendarConfig } from './calendar.config';
import { QuickNotes } from './models/quick-notes-templates.model';
import * as moment from 'moment';
import { NbDialogModule, NbDialogRef, NbDialogService } from '@nebular/theme';
import { MeetingDetailsComponent } from '../meeting-details/meeting-details.component';
import { Helper } from './shared/utils';
import { forkJoin } from 'rxjs';
import { PubnubService } from '@vmsl/shared/facades/pubnub.service';
import { PubNubAngular } from 'pubnub-angular2';
import { EventUpdateInfo } from './models/event-update-info.model';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { BusyEventComponent } from './busy-event/busy-event.component';
@Component({
  selector: 'vmsl-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarComponent extends RouteComponentBase {
  @ViewChild('calendarObj')
  schedulerInterfaceComponent: SchedulerInterfaceComponent;
  userId: string;
  selectedUser;
  loggedInUser;
  possibleOwners: ScheduleUser[];
  isFocusedEventInCreateMode: boolean;
  pubnubListner: object;
  isMobileScreen = false;
  isLegendsDropdown = false;
  constructor(
    protected route: ActivatedRoute,
    protected location: Location,
    private readonly pubnub: PubNubAngular,
    private readonly calendarService: CalendarService,
    private readonly toastrService: ToastrService,
    private readonly store: UserSessionStoreService,
    private readonly dialogService: NbDialogService,
    private readonly userAdapter: GetAddressBookUserAdapter,
    private readonly pubnubService: PubnubService,
    private readonly ngxLoader: NgxUiLoaderService,
  ) {
    super(route, location);
    this.userId = this.getRouteParam('id') || this.store.getUser().id;
    this.navigatedEventId = this.getQueryParam('eventId');
    const eventDate = this.getQueryParam('date');
    if (eventDate) {
      this.selectedView = 'Day';
      this.selectedDate = eventDate as Object as Date;
    }
    this.loggedInUser = this.store.getUser();
    this.setOwnerId();
  }
  navigatedEventId = '';
  validateDate = args => {
    const inputDate = new Date(args.value);
    return inputDate >= new Date();
  };
  createBusyEvent() {
    this.dialogService.open(BusyEventComponent, {
      context: { callback: this.loadEventsbyDate.bind(this) },
    });
  }
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
  canChangeOwner: boolean;
  moreDetailsDialog: NbDialogRef<NbDialogModule>;
  eventStartTimeConfig: StartTimeConfigModel = {
    startEndTimeIntervalInMinutes: 60,
    changeEndTimeOn: 'keyUp',
  };
  @HostListener('click', ['$event'])
  onClick(event) {
    if (event.target.id !== 'legendsBtnRef') {
      this.isLegendsDropdown = false;
    }
  }
  ngOnInit() {
    this.loadParticipants();
    this.callListener();
    this.canChangeOwner = this.store
      .getUser()
      .permissions.includes('ChangeOwner');
    if (this.canChangeOwner) {
      this.loadPossibleOwnersList();
    }
    this.minStartDate = Helper.getMinStartDate();
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
  @ContentChild('quickInfoTemplatesContent')
  quickInfoTemplatesContent: TemplateRef<NgTemplateOutlet>;
  @ContentChild('customFieldsTemplate')
  customFieldsTemplate: TemplateRef<NgTemplateOutlet>;
  showMeetingType = true;
  quickNotes: QuickNotes[] = [];
  isCurrentUserAnAttendee = false;
  showRsvp = false;
  currentEvent: SchedulerEvent;
  timezone = '';
  showCellQuickInfo = false;
  showStartOrJoinMeetingButton = false;
  meetingLinkText = 'Join Meeting';
  scheduleData: SchedulerEvent[] = [];
  participants: ScheduleUser[] = [];
  allContacts: ScheduleUser[] = [];
  calendarConfig = CalendarConfig;
  contactName = '';
  meetingDetailsPage = '/main/meeting-details';
  existingEventData: SchedulerEvent;
  selectedView = 'Week';
  selectedDate = new Date();
  ownerId = '';
  quickColorBox: string;
  onSchedulerCreated = () => {
    setTimeout(() => {
      const startEndDateObj =
        this.schedulerInterfaceComponent.getStartAndEndDateOfCalendar();
      this.loadEventsbyDate(
        startEndDateObj['startDate'],
        startEndDateObj['endDate'],
      );
    });
  };
  setOwnerId() {
    const contactId = this.getRouteParam('id');
    if (!!contactId) {
      this.calendarService
        .checkDownHierarchy(this.loggedInUser.id, contactId)
        .subscribe(res => {
          this.ownerId = res ? contactId : this.loggedInUser.id;
        });
    } else {
      this.ownerId = this.store.getUser().id;
    }
  }
  getStartTimeOfNewEVent = (startDate: Date) =>
    Helper.getStartTimeOfNewEVent(startDate);
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
          this.loadEventsbyDate();
          this.toastrService.success(
            'Your RSVP response has been sent successfully.',
            'SUCCESS',
            { timeOut: environment.messageTimeout },
          );
        });
    }
  }
  onEditEvent = (args, isCreate) => {
    this.isFocusedEventInCreateMode = isCreate;
    if (
      moment(args.data.startTime).format('YYYY-MM-DD') >=
      moment(Date.now()).format('YYYY-MM-DD') &&
      isCreate
    ) {
      return;
    } else if (args.data.endTime < new Date()) {
      args.cancel = true;
      this.toastrService.info(
        'Events cannot be created or edited in past',
        'Info',
        { timeOut: environment.messageTimeout },
      );
    } else if (this.currentEvent['isBusyEvent']) {
      args.cancel = true;
      this.currentEvent = this.scheduleData.find(
        ev => ev.id === args?.data?.id,
      );
      var meetingDetails = this.currentEvent;
      this.dialogService.open(BusyEventComponent, {
        context: { meetingDetails, callback: this.loadEventsbyDate.bind(this) },
      });
      return;
    } else if (!args.data.canEdit) {
      args.cancel = true;
    } else {
      //do nothing
    }
  };
  onOwnerChange(params) {
    if (params?.id) {
      this.schedulerInterfaceComponent.disableSaveAndDiscardButtons(false);
      this.schedulerInterfaceComponent.addAttendee(params.id);
    }
  }
  loadParticipants() {
    this.calendarService.getUsers().subscribe(res => {
      this.allContacts = [...res];
      res.push(this.userAdapter.adaptToModel(this.store.getUser()));
      res.forEach(p => {
        p.role = p['userTitle'];
      });
      this.participants = res;
      Helper.sortList(this.participants);
      Helper.sortList(this.allContacts);
      this.contactName =
        this.userId === this.store.getUser().id
          ? 'My'
          : `${this.participants.find(p => p.id === this.userId)?.name}'s`;
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
      this.showRsvp = this.getShowRsvp(currentUserAsAttendee);
    } else {
      this.showRsvp = false;
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
        a => a.id === this.loggedInUser.id,
      );
    }
    this.meetingLinkText = currentUserAsAttendee?.isOrganizer
      ? 'Start Meeting'
      : 'Join Meeting';
  }
  getDefaultAttendeesOnCreate = event => {
    const attendees = [];
    // sonarignore:start
    const loggedInUserAsAttendee = this.userAdapter.adaptToModel(
      this.store.getUser(),
    ) as AttendeeInfo;
    // sonarignore:end
    if (loggedInUserAsAttendee.id === this.ownerId) {
      loggedInUserAsAttendee.isMandatory = true;
    }
    attendees.push(loggedInUserAsAttendee);
    if (this.userId !== this.loggedInUser.id) {
      // sonarignore:start
      const contact = this.participants.find(
        p => p.id === this.userId,
      ) as AttendeeInfo;
      // sonarignore:end
      if (contact) {
        attendees.push(contact);
        if (contact.id === this.ownerId) {
          contact.isMandatory = true;
        }
      }
    }
    if (
      this.selectedUser &&
      attendees.find(a => a.id !== this.selectedUser?.id)
    ) {
      attendees.push(this.selectedUser);
    }
    return attendees;
  };
  createTitleOfEvent(event) {
    return Helper.createTitleOfEvent(event);
  }
  onNavigation = (startTime, endTime) => {
    this.loadEventsbyDate(startTime, endTime);
  };
  loadEventsbyDate(startTime: Date = null, endTime: Date = null) {
    this.ngxLoader.start();
    const dateFilter = this.getCurrentDateFilter(startTime, endTime);
    this.calendarService
      .getEventsByUserIds(dateFilter, [this.userId], this.selectedUser?.id)
      .subscribe(
        response => {
          this.ngxLoader.stop();
          const filteredEvents = [];
          this.filterEventsBasedOnCurrentUser(response, filteredEvents);
          const currentDateFilter = this.getCurrentDateFilter();
          if (
            currentDateFilter.startDate === dateFilter.startDate &&
            currentDateFilter.endDate === dateFilter.endDate
          ) {
            this.scheduleData = [...filteredEvents];
            this.scheduleData.forEach(event => {
              let currentUserAsAttendee;
              if (event.attendees) {
                currentUserAsAttendee = event.attendees.find(
                  a => a.id === this.loggedInUser.id,
                );
              }
              event.attendees.forEach(attendee => {
                if (
                  !attendee.isOrganizer &&
                  attendee.response &&
                  attendee.response === 'declined'
                ) {
                  event.status = 'tentative';
                }
              });
              event.showProposeTimeField =
                event.userId !== this.loggedInUser.id &&
                !!currentUserAsAttendee &&
                !event.isCancelled;
            });
            const timeOut = 5000;
            setTimeout(() => {
              var eventCard = document.querySelectorAll(
                `div[data-eventid='${this.navigatedEventId}']`,
              )[0];
              if (eventCard) {
                (eventCard as HTMLElement).click();
              }
            }, timeOut);

            this.schedulerInterfaceComponent.databind(this.scheduleData);
          }
        },
        err => {
          this.ngxLoader.stop();
        },
      );
  }
  filterEventsBasedOnCurrentUser(response, filteredEvents) {
    response.forEach(event => {
      if (event.attendeeIds) {
        if (event.attendeeIds.includes(this.userId)) {
          filteredEvents.push(event);
        }
      } else {
        filteredEvents.push(event);
      }
    });
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
      startDate: startTime?.toJSON(),
      endDate: endTime?.toJSON(),
    };
  }
  onBeforeEventCreation = (event: SchedulerEvent, formObj) => {
    delete event.id;
    formObj.cancel = true;
    if (!event.attendees?.length) {
      this.toastrService.error(`Please add atleast one attendee`, 'Error', {
        timeOut: environment.messageTimeout,
      });
      this.showEditorPopUpOnCreate(event);
      return;
    }
    event['identifier'] = event.userId = this.ownerId;
    event['extId'] = this.store.getUser().tenantId;
    event.title = this.createTitleOfEvent(event);
    // set the organizer under attendees
    if (event.attendees) {
      const currentUserAsAttendee = event.attendees.find(
        a => a.id === event.userId,
      );
      if (currentUserAsAttendee) {
        currentUserAsAttendee.isOrganizer = true;
        currentUserAsAttendee.response = 'accepted';
      }
    }
    this.executeCreateEventAPI(event);
  };
  showEditorPopUpOnCreate(event, timeout?) {
    const defaultTimeout = 500;
    const openPopUpTimeout = timeout || defaultTimeout;
    setTimeout(() => {
      this.existingEventData = event;
      delete event.id; // as scheduler library adds an event id of its own
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
  executeCreateEventAPI(args) {
    this.calendarService.createEvent(args).subscribe(res => {
      this.scheduleData.push(res);
      const data = [...this.scheduleData];
      this.scheduleData = data;
      this.schedulerInterfaceComponent.databind(this.scheduleData);
      this.toastrService.success('Event saved successfully.', 'SUCCESS', {
        timeOut: environment.messageTimeout,
      });
    });
  }
  createNewEvent() {
    const currDate = new Date();
    const newEvent = {
      startTime: currDate,
      endTime: new Date(currDate).setHours(currDate.getHours() + 1),
    };
    this.schedulerInterfaceComponent.openEditorPopUp(newEvent, 'Add', false);
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
      // Update all the event and attendees in the API response
      this.executeAllEventEditOperations(
        newAttendees,
        updatedOrDeletedAttendees,
        updatedEvenPropertiesObj,
        changedEvent,
      );
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
    if (
      this.isAnyAttendeeAddedOrDeleted(originalEvent, changedEvent) ||
      changedEventValues['userId']
    ) {
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
        this.loadEventsbyDate();
        this.toastrService.success('Event cancelled successfully.', 'SUCCESS', {
          timeOut: environment.messageTimeout,
        });
      },
      error => {
        this.loadEventsbyDate();
      },
    );
  };
  getNewlyCreatedAttendees(
    originalEvent: SchedulerEvent,
    newEvent: SchedulerEvent,
  ) {
    let newAttendees = [];
    if (newEvent.attendees) {
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
    if (changedEvent.attendees && originalEvent.attendees) {
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
          this.loadEventsbyDate();
          this.toastrService.success('Event updated successfully.', 'SUCCESS', {
            timeOut: environment.messageTimeout,
          });
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
  onUserChange() {
    this.loadEventsbyDate();
    // ng-select on select item
    const selectedElement = document.querySelector(
      'ng-select.ng-select-filtered',
    );
    if (selectedElement !== null) {
      selectedElement.classList.remove('ng-select-filtered');
    }
  }
  onFindTimeOpen = (userIds: string[], startTime: Date) => {
    if (!userIds?.length) {
      return;
    }
    startTime.setHours(0, 0, 0, 0);
    const hoursInADay = 24;
    const endTime = new Date(startTime);
    endTime.setHours(hoursInADay, 0, 0, 0);
    this.calendarService
      .getEventsByUserIds(
        this.getCurrentDateFilter(startTime, endTime),
        userIds,
      )
      .subscribe((events: SchedulerEvent[]) => {
        if (events?.length > 0) {
          events.forEach(event => {
            event.attendeeIds = event.attendees?.map(a => a.id);
            event.attendeeIds.push(event.userId);
            event.attendeeIds = [...new Set(event.attendeeIds)];
          });
        }
        this.schedulerInterfaceComponent.databind(events, true);
      });
  };
  checkAndProposeNewTime(changedEvent) {
    const currentUserAsAttendee = changedEvent.attendees.find(
      a => a.id === this.loggedInUser.id,
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
    this.moreDetailsDialog = this.dialogService.open(MeetingDetailsComponent, {
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
  loadPossibleOwnersList() {
    this.calendarService.getOwners().subscribe(res => {
      if (res?.length) {
        this.possibleOwners = res;

        Helper.sortList(this.possibleOwners);
      }
    });
  }
  callListener() {
    this.pubnubListner = {
      message: m => {
        const eventData = JSON.parse(m.message);
        if (eventData.notificationType === 'SCHEDULED_MEETING') {
          this.updateEventRealTime(eventData.notificationData);
        } else if (eventData.notificationType === 'cancelled_event') {
          this.loadEventsbyDate();
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
    if (newEvent.userId !== this.userId) {
      return;
    }
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
    const newTitle = this.createTitleOfEvent(EventRef);
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
  updateEventRealTime(eventInfo: EventUpdateInfo) {
    this.calendarService.getEventById(eventInfo.eventId).subscribe(res => {
      if (eventInfo.eventType === 'new') {
        const newEventIndex = this.scheduleData.findIndex(
          e => (e.id as Object as string) === eventInfo.eventId,
        );
        if (newEventIndex !== -1) {
          return;
        }
      } else if (eventInfo.eventType === 'existing') {
        this.loadEventsbyDate();
      } else {
        this.scheduleData = this.scheduleData.filter(
          e => (e.id as Object as string) !== eventInfo.eventId,
        );
      }
      this.scheduleData.push(res[0]);
      if (
        this.currentEvent &&
        (this.currentEvent.id as Object as string) === eventInfo.eventId
      ) {
        this.currentEvent = res[0];
        if (this.currentEvent) {
          this.updateStartJoinMeetingButton(
            eventInfo['notificationReason'] === 'startsin15Mins',
          );
        } else {
          return;
        }
      }
      if (this.moreDetailsDialog?.componentRef?.instance) {
        this.moreDetailsDialog.componentRef.instance['meetingDetails'] = res[0];
      }
      const data = [...this.scheduleData];
      this.scheduleData = data;
      setTimeout(() => {
        this.schedulerInterfaceComponent.databind(this.scheduleData);
      });
    });
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
    super.ngOnDestroy();
    this.pubnub.removeListener(this.pubnubListner);
  }
}
