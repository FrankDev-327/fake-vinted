import * as bycrypt from 'bcrypt';

export async function comparePasswords(password: string, hashedPassword: string): Promise<boolean> {
    return await bycrypt.compare(password, hashedPassword);
}