import { Status } from "https://deno.land/std@0.201.0/http/mod.ts";
import { Chat } from "./Chat.ts";
import { Client } from "./Client.ts";

export function startServer(chat: Chat) {
  console.log(`Listening on :41505`);
  Deno.serve({ port: 41505 }, (request) => {
    const url = new URL(request.url);

    console.log(`${request.method.toUpperCase()} ${url.pathname}${url.search}${url.hash}`);

    if (url.pathname === "/chat" && request.headers.get("upgrade") === "websocket") {
      const { socket, response } = Deno.upgradeWebSocket(request);

      chat.registerClient(new Client(socket));

      return response;
    }

    return new Response("404", { status: Status.NotFound });
  });
}
