import {
  AttendeeInfo,
  SchedulerEvent,
  UserInfo,
} from '@sourcefuse/ngx-scheduler/lib/types';
import * as moment from 'moment';
import {RoleName} from '@vmsl/core/enums/roles.enum';
import {EventUpdateInfo} from '../models/event-update-info.model';
import {CalendarService} from '../calendar.service';
import {SchedulerInterfaceComponent} from '@sourcefuse/ngx-scheduler';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';

// sonarignore:start
export class Helper {
  constructor(private readonly store: UserSessionStoreService) {}
  static mapApiEventToSchedulerEvent(resp, userId): any {
    // sonarignore:end
    let attendees: AttendeeInfo[];
    if (resp && resp.attendees) {
      attendees = resp.attendees.map(at => {
        return {
          id: at.identifier,
          attendeeId: at.id,
          response:
            at.responseStatus === 'needsAction' ? null : at.responseStatus,
          name: `${at.extMetadata?.userDetails?.firstName} ${at.extMetadata?.userDetails?.lastName}`,
          email: at.extMetadata?.userDetails?.email,
          username: at.extMetadata?.userDetails?.username,
          isOrganizer: at.isOrganizer,
          meetingStatus: at.extMetadata?.meetingStatus,
          meetingLastUpdateId: at.extMetadata?.message_id,
          role:
            at.extMetadata?.userDetails?.jobTitle ||
            at.extMetadata?.userDetails?.roleName,
          extMetadata: at.extMetadata,
          isMandatory:
            (at.extMetadata?.userDetails?.userTenantId === resp.createdBy &&
              at.extMetadata?.userDetails?.roleName === RoleName.hcp) ||
            at.identifier === resp.identifier,
        };
      });
    }
    const timeline = this.getCurrentTimeLineOfEvent(
      resp.startDateTime,
      resp.endDateTime,
    );
    let currentUserAsAttendee;
    if (resp.attendees) {
      currentUserAsAttendee = attendees.find(a => a.id === userId);
    }
    const obj = {
      description: resp.description,
      endTime: resp.endDateTime,
      location: resp.location,
      userId: resp.identifier,
      startTime: resp.startDateTime,
      title: resp.summary,
      attendees: attendees ? attendees : [],
      isBlock: resp.isBlocked,
      id: resp.id,
      isMaCall: resp.extMetadata?.meetingInfo?.meetingType === 'MoD',
      meetingType: resp.extMetadata?.meetingInfo?.type,
      status: resp.status ?? 'tentative',
      isEditFormReadonly:
        resp.isReadOnly ||
        resp.status === 'cancelled' ||
        timeline === 'past' ||
        (resp.extMetadata?.isBusyEvent && !currentUserAsAttendee),
      attendeeIds: attendees?.map(a => a.id),
      isCancelled: resp.status === 'cancelled',
      canDelete:
        (resp.hasOwnProperty('isCancellable')
          ? resp.isCancellable
          : !resp.isReadOnly) &&
        resp.status !== 'cancelled' &&
        timeline !== 'past' &&
        resp.hasOwnProperty('attendees'),
      canEdit: resp.isMsEvent
        ? false
        : resp.status !== 'cancelled' &&
          timeline !== 'past' &&
          !resp.isMsEvent &&
          resp.hasOwnProperty('attendees') &&
          resp.isAllocationView
        ? !resp.isReadOnly
        : true,
      timeline,
      teamName: resp.extMetadata?.teamDetails?.teamName,
      rsvp: attendees?.length
        ? attendees.find(a => a.id === userId)?.response
        : '',
      isMsEvent: resp.isMsEvent,
      isBusyEvent: resp.extMetadata?.isBusyEvent,
      eventType: resp.extMetadata?.isBusyEvent ? 'busy' : 'normal',
    };
    const isFullDayEvent = moment(obj.endTime).diff(
      moment(obj.startTime),
      'hours',
    );
    const localStartTime = moment(obj.startTime).utc().format('HH:mm');
    const localEndTime = moment(obj.endTime).utc().format('HH:mm');
    const oneDay = 24;
    if (
      isFullDayEvent % oneDay === 0 &&
      localStartTime === '00:00' &&
      localEndTime === '00:00'
    ) {
      this.setTimeForFullDayEvent(obj);
    } else {
      obj['formattedStartTime'] = moment(
        new Date(obj.startTime),
        'HH:mm Z',
      ).format('hh:mm A');
      obj['formattedEndTime'] = moment(new Date(obj.endTime), 'HH:mm Z').format(
        'hh:mm A',
      );
    }
    if (resp.extMetadata?.status === 'missed') {
      obj.status = 'missed';
    }

    const startMoment = moment(obj.startTime);
    const endMoment = moment(obj.endTime);
    const minutes = 30;
    obj['isHalfHour'] =
      moment.duration(endMoment.diff(startMoment)).asMinutes() <= minutes;
    obj['showProposeTimeField'] =
      obj.userId !== userId && !!currentUserAsAttendee && !obj.isCancelled;
    this.assignColorToEvent(obj as Object as SchedulerEvent);
    obj['createdBy'] = resp.createdBy;
    obj['eventBoxBorder'] = this.assignBorderToEvent(obj);
    return obj;
  }
  static getCurrentTimeLineOfEvent(startTime, endTime) {
    const currentTime = new Date().getTime();
    let timeline;
    if (currentTime > new Date(endTime).getTime()) {
      timeline = 'past';
    } else if (
      currentTime > new Date(startTime).getTime() &&
      currentTime < new Date(endTime).getTime()
    ) {
      timeline = 'ongoing';
    } else {
      timeline = 'future';
    }
    return timeline;
  }
  // sonarignore:start
  static assignBorderToEvent(obj: Object) {
    // sonarignore:end
    if (obj['isMsEvent']) {
      if (obj['isMaCall'] || obj['title'] === 'MoD Time') {
        if (obj['timeline'] === 'past') {
          return 'ms-mod-past-event';
        } else {
          return 'ms-mod-future-event';
        }
      }
      if (obj['timeline'] === 'past') {
        return 'ms-past-event';
      } else {
        return 'ms-future-event';
      }
    } else if (obj['isBusyEvent']) {
      if (obj['timeline'] === 'past') {
        return 'vmsl-busy-past';
      } else {
        return 'vmsl-busy-future';
      }
    } else {
      return 'vmsl-event';
    }
  }

