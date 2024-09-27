import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ConferenceReportsComponent } from './conference-reports.component';


describe('ConferenceReportsComponent', () => {
  let component: ConferenceReportsComponent;
  let fixture: ComponentFixture<ConferenceReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ConferenceReportsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConferenceReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
