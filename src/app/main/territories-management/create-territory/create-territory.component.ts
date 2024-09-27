import {Location} from '@angular/common';
import {Component, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {TerritoryManagementService} from '@vmsl/shared/facades/territory-management.service';
import {ToastrService} from 'ngx-toastr';
import {Territory} from '../shared/models/territory-info.model';

@Component({
  selector: 'vmsl-create-territory',
  templateUrl: './create-territory.component.html',
  styleUrls: ['./create-territory.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateTerritoryComponent extends RouteComponentBase {
  title = 'Add Territory';
  territoryRoute = '/main/territories-management';
  territory = new Territory();
  territoryId: string;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly router: Router,
    protected readonly storeService: UserSessionStoreService,
    private readonly territoryManagementService: TerritoryManagementService,
    private readonly toastrService: ToastrService,
  ) {
    super(route, location);
  }
  ngOnInit() {
    this.territoryId = this.getRouteParam('id');
    if (this.territoryId) {
      this.title = 'Update Territory';
      this.getTerritory();
    }
  }

  addUpdateTerritory(form: NgForm) {
    if (form.invalid) {
      return;
    }

    if (this.territoryId) {
      this._subscriptions.push(
        this.territoryManagementService
          .editTerritory(this.territory, this.territoryId)
          .subscribe(resp => {
            this.toastrService.success(
              'Territory Updated succesfully',
              'SUCCESS ',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.router.navigate([this.territoryRoute]);
          }),
      );
    } else {
      this._subscriptions.push(
        this.territoryManagementService
          .addTerritory(this.territory)
          .subscribe(resp => {
            this.toastrService.success(
              'Territory added succesfully',
              'SUCCESS ',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.router.navigate([this.territoryRoute]);
          }),
      );
    }
  }

  getTerritory() {
    this.territoryManagementService
      .getTerritoryById(this.territoryId)
      .subscribe(
        res => {
          this.territory = res;
        },
        err => {
          const goBackDelay = 2000;
          setTimeout(function () {
            window.location.href = '/main/territories-management';
          }, goBackDelay);
        },
      );
  }

  cancel(form) {
    if (this.territoryId) {
      this.getTerritory();
    } else {
      form.resetForm();
    }
  }
}
