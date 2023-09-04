import { FromClient, FromServer, isClientMessage } from "./Protocol.ts";

export class Client {
  readonly socket: WebSocket;
  readonly id: string;
  nickname: string;
  rooms: string[];

  constructor(underlyingSocket: WebSocket) {
    this.socket = underlyingSocket;
    this.id = Date.now().toString(36).slice(2);
    this.nickname = this.id;
    this.rooms = [];
  }

  onMessage(callback: (message: FromClient) => void) {
    this.socket.addEventListener("message", (event) => {
      try {
        const data = JSON.parse(event.data);

        if (isClientMessage(data)) {
          callback(data);
        } else {
          throw new Error("Payload desconhecida");
        }
      } catch (error) {
        console.error("Erro ao interpretar mensagem!", event.data, error);

        // Desconectar este cliente, payload inválido!
        this.socket.close();
      }
    });
  }

  onClose(callback: () => void) {
    this.socket.addEventListener("close", callback);
  }

  send(message: FromServer) {
    this.socket.send(JSON.stringify(message));
  }
}
