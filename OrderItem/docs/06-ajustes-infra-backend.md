# 06 — Ajustes necessários em infra/backend

Esta análise compara o `docker.compose.yml`, o script SQL, os models SQLAlchemy, os schemas Pydantic e as regras dos services. O frontend documentado funciona com o contrato atual, mas os itens obrigatórios abaixo devem ser resolvidos para uma integração confiável.

## 1. Resumo priorizado

| Prioridade | Problema | Efeito |
|---|---|---|
| Obrigatória | Compose usa variável `MYSQL_ROOT_ASSWORD` inválida | container MySQL pode nem inicializar |
| Obrigatória | Compose cria `CARRINHO_DB`, API procura `bd_loja_esportiva` | API conecta no schema errado/inexistente |
| Obrigatória | Compose publica `3309`, API usa `3306` | falha de conexão ou conexão em outro MySQL |
| Obrigatória | Script SQL não é montado no container | tabelas podem não existir |
| Obrigatória | inclusão aceita quantidade zero/negativa | estoque pode ser corrompido |
| Obrigatória | preço do item vem do cliente | usuário pode adulterar o preço |
| Obrigatória | remoção não restaura estoque | estoque fica incorretamente reduzido |
| Alta | CPF/telefone são string no SQL e inteiro no Python | zeros à esquerda são perdidos; tipos divergem |
| Alta | `PessoaResponse` devolve senha | exposição de credencial |
| Alta | descrição é `NOT NULL` no SQL e opcional no ORM/API | criação pode falhar com erro 500 |
| Média | CORS aceita qualquer origem com credenciais | configuração insegura/incompatível com produção |
| Média | commits não fazem rollback/tradução de `IntegrityError` | sessão quebrada e erros 500 pouco claros |
| Média | não há rota para atualizar quantidade | fluxo de edição fica incompleto |
| Baixa | dependências Python não têm versão fixada | instalações futuras podem se comportar diferente |

## 2. Corrigir o Compose

O arquivo atual contém quatro incompatibilidades:

- `MYSQL_ROOT_ASSWORD` deveria ser `MYSQL_ROOT_PASSWORD`;
- `MYSQL_DATABASE` usa `CARRINHO_DB`, diferente do script e da API;
- a porta publicada é `3309`, mas `database.py` usa `3306`;
- não há montagem de `script_loja_esportiva.sql` em `/docker-entrypoint-initdb.d`.

Exemplo coerente para executar o backend localmente e o MySQL em container:

```yaml
services:
  mysql:
    image: mysql:8.4
    container_name: loja_esportiva_mysql
    restart: unless-stopped
    environment:
      MYSQL_ROOT_PASSWORD: root
      MYSQL_DATABASE: bd_loja_esportiva
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
      - ./infra/banco_de_dados/script_loja_esportiva.sql:/docker-entrypoint-initdb.d/01-schema.sql:ro
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost", "-proot"]
      interval: 5s
      timeout: 5s
      retries: 20

volumes:
  mysql_data:
```

Se a porta `3306` já estiver ocupada, mantenha `3309:3306` e configure a API para usar `localhost:3309`. O importante é não misturar as duas opções.

Scripts em `/docker-entrypoint-initdb.d` só são aplicados quando o diretório de dados do MySQL é inicializado pela primeira vez. Não remova um volume que contenha dados importantes. Em ambiente descartável, faça backup antes de recriar o volume.

## 3. Tirar a conexão do código-fonte

Hoje `database.py` fixa usuário, senha, host, porta e schema:

```py
DATABASE_URL = "mysql+pymysql://root:root@localhost:3306/bd_loja_esportiva"
```

Use variável de ambiente:

```py
import os

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://root:root@localhost:3306/bd_loja_esportiva",
)
```

Em produção, não mantenha o fallback com credenciais triviais. Use secret/configuração do ambiente e um usuário MySQL exclusivo para a aplicação, com apenas os privilégios necessários.

## 4. Alinhar SQL, ORM e Pydantic

### CPF e telefone

No SQL, ambos são `VARCHAR(11)`. No model e schema são inteiros. CPF e telefone são identificadores, não valores matemáticos; podem começar com zero.

No model:

```py
cpf: Mapped[str] = mapped_column(String(11), unique=True, nullable=False)
telefone: Mapped[str] = mapped_column(String(11), nullable=False)
```

