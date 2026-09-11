import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { Pedido, PedidoCreate } from '../domain/pedido.model';
import { PedidoService } from './pedido.service';

describe('PedidoService', () => {
  let service: PedidoService;
  let http: HttpTestingController;

  const pedidos: Pedido[] = [
    {
      idpedido: 1,
      idpessoa: 10,
      data_pedido: '2026-09-10',
      status_pedido: 'A',
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    service = TestBed.inject(PedidoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deve listar os pedidos', () => {
    service.listar().subscribe((resultado) => expect(resultado).toEqual(pedidos));

    const request = http.expectOne('/api/pedidos/');
    expect(request.request.method).toBe('GET');
    request.flush(pedidos);
  });

  it('deve buscar um pedido por ID', () => {
    service.buscarPorId(1).subscribe((resultado) => expect(resultado).toEqual(pedidos[0]));

    const request = http.expectOne('/api/pedidos/1');
    expect(request.request.method).toBe('GET');
    request.flush(pedidos[0]);
  });

  it('deve criar um pedido', () => {
    const dados: PedidoCreate = {
      idpessoa: 10,
      data_pedido: '2026-09-11',
      status_pedido: 'A',
    };

    service.criar(dados).subscribe();

    const request = http.expectOne('/api/pedidos/');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(dados);
    request.flush({ idpedido: 2, ...dados }, { status: 201, statusText: 'Created' });
  });

  it('deve atualizar o status do pedido', () => {
    service.atualizar(1, { status_pedido: 'F' }).subscribe();

    const request = http.expectOne('/api/pedidos/1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ status_pedido: 'F' });
    request.flush({ ...pedidos[0], status_pedido: 'F' });
  });
});
