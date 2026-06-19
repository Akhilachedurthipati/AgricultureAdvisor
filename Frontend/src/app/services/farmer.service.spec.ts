import { TestBed } from '@angular/core/testing';

import { FarmerService } from './farmer.service';
import { provideHttpClient } from '@angular/common/http';

describe('FarmerService', () => {
  let service: FarmerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(FarmerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
