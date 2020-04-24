import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { LedgeRenderModule } from '../ledge-render.module';


describe('Pipe: tohtml', () => {
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [LedgeRenderModule],
      declarations: [TestComponent],
    });
    fixture = TestBed.createComponent(TestComponent);
    fixture.detectChanges();
  });

  [
    { value: '', result: `` },
    { value: '<i>ledge</i>', result: `ledge` },
  ].forEach((item: any) => {
    it(`${item.value.toString()} muse be ${item.result}`, () => {
      fixture.componentInstance.value = item.value;
      fixture.detectChanges();
      expect(
        (fixture.debugElement.query(By.css('#result'))
          .nativeElement as HTMLElement).textContent
      ).toBe(item.result);
    });
  });
});

@Component({
  template: `<div id="result" [innerHTML]="value | tohtml"></div> `,
})
class TestComponent {
  value = '';
}
