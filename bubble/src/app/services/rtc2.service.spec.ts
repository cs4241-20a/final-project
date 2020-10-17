import { TestBed } from '@angular/core/testing';

import { Rtc2Service } from './rtc2.service';

describe('Rtc2Service', () => {
  let service: Rtc2Service;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Rtc2Service);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
