import {Location} from '@angular/common';
import {Component, ViewEncapsulation} from '@angular/core';
import {NgForm} from '@angular/forms';
import {ActivatedRoute, Router} from '@angular/router';
import {RouteComponentBase} from '@vmsl/core/route-component-base';
import {UserSessionStoreService} from '@vmsl/core/store/user-session-store.service';
import {environment} from '@vmsl/env/environment';
import {DiseaseAreasService} from '@vmsl/shared/facades/disease-areas.service';
import {ToastrService} from 'ngx-toastr';
import {DiseaseArea} from '../shared/models/disease-area-info.model';

@Component({
  selector: 'vmsl-create-disease-area',
  templateUrl: './create-disease-area.component.html',
  styleUrls: ['./create-disease-area.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CreateDiseaseAreaComponent extends RouteComponentBase {
  title = 'Add Product/Disease Area';
  diseaseAreasRoute = '/main/disease-areas-management';
  diseaseArea = new DiseaseArea();
  diseaseAreaId: string;
  constructor(
    protected readonly route: ActivatedRoute,
    protected readonly location: Location,
    private readonly router: Router,
    protected readonly storeService: UserSessionStoreService,
    private readonly diseaseAreasService: DiseaseAreasService,
    private readonly toastrService: ToastrService,
  ) {
    super(route, location);
  }
  ngOnInit() {
    this.diseaseAreaId = this.getRouteParam('id');
    if (this.diseaseAreaId) {
      this.title = 'Update Product/Disease Area';
      this.getDiseaseArea();
    }
  }

  addUpdateDiseaseArea(form: NgForm) {
    if (form.invalid) {
      return;
    }

    if (this.diseaseAreaId) {
      this._subscriptions.push(
        this.diseaseAreasService
          .editDiseaseArea(this.diseaseArea, this.diseaseAreaId)
          .subscribe(resp => {
            this.toastrService.success(
              'Product/Disease Area updated succesfully',
              'SUCCESS ',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.router.navigate([this.diseaseAreasRoute]);
          }),
      );
    } else {
      this._subscriptions.push(
        this.diseaseAreasService
          .addDiseaseArea(this.diseaseArea)
          .subscribe(resp => {
            this.toastrService.success(
              'Product/Disease Area added succesfully',
              'SUCCESS ',
              {
                timeOut: environment.messageTimeout,
              },
            );
            this.router.navigate([this.diseaseAreasRoute]);
          }),
      );
    }
  }

  getDiseaseArea() {
    this.diseaseAreasService.getDiseaseAreaById(this.diseaseAreaId).subscribe(
      res => {
        this.diseaseArea = res;
      },
      err => {
        const goBackDelay = 2000;
        setTimeout(function () {
          window.location.href = '/main/disease-area-management';
        }, goBackDelay);
      },
    );
  }

  cancel(form) {
    if (this.diseaseAreaId) {
      this.getDiseaseArea();
    } else {
      form.resetForm();
    }
  }
}
