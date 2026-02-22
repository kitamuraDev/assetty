// bcryptjsを使い、パスワードをハッシュ化してログに出力する
import { hash } from 'bcryptjs';

const password = process.argv[2];

if (!password) {
  console.error('Usage: bun run src/db/bcrypt.ts <password>');
  process.exit(1);
}

const hashed = await hash(password, 12);
console.log(hashed);
