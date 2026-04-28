import { getDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  if (!userId) return new Response('Missing userId', { status: 400 });
  
  const db = getDb();
  const progress = db.prepare('SELECT * FROM progress WHERE user_id = ?').all(userId);
  return new Response(JSON.stringify(progress), { status: 200 });
}

export async function POST(req) {
  const { userId, moduleId, stepId, score, totalScore, completed } = await req.json();
  const db = getDb();

  try {
    const existing = db.prepare('SELECT * FROM progress WHERE user_id = ? AND module_id = ?')
      .get(userId, moduleId);

    if (existing) {
      const completedSteps = JSON.parse(existing.completed_steps);
      if (!completedSteps.includes(stepId)) {
        completedSteps.push(stepId);
      }
      
      db.prepare(`
        UPDATE progress 
        SET completed_steps = ?, score = ?, total_score = ?, completed = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(JSON.stringify(completedSteps), score, totalScore, completed ? 1 : 0, existing.id);
    } else {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO progress (id, user_id, module_id, completed_steps, score, total_score, completed)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(id, userId, moduleId, JSON.stringify([stepId]), score, totalScore, completed ? 1 : 0);
    }

    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
