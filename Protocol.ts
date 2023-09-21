interface ClientChangeNickname {
  kind: "changeNickname";
  nickname: string;
}

interface ClientCreateMessage {
  kind: "createMessage";
  roomName: string;
  content: string;
}

interface ClientJoinRoom {
  kind: "joinRoom";
  roomName: string;
}

interface ClientLeaveRoom {
  kind: "leaveRoom";
  roomName: string;
}

export type FromClient =
  | ClientChangeNickname
  | ClientCreateMessage
  | ClientJoinRoom
  | ClientLeaveRoom;

interface ServerMessageCreated {
  kind: "messageCreated";
  authorId: string;
  roomName: string;
  content: string;
}

export type FromServer =
  | ServerMessageCreated
  | {
      kind: `ACK/${FromClient["kind"]}`;
    };

export function isClientMessage(message: object): message is FromClient {
  if (typeof message !== "object") {
    return false;
  }

  if (!("kind" in message)) {
    return false;
  }

  return ["changeNickname", "createMessage", "joinRoom", "leaveRoom"].includes(
    message.kind as string
  );
}

export function isServerMessage(message: object): message is FromServer {
  if (typeof message !== "object") {
    return false;
  }

  if (!("kind" in message)) {
    return false;
  }

  return [
    "messageCreated",
    "ACK/changeNickname",
    "ACK/createMessage",
    "ACK/joinRoom",
    "ACK/leaveRoom"
  ].includes(message.kind as string);
}
