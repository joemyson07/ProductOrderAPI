import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Pedido, PedidoCreate, PedidoUpdate } from '../domain/pedido.model';

@Injectable({
  providedIn: 'root',
})
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  criar(dados: PedidoCreate): Observable<Pedido> {
    return this.http.post<Pedido>(`${this.apiBaseUrl}/pedidos/`, dados);
  }

  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiBaseUrl}/pedidos/`);
  }

  buscarPorId(idpedido: number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiBaseUrl}/pedidos/${idpedido}`);
  }

  atualizar(idpedido: number, dados: PedidoUpdate): Observable<Pedido> {
    return this.http.put<Pedido>(
      `${this.apiBaseUrl}/pedidos/${idpedido}`,
      dados,
    );
  }
}
