import { useCallback, useEffect, useState } from 'react'
import { createTask, deleteTask, listTasks, updateTask } from './api.js'
import TaskForm from './TaskForm.jsx'
import TaskItem from './TaskItem.jsx'

export default function App() {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [status, setStatus] = useState('')
  const [priority, setPriority] = useState('')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')

  // Debounce search so we don't hit the API on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setQ(search), 250)
    return () => clearTimeout(t)
  }, [search])

  const load = useCallback(async () => {
    try {
      const params = {}
      if (status) params.status = status
      if (priority) params.priority = priority
      if (q) params.q = q
      setTasks(await listTasks(params))
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [status, priority, q])

  useEffect(() => {
    load()
  }, [load])

  // Mutations run through one wrapper so errors surface in the same banner
  const run = (fn) => async (...args) => {
    try {
      await fn(...args)
      setError('')
      await load()
    } catch (e) {
      setError(e.message)
      throw e
    }
  }
  const onCreate = run(createTask)
  const onUpdate = run(updateTask)
  const onDelete = run(deleteTask)

  const remaining = tasks.filter((t) => t.status !== 'done').length

  return (
    <main>
      <h1>Task Manager</h1>
      <section className="card add">
        <TaskForm submitLabel="Add task" onSubmit={onCreate} />
      </section>

      <div className="filters">
        <input
          type="search"
          aria-label="Search"
          placeholder="Search tasks…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All statuses</option>
          <option value="todo">To do</option>
          <option value="in-progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <select aria-label="Filter by priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {error && <div className="error" role="alert">{error}</div>}
      {loading ? (
        <p className="empty">Loading…</p>
      ) : tasks.length === 0 ? (
        <p className="empty">No tasks found.</p>
      ) : (
        <>
          <p className="count">{remaining} of {tasks.length} remaining</p>
          <ul className="list">
            {tasks.map((t) => (
              <TaskItem key={t._id} task={t} onUpdate={onUpdate} onDelete={onDelete} />
            ))}
          </ul>
        </>
      )}
    </main>
  )
}
