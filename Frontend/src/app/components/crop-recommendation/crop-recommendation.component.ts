import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CropService } from '../../services/crop.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-crop-recommendation',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './crop-recommendation.component.html',
  styleUrl: './crop-recommendation.component.css'
})
export class CropRecommendationComponent implements OnInit {

  cropData = {
    farmerName: '',
    farmerEmail: '',
    soilType: '',
    season: '',
    temperature: 0,
    humidity: 0,
    ph: 0,
    rainfall: 0
  };

  recommendedCrop = '';
  recommendedFertilizer = '';

  constructor(
    private cropService: CropService,
    public langService: LanguageService
  ) { }

  ngOnInit() {
    const name = localStorage.getItem('farmerName');
    const email = localStorage.getItem('email') || '';

    if (name) {
      this.cropData.farmerName = name;
    } else if (email) {
      this.cropData.farmerName = email.split('@')[0];
    }

    this.cropData.farmerEmail = email;
  }

  get t() {
    return this.langService.t;
  }

  recommend() {
    this.cropService.recommendCrop(this.cropData)
      .subscribe({
        next: (response: any) => {
          this.recommendedCrop = response.recommendedCrop;
          this.recommendedFertilizer = response.recommendedFertilizer;
        },
        error: (error) => {
          console.log('ERROR:', error);
        }
      });
  }

  translateCrop(crop: string): string {

    switch (crop) {
      case 'Wheat':
        return this.t.cropWheat;

      case 'Rice':
        return this.t.cropRice;

      case 'Cotton':
        return this.t.cropCotton;

      case 'Millets':
        return this.t.cropMillets;

      default:
        return crop;
    }
  }

  translateFertilizer(fertilizer: string): string {

    switch (fertilizer) {

      case 'DAP':
        return this.t.fertDAP;

      case 'Urea':
        return this.t.fertUrea;

      default:
        return fertilizer;
    }
  }
}