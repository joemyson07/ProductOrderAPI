import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidoProduto, PedidoProdutoDetalhado } from '../../../core/domain/pedido-produto.model';
import { ActivatedRoute } from '@angular/router';
import { distinctUntilChanged, finalize, forkJoin, map, Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PedidoProdutoService } from '../../../core/services/pedido-produto.service';
import { Produto } from '../../../core/domain/produto.model';
import { ProdutoService } from '../../../core/services/produto.service';
import { obterMensagemApi } from '../../../core/utils/api-error.utils';
import { OnInit, inject, DestroyRef, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-order-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.css'
})
export class OrderItemComponent implements OnInit, OnDestroy {

  private readonly route = inject(ActivatedRoute)

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
      next:({produtos, itens}) => {
       if( numeroCarga !== this.numeroCarga || this.idPedido){
        return;
       }

       this.produtos = produtos;
       this.itens = itens;
       this.montarItensDetalhados();
      },
      error: (error: unknown) =>{
        if (numeroCarga !== this.numeroCarga || this.idPedido !== idPedido){
          this.erro = obterMensagemApi(error)
        }
      },
      
    })
  };
  
}
