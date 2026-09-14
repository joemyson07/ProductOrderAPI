import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-camisas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './camisas.component.html',
  styleUrl: './camisas.component.css'
})
export class CamisasComponent implements OnInit {

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
          // idsetor 2 = Camisas
          this.produtos = dados.filter(produto => produto.idsetor === 2);
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