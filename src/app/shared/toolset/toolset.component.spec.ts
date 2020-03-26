import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToolsetComponent } from './toolset.component';

describe('ToolsetComponent', () => {
  let component: ToolsetComponent;
  let fixture: ComponentFixture<ToolsetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ToolsetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToolsetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
