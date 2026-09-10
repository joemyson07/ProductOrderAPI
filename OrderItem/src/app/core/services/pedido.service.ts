import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import{ Observable} from 'rxjs'
import { Pedido } from '../domain/pedido.model';

@Injectable({
  providedIn: 'root'
})
export class PedidoService {

  constructor() { }
}
