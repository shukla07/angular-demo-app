
export class CalendarConfig {
  // sonarignore:start




  static eventTemplate = `
  <div data-eventid='\${id}' class='event-card \${eventType} \${status} \${isHalfHour} \${meetingType} \${eventBoxBorder}'>
    <div class="e-card-title">
    <div class="e-audio-video-icons">
      <nb-icon class="e-audio-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" class="eva eva-phone-outline" fill="currentColor"><g data-name="Layer 2"><g data-name="phone"><rect width="24" height="24" opacity="0"></rect><path d="M17.4 22A15.42 15.42 0 0 1 2 6.6 4.6 4.6 0 0 1 6.6 2a3.94 3.94 0 0 1 .77.07 3.79 3.79 0 0 1 .72.18 1 1 0 0 1 .65.75l1.37 6a1 1 0 0 1-.26.92c-.13.14-.14.15-1.37.79a9.91 9.91 0 0 0 4.87 4.89c.65-1.24.66-1.25.8-1.38a1 1 0 0 1 .92-.26l6 1.37a1 1 0 0 1 .72.65 4.34 4.34 0 0 1 .19.73 4.77 4.77 0 0 1 .06.76A4.6 4.6 0 0 1 17.4 22zM6.6 4A2.61 2.61 0 0 0 4 6.6 13.41 13.41 0 0 0 17.4 20a2.61 2.61 0 0 0 2.6-2.6v-.33L15.36 16l-.29.55c-.45.87-.78 1.5-1.62 1.16a11.85 11.85 0 0 1-7.18-7.21c-.36-.78.32-1.14 1.18-1.59L8 8.64 6.93 4z"></path></g></g></svg>
      </nb-icon>
      <nb-icon class="e-video-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" class="eva eva-video-outline" fill="currentColor"><g data-name="Layer 2"><g data-name="video"><rect width="24" height="24" opacity="0"></rect><path d="M21 7.15a1.7 1.7 0 0 0-1.85.3l-2.15 2V8a3 3 0 0 0-3-3H5a3 3 0 0 0-3 3v8a3 3 0 0 0 3 3h9a3 3 0 0 0 3-3v-1.45l2.16 2a1.74 1.74 0 0 0 1.16.45 1.68 1.68 0 0 0 .69-.15 1.6 1.6 0 0 0 1-1.48V8.63A1.6 1.6 0 0 0 21 7.15zM15 16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V8a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1zm5-1.4L17.19 12 20 9.4z"></path></g></g></svg>
      </nb-icon>
      <nb-icon class="e-disabled-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" class="eva eva-slash-outline" fill="currentColor"><g data-name="Layer 2"><g data-name="slash"><rect width="24" height="24" opacity="0"></rect><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm8 10a7.92 7.92 0 0 1-1.69 4.9L7.1 5.69A7.92 7.92 0 0 1 12 4a8 8 0 0 1 8 8zM4 12a7.92 7.92 0 0 1 1.69-4.9L16.9 18.31A7.92 7.92 0 0 1 12 20a8 8 0 0 1-8-8z"></path></g></g></svg>
      </nb-icon>
    </div>
    <span class="e-card-time">\${formattedStartTime}-\${formattedEndTime}</span> \${title}
    </div>
    <div class="d-flex justify-content-between align-items-end time-members-row">
      <div class="e-card-members">\${attendees?.length} Attendees</div>
    </div>
  </div>
  `;
  // sonarignore:end

  static tooltipTemplate = `
  <div class="\${status}">
    <div class="text-capitalize">
      \${title}
    </div>
    <div>
      \${startTime}
    </div>
    <div>
      \${endTime}
    </div>
  </div>`;

  static rsvpResponses = [
    {
      text: 'Confirm',
      value: 'accepted',
    },
    {
      text: 'Decline',
      value: 'declined',
    },
  ];

  static firstDayOfWeek = 0;

  static selectedDate = new Date();
  static availableViews = ['Day', 'Week', 'Month'];
  static readOnly = false;
  static attendeeDisplayText = 'name';
  static showMeetingType = true;
  static schedulerHeight = 'calc(100vh - 150px)';
  // sonarignore:start
  static workDays: number[] = [0, 1, 2, 3, 4, 5, 6];
  // sonarignore:end
  static workHours = {start: '09:00', end: '17:00'};
  static cancelButtonText = 'Discard';
  static deleteButtonText = 'Cancel Event';
  static showProposeTime = true;
  static minStartDate = new Date();
  static showHeaderBarOnFindTime = true;
  static showConfirmationPopUpOnEdit = true;
  static defaultMeetingType = 'video';
}

