# 01 — Diagnóstico e arquitetura

## 1. Estado atual do repositório

### Frontend

O projeto é Angular 17, usando componentes standalone e TypeScript 5.4. No estado analisado:

- `src/app/order-item/order-item.component.ts` contém apenas a declaração vazia do componente;
- `order-item.component.html` contém somente o placeholder `order-item works!`;
- `app.routes.ts` não possui rotas;
- `app.config.ts` ainda não fornece `HttpClient`;
- `app.component.html` ainda é a tela padrão gerada pelo Angular CLI;
- não existem models, services, tratamento central de erros ou configuração da URL da API;
- o teste do componente verifica apenas se ele é criado.

### Backend

O backend usa FastAPI, SQLAlchemy e PyMySQL. A divisão atual é:

```text
routes → controllers → services → repositories → models SQLAlchemy → MySQL
```

Existem recursos para:

- pessoas: CRUD completo;
- pedidos: CRUD completo;
- setores: CRUD completo;
- produtos: CRUD completo;
- produtos de um pedido: adicionar, listar e remover.

A API é iniciada em `backend/PROJETO-LOJA/back_end_aplicacao` com:

```powershell
python -m uvicorn main:app --reload --port 8000
```

Quando estiver ativa, a documentação interativa fica em `http://localhost:8000/docs`.

### Banco

O script cria o schema MySQL `bd_loja_esportiva` e quatro tabelas:

```text
pessoa 1 ─── N pedido 1 ─── N pedidoproduto N ─── 1 produto N ─── 1 setor
```

`pedidoproduto` é a tabela associativa e sua chave primária é composta por `(idpedido, idproduto)`. Isso significa que um mesmo produto só pode aparecer uma vez em cada pedido.

## 2. Arquitetura proposta para o frontend

Manter a implementação pequena e explícita:

```text
src/app/
├── core/
│   ├── config/
│   │   └── api.config.ts
│   ├── models/
│   │   ├── api-error.model.ts
│   │   ├── pedido-produto.model.ts
│   │   └── produto.model.ts
│   ├── services/
│   │   ├── pedido-produto.service.ts
│   │   └── produto.service.ts
│   └── utils/
│       └── api-error.util.ts
├── order-item/
│   ├── order-item.component.ts
│   ├── order-item.component.html
│   ├── order-item.component.css
│   └── order-item.component.spec.ts
├── app.component.ts
├── app.component.html
├── app.config.ts
└── app.routes.ts
```

Responsabilidades:

| Camada | Responsabilidade | Não deve fazer |
|---|---|---|
| Model | Representar exatamente o JSON da API | Fazer requisições ou conter estado visual |
| Service Angular | Construir URLs e executar HTTP | Controlar formulário ou mensagens da tela |
| Utilitário de erro | Converter falhas HTTP em mensagem | Alterar estado do componente |
| Componente | Orquestrar estado, validação e ações do usuário | Acessar banco ou montar HTTP manualmente |
| Template HTML | Renderizar e disparar métodos públicos | Reimplementar regra de estoque ou total |

## 3. Fluxo da tela

Ao abrir `/pedidos/:idpedido/itens`:

1. O componente lê `idpedido` da rota.
2. Valida se é um inteiro positivo.
3. Em paralelo, busca `GET /produtos/` e `GET /pedidos/{idpedido}/produtos`.
4. Combina os itens com os dados do catálogo para obter nome e estoque.
5. Libera o formulário quando ambas as requisições terminarem.

Ao adicionar:

1. Valida produto, quantidade e estoque no navegador para feedback rápido.
2. Copia o preço atual do produto selecionado para `valor_unitario`.
3. Envia `POST /pedidos/{idpedido}/produtos`.
4. Após sucesso, limpa o formulário e recarrega catálogo e itens.
5. Se o backend responder com erro, mantém o formulário e mostra a mensagem.

Ao remover:

1. Solicita confirmação do usuário.
2. Envia `DELETE /pedidos/{idpedido}/produtos/{idproduto}`.
3. Após sucesso, recarrega os dados.

## 4. Estado do componente

O componente deve ser a fonte única dos estados da tela:

| Propriedade | Tipo | Uso |
|---|---|---|
| `idPedido` | `number \| null` | Pedido obtido da URL |
| `produtos` | `Produto[]` | Catálogo retornado pela API |
| `itens` | `PedidoProduto[]` | Itens crus do pedido |
| `itensDetalhados` | `PedidoProdutoDetalhado[]` | Itens enriquecidos para a tela |
| `carregando` | `boolean` | Carregamento inicial/recarregamento |
| `salvando` | `boolean` | Inclusão em andamento |
| `produtoEmRemocao` | `number \| null` | ID cujo DELETE está em andamento |
| `erro` | `string \| null` | Falha atual apresentada na tela |
| `mensagem` | `string \| null` | Confirmação de sucesso |
| `form` | `FormGroup` tipado | Produto e quantidade selecionados |

Evite manter duas cópias independentes da mesma informação. Por exemplo, `totalPedido` deve ser calculado a partir de `itensDetalhados`, não atualizado manualmente em cada ação.

## 5. Decisões técnicas

### Reactive Forms

O formulário reativo deixa validação, valores e testes na lógica TypeScript. Isso é especialmente útil porque outra pessoa fará o HTML: basta ela respeitar o contrato descrito em `04-contrato-html.md`.

### Requisições paralelas

`forkJoin` é apropriado no carregamento porque chamadas `HttpClient` emitem uma resposta e concluem. A tela só monta os itens detalhados após receber catálogo e itens.

### Cancelamento ao destruir

`takeUntilDestroyed` evita que subscriptions sobrevivam ao componente. É a alternativa nativa no Angular 17 e dispensa um `Subject<void>` manual.

### Preço como string na resposta

O backend usa `Decimal`; no JSON gerado pelo Pydantic esse valor normalmente chega como string, por exemplo `"199.90"`. Os models mantêm essa realidade como `DecimalString`, e a conversão para `number` ocorre apenas ao calcular/exibir.

### Proxy de desenvolvimento

Usar `/api` no Angular e um proxy para `http://localhost:8000` evita espalhar host/porta pelos services e reduz problemas de CORS no desenvolvimento. O proxy só existe no servidor de desenvolvimento; a publicação deve configurar um proxy reverso ou trocar o valor do token `API_BASE_URL`.

## 6. Fora do escopo inicial

- acesso direto do Angular ao MySQL;
- autenticação e autorização, pois o backend ainda não oferece login/token;
- atualização de quantidade, pois não há rota `PUT/PATCH` para o item;
- paginação, pesquisa e ordenação no servidor;
- criação do HTML/CSS do `order-item`;
- correções no backend ou no compose — elas estão documentadas separadamente para o responsável aplicar.
