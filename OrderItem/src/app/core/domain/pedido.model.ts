export interface PedidoCreate {
  idpessoa: number;
  data_pedido: string;
  status_pedido: string;
}

export interface Pedido extends PedidoCreate {
  idpedido: number;
}

export interface PedidoUpdate {
  status_pedido: string;
}
