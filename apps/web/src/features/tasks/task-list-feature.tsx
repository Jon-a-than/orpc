import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, FieldError } from '@qingshaner/ui'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { api } from '../../apis'
import { TaskForm } from './task-form'

const pageSize = 10

export const TaskListFeature = ({ userId }: { userId: string }) => {
  const [page, setPage] = useState(1)
  const [editingId, setEditingId] = useState<number | null>(null)
  const queryClient = useQueryClient()
  const queryKey = ['tasks', userId]
  const list = useQuery({
    queryFn: () => api.tasks.list.call({ query: { page, pageSize } }),
    queryKey: [...queryKey, page]
  })
  const refresh = () => queryClient.invalidateQueries({ queryKey })
  const remove = useMutation({
    mutationFn: (id: number) => api.tasks.delete.call({ body: { id } }),
    onSuccess: async () => {
      if (list.data?.length === 1 && page > 1) {
        setPage(page - 1)
      }
      await refresh()
    }
  })

  return (
    <Card aria-label="任务列表" className="min-w-0" role="region">
      <CardHeader>
        <CardTitle>
          <h2 className="text-xl">我的任务</h2>
        </CardTitle>
        <CardDescription>记录要做的事，任务会自动保存到你的账户。</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="bg-background/60 rounded-lg border p-4 sm:p-5">
          <TaskForm
            onSaved={() => {
              void refresh()
            }}
          />
        </div>
        {list.isPending ? (
          <p role="status">正在加载任务…</p>
        ) : list.isError ? (
          <div className="space-y-3">
            <FieldError>加载失败：{list.error.message}</FieldError>
            <Button
              onClick={() => {
                void list.refetch()
              }}
              variant="outline"
            >
              重试
            </Button>
          </div>
        ) : list.data.length === 0 ? (
          <p
            className="text-muted-foreground rounded-lg border border-dashed px-4 py-12 text-center text-sm"
            role="status"
          >
            {page === 1 ? '还没有任务，添加第一条吧。' : '这一页没有更多任务。'}
          </p>
        ) : (
          <ul className="divide-y">
            {list.data.map((task) => (
              <li className="py-4 first:pt-0 last:pb-0" key={task.id}>
                {editingId === task.id ? (
                  <TaskForm
                    onCancel={() => setEditingId(null)}
                    onSaved={() => {
                      setEditingId(null)
                      void refresh()
                    }}
                    task={task}
                  />
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 flex-1">
                      <h3 className="font-medium wrap-break-word">{task.title}</h3>
                      {task.description && (
                        <p className="text-muted-foreground mt-1 text-sm wrap-break-word whitespace-pre-wrap">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="flex shrink-0 justify-end gap-2">
                      <Button
                        aria-label={`编辑 ${task.title}`}
                        disabled={remove.isPending}
                        onClick={() => setEditingId(task.id)}
                        size="sm"
                        variant="outline"
                      >
                        编辑
                      </Button>
                      <Button
                        aria-label={`删除 ${task.title}`}
                        disabled={remove.isPending}
                        onClick={() => {
                          if (window.confirm(`确定删除“${task.title}”？`)) {
                            remove.mutate(task.id)
                          }
                        }}
                        size="sm"
                        variant="destructive"
                      >
                        删除
                      </Button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        {remove.error && <FieldError>删除失败：{remove.error.message}</FieldError>}
        <nav aria-label="任务分页" className="flex items-center justify-between gap-3 border-t pt-5">
          <Button
            disabled={page === 1 || list.isFetching || remove.isPending || editingId !== null}
            onClick={() => setPage(page - 1)}
            variant="outline"
          >
            上一页
          </Button>
          <span className="text-muted-foreground text-sm">第 {page} 页</span>
          <Button
            disabled={
              list.isFetching ||
              list.isError ||
              list.data?.length !== pageSize ||
              remove.isPending ||
              editingId !== null
            }
            onClick={() => setPage(page + 1)}
            variant="outline"
          >
            下一页
          </Button>
        </nav>
      </CardContent>
    </Card>
  )
}
