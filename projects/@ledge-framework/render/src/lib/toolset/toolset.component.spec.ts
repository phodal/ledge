import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolsetComponent } from './toolset.component';
import { CustomMaterialModule } from '../custom-material.module';

describe('ToolsetComponent', () => {
  let component: ToolsetComponent;
  let fixture: ComponentFixture<ToolsetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [CustomMaterialModule],
      declarations: [ ToolsetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsetComponent);
    component = fixture.componentInstance;
    component.option = {id: '1', type: 'line-chart', data: []};

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
