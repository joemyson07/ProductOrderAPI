import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css'
})
export class TodosComponent implements OnInit {

  produtos: any[] = [];

  carregando = true;
  erro = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listarProdutos();
  }

  listarProdutos(): void {

    this.http.get<any[]>('http://localhost:8000/produtos/')
      .subscribe({

        next: (dados) => {
          this.produtos = dados;
          this.carregando = false;
        },

        error: (erro) => {
          console.error('Erro ao buscar produtos:', erro);
          this.erro = 'Não foi possível carregar os produtos.';
          this.carregando = false;
        }

      });
  }
}