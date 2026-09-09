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