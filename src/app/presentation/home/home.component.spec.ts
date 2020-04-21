import {
  async,
  ComponentFixture,
  inject,
  TestBed,
} from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { RouterTestingModule } from '@angular/router/testing';
import {
  TranslateFakeLoader,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { SharedModule } from '../../shared/shared.module';
import { PeriodicTableModule } from '../../features/periodic-table/periodic-table.module';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        SharedModule,
        PeriodicTableModule,
        RouterTestingModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useClass: TranslateFakeLoader,
          },
        }),
      ],
      declarations: [HomeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should update category', () => {
    const category = 'sourceMgr';

    component.setCurrentAtomCategory(category);

    expect(component.category).toBe(category);
  });

  it('should get data', () => {
    inject([HttpTestingController], (httpMock: HttpTestingController) => {
      component.ngAfterViewInit();

      const fisrt = httpMock.expectOne('./assets/periodic-table.json');
      const req = httpMock.expectOne(
        'https://api.github.com/repos/phodal/ledge/contributors'
      );
      expect(req.request.method).toEqual('GET');
      req.flush([]);

      httpMock.verify();
    });
  });
});
