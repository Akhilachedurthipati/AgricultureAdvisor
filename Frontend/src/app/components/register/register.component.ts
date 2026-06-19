import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { FarmerService } from '../../services/farmer.service';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  farmer = {
    name: '',
    email: '',
    password: '',
    mobile: ''
  };

  constructor(
    private farmerService: FarmerService,
    public langService: LanguageService,
    private router: Router
  ) {}

  get t() {
    return this.langService.t;
  }

  registerFarmer() {
    this.farmerService.register(this.farmer).subscribe({
      next: (data) => {
        alert(this.t['regSuccess']);
        console.log(data);
        this.router.navigate(['/login']);
      },
      error: (err) => {
        alert(this.t['regFailed']);
        console.error(err);
      }
    });
  }
}