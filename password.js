// Script to generate an admin password, which will be saved in .env.
// I'm no security expert so hopefully I didn't fuck this up.
import crypto from "node:crypto";
import readline from "node:readline";

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question("Password: ", (password) => {
  password = password.trim();
  console.log("password length:", password.length);
  const salt = crypto.randomBytes(128);
  crypto.pbkdf2(password, salt, 10000, 64, "sha512", (err, derivedKey) => {
    if (err) throw err;
    console.log(`ADMIN_HASH=${derivedKey.toString("base64")}`);
    console.log(`ADMIN_SALT=${salt.toString("base64")}`);
  });
})


