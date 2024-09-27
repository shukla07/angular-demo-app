import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import { TherapeuticAreasService } from '@vmsl/shared/facades/therapeutic-areas.service';

@Component({
  selector: 'vmsl-therapeutic-areas-action-icon',
  templateUrl: './therapeutic-areas-action-icon.component.html',
  styleUrls: ['./therapeutic-areas-action-icon.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class TherapeuticAreasActionIconComponent implements OnInit {
  permissionKey = Permission;
  status: number;
  therapeuticAreaId: string;
  therapeuticAreaName: string;

  constructor(
    private readonly router: Router,
    private readonly therapeuticAreaManageService: TherapeuticAreasService,
  ) {}
  ngOnInit(): void {}

  agInit(params): void {
    this.status = params.data.status;
    this.therapeuticAreaId = params.data && params.data.id;
    this.therapeuticAreaName = params.data && params.data.name;
  }

  onClickStatus(radioButton) {
    this.therapeuticAreaManageService.setTherapeuticAreaStatus({
      status: radioButton,
      therapeuticAreaId: this.therapeuticAreaId,
    });
  }

  edit() {
    this.router.navigate([
      `/main/therapeutic-areas-management/edit/${this.therapeuticAreaId}`,
    ]);
  }

  delete() {
    this.therapeuticAreaManageService.setTherapeuticAreaToBeDeleted({
      therapeuticAreaName: this.therapeuticAreaName,
      therapeuticAreaId: this.therapeuticAreaId,
    });
  }
}
