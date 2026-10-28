async function request(path, options = {}) {
  const res = await fetch(`/api/tasks${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (res.status === 204) return null
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const listTasks = (params) => request(`?${new URLSearchParams(params)}`)
export const createTask = (task) => request('', { method: 'POST', body: JSON.stringify(task) })
export const updateTask = (id, patch) =>
  request(`/${id}`, { method: 'PATCH', body: JSON.stringify(patch) })
export const deleteTask = (id) => request(`/${id}`, { method: 'DELETE' })
