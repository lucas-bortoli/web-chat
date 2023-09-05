import { Chat } from "./Chat.ts";
import { startServer } from "./HttpServer.ts";

function main(_args: string[]) {
  const chat = new Chat();

  startServer(chat, "localhost", 41505);
}

main(Deno.args);
