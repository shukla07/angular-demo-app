import {IAdapter} from '@vmsl/core/api/adapters/i-adapter';
import {Injectable} from '@angular/core';
import {ModMetric} from '../models/mod-reports-model';

@Injectable()
export class ModMetricReportListAdapter implements IAdapter<ModMetric> {
  adaptToModel(resp: any): ModMetric {
    const report = new ModMetric();
    report.metric = resp.metric;
    report.value = resp.value;
    return report;
  }
  adaptFromModel(data: Partial<ModMetric>) {
    return data;
  }
}
