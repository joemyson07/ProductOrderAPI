import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnDestroy, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription, distinctUntilChanged, finalize, forkJoin, map } from 'rxjs';
import { PedidoProduto, PedidoProdutoCreate, PedidoProdutoDetalhado } from '../../../core/domain/pedido-produto.model';
import { Produto } from '../../../core/domain/produto.model';
import { PedidoProdutoService } from '../../../core/services/pedido-produto.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { obterMensagemApi } from '../../../core/utils/api-error.utils';

@Component({
  selector: 'app-order-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.css'
})
export class OrderItemComponent implements OnInit, OnDestroy {


  private readonly route = inject(ActivatedRoute);
  private readonly pedidoProdutoService = inject(PedidoProdutoService);

  private readonly produtoService = inject(ProdutoService);

  private readonly formBuilder = inject(FormBuilder);

  private readonly destroyRef = inject(DestroyRef);

  private readonly subscriptions = new Subscription();

  private numeroCarga = 0;

  idPedido: number | null = null;
  produtos: Produto[] = [];
  itens: PedidoProduto[] = [];
  itensDetalhados: PedidoProdutoDetalhado [] = [];

  carregando = false;
  salvando = false;
  produtoEmRemocao: number | null = null;
  erro: string | null = null;
  mensagem: string | null = null;

  readonly form = this.formBuilder.nonNullable.group({
    idproduto: [0, [Validators.required, Validators.min(1)]],

    quantidade: [
      1,[Validators.required, Validators.min(1),Validators.pattern(/^\d+$/)]
    ]
  })
  
  

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map((params) => params.get('idpedido')),
      distinctUntilChanged(),
    )
    .subscribe((idParam) => {
      const idPedido = Number(idParam);

      if( idParam === null || !Number.isInteger(idPedido) || idPedido <= 0){
        this.numeroCarga += 1;
        this.idPedido = null;
        this.produtos = [];
        this.itens = [];
        this.itensDetalhados = [];
        this.carregando = false;
        this.erro = 'O identificador do pedido na URL é inválido.';
        return;
      }

      this.idPedido = idPedido;
      this.carregarDados();
    })
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
          next: ({ produtos, itens }) => {
            if (numeroCarga !== this.numeroCarga || this.idPedido !== idPedido) {
              return;
            }

            this.produtos = produtos;
            this.itens = itens;
            this.montarItensDetalhados();
          },
          error: (error: unknown) => {
            if (numeroCarga === this.numeroCarga) {
              this.erro = obterMensagemApi(error);
            }
          },
        }),
    );
  }

  adicionar(): void {
    this.limparMensagens();
    this.form.markAllAsTouched();

    if (this.idPedido === null || this.form.invalid || this.salvando) {
      return;
    }

    const { idproduto, quantidade } = this.form.getRawValue();
    const produto = this.produtos.find(
      (item) => item.idproduto === idproduto,
    );

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

  remover(idproduto: number): void {
    this.limparMensagens();

    if (
      this.idPedido === null ||
      this.produtoEmRemocao !== null ||
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

  produtoJaAdicionado(idproduto: number): boolean {
    return this.itens.some((item) => item.idproduto === idproduto);
  }

  get produtoSelecionado(): Produto | null {
    const idproduto = this.form.controls.idproduto.value;
    return (
      this.produtos.find((produto) => produto.idproduto === idproduto) ?? null
    );
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
  
}
