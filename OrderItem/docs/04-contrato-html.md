# 04 — Contrato do HTML do `order-item`

Este documento é a interface entre quem implementa a lógica TypeScript e quem implementa `order-item.component.html`. O HTML pode ter qualquer estrutura visual, desde que use as propriedades e métodos abaixo.

## 1. Formulário

O elemento `<form>` deve usar:

```html
<form [formGroup]="form" (ngSubmit)="adicionar()">
```

Controles disponíveis:

| Nome | Tipo esperado | Valor inicial | Validações |
|---|---|---:|---|
| `idproduto` | `number` | `0` | obrigatório, mínimo 1 |
| `quantidade` | `number` inteiro | `1` | obrigatório, mínimo 1, somente dígitos |

O `<select>` de produtos deve usar `[ngValue]="produto.idproduto"`. `ngValue` preserva o ID como `number`; `[value]` pode transformá-lo em string e quebrar a comparação estrita feita no TypeScript. Para impedir inclusão duplicada, cada opção pode usar:

```html
[disabled]="produtoJaAdicionado(produto.idproduto) || produto.estoque <= 0"
```

O input de quantidade deve usar `type="number"`, `min="1"`, `step="1"` e, quando houver produto selecionado:

```html
[max]="produtoSelecionado?.estoque ?? null"
```

O botão de envio deve chamar apenas o submit do formulário e ficar desabilitado quando:

```html
[disabled]="form.invalid || salvando || carregando"
```

Durante o POST, use `salvando` para trocar o texto do botão ou mostrar um indicador. Não chame o service diretamente no template.

## 2. Estados de tela

O template deve renderizar estados mutuamente compreensíveis:

| Condição | O que mostrar |
|---|---|
| `carregando` | indicador com texto “Carregando itens...” |
| `erro` | alerta de erro com `{{ erro }}` e botão que chama `carregarDados()` quando fizer sentido |
| `mensagem` | confirmação com `{{ mensagem }}` |
| `!carregando && itensDetalhados.length === 0` | estado vazio “Este pedido ainda não possui produtos.” |
| `itensDetalhados.length > 0` | lista/tabela de itens e total |

Use `role="alert"` para erro e `role="status"`/`aria-live="polite"` para carregamento e confirmação. Isso também ajuda testes e acessibilidade.

## 3. Lista de itens

Fonte de dados:

```ts
itensDetalhados: PedidoProdutoDetalhado[]
```

Campos seguros para exibir:

| Expressão | Significado |
|---|---|
| `item.produto?.produto ?? ('Produto #' + item.idproduto)` | nome com fallback |
| `item.produto?.descricao_produto` | descrição opcional |
| `item.quantidade` | quantidade registrada |
| `item.valor_unitario` | preço histórico do item |
| `item.subtotal` | quantidade × preço histórico |

Para formatar moeda brasileira:

```html
{{ item.valor_unitario | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
{{ item.subtotal | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
{{ totalPedido | currency:'BRL':'symbol':'1.2-2':'pt-BR' }}
```

O guia de implementação registra `localePt` e fornece `LOCALE_ID` como `pt-BR` em `app.config.ts`. Se essa configuração não tiver sido aplicada, o pipe com locale explícito poderá lançar um erro de locale ausente.

Com sintaxe clássica, a repetição pode usar:

```html
*ngFor="let item of itensDetalhados; trackBy: trackByProdutoId"
```

Com o control flow do Angular 17, o equivalente é:

```html
@for (item of itensDetalhados; track item.idproduto) {
  <!-- apresentação do item -->
}
```

Escolha apenas uma sintaxe.

## 4. Remoção

O botão de remover deve chamar:

```html
(click)="remover(item.idproduto)"
```

Todos os botões de remoção devem ser desabilitados enquanto qualquer DELETE estiver em andamento:

```html
[disabled]="produtoEmRemocao !== null"
```

Para mostrar um indicador apenas na linha afetada, compare `produtoEmRemocao === item.idproduto`.

O TypeScript já pede confirmação com `window.confirm`. Não adicione uma segunda confirmação no HTML. Se futuramente for usado um modal, remova o `window.confirm` do método e faça o modal chamar um método de confirmação separado.

## 5. Informações gerais

O número do pedido está em `idPedido`. Ele pode ser `null` quando a URL for inválida, portanto use interpolação tolerante ou condicione sua apresentação.

O estoque do produto selecionado está disponível em:

```ts
produtoSelecionado?.estoque
```

O preço atual do produto selecionado está em:

```ts
produtoSelecionado?.valor_unitario
```

Esses dados são apenas informativos. O usuário não deve editar `valor_unitario`.

## 6. Esqueleto de integração, não de layout

Este fragmento mostra apenas como conectar o HTML à lógica. O estagiário deve substituir a estrutura e classes pelo layout definitivo:

```html
<section>
  <h1>Itens do pedido {{ idPedido }}</h1>

  @if (erro) {
    <p role="alert">{{ erro }}</p>
  }

  @if (mensagem) {
    <p role="status" aria-live="polite">{{ mensagem }}</p>
  }

  <form [formGroup]="form" (ngSubmit)="adicionar()">
    <!-- select formControlName="idproduto" -->
    <!-- input formControlName="quantidade" -->
    <!-- button type="submit" -->
  </form>

  @if (carregando) {
    <p role="status">Carregando itens...</p>
  } @else {
    <!-- repetir itensDetalhados e chamar remover(item.idproduto) -->
    <!-- exibir totalPedido -->
  }
</section>
```

## 7. Checklist para entrega do HTML

- O template compila sem acessar propriedades inexistentes.
- O submit chama `adicionar()` exatamente uma vez.
- Os controles usam `formControlName`, não `[(ngModel)]`.
- Estados de loading desabilitam ações concorrentes.
- Erro, sucesso, estado vazio e dados carregados são visualmente distintos.
- A tabela/lista funciona com `produto: null` usando o fallback.
- Preço e total têm duas casas decimais.
- Botões possuem `type` explícito (`submit` ou `button`).
- Labels estão associados aos campos.
- Navegação por teclado e foco permanecem utilizáveis.
