import { json, error } from './http.js';
import { getSession } from './index.js';

export async function handleResidents(request, env) {
  const session = await getSession(request, env);
  if (!session) return error(401, 'unauthorized', env);

  const url = new URL(request.url);
  const q     = url.searchParams.get('q')     || '';
  const page  = Math.max(1, Number(url.searchParams.get('page') || 1));
  const limit = Math.min(100, Number(url.searchParams.get('limit') || 50));
  const offset = (page - 1) * limit;

  let query, params;
  if (q) {
    query = `SELECT id, family_name, first_name, street, house_no
             FROM residents WHERE active = 1
               AND (family_name LIKE ? OR first_name LIKE ?)
             ORDER BY family_name LIMIT ? OFFSET ?`;
    params = [`%${q}%`, `%${q}%`, limit, offset];
  } else {
    query = `SELECT id, family_name, first_name, street, house_no
             FROM residents WHERE active = 1
             ORDER BY family_name LIMIT ? OFFSET ?`;
    params = [limit, offset];
  }

  const rs = await env.DB.prepare(query).bind(...params).all();
  return json({ page, limit, results: rs.results || [] }, env);
}
