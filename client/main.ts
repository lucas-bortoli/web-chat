import { FromServer, isServerMessage } from "../Protocol.ts";
import { Interface } from "./Interface.ts";

async function onServerEvent(event: FromServer) {
  switch (event.kind) {
    case "messageCreated":
      console.log(`<${event.authorId}> #${event.roomName} ${event.content}`);
      break;
    default:
      console.log(event.kind);
  }
}

function main(_args: string[]) {
  const ui = new Interface();

  ui.startInputLoop();
  ui.render();

  const socket = new WebSocket("http://localhost:41505/chat");

  socket.addEventListener("close", () => {
    console.log(`Socket closed`);
  });

  socket.addEventListener("open", () => {
    console.log(`Socket opened`);
  });

  socket.addEventListener("message", (event) => {
    try {
      const data = JSON.parse(event.data);

      if (isServerMessage(data)) {
        onServerEvent(data);
      } else {
        throw new Error("Payload desconhecida");
      }
    } catch (error) {
      console.error("Erro ao interpretar mensagem!", event.data, error);

      // Desconectar este cliente, payload inválido!
      socket.close();
    }
  });
}

main(Deno.args);
