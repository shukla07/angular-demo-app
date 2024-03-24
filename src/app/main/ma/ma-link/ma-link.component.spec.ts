import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MaLinkComponent } from './ma-link.component';

describe('MaLinkComponent', () => {
  let component: MaLinkComponent;
  let fixture: ComponentFixture<MaLinkComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MaLinkComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MaLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
