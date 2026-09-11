import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { Produto } from '../../../../core/domain/produto.model';
import { PedidoAtivoService } from '../../../../core/services/pedido-ativo.service';
import { PedidoProdutoService } from '../../../../core/services/pedido-produto.service';
import { ProdutoService } from '../../../../core/services/produto.service';
import { TodosComponent } from './todos.component';

describe('TodosComponent', () => {
  let component: TodosComponent;
  let fixture: ComponentFixture<TodosComponent>;
  let produtoService: jasmine.SpyObj<ProdutoService>;
  let pedidoProdutoService: jasmine.SpyObj<PedidoProdutoService>;
  let router: jasmine.SpyObj<Router>;

  const produto: Produto = {
    idproduto: 7,
    idsetor: 2,
    produto: 'Tênis',
    descricao_produto: 'Corrida',
    valor_unitario: '299.90',
    unidade: 'UN',
    estoque: 12,
  };

  beforeEach(async () => {
    produtoService = jasmine.createSpyObj<ProdutoService>('ProdutoService', [
      'listar',
    ]);
    pedidoProdutoService = jasmine.createSpyObj<PedidoProdutoService>(
      'PedidoProdutoService',
      ['adicionar'],
    );
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);

    produtoService.listar.and.returnValue(of([produto]));
    pedidoProdutoService.adicionar.and.returnValue(
      of({
        idpedido: 10,
        idproduto: 7,
        quantidade: 1,
        valor_unitario: '299.90',
      }),
    );
    router.navigate.and.resolveTo(true);

    await TestBed.configureTestingModule({
      imports: [TodosComponent],
      providers: [
        { provide: ProdutoService, useValue: produtoService },
        { provide: PedidoProdutoService, useValue: pedidoProdutoService },
        { provide: PedidoAtivoService, useValue: { idPedido: signal(10) } },
        { provide: Router, useValue: router },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TodosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve listar produtos pela API compartilhada', () => {
    expect(component.produtos).toEqual([produto]);
    expect(produtoService.listar).toHaveBeenCalled();
  });

  it('deve adicionar o produto ao pedido ativo', () => {
    component.adicionarAoCarrinho(produto);

    expect(pedidoProdutoService.adicionar).toHaveBeenCalledWith(10, {
      idpedido: 10,
      idproduto: 7,
      quantidade: 1,
      valor_unitario: '299.90',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/carrinho', 10]);
  });
});
