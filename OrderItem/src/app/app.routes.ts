import { Routes } from '@angular/router';
import { Tela } 
import { Sobre } 

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
        path: "sobre",
        component: Sobre },

    { 
        path: "carrinho",
        component: Sobre },

    { 
        path: "login",
        component: Sobre },
        

];