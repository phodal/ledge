import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgePipelineComponent } from './ledge-pipeline.component';
import { Stage } from './ledge-pipeline.model';

describe('LedgePieComponent', () => {
  let component: LedgePipelineComponent;
  let fixture: ComponentFixture<LedgePipelineComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LedgePipelineComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgePipelineComponent);
    component = fixture.componentInstance;
    component.data = [
      {
        label: 'Initialize',
        jobs: [
          { label: 'Initialize', state: 'success' }
        ]
      }, {
        label: 'Build',
        jobs: [
          { label: 'Pull code', state: 'success' },
          { label: 'Test', state: 'error' },
          { label: 'Build', state: 'current' }
        ]
      }, {
        label: 'Deploy',
        jobs: [
          { label: 'QA', state: 'pending' },
          { label: 'UAT', state: 'processing' },
          { label: 'STAGING', state: 'processing' },
          { label: 'PROD', state: 'untouched' }
        ]
      }, {
        label: 'Finish',
        jobs: [
          { label: 'Finish', state: 'untouched' }
        ]
      }
    ] as Stage[];
    component.config = {
      connectionStrokeWidth: 4,
      stateStrokeWidth: 4,
      stateRadius: 16,
      stageSpace: 60,
      stageLabelHeight: 30,
      stageLabelSize: '16px',
      jobHeight: 60,
      jobLabelSize: '12px',
      startNodeRadius: 12,
      startNodeSpace: 40,
      endNodeRadius: 12,
      endNodeSpace: 40
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
