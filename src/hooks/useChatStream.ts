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
    let cleanup: (() => void) | undefined;

    Promise.all([
      listen<TokenPayload>("chat-token", (e) => appendToken(e.payload.token)),
      listen<DonePayload>("chat-done", () => finishStream()),
    ]).then(([unlistenToken, unlistenDone]) => {
      cleanup = () => {
        unlistenToken();
        unlistenDone();
      };
    });

    return () => {
      cleanup?.();
    };
  }, [appendToken, finishStream]);
}
