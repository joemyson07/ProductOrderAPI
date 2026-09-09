# Guia de integração — OrderItem

Esta documentação foi criada a partir do código existente em `infra/`, `backend/` e `src/`. Ela descreve como implementar a lógica do frontend Angular para o componente `order-item`, mantendo o HTML como uma tarefa separada.

## Ordem de leitura

1. [01 — Diagnóstico e arquitetura](./01-diagnostico-e-arquitetura.md): estado atual, fluxo da aplicação, responsabilidades e riscos encontrados.
2. [02 — Contrato da API e do banco](./02-contrato-api-e-banco.md): endpoints, modelos TypeScript, formatos JSON e regras de negócio existentes.
3. [03 — Implementação do frontend](./03-implementacao-frontend.md): passo a passo com o conteúdo completo dos arquivos TypeScript e de configuração.
4. [04 — Contrato do HTML](./04-contrato-html.md): propriedades, métodos e estados que o template feito pelo estagiário deve consumir.
5. [05 — Testes e validação](./05-testes-e-validacao.md): testes unitários, teste integrado e checklist de aceite.
6. [06 — Ajustes necessários em infra/backend](./06-ajustes-infra-backend.md): incompatibilidades encontradas e correções recomendadas.

## Escopo da implementação

O fluxo principal documentado é a tela de itens de um pedido, acessível por uma rota como:

```text
/pedidos/10/itens
```

Essa tela deve:

- obter o pedido pelo parâmetro `idpedido` da rota;
- listar o catálogo de produtos;
- listar os produtos já associados ao pedido;
- adicionar um produto com quantidade válida;
- remover um produto do pedido;
- apresentar subtotal por item e total do pedido;
- bloquear ações durante requisições;
- traduzir erros HTTP do FastAPI para mensagens úteis.

O backend atual **não possui endpoint para alterar a quantidade de um item**. Portanto, edição de item não faz parte da primeira versão. Não simule uma edição com remoção seguida de inclusão enquanto o backend não restaurar corretamente o estoque ao remover.

## Decisão arquitetural mais importante

O navegador nunca se conecta diretamente ao MySQL. A integração correta é:

```text
order-item.component.ts
        ↓
services Angular (HttpClient)
        ↓ HTTP/JSON
FastAPI (routes → controllers → services → repositories)
        ↓ SQLAlchemy
MySQL bd_loja_esportiva
```

Assim, “integrar o frontend com o banco” significa integrar o Angular com a API FastAPI que já acessa o banco.

## Critério de conclusão

A tarefa está pronta quando todos os itens do [checklist de aceite](./05-testes-e-validacao.md#checklist-de-aceite) passarem e os bloqueios classificados como “obrigatórios” em [06 — Ajustes necessários](./06-ajustes-infra-backend.md) tiverem sido resolvidos pelo responsável do backend/infra.
