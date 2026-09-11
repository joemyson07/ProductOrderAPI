import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { Produto } from '../../../../core/domain/produto.model';
import { PedidoAtivoService } from '../../../../core/services/pedido-ativo.service';
import { PedidoProdutoService } from '../../../../core/services/pedido-produto.service';
import { ProdutoService } from '../../../../core/services/produto.service';
import { obterMensagemApi } from '../../../../core/utils/api-error.utils';

@Component({
  selector: 'app-todos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './todos.component.html',
  styleUrl: './todos.component.css',
})
export class TodosComponent implements OnInit {
  private readonly pedidoAtivoService = inject(PedidoAtivoService);
  private readonly pedidoProdutoService = inject(PedidoProdutoService);
  private readonly produtoService = inject(ProdutoService);
  private readonly router = inject(Router);

  produtos: Produto[] = [];
  carregando = true;
  produtoEmAdicao: number | null = null;
  erro = '';

  ngOnInit(): void {
    this.listarProdutos();
  }

  listarProdutos(): void {
    this.carregando = true;
    this.erro = '';

    this.produtoService
      .listar()
      .pipe(finalize(() => (this.carregando = false)))
      .subscribe({
        next: (dados) => {
          this.produtos = dados;
        },
        error: (error: unknown) => {
          this.erro = obterMensagemApi(error);
        },
      });
  }

  adicionarAoCarrinho(produto: Produto): void {
    const idPedido = this.pedidoAtivoService.idPedido();
    this.erro = '';

    if (idPedido === null) {
      this.erro = 'Abra um pedido existente antes de adicionar produtos ao carrinho.';
      return;
    }

    if (produto.estoque < 1 || this.produtoEmAdicao !== null) {
      return;
    }

    this.produtoEmAdicao = produto.idproduto;

    this.pedidoProdutoService
      .adicionar(idPedido, {
        idpedido: idPedido,
        idproduto: produto.idproduto,
        quantidade: 1,
        valor_unitario: produto.valor_unitario,
      })
      .pipe(finalize(() => (this.produtoEmAdicao = null)))
      .subscribe({
        next: () => {
          void this.router.navigate(['/carrinho', idPedido]);
        },
        error: (error: unknown) => {
          this.erro = obterMensagemApi(error);
        },
      });
  }
}
