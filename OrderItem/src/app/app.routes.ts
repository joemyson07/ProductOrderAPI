import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pedidos/:idpedido/itens',
    loadComponent: () =>
      import('./order-item/order-item.component').then(
        (module) => module.OrderItemComponent
      ),
  },
];