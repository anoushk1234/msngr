// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import fetch from "node-fetch";
import { MessageEmbed } from "./types";
export interface payload {
  message?: string;
  embeds?: MessageEmbed[];
}
export type request = string | payload;
export interface response {
  success: boolean;
  response?: unknown;
  // returns the reason if success is false
  reason?: string;
}

const send = async (webhook: string, request: request): Promise<response> => {
  let finalPayload;
  if (typeof request === "string") {
    request = { message: request };
  }
  if (webhook.startsWith("https://hooks.slack.com/services/")) {
    finalPayload = {
      text: request.message,
    };
  } else if (webhook.startsWith("https://discord.com/api/webhooks")) {
    if (request.message) {
      finalPayload = {
        content: request.message,
      };
    } else if (request.embeds) {
      finalPayload = {
        embeds: request.embeds,
      };
    }
  } else {
    return {
      success: false,
      reason: "Invalid webhook",
    };
  }
  return fetch(webhook, {
    method: "POST",
    body: JSON.stringify(finalPayload),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then(async (res: Response) => {
      if (res.ok) {
        return {
          success: true,
          response: await res.text(),
        };
      } else {
        throw new Error(res.statusText);
      }
    })
    .catch((err: Error) => {
      return {
        success: false,
        reason: err.message,
      };
    });
};

const ping = async (webhook: string): Promise<response> => {
  return await send(webhook, { message: "Webhook pinged successfully!" });
};
export { send, ping };
