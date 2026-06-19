import { Component } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LanguageService, LanguageCode } from './services/language.service';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'agriculture-advisor-ui';

  constructor(
    private router: Router,
    private languageService: LanguageService,
    private themeService: ThemeService
  ) {}

  get isLightMode(): boolean {
    return this.themeService.isLightMode();
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  get currentLang(): LanguageCode {
    return this.languageService.getCurrentLanguage();
  }

  changeLang(lang: string): void {
    this.languageService.setLanguage(lang as LanguageCode);
  }

  isHomePage(): boolean {
    return this.router.url === '/' || this.router.url === '';
  }
}