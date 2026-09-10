import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { PedidoProduto } from '../../../core/domain/pedido-produto.model';
import { Produto } from '../../../core/domain/produto.model';
import { PedidoProdutoService } from '../../../core/services/pedido-produto.service';
import { ProdutoService } from '../../../core/services/produto.service';
import { OrderItemComponent } from './order-item.component';

registerLocaleData(localePt);

describe('OrderItemComponent', () => {
  let fixture: ComponentFixture<OrderItemComponent>;
  let component: OrderItemComponent;
  let produtoService: jasmine.SpyObj<ProdutoService>;
  let pedidoProdutoService: jasmine.SpyObj<PedidoProdutoService>;

  const produtos: Produto[] = [
    {
      idproduto: 7,
      idsetor: 2,
      produto: 'Tênis',
      descricao_produto: 'Corrida',
      valor_unitario: '299.90',
      unidade: 'UN',
      estoque: 12,
    },
  ];

  function criarComItens(itens: PedidoProduto[] = []): void {
    produtoService.listar.and.returnValue(of(produtos));
    pedidoProdutoService.listarPorPedido.and.returnValue(of(itens));

    fixture = TestBed.createComponent(OrderItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  beforeEach(async () => {
    produtoService = jasmine.createSpyObj<ProdutoService>('ProdutoService', [
      'listar',
    ]);
    pedidoProdutoService = jasmine.createSpyObj<PedidoProdutoService>(
      'PedidoProdutoService',
      ['listarPorPedido', 'adicionar', 'remover'],
    );

    await TestBed.configureTestingModule({
      imports: [OrderItemComponent],
      providers: [
        { provide: ProdutoService, useValue: produtoService },
        { provide: PedidoProdutoService, useValue: pedidoProdutoService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ idpedido: '10' })),
          },
        },
      ],
    }).compileComponents();
  });

  it('deve carregar e enriquecer os itens', () => {
    criarComItens([
      {
        idpedido: 10,
        idproduto: 7,
        quantidade: 2,
        valor_unitario: '299.90',
      },
    ]);

    expect(component.idPedido).toBe(10);
    expect(component.itensDetalhados[0].produto?.produto).toBe('Tênis');
    expect(component.itensDetalhados[0].subtotal).toBeCloseTo(599.8);
    expect(component.totalPedido).toBeCloseTo(599.8);
  });

  it('deve montar o payload com o preço do produto', () => {
    pedidoProdutoService.adicionar.and.returnValue(
      of({
        idpedido: 10,
        idproduto: 7,
        quantidade: 2,
        valor_unitario: '299.90',
      }),
    );
    criarComItens();

    component.form.setValue({ idproduto: 7, quantidade: 2 });
    component.adicionar();

    expect(pedidoProdutoService.adicionar).toHaveBeenCalledWith(10, {
      idpedido: 10,
      idproduto: 7,
      quantidade: 2,
      valor_unitario: '299.90',
    });
  });

  it('não deve enviar quantidade maior que o estoque', () => {
    criarComItens();

    component.form.setValue({ idproduto: 7, quantidade: 13 });
    component.adicionar();

    expect(pedidoProdutoService.adicionar).not.toHaveBeenCalled();
    expect(component.erro).toContain('estoque disponível');
  });

  it('deve remover após confirmação', () => {
    pedidoProdutoService.remover.and.returnValue(of(undefined));
    spyOn(window, 'confirm').and.returnValue(true);
    criarComItens();

    component.remover(7);

    expect(pedidoProdutoService.remover).toHaveBeenCalledWith(10, 7);
  });
});