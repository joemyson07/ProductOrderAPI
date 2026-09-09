import { DecimalString, Produto } from "./produto.model";

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