import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  farmerName = '';

  constructor(
    public langService: LanguageService,
    private router: Router
  ) {}

  ngOnInit() {
    this.farmerName = localStorage.getItem('farmerName') || 'Farmer';
  }

  get t() {
    return this.langService.t;
  }

  logout() {
    localStorage.removeItem('farmerName');
    localStorage.removeItem('email');
    this.router.navigate(['/']);
  }
}