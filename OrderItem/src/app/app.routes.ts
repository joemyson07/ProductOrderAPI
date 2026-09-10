import { Routes } from '@angular/router';
import { Sobre } from './presentation/pages/sobre/sobre';
import { TelaInicial } from './presentation/pages/tela-inicial/tela-inicial';
import { Login } from './presentation/pages/login/login';
import { OrderItemComponent } from './presentation/features/order-item/order-item.component';

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
    component:Sobre
  },
  {
    path:"login",
    component:Login
  },
];