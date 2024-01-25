import { PrismaClient as BasePrismaClient, StatusPedido } from "@prisma/client";
import { IConnectionDatabase } from "@adapters/ports/IConnectionDatabase";
import { PedidoEntity } from "@src/entities/PedidoEntity";

export class PrismaClient extends BasePrismaClient {
  // Aqui você pode adicionar métodos personalizados ou personalizar o comportamento do PrismaClient, se necessário
}

export class PrismaConnection implements IConnectionDatabase {
  private prisma: PrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  async listPedidos(): Promise<any> {
    const pedidosData = await this.prisma.pedidoProps.findMany({
      include: {
        cliente: true,
        itens: true,
      },
    });
    return pedidosData;
  }

  async savePedido(newPedido: PedidoEntity): Promise<any> {
    const pedidoData = await this.prisma.pedidoProps.create({
      data: {
        status: StatusPedido[newPedido.status] as StatusPedido,
        valor: newPedido.valor,
        cliente: {
          connectOrCreate: {
            where: { cpf: newPedido.cliente.cpf },
            create: {
              nome: newPedido.cliente.nome,
              cpf: newPedido.cliente.cpf,
            },
          },
        },
        itens: {
          connectOrCreate: newPedido.itens.map((item) => ({
            where: { descricao: item.descricao },
            create: {
              descricao: item.descricao,
              qtd: item.qtd,
            },
          })),
          /* create: newPedido.itens.map((item) => ({
            preco: item.valor,
            descricao: item.descricao,
            qtd: item.qtd,
            tipo: TipoItem.bebida,
          })), */
        },
      },
    });

    return pedidoData.id;
  }

  async findPedidoById(pedidoId: string): Promise<any> {
    throw new Error("Method not implemented.");
  }

  getConnection(): PrismaClient {
    return this.prisma;
  }

  async connect(): Promise<void> {
    // Lógica para conectar ao banco de dados
    await this.prisma.$connect();
  }

  async disconnect(): Promise<void> {
    // Lógica para desconectar do banco de dados
    await this.prisma.$disconnect();
  }
}
