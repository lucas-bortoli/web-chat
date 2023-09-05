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
        break;
      case "leaveRoom":
        removeFromArray(client.rooms, message.kind);
        break;
      case "changeNickname":
        client.nickname = message.nickname;
        break;
      case "createMessage":
        for (const otherPeer of this.#clients) {
          if (otherPeer === client || !otherPeer.rooms.includes(message.roomName)) {
            continue;
          }

          otherPeer.send({
            kind: "messageCreated",
            authorId: client.id,
            roomName: message.roomName,
            content: message.content
          });
        }

        break;
    }

    client.send({ kind: `ACK/${message.kind}` });
  }

  #cleanupClient(client: Client) {
    if (client.socket.readyState === WebSocket.OPEN) {
      client.socket.close();
    }

    removeFromArray(this.#clients, client);

    console.log(`Cliente ${client.id} desconectado!`);
  }
}
