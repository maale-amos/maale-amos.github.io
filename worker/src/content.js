import { json, error } from './http.js';
import { getSession } from './index.js';

export async function handleContent(request, env, path) {
  const section = path.replace('/api/content/', '');
  if (!/^[a-z0-9-]+$/.test(section)) return error(400, 'bad_section', env);

  if (request.method === 'GET') {
    const row = await env.DB.prepare('SELECT json_data, updated_at FROM content WHERE section_id = ?')
      .bind(section).first();
    if (!row) return json({ section, data: null }, env);
    return json({ section, data: JSON.parse(row.json_data), updatedAt: row.updated_at }, env);
  }

  if (request.method === 'POST') {
    const session = await getSession(request, env);
    if (!session)                    return error(401, 'unauthorized', env);
    if (session.role !== 'admin')    return error(403, 'forbidden', env);

    const body = await request.json().catch(() => null);
    if (!body || typeof body !== 'object') return error(400, 'bad_json', env);

    await env.DB.prepare(
      `INSERT INTO content (section_id, json_data, updated_by, updated_at)
       VALUES (?, ?, ?, unixepoch())
       ON CONFLICT(section_id) DO UPDATE SET
         json_data = excluded.json_data,
         updated_by = excluded.updated_by,
         updated_at = excluded.updated_at`
    ).bind(section, JSON.stringify(body), session.uid).run();

    return json({ ok: true, section }, env);
  }

  return error(405, 'method_not_allowed', env);
}