No schema:

```py
from typing import Annotated
from pydantic import BaseModel, Field

Cpf = Annotated[str, Field(pattern=r"^\d{11}$")]
Telefone = Annotated[str, Field(pattern=r"^\d{10,11}$")]
```

Depois dessa alteração, frontends de pessoa também devem enviar strings (`"01234567890"`), nunca números.

### Descrição do produto

Escolha uma regra única:

- se a descrição for obrigatória, use `nullable=False` no ORM e `descricao_produto: str` no schema;
- se for opcional, altere o SQL para aceitar `NULL`.

O estado atual (`NOT NULL` no SQL e opcional na aplicação) não é válido.

### IDs

`pessoa.idpessoa` é `INT` no SQL e `BigInteger` no ORM. Use `Integer` nos dois lados, ou faça uma migração do banco para `BIGINT`. Não confie em `Base.metadata.create_all` para modificar tabelas que já existem.

### Unicidade

O model declara `cpf` como `unique=True`, mas o script SQL não cria `UNIQUE`. Acrescente a constraint via migração se essa for a regra de negócio. Avalie também unicidade de e-mail.

## 5. Proteger a inclusão do item

O backend deve ser a autoridade sobre preço e quantidade. O corpo ideal do POST é apenas:

```json
{
  "idproduto": 7,
  "quantidade": 2
}
```

Schema sugerido:

```py
from decimal import Decimal
from pydantic import BaseModel, ConfigDict, Field


class PedidoProdutoCreate(BaseModel):
    idproduto: int = Field(gt=0)
    quantidade: int = Field(gt=0)


class PedidoProdutoResponse(BaseModel):
    idpedido: int
    idproduto: int
    quantidade: int
    valor_unitario: Decimal

    model_config = ConfigDict(from_attributes=True)
```

A rota deve passar o ID separadamente:

```py
@router.post(
    "/{idpedido}/produtos",
    response_model=PedidoProdutoResponse,
    status_code=status.HTTP_201_CREATED,
)
def adicionar_produto(
    idpedido: int,
    dados: PedidoProdutoCreate,
    db: Session = Depends(get_db),
):
    return PedidoProdutoController(db).adicionar(idpedido, dados)
```

E o service deve usar o preço consultado no banco:

```py
item = PedidoProduto(
    idpedido=idpedido,
    idproduto=dados.idproduto,
    quantidade=dados.quantidade,
    valor_unitario=produto.valor_unitario,
)
```

Isso elimina:

- a duplicidade de `idpedido` na URL e no body;
- a possibilidade de os dois IDs divergirem;
- a possibilidade de o cliente escolher o preço;
- o bug de quantidade zero/negativa, por validação do Pydantic.

## 6. Restaurar estoque ao remover

Antes de remover a associação, consulte o produto e devolva a quantidade:

```py
def remover(self, idpedido: int, idproduto: int):
    item = self.repository.buscar(idpedido, idproduto)

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Produto não encontrado no pedido",
        )

    produto = self.produto_repository.buscar_por_id(idproduto)
    produto.estoque += item.quantidade
    self.repository.remover(item)
```

Como os objetos estão na mesma sessão, o commit da remoção também persiste a alteração do produto. Ainda assim, o desenho mais robusto é controlar a transação no service/unit of work, em vez de cada repository fazer seu próprio commit.

Também defina a regra para excluir um pedido inteiro: todos os itens removidos devem devolver estoque ou o pedido, depois de confirmado, deve ser imutável. Cascade sozinho não implementa essa regra.

## 7. Tratar concorrência de estoque

A sequência “ler estoque → comparar → diminuir → commit” pode permitir venda acima do estoque quando duas requisições ocorrem ao mesmo tempo.

Soluções possíveis:

- bloquear a linha do produto com `SELECT ... FOR UPDATE` durante a transação;
- executar um `UPDATE produto SET estoque = estoque - :qtd WHERE idproduto = :id AND estoque >= :qtd` e conferir o número de linhas afetadas;
- adicionar constraint `CHECK (estoque >= 0)` como última defesa, em versão MySQL compatível.

O frontend não consegue resolver essa concorrência. Ele deve tratar o `400/409` devolvido pela API e recarregar os dados.

## 8. Adicionar atualização de quantidade

