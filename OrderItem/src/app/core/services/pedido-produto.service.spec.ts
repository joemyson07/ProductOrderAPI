import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import {
  PedidoProduto,
  PedidoProdutoCreate,
} from '../domain/pedido-produto.model';
import { PedidoProdutoService } from './pedido-produto.service';

describe('PedidoProdutoService', () => {
  let service: PedidoProdutoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    service = TestBed.inject(PedidoProdutoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deve listar itens de um pedido', () => {
    const itens: PedidoProduto[] = [
      {
        idpedido: 10,
        idproduto: 7,
        quantidade: 2,
        valor_unitario: '299.90',
      },
    ];

    service.listarPorPedido(10).subscribe((resultado) => {
      expect(resultado).toEqual(itens);
    });

    const request = http.expectOne('/api/pedidos/10/produtos');
    expect(request.request.method).toBe('GET');
    request.flush(itens);
  });

  it('deve enviar todos os campos exigidos pelo backend atual', () => {
    const payload: PedidoProdutoCreate = {
      idpedido: 10,
      idproduto: 7,
      quantidade: 2,
      valor_unitario: '299.90',
    };

    service.adicionar(10, payload).subscribe();

    const request = http.expectOne('/api/pedidos/10/produtos');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush(payload, { status: 201, statusText: 'Created' });
  });

  it('deve remover um produto do pedido', () => {
    service.remover(10, 7).subscribe();

    const request = http.expectOne('/api/pedidos/10/produtos/7');
    expect(request.request.method).toBe('DELETE');
    request.flush(null, { status: 204, statusText: 'No Content' });
  });

  it('deve atualizar a quantidade de um item', () => {
    service.atualizarQuantidade(10, 7, 4).subscribe();

    const request = http.expectOne('/api/pedidos/10/produtos/7');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ quantidade: 4 });
    request.flush({
      idpedido: 10,
      idproduto: 7,
      quantidade: 4,
      valor_unitario: '299.90',
    });
  });
});
