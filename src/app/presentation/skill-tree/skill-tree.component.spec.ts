import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillTreeComponent } from './skill-tree.component';

describe('SkillTreeComponent', () => {
  let component: SkillTreeComponent;
  let fixture: ComponentFixture<SkillTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SkillTreeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SkillTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