O schema `PedidoProdutoUpdate` existe, mas nenhuma rota/controller/service/repository o utiliza. Uma API consistente pode expor:

```text
PATCH /pedidos/{idpedido}/produtos/{idproduto}
```

Corpo:

```json
{ "quantidade": 4 }
```

O backend deve calcular a diferença:

- antiga `2`, nova `4`: retirar mais `2` do estoque;
- antiga `4`, nova `1`: devolver `3` ao estoque;
- nova igual à antiga: não alterar estoque;
- nova menor que `1`: responder `422`;
- diferença maior que estoque: responder `400`.

Só depois dessa rota existir a UI deve oferecer edição.

## 9. Não devolver senha

`PessoaResponse` herda de `PessoaBase`, portanto inclui `senha` nas respostas de create/list/get/update. Defina um response sem esse campo:

```py
class PessoaResponse(BaseModel):
    idpessoa: int
    nome: str
    cpf: str
    data_nascimento: date
    sexo: str
    telefone: str
    email: str

    model_config = ConfigDict(from_attributes=True)
```

Senhas também devem ser armazenadas com hash forte, nunca em texto puro. Isso exige um fluxo próprio de cadastro/autenticação e não deve ser improvisado no componente de pedido.

## 10. Corrigir CORS

Para desenvolvimento sem proxy, restrinja à origem real:

```py
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:4200"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"],
)
```

Com o proxy Angular, as chamadas parecem ser da mesma origem durante desenvolvimento. Em produção, configure as origens por ambiente. Não use `allow_origins=["*"]` junto de credenciais.

## 11. Tratar erros e rollback

Cada método de repository chama `commit()` diretamente e não executa `rollback()` quando uma constraint falha. No mínimo:

```py
from sqlalchemy.exc import IntegrityError

try:
    db.commit()
except IntegrityError as exc:
    db.rollback()
    raise HTTPException(
        status_code=status.HTTP_409_CONFLICT,
        detail="A operação viola uma regra do banco de dados",
    ) from exc
```

Em uma evolução, mantenha os repositories focados em consultas e deixe o service controlar uma transação completa. Inclusão do item e redução do estoque devem confirmar ou falhar juntas.

## 12. Melhorar o contrato de leitura (opcional)

Hoje o frontend precisa buscar catálogo e itens e fazer o join. Uma resposta específica para a tela reduziria isso:

```json
{
  "idpedido": 10,
  "idproduto": 7,
  "quantidade": 2,
  "valor_unitario": "299.90",
  "produto": {
    "produto": "Tênis",
    "descricao_produto": "Corrida"
  },
  "subtotal": "599.80"
}
```

Isso é uma otimização de contrato, não um bloqueio. Se adotada, atualize os models TypeScript e remova a chamada ao catálogo apenas quando o formulário de inclusão também não precisar dele.

## 13. Migração do frontend após corrigir o POST

Quando o backend deixar de aceitar `idpedido` e `valor_unitario` no corpo, altere somente três pontos.

Model:

```ts
export interface PedidoProdutoCreate {
  idproduto: number;
  quantidade: number;
}
```

Montagem no componente:

```ts
const dados: PedidoProdutoCreate = {
  idproduto,
  quantidade,
};
```

Teste do service/componente: atualize o payload esperado. A URL e a resposta continuam iguais.

## 14. Checklist do responsável por backend/infra

- [ ] Compose inicializa e passa no healthcheck.
- [ ] Porta/schema/credenciais usados pela API correspondem ao MySQL iniciado.
- [ ] O script cria as quatro tabelas no schema correto.
- [ ] Swagger executa todos os endpoints sem erro 500.
- [ ] CPF e telefone preservam zeros à esquerda.
- [ ] Descrição opcional/obrigatória é igual no SQL, ORM e schema.
- [ ] POST rejeita quantidade menor que 1.
- [ ] POST ignora preço vindo do navegador e usa o preço do banco.
- [ ] DELETE restaura estoque.
- [ ] Operações concorrentes não deixam estoque negativo.
- [ ] Falha de banco executa rollback e retorna status útil.
- [ ] Respostas de pessoa não contêm senha.
- [ ] CORS é configurado por ambiente.
- [ ] Testes de integração cobrem 201, 204, 400, 404, 409 e 422.
