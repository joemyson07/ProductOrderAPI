import { Routes } from '@angular/router';

import { Login } from './presentation/pages/login/login';
import { Sobre } from './presentation/pages/sobre/sobre'; 
import { TelaInicial } from './presentation/pages/tela-inicial/tela-inicial'; 
import { OrderItemComponent } from './presentation/features/order-item/order-item.component';
import { CalcadosComponent } from './presentation/pages/sessoes/calcados/calcados.component';
import { CamisasComponent } from './presentation/pages/sessoes/camisas/camisas.component';
import { CamisetasComponent } from './presentation/pages/sessoes/camisetas/camisetas.component';
import { EquipamentosComponent } from './presentation/pages/sessoes/equipamentos/equipamentos.component';
import { ManguitosComponent } from './presentation/pages/sessoes/manguitos/manguitos.component';
import { ShortsComponent } from './presentation/pages/sessoes/shorts/shorts.component';
import { TodosComponent } from './presentation/pages/sessoes/todos/todos.component';


export const routes: Routes = [

    {
        path:"",
        redirectTo: "tela-inicial",
        pathMatch: "full",

    },

    { 
        path: "tela-inicial",
        component: TelaInicial },

    { 
        path: "login",
        component: Login },

    { 
        path: "sobre",
        component: Sobre },

    { 
        path: "carrinho",
        component: OrderItemComponent },

    { 
        path: "calcados",
        component: CalcadosComponent },

    { 
        path: "camisas",
        component: CamisasComponent },

    { 
        path: "camisetas",
        component: CamisetasComponent },

    { 
        path: "equipamentos",
        component: EquipamentosComponent },

    { 
        path: "manguitos",
        component: ManguitosComponent },

    { 
        path: "shorts",
        component: ShortsComponent },
    
    { 
        path: "todos",
        component: TodosComponent },

];