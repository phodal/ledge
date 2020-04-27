import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeFishBoneComponent } from './ledge-fish-bone.component';

describe('LedgeFishboneComponent', () => {
  let component: LedgeFishBoneComponent;
  let fixture: ComponentFixture<LedgeFishBoneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LedgeFishBoneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeFishBoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
