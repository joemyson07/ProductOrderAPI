# 03 — Implementação do frontend

Este capítulo é o roteiro principal da tarefa. Os blocos mostram o conteúdo final sugerido de cada arquivo. Implemente na ordem apresentada e execute os testes ao final.

## 1. Criar as pastas

A partir de `ProductOrderAPI/OrderItem`:

```powershell
New-Item -ItemType Directory -Force src/app/core/config
New-Item -ItemType Directory -Force src/app/core/models
New-Item -ItemType Directory -Force src/app/core/services
New-Item -ItemType Directory -Force src/app/core/utils
```

Não crie um service que acessa MySQL. Services Angular são clientes HTTP da API.

## 2. Configurar a URL da API

Crie `src/app/core/config/api.config.ts`:

```ts
import { InjectionToken } from '@angular/core';

export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');
```

O valor será fornecido em `app.config.ts`. Usar um token deixa os services testáveis e permite trocar a URL sem editar cada um deles.

## 3. Criar os models

Crie `src/app/core/models/produto.model.ts`:

```ts
export type DecimalString = string;

export interface Produto {
  idproduto: number;
  idsetor: number;
  produto: string;
  descricao_produto: string | null;
  valor_unitario: DecimalString;
  unidade: string;
  estoque: number;
}
```

Crie `src/app/core/models/pedido-produto.model.ts`:

```ts
import { DecimalString, Produto } from './produto.model';

export interface PedidoProduto {
  idpedido: number;
  idproduto: number;
  quantidade: number;
  valor_unitario: DecimalString;
}

export interface PedidoProdutoCreate {
  // Obrigatório enquanto o schema atual do backend exigir esse campo no body.
  idpedido: number;
  idproduto: number;
  quantidade: number;
  valor_unitario: DecimalString;
}

export interface PedidoProdutoDetalhado extends PedidoProduto {
  produto: Produto | null;
  subtotal: number;
}
```

Crie `src/app/core/models/api-error.model.ts`:

```ts
export interface FastApiValidationIssue {
  type?: string;
  loc?: Array<string | number>;
  msg: string;
}

export interface FastApiErrorBody {
  detail?: string | FastApiValidationIssue[];
}
```

Não use `any`: os tipos acima documentam o contrato e fazem mudanças do backend aparecerem como erros de compilação.

## 4. Criar o tradutor de erros

Crie `src/app/core/utils/api-error.util.ts`:

```ts
import { HttpErrorResponse } from '@angular/common/http';
import {
  FastApiErrorBody,
  FastApiValidationIssue,
} from '../models/api-error.model';

export function obterMensagemApi(error: unknown): string {
  if (!(error instanceof HttpErrorResponse)) {
    return 'Ocorreu um erro inesperado.';
  }

  if (error.status === 0) {
    return 'Não foi possível conectar à API. Verifique se o backend está ativo.';
  }

  const body = error.error as FastApiErrorBody | null;
  const detail = body?.detail;

  if (typeof detail === 'string' && detail.trim()) {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((issue: FastApiValidationIssue) => {
        const campo = issue.loc?.filter((part) => part !== 'body').join('.');
        return campo ? `${campo}: ${issue.msg}` : issue.msg;
      })
      .join(' | ');
  }

  switch (error.status) {
    case 400:
      return 'A requisição contém dados inválidos.';
    case 404:
      return 'O recurso solicitado não foi encontrado.';
    case 409:
      return 'A operação conflita com um registro existente.';
    case 422:
      return 'A API rejeitou um ou mais campos enviados.';
    default:
      return `Falha na API (HTTP ${error.status}).`;
  }
}
```

## 5. Criar o service de produtos

Crie `src/app/core/services/produto.service.ts`:

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import { Produto } from '../models/produto.model';

@Injectable({ providedIn: 'root' })
export class ProdutoService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listar(): Observable<Produto[]> {
    return this.http.get<Produto[]>(`${this.apiBaseUrl}/produtos/`);
  }

  buscarPorId(idproduto: number): Observable<Produto> {
    return this.http.get<Produto>(
      `${this.apiBaseUrl}/produtos/${idproduto}`,
    );
  }
}
```

O endpoint de listagem termina com `/` porque a rota FastAPI foi declarada dessa forma. Isso evita uma resposta de redirecionamento antes do GET real.

## 6. Criar o service de itens do pedido

Crie `src/app/core/services/pedido-produto.service.ts`:

```ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_BASE_URL } from '../config/api.config';
import {
  PedidoProduto,
  PedidoProdutoCreate,
} from '../models/pedido-produto.model';

@Injectable({ providedIn: 'root' })
export class PedidoProdutoService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  listarPorPedido(idpedido: number): Observable<PedidoProduto[]> {
    return this.http.get<PedidoProduto[]>(
      `${this.apiBaseUrl}/pedidos/${idpedido}/produtos`,
    );
  }

  adicionar(
    idpedido: number,
    dados: PedidoProdutoCreate,
  ): Observable<PedidoProduto> {
    return this.http.post<PedidoProduto>(
      `${this.apiBaseUrl}/pedidos/${idpedido}/produtos`,
      dados,
    );
  }

  remover(idpedido: number, idproduto: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiBaseUrl}/pedidos/${idpedido}/produtos/${idproduto}`,
    );
  }
}
```

Não esconda `subscribe()` dentro dos services. O componente precisa controlar loading, sucesso, erro e recarregamento.

## 7. Habilitar HttpClient

Substitua `src/app/app.config.ts` por:

```ts
import { registerLocaleData } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';
import localePt from '@angular/common/locales/pt';
import { ApplicationConfig, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from './core/config/api.config';
import { routes } from './app.routes';

registerLocaleData(localePt);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(),
    provideRouter(routes),
    { provide: API_BASE_URL, useValue: '/api' },
    { provide: LOCALE_ID, useValue: 'pt-BR' },
  ],
};
```

