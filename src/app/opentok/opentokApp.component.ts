import {Component, OnInit, ChangeDetectorRef} from '@angular/core';
import {OpentokService} from './opentok.service';
import * as OT from '@opentok/client';

@Component({
  selector: 'app-root',
  templateUrl: './opentokApp.component.html',
  styleUrls: ['./opentokApp.component.css'],
  providers: [OpentokService],
})
export class OpentokComponent implements OnInit {
  title = 'Angular Basic Video Chat';
  session: OT.Session;
  streams: Array<OT.Stream> = [];
  changeDetectorRef: ChangeDetectorRef;

  constructor(
    private readonly ref: ChangeDetectorRef,
    private readonly opentokService: OpentokService,
  ) {
    this.changeDetectorRef = ref;
  }

  ngOnInit() {
    this.opentokService
      .initSession()
      .then((session: OT.Session) => {
        this.session = session;
        this.session.on('streamCreated', event => {
          this.streams.push(event.stream);
          this.changeDetectorRef.detectChanges();
        });
        this.session.on('streamDestroyed', event => {
          const idx = this.streams.indexOf(event.stream);
          if (idx > -1) {
            this.streams.splice(idx, 1);
            this.changeDetectorRef.detectChanges();
          }
        });
      })
      .then(() => this.opentokService.connect())
      .catch(err => {
        alert(
          'Unable to connect. Make sure you have updated the config.ts file with your OpenTok details.',
        );
      });
  }
}
