import { Button, Field, FieldError, FieldLabel, FieldSet, Input } from '@qingshaner/ui'
import { useMutation } from '@tanstack/react-query'

import { api } from '../../apis'

type Task = { id: number; title: string; description: string }

export const TaskForm = ({ task, onSaved, onCancel }: { task?: Task; onSaved: () => void; onCancel?: () => void }) => {
  const save = useMutation({
    mutationFn: async (form: HTMLFormElement) => {
      const data = new FormData(form)
      const title = String(data.get('title') ?? '').trim()
      const description = String(data.get('description') ?? '').trim()
      if (!title) {
        throw new Error('请输入任务标题。')
      }
      if (task) {
        await api.tasks.update.call({ body: { description, id: task.id, title } })
      } else {
        await api.tasks.create.call({ body: { description, title } })
      }
      form.reset()
      onSaved()
    }
  })
  const prefix = task ? `task-${task.id}` : 'new-task'

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        save.mutate(event.currentTarget)
      }}
    >
      <FieldSet className="grid gap-4 sm:grid-cols-2" disabled={save.isPending}>
        <Field className="min-w-0 gap-2">
          <FieldLabel htmlFor={`${prefix}-title`}>任务标题</FieldLabel>
          <Input
            defaultValue={task?.title ?? ''}
            id={`${prefix}-title`}
            name="title"
            placeholder="接下来要做什么？"
            required
          />
        </Field>
        <Field className="min-w-0 gap-2">
          <FieldLabel htmlFor={`${prefix}-description`}>描述（可选）</FieldLabel>
          <Input defaultValue={task?.description ?? ''} id={`${prefix}-description`} name="description" />
        </Field>
        <div className="flex justify-end gap-2 sm:col-span-2">
          <Button type="submit">{save.isPending ? '正在保存…' : task ? '保存任务' : '添加任务'}</Button>
          {onCancel && (
            <Button onClick={onCancel} type="button" variant="outline">
              取消
            </Button>
          )}
        </div>
      </FieldSet>
      {save.error && <FieldError className="mt-3">{save.error.message}</FieldError>}
    </form>
  )
}
