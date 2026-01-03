import { GoogleGenAI } from "@google/genai";
import * as fs from "node:fs";
import type { Dispatcher, RequestInit, Response } from "undici";
import { ProxyAgent, fetch } from "undici";
import { OpenAI } from "openai";

/**
 * A common fetch implementation that uses a proxy if HTTPS_PROXY or https_proxy is set.
 */
class FetchWithProxy {
  private readonly dispatcher: Dispatcher | undefined;

  constructor() {
    // Uses proxy if HTTPS_PROXY or https_proxy is set
    const https_proxy =
      process.env.HTTPS_PROXY || process.env.https_proxy || "";
    this.dispatcher = https_proxy ? new ProxyAgent(https_proxy) : undefined;
  }

  fetch(url: string, requestInit?: RequestInit) {
    requestInit ??= {};
    requestInit.dispatcher = this.dispatcher;
    return fetch(url, requestInit);
  }

  createFetcher() {
    return this.fetch.bind(this) as any;
  }
}

/**
 * Reads the API key from the .env file.
 */
const apiKey = (() => {
  // get from .env
  const env = fs.readFileSync(".env", "utf-8");
  const apiKey = env
    .split("\n")
    .find((line) => line.startsWith("GEMINI_API_KEY="))
    ?.split("=")[1];
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not set");
  }
  return apiKey;
})();

/**
 * A wrapper around the GoogleGenAI class that uses a custom fetch implementation.
 */
class GenAI extends GoogleGenAI {
  constructor(
    apiKey: string,
    private readonly fetcher: (
      url: string,
      requestInit?: RequestInit,
    ) => Promise<Response>,
  ) {
    super({
      apiKey,
    });
    if (!(this.apiClient as any).apiCall) {
      throw new Error("apiCall cannot be patched");
    }
    // Monkey patches apiCall to use our fetch.
    (this.apiClient as any).apiCall = async (url: string, requestInit: any) => {
      return this.fetcher(url, requestInit).catch((e) => {
        throw new Error(`exception ${e} sending request`);
      });
    };
  }
}

async function genAiExample() {
  /**
   * The fetch should be optionally given by the classes who constructs `GenAI`
   */
  const genAi = new GenAI(apiKey, new FetchWithProxy().createFetcher());

  // generate hello world

  const response = await genAi.models.generateContent({
    model: "gemini-2.5-flash",
    contents: ["Hello, world!"],
  });

  console.log(response.text);
}

async function openAiExample() {
  const openAi = new OpenAI({
    apiKey,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    fetch: new FetchWithProxy().createFetcher(),
  });
  const response = await openAi.chat.completions.create({
    model: "gemini-2.5-flash",
    messages: [{ role: "user", content: "Hello, world!" }],
  });
  console.log(response.choices[0].message.content);
}

// genAiExample()

await openAiExample();
