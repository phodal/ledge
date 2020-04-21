import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';

import { PeriodicTableModule } from '../periodic-table.module';
import { PeriodicTableComponent } from './periodic-table.component';
import { SharedModule } from '../../../shared/shared.module';

describe('PeriodicTableComponent', () => {
  let component: PeriodicTableComponent;
  let fixture: ComponentFixture<PeriodicTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        PeriodicTableModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader,
          },
        }),
      ],
      declarations: [PeriodicTableComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PeriodicTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update category', () => {
    const type = 'openCloud';

    component.select(type);

    expect(component.selectCategory).toEqual(type);
  });

  it('should enable hover detail', () => {
    component.atoms = [{ number: 3 } as any];
    const atomNumber = 3;

    component.showAtomDetails(atomNumber);

    expect(component.currentAtom.number).toEqual(atomNumber);
  });
});
