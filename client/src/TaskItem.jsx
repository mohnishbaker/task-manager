import { useState } from 'react'
import TaskForm from './TaskForm.jsx'

const STATUSES = [
  ['todo', 'To do'],
  ['in-progress', 'In progress'],
  ['done', 'Done'],
]

export default function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false)
  const done = task.status === 'done'
  const overdue = task.dueDate && !done && new Date(task.dueDate) < new Date(new Date().toDateString())

  if (editing) {
    return (
      <li className="card">
        <TaskForm
          initial={task}
          submitLabel="Save"
          onCancel={() => setEditing(false)}
          onSubmit={async (patch) => {
            await onUpdate(task._id, patch)
            setEditing(false)
          }}
        />
      </li>
    )
  }

  return (
    <li className={`card ${done ? 'done' : ''}`}>
      <input
        type="checkbox"
        aria-label={`Mark "${task.title}" ${done ? 'not done' : 'done'}`}
        checked={done}
        onChange={() => onUpdate(task._id, { status: done ? 'todo' : 'done' })}
      />
      <div className="body">
        <div className="title">{task.title}</div>
        {task.description && <div className="desc">{task.description}</div>}
        <div className="meta">
          <span className={`badge ${task.priority}`}>{task.priority}</span>
          {task.dueDate && (
            <span className={overdue ? 'overdue' : ''}>
              Due {new Date(task.dueDate).toLocaleDateString(undefined, { timeZone: 'UTC' })}
              {overdue && ' (overdue)'}
            </span>
          )}
        </div>
      </div>
      <select
        aria-label="Status"
        value={task.status}
        onChange={(e) => onUpdate(task._id, { status: e.target.value })}
      >
        {STATUSES.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <button className="ghost" onClick={() => setEditing(true)}>
        Edit
      </button>
      <button className="ghost danger" onClick={() => onDelete(task._id)}>
        Delete
      </button>
    </li>
  )
}
