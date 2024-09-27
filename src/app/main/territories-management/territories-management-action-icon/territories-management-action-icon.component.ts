import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import {Router} from '@angular/router';
import {Permission} from '@vmsl/core/auth/permission-key.enum';
import {TerritoryManagementService} from '@vmsl/shared/facades/territory-management.service';

@Component({
  selector: 'vmsl-territories-management-action-icon',
  templateUrl: './territories-management-action-icon.component.html',
  styleUrls: ['./territories-management-action-icon.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TerritoriesManagementActionIconComponent implements OnInit {
  permissionKey = Permission;
  status: number;
  territoryId: string;
  name: string;

  constructor(
    private readonly router: Router,
    private readonly territoryManageService: TerritoryManagementService,
  ) {}
  ngOnInit(): void {}

  agInit(params): void {
    this.status = params.data.status;
    this.territoryId = params.data && params.data.id;
    this.name = params.data && params.data.name;
  }

  onClickStatus(radioButton) {
    this.territoryManageService.setTerritoryStatus({
      status: radioButton,
      territoryId: this.territoryId,
    });
  }

  edit() {
    this.router.navigate([
      `/main/territories-management/edit/${this.territoryId}`,
    ]);
  }

  delete() {
    this.territoryManageService.setTerritoryToBeDeleted({
      territoryName: this.name,
      territoryId: this.territoryId,
    });
  }
}
