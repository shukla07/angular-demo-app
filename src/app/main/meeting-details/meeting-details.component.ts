import {Component} from '@angular/core';
import {ActivatedRoute} from '@angular/router';
import {Location} from '@angular/common';
import {ToastrService} from 'ngx-toastr';
import {NbDialogRef} from '@nebular/theme';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {environment} from '@vmsl/env/environment';
import {CalendarService} from '../calendar/calendar.service';

@Component({
  selector: 'vmsl-meeting-details',
  templateUrl: './meeting-details.component.html',
  styleUrls: ['./meeting-details.component.scss'],
})
export class MeetingDetailsComponent extends RouteComponentBase {
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly calendarService: CalendarService,
    private readonly toastrService: ToastrService,
    protected dialogRef: NbDialogRef<MeetingDetailsComponent>,
  ) {
    super(route, location);
  }
  meetingDetails;
  quickNotesData;
  quickNotes = {};
  ngOnInit(): void {
    if (!this.meetingDetails) {
      const stateMeetingDetails =
        this.location.getState()['meetingDetails'] || null;
      if (!stateMeetingDetails) {
        this.getMeetingDetails(this.route.snapshot.paramMap.get('id'));
      } else {
        this.meetingDetails = stateMeetingDetails;
      }
    }
    if (!this.quickNotesData) {
      this.calendarService.getQuickNotes().subscribe(
        response => {
          response.forEach(note => {
            this.quickNotes[note.id] = note.message;
          });
        },
        error => {},
      );
    } else {
      this.quickNotesData.forEach(note => {
        this.quickNotes[note.id] = note.message;
      });
    }
  }

  getMeetingDetails(id) {
    this.calendarService.getEventById(id).subscribe(
      response => {
        if (!response.length) {
          this.toastrService.error("Couldn't get Meeting Details", 'Error', {
            timeOut: environment.messageTimeout,
          });
        }
        this.meetingDetails = response[0];
      },
      error => {},
    );
  }

  closeDialog(event) {
    event.preventDefault();
    this.dialogRef.close();
  }
}
