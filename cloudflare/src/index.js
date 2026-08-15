const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};
const allowedTypes = new Set(['reel', 'story', 'property', 'ad']);
const allowedStatuses = new Set(['pending', 'done', 'late', 'missed']);
const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { ...headers, 'Content-Type': 'application/json' },
});

function validateTask(task) {
  if (!task.id || !task.title || !task.date) return 'Faltan campos obligatorios';
  if (!allowedTypes.has(task.task_type)) return 'Tipo de contenido inválido';
  if (!allowedStatuses.has(task.status || 'pending')) return 'Evaluación inválida';
  return null;
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    const url = new URL(request.url);
    const match = url.pathname.match(/^\/api\/tasks\/([^/]+)$/);

    try {
      if (request.method === 'GET' && url.pathname === '/api/tasks') {
        const month = url.searchParams.get('month');
        const { results } = await env.DB.prepare(
          'SELECT * FROM tasks WHERE date LIKE ? ORDER BY date, time',
        ).bind(`${month}%`).all();
        return json(results);
      }

      if (request.method === 'POST' && url.pathname === '/api/tasks') {
        const task = await request.json();
        const error = validateTask(task);
        if (error) return json({ error }, 400);
        await env.DB.prepare(
          'INSERT INTO tasks (id,title,task_type,date,time,notes,status) VALUES (?,?,?,?,?,?,?)',
        ).bind(task.id, task.title, task.task_type, task.date, task.time || '', task.notes || '', task.status || 'pending').run();
        return json(task, 201);
      }

      if (request.method === 'PUT' && match) {
        const task = { ...(await request.json()), id: match[1] };
        const error = validateTask(task);
        if (error) return json({ error }, 400);
        await env.DB.prepare(
          'UPDATE tasks SET title=?,task_type=?,date=?,time=?,notes=?,status=?,updated_at=CURRENT_TIMESTAMP WHERE id=?',
        ).bind(task.title, task.task_type, task.date, task.time || '', task.notes || '', task.status || 'pending', match[1]).run();
        return json(task);
      }

      if (request.method === 'DELETE' && match) {
        await env.DB.prepare('DELETE FROM tasks WHERE id=?').bind(match[1]).run();
        return new Response(null, { status: 204, headers });
      }

      return json({ error: 'Not found' }, 404);
    } catch (error) {
      return json({ error: 'Database error', detail: error.message }, 500);
    }
  },
};
