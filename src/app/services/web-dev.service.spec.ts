import { TestBed } from '@angular/core/testing';

import { WebDevService } from './web-dev.service';

describe('WebDevService', () => {
  let service: WebDevService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WebDevService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
