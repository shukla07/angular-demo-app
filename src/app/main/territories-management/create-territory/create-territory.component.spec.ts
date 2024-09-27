import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTerritoryComponent } from './create-territory.component';

describe('CreateTerritoryComponent', () => {
  let component: CreateTerritoryComponent;
  let fixture: ComponentFixture<CreateTerritoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTerritoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTerritoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
