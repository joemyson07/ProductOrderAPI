import { TestBed } from '@angular/core/testing';
import { PedidoAtivoService } from './pedido-ativo.service';

describe('PedidoAtivoService', () => {
  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();
  });

  afterEach(() => localStorage.clear());

  it('deve armazenar e recuperar o pedido ativo', () => {
    const service = TestBed.inject(PedidoAtivoService);

    service.definir(10);

    expect(service.idPedido()).toBe(10);
    expect(localStorage.getItem('pedidoAtivoId')).toBe('10');
  });

  it('deve limpar o pedido ativo', () => {
    const service = TestBed.inject(PedidoAtivoService);
    service.definir(10);

    service.limpar();

    expect(service.idPedido()).toBeNull();
    expect(localStorage.getItem('pedidoAtivoId')).toBeNull();
  });
});
