import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { PedidoProduto, PedidoProdutoCreate } from '../domain/pedido-produto.model';
@Injectable({
  providedIn: 'root'
})
export class PedidoProdutoService {

  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listarPorPedido(idpedido: number): Observable<PedidoProduto[]> {
    return this.http.get<PedidoProduto[]> (`${this.apiBaseUrl}/pedidos/${idpedido}/produtos`);
  }

  adicionar(idpedido: number, dados: PedidoProdutoCreate): Observable<PedidoProduto> {
    return this.http.post<PedidoProduto>(
      `${this.apiBaseUrl}/pedidos/${idpedido}/produtos`, dados);
  }
  atualizarQuantidade(
    idpedido: number,
    idproduto: number,
    quantidade: number,
  ): Observable<PedidoProduto> {
    return this.http.patch<PedidoProduto>(
      `${this.apiBaseUrl}/pedidos/${idpedido}/produtos/${idproduto}`,
      { quantidade },
    );
  }

  remover(idpedido: number, idproduto: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBaseUrl}/pedidos/${idpedido}/produtos/${idproduto}`);
  }
}
