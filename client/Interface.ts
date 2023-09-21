import * as ansi from "https://deno.land/x/ansi@1.0.1/mod.ts";
import { Key, isPrintableCharacter } from "./Keys.ts";

export class Interface {
  #encoder: TextEncoder = new TextEncoder();
  #decoder: TextDecoder = new TextDecoder();

  #inputBuffer = "";

  async startInputLoop() {
    //   for await (io)
    const decoder = new TextDecoder();

    Deno.stdin.setRaw(true, { cbreak: true });

    while (true) {
      const character = await this.readCharacter();

      if (character === null) {
        break;
      }

      if (character.charCodeAt(0) === 127) {
        this.#inputBuffer = this.#inputBuffer.slice(0, -1);
      } else if (character === "\x27") {} else {
        this.#inputBuffer += character;
      }

      await this.render();
    }
  }

  async #read(): Promise<number> {
    const byte = new Uint8Array(1);

    if ((await Deno.stdin.read(byte)) === null) {
      console.error("Broken stdin");
      Deno.exit(1);
    }

    return byte.at(0)!;
  }

  async readCharacter(): Promise<string | null> {
    const buf = new Uint8Array(4); // Create a buffer to hold potential multi-byte characters
    let bytesRead = 0;
  
    while (true) {
      const n = await Deno.stdin.read(buf.subarray(bytesRead)); // Read bytes from stdin
  
      if (n === null) {
        return null; // No more input
      }
  
      bytesRead += n;
  
      // Check if we've read a complete character
      try {
        const text = this.#decoder.decode(buf.subarray(0, bytesRead));
        return text; // Return the character if successfully decoded
      } catch (error) {
        // If decoding fails, continue reading more bytes
        if (error instanceof Deno.errors.InvalidData) {
          continue;
        } else {
          throw error;
        }
      }
    }
  }

  async #write(data: string) {
    await Deno.stdout.write(this.#encoder.encode(data));
  }

  async render() {
    const { columns, rows } = Deno.consoleSize();

    await this.#write(ansi.clearTerminal());

    await this.#write(ansi.cursorTo(0, rows - 2));
    await this.#write(
      this.#inputBuffer
        .split("")
        .map((s) => s.charCodeAt(0))
        .join(" ")
    );

    await this.#write(ansi.cursorTo(0, rows - 1));
    await this.#write(this.#inputBuffer.slice(-columns + 1) + ` ${this.#inputBuffer.length}`);
  }
}
