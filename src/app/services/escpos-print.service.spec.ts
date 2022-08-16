import { TestBed } from '@angular/core/testing';

import { EscposPrintService } from './escpos-print.service';

describe('EscposPrintService', () => {
  let service: EscposPrintService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EscposPrintService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
