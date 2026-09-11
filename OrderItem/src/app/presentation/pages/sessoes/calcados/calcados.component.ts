import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-calcados',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calcados.component.html',
  styleUrl: './calcados.component.css'
})
export class CalcadosComponent implements OnInit {

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
          // Altere o numero '1' caso o idsetor de calçados seja diferente no seu banco
          this.produtos = dados.filter(produto => produto.idsetor === 1);
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