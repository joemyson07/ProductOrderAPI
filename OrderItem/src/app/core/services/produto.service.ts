import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Produto } from '../domain/produto.model';
@Injectable({
  providedIn: 'root'
})
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiBaseUrl}/produtos/`)
  }

  buscarPorId(idproduto: number): Observable<Produto> {
    return this.http.get<Produto>(
      `${this.apiBaseUrl}/produtos/${idproduto}`);
  }
}
