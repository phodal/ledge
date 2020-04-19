import { TestBed } from '@angular/core/testing';

import { LedgeViewService } from './ledge-view.service';

describe('LedgeViewService', () => {
  let service: LedgeViewService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LedgeViewService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
