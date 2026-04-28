import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export async function POST(req) {
  const { username, password } = await req.json();
  const db = getDb();

  try {
    // Try to find user
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    if (user) {
      // Login
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        return new Response(JSON.stringify({ error: 'Invalid password' }), { status: 401 });
      }
      return new Response(JSON.stringify({ id: user.id, username: user.username }), { status: 200 });
    } else {
      // Simple register if not found
      const id = uuidv4();
      const hash = await bcrypt.hash(password, 10);
      db.prepare('INSERT INTO users (id, username, password_hash) VALUES (?, ?, ?)').run(id, username, hash);
      return new Response(JSON.stringify({ id, username }), { status: 201 });
    }
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
