# 02 — Contrato da API e do banco

## 1. URL base e formato

Durante o desenvolvimento:

```text
Angular: http://localhost:4200
API:     http://localhost:8000
Swagger: http://localhost:8000/docs
```

Com o proxy proposto, os services Angular usam `/api`; o dev server encaminha para a API e remove esse prefixo.

Todas as requisições e respostas usam JSON, exceto `DELETE`, que responde `204 No Content`.

## 2. Endpoints relevantes para `order-item`

| Método | Caminho FastAPI | Sucesso | Corpo/resposta |
|---|---|---:|---|
| GET | `/produtos/` | 200 | `Produto[]` |
| GET | `/produtos/{idproduto}` | 200 | `Produto` |
| GET | `/pedidos/{idpedido}` | 200 | `Pedido` |
| GET | `/pedidos/{idpedido}/produtos` | 200 | `PedidoProduto[]` |
| POST | `/pedidos/{idpedido}/produtos` | 201 | envia `PedidoProdutoCreate`, recebe `PedidoProduto` |
| DELETE | `/pedidos/{idpedido}/produtos/{idproduto}` | 204 | sem corpo |

O backend também expõe CRUDs em `/pessoas/`, `/pedidos/`, `/produtos/` e `/setores/`, mas o componente de itens só precisa dos endpoints acima.

## 3. JSON real esperado

### Produto

```json
{
  "idproduto": 7,
  "idsetor": 2,
  "produto": "Tênis",
  "descricao_produto": "Tênis para corrida",
  "valor_unitario": "299.90",
  "unidade": "UN",
  "estoque": 12
}
```

### Item de pedido

```json
{
  "idpedido": 10,
  "idproduto": 7,
  "quantidade": 2,
  "valor_unitario": "299.90"
}
```

### Inclusão no contrato atual

```http
POST /pedidos/10/produtos
Content-Type: application/json
```

```json
{
  "idpedido": 10,
  "idproduto": 7,
  "quantidade": 2,
  "valor_unitario": "299.90"
}
```

Embora a rota sobrescreva `dados.idpedido` com o ID da URL, o schema `PedidoProdutoCreate` atual ainda declara `idpedido` como obrigatório. A validação do Pydantic ocorre antes de entrar na função da rota; portanto, omitir o campo atualmente gera `422`. O frontend deve enviá-lo até o backend adotar o ajuste recomendado em `06-ajustes-infra-backend.md`.

## 4. Models TypeScript

Use nomes e caixa exatamente iguais aos campos do backend. Não converta para camelCase no meio da primeira implementação, pois isso adicionaria um mapeamento sem benefício funcional.

```ts
// core/models/produto.model.ts
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

```ts
// core/models/pedido-produto.model.ts
import { DecimalString, Produto } from './produto.model';

export interface PedidoProduto {
  idpedido: number;
  idproduto: number;
  quantidade: number;
  valor_unitario: DecimalString;
}

export interface PedidoProdutoCreate {
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

Se outra tela precisar do pedido:

```ts
export interface Pedido {
  idpedido: number;
  idpessoa: number;
  data_pedido: string; // YYYY-MM-DD
  status_pedido: string; // banco limita a CHAR(1)
}
```

## 5. Erros retornados

Erros de negócio são enviados no formato:

```json
{ "detail": "Estoque insuficiente" }
```

Validações do FastAPI/Pydantic usam uma lista:

```json
{
  "detail": [
    {
      "type": "missing",
      "loc": ["body", "idpedido"],
      "msg": "Field required",
      "input": {}
    }
  ]
}
```

Status esperados:

| Status | Situação |
|---:|---|
| 0 | API indisponível, bloqueio de rede ou CORS |
| 400 | estoque insuficiente |
| 404 | pedido/produto/item não encontrado |
| 409 | produto já está no pedido |
| 422 | payload ausente, inválido ou com tipo incompatível |
| 500 | falha não tratada, conexão/constraint do banco ou bug do backend |

## 6. Regras existentes no backend

Na inclusão de item, o backend já:

- confirma que o pedido existe;
- confirma que o produto existe;
- impede duplicidade do mesmo produto no mesmo pedido;
- verifica se `produto.estoque < quantidade`;
- reduz o estoque antes do commit do novo item.

Na listagem, confirma que o pedido existe. Na remoção, confirma que o item existe.

## 7. Regras que o frontend deve aplicar

Validações locais melhoram a experiência, mas o backend continua sendo a autoridade:

- `idpedido`, `idproduto` e `quantidade` devem ser inteiros positivos;
- produto selecionado deve existir no catálogo carregado;
- quantidade não deve superar o estoque exibido;
- produto que já está no pedido deve ser desabilitado ou rejeitado antes do POST;
- preço enviado deve vir do produto selecionado, nunca de um campo editável pelo usuário;
- botões devem ficar desabilitados durante a respectiva requisição;
- após mutações, os dados devem ser buscados novamente na API.

Mesmo com essas validações, trate `400` e `409`: estoque e conteúdo do pedido podem mudar entre a leitura e o POST.

## 8. Relação com as tabelas

| Dado de tela | Origem |
|---|---|
| Nome/descrição do produto | `produto.produto`, `produto.descricao_produto` |
| Estoque disponível | `produto.estoque` |
| Quantidade no pedido | `pedidoproduto.quantidade` |
| Preço registrado no pedido | `pedidoproduto.valor_unitario` |
| Subtotal | cálculo de frontend: `quantidade × valor_unitario` |
| Total do pedido | soma dos subtotais |

Não calcule o subtotal usando o preço atual de `produto`: o item guarda um preço próprio, que representa o preço no momento da inclusão. Use `pedidoproduto.valor_unitario`.

## 9. Limitações importantes do contrato atual

- A resposta de item não inclui nome, descrição ou estoque do produto. Por isso são necessárias duas chamadas e um join no frontend.
- O POST confia no `valor_unitario` enviado pelo cliente. Isso permite adulteração de preço e deve ser corrigido no backend.
- Quantidade zero ou negativa não é rejeitada. Uma quantidade negativa chega a aumentar o estoque.
- O DELETE não devolve a quantidade removida ao estoque.
- Não existe atualização de quantidade.
- A remoção de pedido/produto pode conflitar com FKs do SQL, embora os relacionamentos ORM declarem cascade; o banco usa `ON DELETE NO ACTION`.
- `PessoaResponse` devolve `senha`, o que é uma vulnerabilidade e não deve ser reproduzido em telas.

Essas limitações estão classificadas e acompanhadas de correções em `06-ajustes-infra-backend.md`.
