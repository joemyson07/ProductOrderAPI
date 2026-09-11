import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PedidoAtivoService } from '../../../core/services/pedido-ativo.service';

@Component({
  standalone: true,
  selector: 'app-menu',
  imports: [RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  private readonly pedidoAtivoService = inject(PedidoAtivoService);

  get rotaCarrinho(): string[] {
    const idpedido = this.pedidoAtivoService.idPedido();
    return idpedido ? ['/carrinho', String(idpedido)] : ['/carrinho'];
  }
}
