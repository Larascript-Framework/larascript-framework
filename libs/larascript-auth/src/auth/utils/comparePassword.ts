import bcrypt from "bcryptjs";

/**
 * Compares a plain text password with a hashed password.
 *
 * @param password The plain text password
 * @param hashedPassword The hashed password
 * @returns true if the password matches the hashed password, false otherwise
 * @deprecated Use cryptoService().verifyHash instead
 */
export const comparePassword = (
  password: string,
  hashedPassword: string,
): boolean => bcrypt.compareSync(password, hashedPassword);
