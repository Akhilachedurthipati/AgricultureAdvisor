import { TestBed } from '@angular/core/testing';

import { CropService } from './crop.service';
import { provideHttpClient } from '@angular/common/http';

describe('CropService', () => {
  let service: CropService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient()]
    });
    service = TestBed.inject(CropService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
