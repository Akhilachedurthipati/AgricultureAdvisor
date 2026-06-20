import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CropService {

  private apiUrl = `${environment.apiUrl}/crop`;

  constructor(private http: HttpClient) {}

  recommendCrop(data: any) {
    const email = data.farmerEmail || '';
    return this.http.post(
      `${this.apiUrl}/recommend`,
      data,
      {
        headers: { email: email }
      }
    );
  }

  getAllRecommendations(email: string) {
    return this.http.get<any[]>(`${this.apiUrl}/all`, {
      headers: { email: email }
    });
  }

  deleteRecommendation(id: number) {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' });
  }

  updateRecommendation(id: number, data: any) {
    return this.http.put(`${this.apiUrl}/${id}`, data);
  }
}