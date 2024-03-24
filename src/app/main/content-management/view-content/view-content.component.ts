import {Component} from '@angular/core';
import {Location} from '@angular/common';
import {ContentManagementService} from '@vmsl/shared/facades/content-management.service';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {Content} from '../shared/models/content-info.model';
import {ActivatedRoute} from '@angular/router';
import {ContentType} from '@vmsl/core/enums';

@Component({
  selector: 'vmsl-view-content',
  templateUrl: './view-content.component.html',
  styleUrls: ['./view-content.component.scss'],
})
export class ViewContentComponent extends RouteComponentBase {
  pdfSrc: string;
  content = new Content();
  contentId: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileEnum = ContentType;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly contentManagementService: ContentManagementService,
  ) {
    super(route, location);
  }

  ngOnInit() {
    this.contentId = this.getRouteParam('id');
    if (this.contentId) {
      this.getContent();
    }
  }

  getContent() {
    this.contentManagementService.getContentById(this.contentId).subscribe(
      res => {
        this.content = res;
      },
      err => {
        const goBackDelay = 2000;
        setTimeout(function () {
          window.location.href = '/main/content-management';
        }, goBackDelay);
      },
    );
  }
}
