class LoggerService {
  constructor(public logs: string[] = []) {}

  log(message: string) {
    this.logs.push(message);
  }

  clear() {
    this.logs = [];
  }

  containsLog(message: string) {
    return this.logs.includes(message);
  }
}

export default LoggerService;