  static assignColorToEvent(event: SchedulerEvent) {
    switch (event.status) {
      case 'tentative':
        event.color = '#458dc9';
        break;
      case 'confirmed':
        event.color = '#00d68f';
        break;
      case 'cancelled':
        event.color = '#9f9f9f';
        break;
      case 'completed':
        event.color = '#d0d0d0';
        break;
      case 'missed':
        event.color = 'orange';
        break;
      default:
        break;
    }
  }

  static eventFieldMapper = {
    endTime: 'endDateTime',
    userId: 'identifier',
    startTime: 'startDateTime',
    meetingType: 'meetingType',
    title: 'summary',
    status: 'status',
  };

  static getStartTimeOfNewEVent = (startDate: Date) => {
    const newDate = new Date(startDate);
    newDate.setHours(new Date().getHours());
    const intervalInMinutes = 15;
    newDate.setMinutes(
      (Math.round(new Date().getMinutes() / intervalInMinutes) + 1) *
        intervalInMinutes,
    );
    return newDate;
  };

  static createTitleOfEvent(
    event: SchedulerEvent,
    ownerName = null,
    ownerId = null,
  ) {
    let title = '';
    const owner = event.attendees.find(at => at.id === event.userId);
    ownerName = ownerName || `${owner['title'] ?? ''} ${owner.name}`;
    let attendee;

    const minAttendeesCountForTitleCreation = 2;
    if (event.attendees?.length >= minAttendeesCountForTitleCreation) {
      attendee =
        event.attendees[0].id === (ownerId || owner.id)
          ? event.attendees[1]
          : event.attendees[0];
      title = `Meeting: ${ownerName} with ${attendee.title ?? ''} ${
        attendee.name
      }`;

      const minAttendeesRequired = 2;
      if (event.attendees.length > minAttendeesRequired) {
        title = `${title} and additional attendees`;
      }
    } else {
      title = `${ownerName}'s Meeting`;
    }

    if (event['teamName']) {
      event['teamName'] = `${event['teamName'].charAt(0).toUpperCase()}${event[
        'teamName'
      ].slice(1)}`;
      title = `${title} - ${event['teamName']}`;
    }

    return title;
  }

  static sortList(list: UserInfo[]) {
    list.sort((a, b) => a.name.localeCompare(b.name));
  }

  static getMinStartDate(): Date {
    const minStartDate = new Date();
    minStartDate.setMinutes(0);
    minStartDate.setHours(0);
    return minStartDate;
  }

  static updateEventRealTime(
    eventInfo: EventUpdateInfo,
    scheduleObj: SchedulerInterfaceComponent,
    scheduleData: SchedulerEvent[],
    currentEvent: SchedulerEvent,
    calendarService: CalendarService,
  ) {
    calendarService.getEventById(eventInfo.eventId).subscribe(res => {
      if (eventInfo.eventType === 'new') {
        const newEventIndex = scheduleData.findIndex(
          e => (e.id as Object as string) === eventInfo.eventId,
        );
        if (newEventIndex !== -1) {
          return;
        }
      } else {
        scheduleData = scheduleData.filter(
          e => (e.id as Object as string) !== eventInfo.eventId,
        );
      }
      scheduleData.push(res[0]);
      if (
        currentEvent &&
        (currentEvent.id as Object as string) === eventInfo.eventId
      ) {
        currentEvent = res[0];
      }
      const data = [...scheduleData];
      scheduleData = data;
      setTimeout(() => {
        scheduleObj.databind(scheduleData);
      });
    });
  }

  static setTimeForFullDayEvent(event) {
    event.formattedStartTime = '12:00 AM';
    event.formattedEndTime = '11:59 PM';
    const format = 'YYYY-MM-DDTHH:mm:ss';
    const timeDiffInMinutes = moment.tz(moment.tz.guess())['_offset'];
    const removeZoneFromStartTime = moment(event.startTime)
      .utc()
      .format(format);
    const removeZoneFromEndTime = moment(event.endTime).utc().format(format);
    const allDayStartTime = moment(removeZoneFromStartTime)
      .subtract(timeDiffInMinutes, 'minutes')
      .format(format);
    const allDayEndTime = moment(removeZoneFromEndTime)
      .subtract(timeDiffInMinutes, 'minutes')
      .format(format);
    event.startTime = `${allDayStartTime}.000Z`;
    event.endTime = `${allDayEndTime}.000Z`;
  }
}
