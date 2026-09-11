import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PedidoAtivoService {
  private readonly chave = 'pedidoAtivoId';
  private readonly idPedidoSignal = signal<number | null>(this.lerIdArmazenado());

  readonly idPedido = this.idPedidoSignal.asReadonly();

  definir(idpedido: number): void {
    if (!Number.isInteger(idpedido) || idpedido <= 0) {
      return;
    }

    localStorage.setItem(this.chave, String(idpedido));
    this.idPedidoSignal.set(idpedido);
  }

  limpar(): void {
    localStorage.removeItem(this.chave);
    this.idPedidoSignal.set(null);
  }

  private lerIdArmazenado(): number | null {
    const idpedido = Number(localStorage.getItem(this.chave));
    return Number.isInteger(idpedido) && idpedido > 0 ? idpedido : null;
  }
}
