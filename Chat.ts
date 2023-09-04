import { Client } from "./Client.ts";
import { FromClient, isClientMessage } from "./Protocol.ts";
import { removeFromArray } from "./Utils.ts";

export class Chat {
  #clients: Client[] = [];

  registerClient(client: Client) {
    this.#clients.push(client);

    client.onMessage((msg) => this.#onClientProtocolMessage(client, msg));
    client.onClose(() => this.#cleanupClient(client));
  }

  #onClientProtocolMessage(client: Client, message: FromClient) {
    switch (message.kind) {
      case "joinRoom":
        client.rooms.push(message.roomName);
        client.send({ kind: "ACK/joinRoom" });
        break;
      case "leaveRoom":
        removeFromArray(client.rooms, message.kind);
        client.send({ kind: "ACK/leaveRoom" });
        break;
      case "changeNickname":
        client.nickname = message.nickname;
        client.send({ kind: "ACK/changeNickname" });
        break;
      case "createMessage":
        client.send({ kind: "ACK/createMessage" });

        for (const otherPeer of this.#clients) {
          if (otherPeer === client) {
            continue;
          }

          otherPeer.send({ kind: "messageCreated", authorId: client.id, content: message.content });
        }

        break;
    }
  }

  #cleanupClient(client: Client) {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.close();
    }

    removeFromArray(this.#clients, client);

    console.log(`Cliente ${client.id} desconectado!`);
  }
}
