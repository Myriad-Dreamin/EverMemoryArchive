import { DryMongoBinary, MongoBinary } from "mongodb-memory-server";

const options = await DryMongoBinary.generateOptions();
await MongoBinary.download({ ...options, checkMD5: true });
console.log(
  `MongoDB binary (v${options.version}) downloaded to ${options.downloadDir}`,
);
