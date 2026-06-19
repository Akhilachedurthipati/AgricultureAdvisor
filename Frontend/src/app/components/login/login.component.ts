import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  loginData = {
    email: '',
    password: ''
  };

  constructor(
    private farmerService: FarmerService,
    private router: Router,
    public langService: LanguageService
  ) { }

  get t() {
    return this.langService.t;
  }

  login() {
    this.farmerService.login(this.loginData)
      .subscribe({
        next: (response) => {
          let cleanResponse = response.trim();
          if (cleanResponse.startsWith('"') && cleanResponse.endsWith('"')) {
            cleanResponse = cleanResponse.substring(1, cleanResponse.length - 1);
          }
          if (cleanResponse.startsWith('Login Successful')) {
            alert(this.t['loginSuccess']);
            const parts = cleanResponse.split(':');
            let farmerName = parts[1] || 'Farmer';
            farmerName = farmerName.trim();
            localStorage.setItem("email", this.loginData.email);
            localStorage.setItem("farmerName", farmerName);
            this.router.navigate(['/dashboard']);
          } else {
            alert(this.t['invalidCredentials']);
          }
        },
        error: (err) => {
          console.log(err);
          alert(this.t['loginFailed']);
        }
      });
  }
}