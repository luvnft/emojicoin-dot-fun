import { type ChildProcessWithoutNullStreams, spawn } from "child_process";
import kill from "tree-kill";
import { sleep } from "../../src/emojicoin_dot_fun/utils";

export class LocalNode {
  readonly MAXIMUM_WAIT_TIME_SEC = 75;

  readonly READINESS_ENDPOINT = "http://127.0.0.1:8070/";

  process: ChildProcessWithoutNullStreams | null = null;

  /**
   * Kills all the descendent processes of the node
   * process, including the node process itself.
   */
  stop() {
    if (!this.process?.pid) return;
    kill(this.process.pid);
  }

  /**
   * Runs a local testnet and waits for process to be up.
   *
   * If the local node process is already up, it returns and does
   * not start the process.
   */
  async run() {
    const nodeIsUp = await this.checkIfProcessIsUp();
    if (nodeIsUp) {
      return;
    }
    this.start();
    await this.waitUntilProcessIsUp();
  }

  /**
   * Starts the local testnet by running the aptos node run-local-testnet command.
   */
  start() {
    const cliCommand = "npx";
    const cliArgs = [
      "@aptos-labs/aptos-cli",
      "node",
      "run-local-testnet",
      "--force-restart",
      "--assume-yes",
      "--with-indexer-api",
      "--bind-to",
      "0.0.0.0",
    ];

    const childProcess = spawn(cliCommand, cliArgs);
    this.process = childProcess;

    childProcess.stderr?.on("data", (data: any) => {
      const str = data.toString();
      // eslint-disable-next-line no-console
      console.log(str);
    });

    childProcess.stdout?.on("data", (data: any) => {
      const str = data.toString();
      // eslint-disable-next-line no-console
      console.log(str);
    });
  }

  /**
   * Waits for the local testnet process to be up.
   *
   * @returns Promise<boolean>
   */
  async waitUntilProcessIsUp(): Promise<boolean> {
    let operational = await this.checkIfProcessIsUp();
    const start = Date.now() / 1000;
    let last = start;

    while (!operational && start + this.MAXIMUM_WAIT_TIME_SEC > last) {
      // eslint-disable-next-line no-await-in-loop
      await sleep(1000);
      // eslint-disable-next-line no-await-in-loop
      operational = await this.checkIfProcessIsUp();
      last = Date.now() / 1000;
    }

    // If we are here it means something blocks the process to start.
    // Might worth checking if another process is running on port 8080.
    if (!operational) {
      throw new Error("Process failed to start");
    }

    return true;
  }

  /**
   * Checks if the local testnet is up.
   *
   * @returns Promise<boolean>
   */
  async checkIfProcessIsUp(): Promise<boolean> {
    try {
      // Query readiness endpoint
      const data = await fetch(this.READINESS_ENDPOINT);
      if (data.status === 200) {
        return true;
      }
      return false;
    } catch (err: any) {
      return false;
    }
  }
}