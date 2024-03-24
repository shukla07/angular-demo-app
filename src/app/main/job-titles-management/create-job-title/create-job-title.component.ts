import {Location} from '@angular/common';
import {Component, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {JobTitlesManagementService} from '@vmsl/shared/facades/job-titles-management.service';
import {ToastrService} from 'ngx-toastr';
import {JobTitle} from '../shared/models/job-titles-info.model';

@Component({
  selector: 'vmsl-create-job-title',
  templateUrl: './create-job-title.component.html',
  styleUrls: ['./create-job-title.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateJobTitleComponent extends RouteComponentBase {
  title = 'Add Role';
  jobTitleRoute = '/main/job-titles-management';
  jobTitle = new JobTitle();
  jobTitleId: string;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly router: Router,
    protected readonly storeService: UserSessionStoreService,
    private readonly jobTitlesManagementService: JobTitlesManagementService,
    private readonly toastrService: ToastrService,
  ) {
    super(route, location);
  }
  ngOnInit() {
    this.jobTitleId = this.getRouteParam('id');
    if (this.jobTitleId) {
      this.title = 'Update Role';
      this.getJobTitles();
    }
  }

  addUpdateJobTitle(form: NgForm) {
    if (form.invalid) {
      return;
    }
    if (this.jobTitleId) {
      this._subscriptions.push(
        this.jobTitlesManagementService
          .editJobTitle(this.jobTitle, this.jobTitleId)
          .subscribe(resp => {
            this.toastrService.success(
              'Role Updated succesfully',
              'SUCCESS ',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.router.navigate([this.jobTitleRoute]);
          }),
      );
    } else {
      this._subscriptions.push(
        this.jobTitlesManagementService
          .addJobTitle(this.jobTitle)
          .subscribe(resp => {
            this.toastrService.success(
              'Role added succesfully',
              'SUCCESS ',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.router.navigate([this.jobTitleRoute]);
          }),
      );
    }
  }

  getJobTitles() {
    this.jobTitlesManagementService.getJobTitleById(this.jobTitleId).subscribe(
      res => {
        this.jobTitle = res;
      },
      err => {
        const goBackDelay = 2000;
        setTimeout(function () {
          window.location.href = '/main/job-titles-management';
        }, goBackDelay);
      },
    );
  }

  cancel(form) {
    if (this.jobTitleId) {
      this.getJobTitles();
    } else {
      form.resetForm();
    }
  }
}
