import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LedgeMarkdownRenderComponent } from './ledge-markdown-render.component';
import { SharedModule } from '../../shared.module';
import { RouterTestingModule } from '@angular/router/testing';

describe('MarkdownRenderComponent', () => {
  let component: LedgeMarkdownRenderComponent;
  let fixture: ComponentFixture<LedgeMarkdownRenderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [SharedModule, RouterTestingModule],
      declarations: [LedgeMarkdownRenderComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LedgeMarkdownRenderComponent);
    component = fixture.componentInstance;
    component.data = `
# h1

## h2

[link](link)

`;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should build toc str', () => {
    expect(component.tocStr)
      .toEqual(`<div class="level_1" data-tocId="0"><a id="menu-h1" href="#h1" title=h1>h1</a>
<div class="level_child"><div class="level_2" data-tocId="1"><a id="menu-h2" href="#h2" title=h2>h2</a></div></div>
</div>`);
  });

  it('should scroll to top when call scrollToTop', () => {
    component.sticky = true;
    const scrollTop = window.scrollTo;
    window.scrollTo = jasmine.createSpy('scroll');

    component.scrollToTop();
    expect(component.sticky).toBeFalse();
    expect(window.scrollTo).toHaveBeenCalled();

    window.scrollTo = scrollTop;
  });

  it('should not show sticky button when not scroll', () => {
    component.handleScroll({});
    expect(component.sticky).toBeFalse();
  });
});
