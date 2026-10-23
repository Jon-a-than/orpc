import { Button, Card, CardContent, CardDescription, CardHeader } from '@qingshaner/ui'

import { authApi } from '../../apis'
import { TaskListFeature } from '../tasks/task-list-feature'
import { AuthForm } from './auth-form'
import { ProfileForm } from './profile-form'

export const AccountFeature = () => {
  const { data: session, isPending, error, refetch } = authApi.useSession()

  if (!(isPending || error) && session) {
    return (
      <main className="bg-background text-foreground min-h-dvh px-4 py-8 sm:px-6 lg:py-12">
        <div className="mx-auto w-full max-w-6xl space-y-8">
          <header className="space-y-2 border-b pb-6">
            <p className="text-muted-foreground text-xs font-medium tracking-widest">WORKSPACE</p>
            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">专注手边的事</h1>
            <p className="text-muted-foreground text-sm">把想法记下来，一件一件完成。</p>
          </header>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
            <TaskListFeature key={session.user.id} userId={session.user.id} />
            <aside aria-label="账户设置" className="min-w-0 lg:sticky lg:top-8">
              <Card>
                <CardContent>
                  <ProfileForm key={session.user.id} user={session.user} />
                </CardContent>
              </Card>
            </aside>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="bg-background text-foreground grid min-h-dvh place-items-center px-4 py-10">
      <Card aria-label="账户" className="w-full max-w-md" role="region">
        <CardHeader>
          <CardDescription className="text-xs font-semibold tracking-widest">YOUR ACCOUNT</CardDescription>
        </CardHeader>
        <CardContent>
          {isPending ? (
            <p role="status">正在加载账户…</p>
          ) : error ? (
            <div className="space-y-4" role="alert">
              <h1 className="text-xl font-semibold">暂时无法读取账户</h1>
              <p>请检查网络连接后重试。</p>
              <Button onClick={() => refetch()}>重新加载</Button>
            </div>
          ) : (
            <AuthForm />
          )}
        </CardContent>
      </Card>
    </main>
  )
}
