import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgePipelineComponent } from './ledge-pipeline.component';

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
        name: 'Initialize',
        children: [
          { name: 'Initialize:success' }
        ]
      },
      {
        name: 'Build', children: [
          { name: 'Pull code:success' },
          { name: 'Test:error' },
          { name: 'Build:current' }
        ]
      },
      {
        name: 'Deploy', children: [
          { name: 'QA:pending' },
          { name: 'UAT:processing' },
          { name: 'STAGING:processing' },
          { name: 'PROD:untouched' }
        ]
      },
      {
        name: 'Finish', children: [
          { name: 'Finish:untouched' }
        ]
      }
    ];
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
