import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { LanguageService, LanguageCode } from '../../services/language.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(
    private router: Router,
    private languageService: LanguageService,
    private themeService: ThemeService
  ) { }

  get t() {
    return this.languageService.t;
  }

  get currentLang(): LanguageCode {
    return this.languageService.getCurrentLanguage();
  }

  changeLang(lang: string): void {
    this.languageService.setLanguage(lang as LanguageCode);
  }

  get isLightMode(): boolean {
    return this.themeService.isLightMode();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  selectTheme(mode: 'light' | 'dark'): void {
    if ((mode === 'light' && !this.isLightMode) || (mode === 'dark' && this.isLightMode)) {
      this.themeService.toggleTheme();
    }
  }

  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}
