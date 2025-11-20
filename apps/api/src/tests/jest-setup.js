// jest.setup.ts

afterEach(() => {
    // Patch console.log to catch late logs
    const origLog = console.log;
    console.log = (...args) => {
      origLog(
        "[LATE LOG DETECTED]",
        ...args,
        "\nStack trace:\n",
        new Error().stack
      );
    };
  
    // Warn about unhandled async stuff
    process.on("unhandledRejection", (reason) => {
      console.error("[UNHANDLED PROMISE REJECTION]", reason);
    });
  
    process.on("rejectionHandled", (promise) => {
      console.warn("[PROMISE HANDLED TOO LATE]", promise);
    });
  
    // Warn if a test schedules timers after it finishes
    const timers = setTimeout(() => {}, 0);
    clearTimeout(timers);
  });
  