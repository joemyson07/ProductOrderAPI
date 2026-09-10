import { Routes } from '@angular/router';
import { OrderItemComponent } from './presentation/features/order-item/order-item.component';
import { Login } from './presentation/pages/login/login';
import { Sobre } from './presentation/pages/sobre/sobre';
import { TelaInicial } from './presentation/pages/tela-inicial/tela-inicial';

export const routes: Routes = [
  {
    path:"",
    redirectTo: "tela-inicial",
    pathMatch: "full",
  },
  {
    path:"tela-inical",
    component:TelaInicial
  },
  {
    path:"sobre",
    component:Sobre
  },
  {
    path:"carrinho",
    component:OrderItemComponent
  },
  {
    path:"login",
    component:Login
  },
];