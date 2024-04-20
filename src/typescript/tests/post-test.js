module.exports = async function () {
  // Check if the current local node process is
  // from within the sdk node environment
  if (process.env.RUN_LOCAL_NODE == "true" && globalThis.__LOCAL_NODE__.process) {
    const aptosNode = globalThis.__LOCAL_NODE__;
    // Local node runs multiple processes, to avoid asynchronous operations
    // that weren't stopped in our tests, we kill all the descendent processes
    // of the node process, including the node process itself
    aptosNode.stop();
  }
};
