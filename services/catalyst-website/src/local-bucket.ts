import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { Readable } from "node:stream";

/**
 * A filesystem stand-in for a Stratus bucket, used ONLY when
 * LOCAL_STORE_DIR is set.
 *
 * This exists so the publish → freeze → serve chain can be proven without a
 * deploy. Catching a bug here costs a second; catching it on AppSail costs a
 * build, an upload and a round trip through someone else's console.
 *
 * It is never reachable in Catalyst: server.ts only constructs it when the
 * environment variable is present, and that variable is not set on AppSail.
 */
export function createLocalBucket(rootDir: string) {
  const root = resolve(rootDir);

  return {
    async putObject(key: string, body: Buffer, options?: Record<string, unknown>) {
      const file = join(root, key);
      if (options?.overwrite === false && existsSync(file)) {
        throw new Error(`Object already exists: ${key}`);
      }
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, body);
      return { key };
    },

    async getObject(key: string) {
      const file = join(root, key);
      if (!existsSync(file)) throw new Error(`Object not found: ${key}`);
      return Readable.from([readFileSync(file)]);
    },
  };
}
