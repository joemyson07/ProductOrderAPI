import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { Produto } from '../domain/produto.model';
import { ProdutoService } from './produto.service';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api'},
      ],
    });

    service = TestBed.inject(ProdutoService);
    http: TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deve listar produtos', () => {
    const produtos: Produto[] = [
      {
        idproduto: 7,
        idsetor:2,
        produto: 'Tênis',
        descricao_produto: 'Corrida',
        valor_unitario: '299.90',
        unidade: 'UN',
        estoque: 12,
      },
    ];

    service.listar().subscribe((resultado) => {
      expect(resultado).toEqual(produtos);
    });

    const request = http.expectOne('/api/produtos/');
    expect(request.request.method).toBe('GET');
    request.flush(produtos);

  });
});
