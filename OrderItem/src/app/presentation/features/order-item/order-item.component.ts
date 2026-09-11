import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, distinctUntilChanged, finalize, forkJoin, map } from 'rxjs';
import { PedidoProduto, PedidoProdutoCreate, PedidoProdutoDetalhado } from '../../../core/domain/pedido-produto.model';
import { Pedido } from '../../../core/domain/pedido.model';
import { Produto } from '../../../core/domain/produto.model';
import { PedidoAtivoService } from '../../../core/services/pedido-ativo.service';
import { PedidoProdutoService } from '../../../core/services/pedido-produto.service';
import { PedidoService } from '../../../core/services/pedido.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { obterMensagemApi } from '../../../core/utils/api-error.utils';

@Component({
  selector: 'app-order-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.css',
})
export class OrderItemComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pedidoAtivoService = inject(PedidoAtivoService);
  private readonly pedidoProdutoService = inject(PedidoProdutoService);
  private readonly pedidoService = inject(PedidoService);
  private readonly produtoService = inject(ProdutoService);
  private readonly formBuilder = inject(FormBuilder);
  private readonly subscriptions = new Subscription();

  private numeroCarga = 0;
  private readonly statusFinalizado = 'F';

  idPedido: number | null = null;
  pedido: Pedido | null = null;
  produtos: Produto[] = [];
  itens: PedidoProduto[] = [];
  itensDetalhados: PedidoProdutoDetalhado[] = [];

  carregando = false;
  salvando = false;
  finalizando = false;
  criandoPedido = false;
  produtoEmRemocao: number | null = null;
  produtoEmAtualizacao: number | null = null;
  erro: string | null = null;
  mensagem: string | null = null;
  idPessoaNovoPedido = 0;

  readonly form = this.formBuilder.nonNullable.group({
    idproduto: [0, [Validators.required, Validators.min(1)]],
    quantidade: [
      1,
      [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
    ],
  });

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.paramMap
        .pipe(
          map((params) => params.get('idpedido')),
          distinctUntilChanged(),
        )
        .subscribe((idParam) => this.selecionarPedido(idParam)),
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  carregarDados(): void {
    if (this.idPedido === null) {
      return;
    }

    const idPedido = this.idPedido;
    const numeroCarga = ++this.numeroCarga;
    this.carregando = true;
    this.erro = null;

    this.subscriptions.add(
      forkJoin({
        pedido: this.pedidoService.buscarPorId(idPedido),
        produtos: this.produtoService.listar(),
        itens: this.pedidoProdutoService.listarPorPedido(idPedido),
      })
        .pipe(
          finalize(() => {
            if (numeroCarga === this.numeroCarga) {
              this.carregando = false;
            }
          }),
        )
        .subscribe({
          next: ({ pedido, produtos, itens }) => {
            if (numeroCarga !== this.numeroCarga || this.idPedido !== idPedido) {
              return;
            }

            this.pedido = pedido;
            this.produtos = produtos;
            this.itens = itens;
            if (pedido.status_pedido === this.statusFinalizado) {
              this.pedidoAtivoService.limpar();
            } else {
              this.pedidoAtivoService.definir(idPedido);
            }
            this.montarItensDetalhados();
          },
          error: (error: unknown) => {
            if (numeroCarga !== this.numeroCarga) {
              return;
            }

            if (error instanceof HttpErrorResponse && error.status === 404) {
              this.pedidoAtivoService.limpar();
            }
            this.erro = obterMensagemApi(error);
          },
        }),
    );
  }

  criarPedido(): void {
    this.limparMensagens();

    if (
      !Number.isInteger(this.idPessoaNovoPedido) ||
      this.idPessoaNovoPedido <= 0 ||
      this.criandoPedido
    ) {
      this.erro = 'Informe um identificador de pessoa válido.';
      return;
    }

    this.criandoPedido = true;

    this.subscriptions.add(
      this.pedidoService
        .criar({
          idpessoa: this.idPessoaNovoPedido,
          data_pedido: this.obterDataLocal(),
          status_pedido: 'A',
        })
        .pipe(finalize(() => (this.criandoPedido = false)))
        .subscribe({
          next: (pedido) => {
            this.pedidoAtivoService.definir(pedido.idpedido);
            void this.router.navigate(['/carrinho', pedido.idpedido]);
          },
          error: (error: unknown) => {
            this.erro = obterMensagemApi(error);
          },
        }),
    );
  }

  adicionar(): void {
    this.limparMensagens();
    this.form.markAllAsTouched();

    if (
      this.idPedido === null ||
      this.form.invalid ||
      this.salvando ||
      this.pedidoFinalizado
    ) {
      return;
    }

    const { idproduto, quantidade } = this.form.getRawValue();
    const produto = this.produtos.find((item) => item.idproduto === idproduto);

    if (!produto) {
      this.erro = 'Selecione um produto válido.';
      return;
    }

    if (this.produtoJaAdicionado(idproduto)) {
      this.erro = 'Este produto já faz parte do pedido.';
      return;
    }

    if (quantidade > produto.estoque) {
      this.erro = `Quantidade maior que o estoque disponível (${produto.estoque}).`;
      return;
    }

    const dados: PedidoProdutoCreate = {
      idpedido: this.idPedido,
      idproduto,
      quantidade,
      valor_unitario: produto.valor_unitario,
    };

    this.salvando = true;

    this.subscriptions.add(
      this.pedidoProdutoService
        .adicionar(this.idPedido, dados)
        .pipe(finalize(() => (this.salvando = false)))
        .subscribe({
          next: () => {
            this.mensagem = 'Produto adicionado ao pedido.';
            this.form.reset({ idproduto: 0, quantidade: 1 });
            this.carregarDados();
          },
          error: (error: unknown) => {
            this.erro = obterMensagemApi(error);
          },
        }),
    );
  }

  alterarQuantidade(item: PedidoProdutoDetalhado, delta: number): void {
    this.limparMensagens();

    if (
      this.idPedido === null ||
      this.produtoEmAtualizacao !== null ||
      this.pedidoFinalizado
    ) {
      return;
    }

    const novaQuantidade = item.quantidade + delta;

    if (novaQuantidade < 1) {
      return;
    }

    if (delta > 0 && item.produto && delta > item.produto.estoque) {
      this.erro = `Quantidade maior que o estoque disponível (${item.produto.estoque}).`;
      return;
    }

    this.produtoEmAtualizacao = item.idproduto;

    this.subscriptions.add(
      this.pedidoProdutoService
        .atualizarQuantidade(this.idPedido, item.idproduto, novaQuantidade)
        .pipe(finalize(() => (this.produtoEmAtualizacao = null)))
        .subscribe({
          next: () => this.carregarDados(),
          error: (error: unknown) => {
            this.erro = obterMensagemApi(error);
          },
        }),
    );
  }

  remover(idproduto: number): void {
    this.limparMensagens();

    if (
      this.idPedido === null ||
      this.produtoEmRemocao !== null ||
      this.pedidoFinalizado ||
      !window.confirm('Deseja remover este produto do pedido?')
    ) {
      return;
    }

    this.produtoEmRemocao = idproduto;

    this.subscriptions.add(
      this.pedidoProdutoService
        .remover(this.idPedido, idproduto)
        .pipe(finalize(() => (this.produtoEmRemocao = null)))
        .subscribe({
          next: () => {
            this.mensagem = 'Produto removido do pedido.';
            this.carregarDados();
          },
          error: (error: unknown) => {
            this.erro = obterMensagemApi(error);
          },
        }),
    );
  }

  finalizar(): void {
    this.limparMensagens();

    if (
      this.idPedido === null ||
      this.itensDetalhados.length === 0 ||
      this.finalizando ||
      this.pedidoFinalizado ||
      !window.confirm('Deseja finalizar este pedido?')
    ) {
      return;
    }

    const idPedido = this.idPedido;
    this.finalizando = true;

    this.subscriptions.add(
      this.pedidoService
        .atualizar(idPedido, { status_pedido: this.statusFinalizado })
        .pipe(finalize(() => (this.finalizando = false)))
        .subscribe({
          next: (pedido) => {
            this.pedido = pedido;
            this.pedidoAtivoService.limpar();
            this.mensagem = 'Pedido finalizado com sucesso.';
          },
          error: (error: unknown) => {
            this.erro = obterMensagemApi(error);
          },
        }),
    );
  }

  produtoJaAdicionado(idproduto: number): boolean {
    return this.itens.some((item) => item.idproduto === idproduto);
  }

  get produtoSelecionado(): Produto | null {
    const idproduto = this.form.controls.idproduto.value;
    return this.produtos.find((produto) => produto.idproduto === idproduto) ?? null;
  }

  get pedidoFinalizado(): boolean {
    return this.pedido?.status_pedido === this.statusFinalizado;
  }

  get totalPedido(): number {
    return this.itensDetalhados.reduce(
      (total, item) => total + item.subtotal,
      0,
    );
  }

  trackByProdutoId(_index: number, item: PedidoProdutoDetalhado): number {
    return item.idproduto;
  }

  limparMensagens(): void {
    this.erro = null;
    this.mensagem = null;
  }

  private selecionarPedido(idParam: string | null): void {
    const idPedido = idParam === null
      ? this.pedidoAtivoService.idPedido()
      : Number(idParam);

    if (idPedido === null) {
      this.limparEstado();
      return;
    }

    if (!Number.isInteger(idPedido) || idPedido <= 0) {
      this.limparEstado();
      this.erro = 'O identificador do pedido na URL é inválido.';
      return;
    }

    this.idPedido = idPedido;
    this.carregarDados();
  }

  private limparEstado(): void {
    this.numeroCarga += 1;
    this.idPedido = null;
    this.pedido = null;
    this.produtos = [];
    this.itens = [];
    this.itensDetalhados = [];
    this.carregando = false;
  }

  private montarItensDetalhados(): void {
    const produtosPorId = new Map(
      this.produtos.map((produto) => [produto.idproduto, produto]),
    );

    this.itensDetalhados = this.itens.map((item) => ({
      ...item,
      produto: produtosPorId.get(item.idproduto) ?? null,
      subtotal: item.quantidade * Number(item.valor_unitario),
    }));
  }

  private obterDataLocal(): string {
    const data = new Date();
    const ano = data.getFullYear();
    const mes = String(data.getMonth() + 1).padStart(2, '0');
    const dia = String(data.getDate()).padStart(2, '0');
    return `${ano}-${mes}-${dia}`;
  }
}
