import { Command, Option } from "clipanion";
import { fetch } from "undici";

const post = async (url: string, body: any) =>
  fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

export abstract class SnapshotCommand extends Command {
  port = Option.String(`-p,--port`, "3000");
  address = Option.String(`-a,--addr`);

  protected getUrl(): string {
    if (!this.address && !this.port) {
      throw new Error("Either --address or --port must be provided");
    }
    let url = this.address;
    if (!url) {
      url = `http://localhost:${this.port}`;
    }
    return url;
  }
}

export class SnapshotCreateCommand extends SnapshotCommand {
  static paths = [
    [`snapshot`, "create"],
    [`snapshot`, "c"],
  ];

  static usage = Command.Usage({
    description: "Create a snapshot of the server",
    details: `Create a snapshot of the server and save it to a file. When running in development mode, the server will restore the "default" snapshot after starting.`,
    examples: [
      [
        "Create a default snapshot of the server (named 'default')",
        "ema snapshot c",
      ],
      [
        "Create a snapshot of the server with a custom name",
        "ema snapshot c -n my-snapshot",
      ],
    ],
  });

  name = Option.String("-n,--name", "default");

  async execute() {
    const name = this.name;
    const response = await post(`${this.getUrl()}/api/snapshot`, { name });
    const result: any = await response.json();
    if (result && result.fileName) {
      console.log(`Snapshot saved to ${result.fileName}`);
    } else {
      console.error("Failed to save snapshot");
    }
  }
}

export class SnapshotRestoreCommand extends SnapshotCommand {
  static paths = [
    [`snapshot`, `restore`],
    [`snapshot`, `r`],
  ];

  static usage = Command.Usage({
    description: "Restore a snapshot of the server",
    details: `Restore a snapshot of the server from a file. When running in development mode, the server will restore the "default" snapshot after starting.`,
    examples: [
      [
        "Restore a default snapshot of the server (named 'default')",
        "ema snapshot r",
      ],
      [
        "Restore a snapshot of the server with a custom name",
        "ema snapshot r -n my-snapshot",
      ],
    ],
  });

  name = Option.String("-n,--name", "default");

  async execute() {
    const name = this.name;
    const response = await post(`${this.getUrl()}/api/snapshot/restore`, {
      name,
    });
    const result: any = await response.json();
    if (result && result.message) {
      console.log(`Snapshot restored: ${result.message}`);
    } else {
      console.error("Failed to save snapshot");
    }
  }
}
