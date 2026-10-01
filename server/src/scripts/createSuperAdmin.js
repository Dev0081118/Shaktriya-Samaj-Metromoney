import 'dotenv/config';
import readline from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import mongoose from 'mongoose';
import { connectDatabase } from '../config/database.js';
import User from '../models/User.js';

const argument = (name) => {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : null;
};
const email = String(argument('email') || '')
  .trim()
  .toLowerCase();
if (!/^\S+@\S+\.\S+$/.test(email))
  throw new Error('Usage: npm run admin:create -- --email admin@example.com');
if (!stdin.isTTY)
  throw new Error(
    'Run this command in an interactive terminal so the password is not exposed in shell history.'
  );
const askHidden = (prompt) =>
  new Promise((resolve) => {
    stdout.write(prompt);
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let value = '';
    const onData = (character) => {
      if (character === '\r' || character === '\n') {
        stdin.setRawMode(false);
        stdin.pause();
        stdin.off('data', onData);
        stdout.write('\n');
        resolve(value);
      } else if (character === '\u0003') {
        process.exit(130);
      } else if (character === '\u007f') {
        if (value) {
          value = value.slice(0, -1);
          stdout.write('\b \b');
        }
      } else {
        value += character;
        stdout.write('*');
      }
    };
    stdin.on('data', onData);
  });
const password = await askHidden('Password (minimum 12 characters): ');
const confirmation = await askHidden('Confirm password: ');
if (password.length < 12)
  throw new Error('Password must be at least 12 characters.');
if (password !== confirmation) throw new Error('Passwords do not match.');
const terminal = readline.createInterface({ input: stdin, output: stdout });
const phone = (await terminal.question('Phone number (optional): ')).trim();
terminal.close();
await connectDatabase();
let user = await User.findOne({ email });
if (user) {
  user.role = 'super_admin';
  user.status = 'Active';
  user.password = password;
  if (phone) user.phone = phone;
  await user.save();
} else
  user = await User.create({
    email,
    password,
    phone: phone || undefined,
    role: 'super_admin',
    status: 'Active',
    emailVerified: true
  });
console.log(`Super admin ready: ${user.email}`);
await mongoose.disconnect();
