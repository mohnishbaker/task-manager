import { useState } from 'react'

const toDateInput = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '')

export default function TaskForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [description, setDescription] = useState(initial?.description ?? '')
  const [priority, setPriority] = useState(initial?.priority ?? 'medium')
  const [dueDate, setDueDate] = useState(toDateInput(initial?.dueDate))
  const [busy, setBusy] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!title.trim()) return
    setBusy(true)
    try {
      await onSubmit({ title, description, priority, dueDate: dueDate || null })
      if (!initial) {
        setTitle('')
        setDescription('')
        setDueDate('')
        setPriority('medium')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <input
        aria-label="Title"
        placeholder="What needs doing?"
        value={title}
        maxLength={200}
        onChange={(e) => setTitle(e.target.value)}
        required
        autoFocus={!!initial}
      />
      <textarea
        aria-label="Description"
        placeholder="Details (optional)"
        value={description}
        maxLength={2000}
        rows={2}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="row">
        <select aria-label="Priority" value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="low">Low priority</option>
          <option value="medium">Medium priority</option>
          <option value="high">High priority</option>
        </select>
        <input
          type="date"
          aria-label="Due date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <span className="spacer" />
        {onCancel && (
          <button type="button" className="ghost" onClick={onCancel}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={busy || !title.trim()}>
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
