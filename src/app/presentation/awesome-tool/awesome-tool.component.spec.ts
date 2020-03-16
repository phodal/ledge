import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AwesomeToolComponent } from './awesome-tool.component';

describe('AwesomeToolComponent', () => {
  let component: AwesomeToolComponent;
  let fixture: ComponentFixture<AwesomeToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AwesomeToolComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AwesomeToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
