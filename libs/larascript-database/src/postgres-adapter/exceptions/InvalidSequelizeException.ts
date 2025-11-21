export default class InvalidSequelizeException extends Error {
  constructor(message: string = "Invalid Sequelize Exception") {
    super(message);
    this.name = "InvalidSequelizeException";
  }
}
