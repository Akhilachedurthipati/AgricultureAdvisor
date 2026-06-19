import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FarmerService {

  private apiUrl = 'http://localhost:8080/farmer';

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