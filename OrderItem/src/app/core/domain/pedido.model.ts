export interface Pedido {
    idpedido?: number;
    idpessoa: number;
    data_pedido: Date | string;
    status_pedido: string;
}