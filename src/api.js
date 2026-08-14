const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/$/, '');

async function request(path, options = {}) {
  if (!base) throw new Error('offline');
  const response = await fetch(`${base}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.status === 204 ? null : response.json();
}

export const api = {
  enabled: Boolean(base),
  list: (month) => request(`/api/tasks?month=${month}`),
  create: (task) => request('/api/tasks', { method: 'POST', body: JSON.stringify(task) }),
  update: (id, task) => request(`/api/tasks/${id}`, { method: 'PUT', body: JSON.stringify(task) }),
  remove: (id) => request(`/api/tasks/${id}`, { method: 'DELETE' }),
};
