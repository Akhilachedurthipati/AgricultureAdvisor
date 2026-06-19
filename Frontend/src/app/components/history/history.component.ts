import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CropService } from '../../services/crop.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './history.component.html',
  styleUrl: './history.component.css'
})
export class HistoryComponent implements OnInit {
  historyList: any[] = [];
  filteredList: any[] = [];
  loading = true;

  // Search & Filter models
  searchQuery = '';
  soilFilter = '';
  seasonFilter = '';

  // KPI Statistics
  totalQueries = 0;
  topCrop = '-';
  avgTemp = 0;
  avgRainfall = 0;
  avgPh = 0;

  // Edit Modal State
  isEditing = false;
  editingItem: any = null;

  constructor(
    private cropService: CropService,
    public langService: LanguageService
  ) {}

  ngOnInit() {
    this.loadHistory();
  }

  get t() {
    return this.langService.t;
  }

  loadHistory() {
    this.loading = true;
    const email = localStorage.getItem('email') || '';
    this.cropService.getAllRecommendations(email).subscribe({
      next: (data) => {
        this.historyList = data || [];
        this.applyFilters();
        this.loading = false;
      },
      error: (err) => {
        console.error('Failed to load history', err);
        this.loading = false;
      }
    });
  }

  applyFilters() {
    this.filteredList = this.historyList.filter(item => {
      const matchesSearch = !this.searchQuery || 
        (item.farmerName && item.farmerName.toLowerCase().includes(this.searchQuery.toLowerCase())) ||
        (item.recommendedCrop && item.recommendedCrop.toLowerCase().includes(this.searchQuery.toLowerCase()));
      
      const matchesSoil = !this.soilFilter || 
        (item.soilType && item.soilType.toLowerCase() === this.soilFilter.toLowerCase());
      
      const matchesSeason = !this.seasonFilter || 
        (item.season && item.season.toLowerCase() === this.seasonFilter.toLowerCase());

      return matchesSearch && matchesSoil && matchesSeason;
    });

    this.calculateStats();
  }

  calculateStats() {
    this.totalQueries = this.filteredList.length;
    if (this.totalQueries === 0) {
      this.topCrop = '-';
      this.avgTemp = 0;
      this.avgRainfall = 0;
      this.avgPh = 0;
      return;
    }

    // Averages
    let totalTemp = 0;
    let totalRainfall = 0;
    let totalPh = 0;
    const cropCounts: Record<string, number> = {};

    this.filteredList.forEach(item => {
      totalTemp += item.temperature || 0;
      totalRainfall += item.rainfall || 0;
      totalPh += item.ph || 0;

      if (item.recommendedCrop) {
        cropCounts[item.recommendedCrop] = (cropCounts[item.recommendedCrop] || 0) + 1;
      }
    });

    this.avgTemp = totalTemp / this.totalQueries;
    this.avgRainfall = totalRainfall / this.totalQueries;
    this.avgPh = totalPh / this.totalQueries;

    // Top Crop
    let maxCount = 0;
    let bestCrop = '-';
    Object.keys(cropCounts).forEach(crop => {
      if (cropCounts[crop] > maxCount) {
        maxCount = cropCounts[crop];
        bestCrop = crop;
      }
    });
    this.topCrop = bestCrop;
  }

  deleteItem(id: number) {
    if (confirm(this.t['deleteConfirm'])) {
      this.cropService.deleteRecommendation(id).subscribe({
        next: (response) => {
          alert(this.t['recordDeleted']);
          this.historyList = this.historyList.filter(item => item.id !== id);
          this.applyFilters();
        },
        error: (err) => {
          console.error('Failed to delete item', err);
          if (err.status === 200) {
            alert(this.t['recordDeleted']);
            this.historyList = this.historyList.filter(item => item.id !== id);
            this.applyFilters();
          } else {
            alert('Failed to delete record.');
          }
        }
      });
    }
  }

  editItem(item: any) {
    this.editingItem = { ...item };
    this.isEditing = true;
  }

  closeEditModal() {
    this.isEditing = false;
    this.editingItem = null;
  }

  saveEdit() {
    if (!this.editingItem) return;

    this.cropService.updateRecommendation(this.editingItem.id, this.editingItem).subscribe({
      next: (updatedItem) => {
        const index = this.historyList.findIndex(item => item.id === this.editingItem.id);
        if (index !== -1) {
          this.historyList[index] = updatedItem || this.editingItem;
        }
        this.applyFilters();
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Failed to update record', err);
        alert('Failed to update record.');
      }
    });
  }
}
