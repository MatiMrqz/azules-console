import { TestBed } from '@angular/core/testing';

import { AuthDevService } from './auth-dev.service';

describe('AuthDevService', () => {
  let service: AuthDevService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AuthDevService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
