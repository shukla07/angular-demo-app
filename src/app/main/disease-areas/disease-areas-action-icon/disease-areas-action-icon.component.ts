import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {DiseaseAreasService} from '@vmsl/shared/facades/disease-areas.service';

@Component({
  selector: 'vmsl-disease-areas-action-icon',
  templateUrl: './disease-areas-action-icon.component.html',
  styleUrls: ['./disease-areas-action-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DiseaseAreasActionIconComponent implements OnInit {
  permissionKey = Permission;
  status: number;
  diseaseAreaId: string;
  diseaseAreaName: string;

  constructor(
    private readonly router: Router,
    private readonly diseaseAreaManageService: DiseaseAreasService,
  ) {}
  ngOnInit(): void {}

  agInit(params): void {
    this.status = params.data.status;
    this.diseaseAreaId = params.data && params.data.id;
    this.diseaseAreaName = params.data && params.data.name;
  }

  onClickStatus(radioButton) {
    this.diseaseAreaManageService.setDiseaseAreaStatus({
      status: radioButton,
      diseaseAreaId: this.diseaseAreaId,
    });
  }

  edit() {
    this.router.navigate([
      `/main/disease-areas-management/edit/${this.diseaseAreaId}`,
    ]);
  }

  delete() {
    this.diseaseAreaManageService.setDiseaseAreaToBeDeleted({
      diseaseAreaName: this.diseaseAreaName,
      diseaseAreaId: this.diseaseAreaId,
    });
  }
}
