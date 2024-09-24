import * as bcrypt from 'bcrypt';
import { singleton } from 'tsyringe';

@singleton()
export class HashService {
  public async hash(data: string): Promise<string> {
    const salt = await this.generateSalt();

    return bcrypt.hash(data, salt);
  }

  public async generateSalt(): Promise<string> {
    const saltRounds = 10;

    return bcrypt.genSalt(saltRounds);
  }

  public async compare(data: string, encrypted: string): Promise<boolean> {
    return bcrypt.compare(data, encrypted);
  }
}
