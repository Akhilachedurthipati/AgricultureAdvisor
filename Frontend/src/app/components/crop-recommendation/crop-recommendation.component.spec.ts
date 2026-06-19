import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CropRecommendationComponent } from './crop-recommendation.component';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

describe('CropRecommendationComponent', () => {
  let component: CropRecommendationComponent;
  let fixture: ComponentFixture<CropRecommendationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CropRecommendationComponent],
      providers: [
        provideHttpClient(),
        provideRouter([])
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CropRecommendationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