Sem `provideHttpClient()`, a aplicação falhará com `NullInjectorError: No provider for HttpClient`.

## 8. Configurar rota

Substitua `src/app/app.routes.ts` por:

```ts
import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'pedidos/:idpedido/itens',
    loadComponent: () =>
      import('./order-item/order-item.component').then(
        (module) => module.OrderItemComponent,
      ),
  },
];
```

O carregamento lazy evita importar a feature na inicialização. Não redirecione `/` para um pedido fixo sem saber se esse registro existe.

O `src/app/app.component.ts` já importa `RouterOutlet`. Limpe o conteúdo padrão de `src/app/app.component.html` e deixe somente:

```html
<router-outlet />
```

## 9. Implementar a lógica do componente

Substitua `src/app/order-item/order-item.component.ts` pelo código a seguir. Ele não define estrutura visual; apenas oferece o estado e os eventos que o HTML consumirá.

```ts
import { CommonModule } from '@angular/common';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, finalize, forkJoin, map } from 'rxjs';
import {
  PedidoProduto,
  PedidoProdutoCreate,
  PedidoProdutoDetalhado,
} from '../core/models/pedido-produto.model';
import { Produto } from '../core/models/produto.model';
import { PedidoProdutoService } from '../core/services/pedido-produto.service';
import { ProdutoService } from '../core/services/produto.service';
import { obterMensagemApi } from '../core/utils/api-error.util';

@Component({
  selector: 'app-order-item',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './order-item.component.html',
  styleUrl: './order-item.component.css',
})
export class OrderItemComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly formBuilder = inject(FormBuilder);
  private readonly produtoService = inject(ProdutoService);
  private readonly pedidoProdutoService = inject(PedidoProdutoService);
  private readonly destroyRef = inject(DestroyRef);
  private numeroCarga = 0;

  idPedido: number | null = null;
  produtos: Produto[] = [];
  itens: PedidoProduto[] = [];
  itensDetalhados: PedidoProdutoDetalhado[] = [];

  carregando = false;
  salvando = false;
  produtoEmRemocao: number | null = null;
  erro: string | null = null;
  mensagem: string | null = null;

  readonly form = this.formBuilder.nonNullable.group({
    idproduto: [0, [Validators.required, Validators.min(1)]],
    quantidade: [
      1,
      [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)],
    ],
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        map((params) => params.get('idpedido')),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((idParam) => {
        const idPedido = Number(idParam);

        if (
          idParam === null ||
          !Number.isInteger(idPedido) ||
          idPedido <= 0
        ) {
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
      });
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
        takeUntilDestroyed(this.destroyRef),
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
      });
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

    this.pedidoProdutoService
      .adicionar(this.idPedido, dados)
      .pipe(
        finalize(() => (this.salvando = false)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.mensagem = 'Produto adicionado ao pedido.';
          this.form.reset({ idproduto: 0, quantidade: 1 });
          this.carregarDados();
        },
        error: (error: unknown) => {
          this.erro = obterMensagemApi(error);
        },
      });
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

    this.pedidoProdutoService
      .remover(this.idPedido, idproduto)
      .pipe(
        finalize(() => (this.produtoEmRemocao = null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: () => {
          this.mensagem = 'Produto removido do pedido.';
          this.carregarDados();
        },
        error: (error: unknown) => {
          this.erro = obterMensagemApi(error);
        },
      });
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
```

### Por que recarregar após POST/DELETE

Não altere apenas os arrays locais. O POST reduz estoque no backend e outro cliente pode ter alterado os dados. Reconsultar mantém a API como fonte da verdade. Depois que a aplicação crescer, pode-se adotar cache coordenado, mas isso não é necessário aqui.

### Por que manter `itens` e `itensDetalhados`

`itens` preserva a resposta pura. `itensDetalhados` contém o resultado do join com produtos e os subtotais destinados ao template. Essa separação evita modificar acidentalmente o objeto usado como contrato HTTP.

### Por que existe `numeroCarga`

O Angular pode reutilizar o mesmo componente quando apenas o parâmetro da rota muda. `numeroCarga` impede uma resposta antiga e mais lenta de sobrescrever os dados do pedido mais recente. A cada recarga o número aumenta; apenas a resposta da carga atual pode alterar a tela.

## 10. Configurar o proxy local

Crie `proxy.conf.json` na raiz do projeto Angular, ao lado de `package.json`:

```json
{
  "/api": {
    "target": "http://localhost:8000",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    },
    "logLevel": "debug"
  }
}
```

Altere o script `start` em `package.json`:

```json
"start": "ng serve --proxy-config proxy.conf.json"
```

Depois reinicie `npm start`. Alterar o proxy com o dev server já aberto não é suficiente.

## 11. Configuração de produção

O proxy acima funciona apenas com `ng serve`. Para publicar, escolha uma das opções:

1. Servir Angular e FastAPI no mesmo domínio e configurar o servidor/reverse proxy para encaminhar `/api` ao FastAPI. Nesse caso o código não muda.
2. Fornecer ao token `API_BASE_URL` uma URL completa, por exemplo `https://api.exemplo.com`, e configurar CORS restrito no FastAPI.

Não deixe `localhost` embutido nos services. Também não coloque usuário/senha do MySQL no frontend: todo código enviado ao navegador é público.

## 12. Ordem prática de commits

Uma divisão revisável seria:

1. `feat: add api models and http services`
2. `feat: implement order item component logic`
3. `test: cover order item services and component`
4. `docs: document html contract and integration setup`

Antes de cada commit, execute:

```powershell
npm run build
npm test -- --watch=false --browsers=ChromeHeadless
```
