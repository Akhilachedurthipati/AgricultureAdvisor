import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class FarmerService {

  private apiUrl = `${environment.apiUrl}/farmer`;

  constructor(private http: HttpClient) { }

  register(farmer: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, farmer);
  }
  login(data: any) {
  return this.http.post(`${this.apiUrl}/login`, data, {
    responseType: 'text'
  });
}
}