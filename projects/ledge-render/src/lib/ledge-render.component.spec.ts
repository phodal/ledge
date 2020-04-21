import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { LedgeRenderComponent } from './ledge-render.component';
import { SimpleChange, SimpleChanges } from '@angular/core';

describe('LedgeChecklistComponent', () => {
  let component: LedgeRenderComponent;
  let fixture: ComponentFixture<LedgeRenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LedgeRenderComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeRenderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build paragraph', () => {
    const content = `这是一个段落`;

    const simpleChange = new SimpleChange('', content, false);
    const changesObj: SimpleChanges = {
      content: simpleChange
    };
    component.ngOnChanges(changesObj);

    expect(component.markdownData.length).toEqual(1);
    expect(component.markdownData[0].type).toEqual('paragraph');
    expect(component.markdownData[0].data).toEqual(content);
  });

  it('should build checklist', () => {
    const content = `
\`\`\`checklist
- DevOps 检查清单
  - 文化
    - 确保跨组织和团队中的业务对齐
\`\`\`
`;

    const simpleChange = new SimpleChange('', content, false);
    const changesObj: SimpleChanges = {
      content: simpleChange
    };
    component.ngOnChanges(changesObj);

    expect(component.markdownData.length).toEqual(1);
    expect(component.markdownData[0].type).toEqual('checklist');
    expect(component.markdownData[0].data[0].name).toEqual('DevOps 检查清单');
  });
});
