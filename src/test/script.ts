// Quick test — paste in a temp API route or run with ts-node
import { hashPassword, verifyPassword } from "@/lib/password";

const hash  = await hashPassword("secret123");
const valid = await verifyPassword("secret123", hash);
const wrong = await verifyPassword("wrongpass", hash);

console.log({ hash, valid, wrong });
// { hash: "$2b$10$...", valid: true, wrong: false }