import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isLightModeSubject = new BehaviorSubject<boolean>(false);
  isLightMode$ = this.isLightModeSubject.asObservable();

  constructor() {
    const savedTheme = localStorage.getItem('theme');
    const isLight = savedTheme === 'light';
    this.isLightModeSubject.next(isLight);
    this.applyTheme(isLight);
  }

  toggleTheme(): void {
    const newValue = !this.isLightModeSubject.value;
    this.isLightModeSubject.next(newValue);
    localStorage.setItem('theme', newValue ? 'light' : 'dark');
    this.applyTheme(newValue);
  }

  isLightMode(): boolean {
    return this.isLightModeSubject.value;
  }

  private applyTheme(isLight: boolean): void {
    if (isLight) {
      document.body.classList.add('light-theme');
    } else {
      document.body.classList.remove('light-theme');
    }
  }
}
