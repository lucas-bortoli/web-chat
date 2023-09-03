interface ClientChangeNickname {
  kind: "changeNickname";
  nickname: string;
}

interface ClientCreateMessage {
  kind: "createMessage";
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
  content: string;
}

export type ServerAck = {
  kind: `ACK/${FromClient["kind"]}`;
};

export type FromServer = ServerMessageCreated | ServerAck;

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
