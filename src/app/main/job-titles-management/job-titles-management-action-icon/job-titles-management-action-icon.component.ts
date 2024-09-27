import {Component, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {JobTitlesManagementService} from '@vmsl/shared/facades/job-titles-management.service';
import {Status} from '@vmsl/core/enums/status.enum';

@Component({
  selector: 'vmsl-job-titles-management-action-icon',
  templateUrl: './job-titles-management-action-icon.component.html',
  styleUrls: ['./job-titles-management-action-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class JobTitlesManagementActionIconComponent {
  permissionKey = Permission;
  status: number;
  jobTitleId: string;
  jobTitle: string;
  jobTitleStatus = Status;

  constructor(
    private readonly router: Router,
    private readonly jobTitleManageService: JobTitlesManagementService,
  ) {}

  agInit(params): void {
    this.status = params.data.status;
    this.jobTitleId = params.data && params.data.id;
    this.jobTitle = params.data && params.data.jobTitle;
  }

  onClickStatus(radioButton) {
    this.jobTitleManageService.setJobTitleStatus({
      status: radioButton,
      jobTitleId: this.jobTitleId,
    });
  }

  edit() {
    this.router.navigate([
      `/main/job-titles-management/edit/${this.jobTitleId}`,
    ]);
  }

  delete() {
    this.jobTitleManageService.setJobTitleToBeDeleted({
      jobTitleName: this.jobTitle,
      jobTitleId: this.jobTitleId,
    });
  }
}
