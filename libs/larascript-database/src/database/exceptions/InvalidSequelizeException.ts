export default class InvalidSequelizeException extends Error {
  constructor(message: string = "Invalid Sequelize") {
    super(message);
    this.name = "InvalidSequelize";
  }
}
