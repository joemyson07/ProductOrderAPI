import { Injectable, inject} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable} from 'rxjs'
import { API_BASE_URL } from '../config/api.config';
import { Pedido } from '../domain/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listar(): Observable<Pedido[]> {
    return this.http.get<Pedido[]>(`${this.apiBaseUrl}/pedido/`)
  }

  buscarPorId(idpedido:number): Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiBaseUrl}/pedido/${idpedido}`)
  }

  dataPedido(data:Date | string): Observable<Pedido> {
    // Se for um objeto Date, gera "YYYY-MM-DDTHH:mm:ss", corta no 'T' e o [0] pega só a data ("YYYY-MM-DD")
    // Se já for string (texto), usa o valor direto sem alterar
    // Esse coméntario é para que, eu possa me lembrar depois como funciona  
    const dataInformada = data instanceof Date? data.toISOString().split('T')[0]:data 

    return this.http.get<Pedido>(`${this.apiBaseUrl}/pedido/data/${dataInformada}`)
  }
  
  statusPedido(status:string):Observable<Pedido> {
    return this.http.get<Pedido>(`${this.apiBaseUrl}/pedido/status/${status}`)
  }
}
