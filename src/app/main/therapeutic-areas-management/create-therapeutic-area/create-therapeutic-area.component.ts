import {Location} from '@angular/common';
import {Component, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {TherapeuticAreasService} from '@vmsl/shared/facades/therapeutic-areas.service';
import {ToastrService} from 'ngx-toastr';
import {TherapeuticArea} from '../shared/models/therapeutic-area-info.model.ts';

@Component({
  selector: 'vmsl-create-therapeutic-area',
  templateUrl: './create-therapeutic-area.component.html',
  styleUrls: ['./create-therapeutic-area.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateTherapeuticAreaComponent extends RouteComponentBase {
  title = 'Add Therapeutic Area';
  therapeuticAreasRoute = '/main/therapeutic-areas-management';
  therapeuticArea = new TherapeuticArea();
  therapeuticAreaId: string;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly router: Router,
    protected readonly storeService: UserSessionStoreService,
    private readonly therapeuticAreasService: TherapeuticAreasService,
    private readonly toastrService: ToastrService,
  ) {
    super(route, location);
  }
  ngOnInit() {
    this.therapeuticAreaId = this.getRouteParam('id');
    if (this.therapeuticAreaId) {
      this.title = 'Update Therapeutic Area';
      this.getTherapeuticArea();
    }
  }

  addUpdateTherapeuticArea(form: NgForm) {
    if (form.invalid) {
      return;
    }

    if (this.therapeuticAreaId) {
      this._subscriptions.push(
        this.therapeuticAreasService
          .editTherapeuticArea(this.therapeuticArea, this.therapeuticAreaId)
          .subscribe(resp => {
            this.toastrService.success(
              'Therapeutic Area Updated succesfully',
              'SUCCESS ',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.router.navigate([this.therapeuticAreasRoute]);
          }),
      );
    } else {
      this._subscriptions.push(
        this.therapeuticAreasService
          .addTherapeuticArea(this.therapeuticArea)
          .subscribe(resp => {
            this.toastrService.success(
              'Therapeutic Area added succesfully',
              'SUCCESS ',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.router.navigate([this.therapeuticAreasRoute]);
          }),
      );
    }
  }

  getTherapeuticArea() {
    this.therapeuticAreasService
      .getTherapeuticAreaById(this.therapeuticAreaId)
      .subscribe(
        res => {
          this.therapeuticArea = res;
        },
        err => {
          const goBackDelay = 2000;
          setTimeout(function () {
            window.location.href = '/main/therapeutic-area-management';
          }, goBackDelay);
        },
      );
  }

  cancel(form) {
    if (this.therapeuticAreaId) {
      this.getTherapeuticArea();
    } else {
      form.resetForm();
    }
  }
}
