import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporterComponent } from './reporter.component';
import { SharedModule } from '../../shared/shared.module';

describe('ReporterComponent', () => {
  let component: ReporterComponent;
  let fixture: ComponentFixture<ReporterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule],
      declarations: [ReporterComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReporterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
