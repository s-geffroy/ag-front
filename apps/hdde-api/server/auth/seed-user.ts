// Admin seeding CLI — the ONLY way to create accounts (no self-signup, ADR 0033).
//   npm --workspace @ag/hdde-api run seed:user -- <email> <password> [role]
import { getDb } from '../db/index';
import { hashPassword } from './password';
import { getUserByEmail, createUser } from '../db/repo';

function main(): void {
  const [email, password, role = 'owner_admin'] = process.argv.slice(2);
  if (!email || !password) {
    console.error('Usage: seed:user -- <email> <password> [role=owner_admin|analyst]');
    process.exit(1);
  }
  if (password.length < 12) {
    console.error('Refusing: password must be at least 12 characters.');
    process.exit(1);
  }
  // Ensure the shared DB is initialised + migrated at the configured path.
  getDb();
  if (getUserByEmail(email)) {
    console.error(`User already exists: ${email}`);
    process.exit(1);
  }
  const user = createUser(email, hashPassword(password), role);
  console.log(`Created ${role} account: ${user.email} (${user.id})`);
}

main();
