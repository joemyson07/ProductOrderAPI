# 05 — Testes e validação

## 1. Testes do service de produtos

Crie `src/app/core/services/produto.service.spec.ts`:

```ts
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { API_BASE_URL } from '../config/api.config';
import { Produto } from '../models/produto.model';
import { ProdutoService } from './produto.service';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });

    service = TestBed.inject(ProdutoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('deve listar produtos', () => {
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

    service.listar().subscribe((resultado) => {
      expect(resultado).toEqual(produtos);
    });

    const request = http.expectOne('/api/produtos/');
    expect(request.request.method).toBe('GET');
    request.flush(produtos);
  });
});
```

## 2. Testes do service de itens

Crie `src/app/core/services/pedido-produto.service.spec.ts`:

```ts
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
} from '../models/pedido-produto.model';
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
});
```

## 3. Testes da lógica do componente

Substitua `src/app/order-item/order-item.component.spec.ts` por:

```ts
import { registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';
import { of } from 'rxjs';
import { PedidoProduto } from '../core/models/pedido-produto.model';
import { Produto } from '../core/models/produto.model';
import { PedidoProdutoService } from '../core/services/pedido-produto.service';
import { ProdutoService } from '../core/services/produto.service';
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
```

Casos adicionais recomendados:

- rota sem `idpedido` e rota com ID negativo;
- produto inexistente no catálogo;
- produto duplicado;
- retorno `400`, `404`, `409`, `422` e status `0`;
- usuário cancela o `window.confirm`;
- item cujo produto foi removido do catálogo (`produto === null`);
- múltiplos itens e precisão do total.

## 4. Compilar e executar testes

Na raiz `ProductOrderAPI/OrderItem`:

```powershell
npm ci
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```

Se o ambiente não tiver Chrome/Chromium, execute `npm test` e use o navegador aberto pelo Karma. O build deve terminar sem erro de tipos ou template.

## 5. Preparar o banco e a API

Antes do teste integrado, aplique as correções obrigatórias do compose em `06-ajustes-infra-backend.md`, ou use uma instância MySQL local já configurada em `localhost:3306` com usuário/senha `root` e schema `bd_loja_esportiva`.

No diretório do backend:

```powershell
cd backend/PROJETO-LOJA/back_end_aplicacao
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requeriments.txt
python -m uvicorn main:app --reload --port 8000
```

Confirme:

```powershell
Invoke-RestMethod http://localhost:8000/
```

Resposta esperada:

```json
{ "message": "API funcionando" }
```

## 6. Criar dados para teste integrado

Em outro PowerShell, com a API ativa:

```powershell
$api = 'http://localhost:8000'

$pessoa = Invoke-RestMethod -Method Post -Uri "$api/pessoas/" -ContentType 'application/json' -Body (@{
  nome = 'Cliente Teste'
  cpf = 12345678901
  data_nascimento = '2000-01-01'
  sexo = 'F'
  telefone = 11999999999
  email = 'cliente.teste@example.com'
  senha = 'somente-ambiente-local'
} | ConvertTo-Json)

$setor = Invoke-RestMethod -Method Post -Uri "$api/setores/" -ContentType 'application/json' -Body (@{
  setor = 'Corrida'
} | ConvertTo-Json)

$produto = Invoke-RestMethod -Method Post -Uri "$api/produtos/" -ContentType 'application/json' -Body (@{
  idsetor = $setor.idsetor
  produto = 'Tenis Teste'
  descricao_produto = 'Produto para teste integrado'
  valor_unitario = 199.90
  unidade = 'UN'
  estoque = 10
} | ConvertTo-Json)

$pedido = Invoke-RestMethod -Method Post -Uri "$api/pedidos/" -ContentType 'application/json' -Body (@{
  idpessoa = $pessoa.idpessoa
  data_pedido = (Get-Date -Format 'yyyy-MM-dd')
  status_pedido = 'A'
} | ConvertTo-Json)

Invoke-RestMethod -Method Post -Uri "$api/pedidos/$($pedido.idpedido)/produtos" -ContentType 'application/json' -Body (@{
  idpedido = $pedido.idpedido
  idproduto = $produto.idproduto
  quantidade = 2
  valor_unitario = $produto.valor_unitario
} | ConvertTo-Json)
```

Depois consulte:

```powershell
Invoke-RestMethod "$api/pedidos/$($pedido.idpedido)/produtos"
Invoke-RestMethod "$api/produtos/$($produto.idproduto)"
```

O item deve existir e o estoque deve ter passado de `10` para `8`.

## 7. Testar no Angular

Na raiz do Angular:

```powershell
npm start
```

Abra o ID criado no passo anterior:

```text
http://localhost:4200/pedidos/ID_DO_PEDIDO/itens
```

No DevTools do navegador, a chamada aparece como `/api/...`; o proxy a encaminha para `localhost:8000`.

## 8. Cenários manuais obrigatórios

| Cenário | Resultado esperado |
|---|---|
| Pedido existente sem itens | lista vazia, formulário disponível |
| Pedido inexistente | mensagem “Pedido não encontrado” |
| URL com ID não numérico/zero | erro local, sem chamada HTTP |
| Inclusão válida | resposta 201, item aparece, estoque diminui |
| Mesmo produto novamente | bloqueio local ou resposta 409 |
| Quantidade acima do estoque | bloqueio local; backend também deve responder 400 se forçado |
| API desligada | mensagem de conexão, sem travar loading |
| Remoção cancelada | nenhum DELETE |
| Remoção confirmada | resposta 204 e item desaparece |
| Recarregar navegador | estado reconstruído a partir da API |

Atenção: no backend atual, remover não restaura estoque. Esse teste deve ser marcado como bloqueado até a correção obrigatória.

## Checklist de aceite

- [ ] MySQL, API e Angular iniciam com comandos documentados.
- [ ] `GET /produtos/` e `GET /pedidos/{id}/produtos` passam pelo proxy.
- [ ] A URL fornece `idpedido`; não há ID fixo no componente.
- [ ] Models refletem nomes e tipos reais do JSON.
- [ ] `HttpClient` está fornecido em `app.config.ts`.
- [ ] Services não têm `subscribe()` interno.
- [ ] O componente cancela subscriptions ao ser destruído.
- [ ] Formulário rejeita IDs/quantidades inválidos.
- [ ] Preço vem do produto selecionado e não do usuário.
- [ ] Duplicidade e estoque são validados também pelo backend.
- [ ] Loading, sucesso, erro e estado vazio são apresentados.
- [ ] POST 201 e DELETE 204 são tratados corretamente.
- [ ] Total usa o preço histórico do item.
- [ ] Nenhuma senha é armazenada ou exibida pelo componente.
- [ ] `npm run build` passa.
- [ ] Testes unitários passam.
- [ ] Correções obrigatórias do backend/infra foram validadas.
