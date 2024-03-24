import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColumnSortingHeaderComponent } from './column-sorting-header.component';

describe('ColumnSortingHeaderComponent', () => {
  let component: ColumnSortingHeaderComponent;
  let fixture: ComponentFixture<ColumnSortingHeaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColumnSortingHeaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColumnSortingHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
