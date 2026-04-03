import { useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { useChatStore } from "@/stores/chatStore";

type TokenPayload = {
  message_id: string;
  token: string;
};

type DonePayload = {
  message_id: string;
};

export function useChatStream() {
  const appendToken = useChatStore((s) => s.appendToken);
  const finishStream = useChatStore((s) => s.finishStream);

  useEffect(() => {
    const unlistenToken = listen<TokenPayload>("chat-token", (event) => {
      appendToken(event.payload.token);
    });

    const unlistenDone = listen<DonePayload>("chat-done", () => {
      finishStream();
    });

    return () => {
      unlistenToken.then((fn) => fn());
      unlistenDone.then((fn) => fn());
    };
  }, [appendToken, finishStream]);
}
