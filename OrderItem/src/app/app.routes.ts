import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pedidos/:idpedido/itens',
    loadComponent: () =>
      import('./presentation/features/order-item/order-item.component').then(
        (module) => module.OrderItemComponent
      ),
  },
];