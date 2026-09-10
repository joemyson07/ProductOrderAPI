import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { PedidoService } from './pedido.service';
import { API_BASE_URL } from '../config/api.config';
import { Pedido } from '../domain/pedido.model';

describe('PedidoService', () => {
  let service: PedidoService;
  let httpTesting: HttpTestingController;

  const pedidosDeTeste: Pedido[] = [
    { idpedido: 1, idpessoa: 10, data_pedido: '2026-09-10', status_pedido: 'P' },
    { idpedido: 2, idpessoa: 20, data_pedido: '2026-09-10', status_pedido: 'A' }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PedidoService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'http://localhost:8080' } // URL informada diretamente
      ]
    });

    service = TestBed.inject(PedidoService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('deve criar o serviço', () => {
    expect(service).toBeTruthy();
  });

  it('deve listar todos os pedidos (listar)', () => {
    service.listar().subscribe((pedidos) => {
      expect(pedidos).toEqual(pedidosDeTeste);
    });

    const req = httpTesting.expectOne('http://localhost:8080/pedido');
    expect(req.request.method).toBe('GET');
    req.flush(pedidosDeTeste);
  });

  it('deve buscar um pedido por ID (buscarPorId)', () => {
    service.buscarPorId(1).subscribe((pedido) => {
      expect(pedido).toEqual(pedidosDeTeste[0]);
    });

    const req = httpTesting.expectOne('http://localhost:8080/pedido/1');
    expect(req.request.method).toBe('GET');
    req.flush(pedidosDeTeste[0]);
  });

  describe('dataPedido', () => {
    it('deve buscar pedidos passando a data como string', () => {
      service.dataPedido('2026-09-10').subscribe((pedidos) => {
        expect(pedidos).toEqual(pedidosDeTeste);
      });

      const req = httpTesting.expectOne('http://localhost:8080/pedido/data/2026-09-10');
      expect(req.request.method).toBe('GET');
      req.flush(pedidosDeTeste);
    });

    it('deve formatar e buscar pedidos passando a data como objeto Date', () => {
      const dataObj = new Date('2026-09-10T10:00:00Z');

      service.dataPedido(dataObj).subscribe((pedidos) => {
        expect(pedidos).toEqual(pedidosDeTeste);
      });

      const req = httpTesting.expectOne('http://localhost:8080/pedido/data/2026-09-10');
      expect(req.request.method).toBe('GET');
      req.flush(pedidosDeTeste);
    });
  });

  it('deve buscar pedidos por status (statusPedido)', () => {
    service.statusPedido('P').subscribe((pedidos) => {
      expect(pedidos.length).toBe(1);
    });

    const req = httpTesting.expectOne('http://localhost:8080/pedido/status/P');
    expect(req.request.method).toBe('GET');
    req.flush([pedidosDeTeste[0]]);
  });
});