import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-manguitos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './manguitos.component.html',
  styleUrl: './manguitos.component.css'
})
export class ManguitosComponent implements OnInit {

produtos: any[] = [];

  carregando = true;
  erro = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.listarProdutos();
  }

  listarProdutos(): void {

    this.http.get<any[]>('http://127.0.0.1:8000/produtos/')
      .subscribe({

        next: (dados) => {
          this.produtos = dados.filter(produtos => produtos.idsetor === 5);
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