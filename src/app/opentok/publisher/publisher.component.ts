import {
  Component,
  ElementRef,
  AfterViewInit,
  ViewChild,
  Input,
} from '@angular/core';
import {OpentokService} from '../opentok.service';
const publish = () => {
  //this is intentional piece of code
};
@Component({
  selector: 'app-publisher',
  templateUrl: './publisher.component.html',
  styleUrls: ['./publisher.component.css'],
})
export class PublisherComponent implements AfterViewInit {
  @ViewChild('publisherDiv') publisherDiv: ElementRef;
  @Input() session: OT.Session;
  publisher: OT.Publisher;
  publishing: boolean;
  camera = false;

  constructor(private readonly opentokService: OpentokService) {
    this.publishing = false;
  }

  ngAfterViewInit() {
    const OT = this.opentokService.getOT();
    this.publisher = OT.initPublisher(this.publisherDiv.nativeElement, {
      insertMode: 'append',
      publishVideo: true,
    });

    if (this.session) {
      if (this.session['isConnected']()) {
        this.publish();
      }
      this.session.on('sessionConnected', () => this.publish());
    }
  }

  publish() {
    this.session.publish(this.publisher, err => {
      if (err) {
        alert(err.message);
      } else {
        this.publishing = true;
      }
    });
  }

  switchCamera() {
    this.camera = !this.camera;
    this.publisher.publishVideo(this.camera);
  }
}
