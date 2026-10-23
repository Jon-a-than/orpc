import {
  Button,
  CardDescription,
  CardTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  Input
} from '@qingshaner/ui'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { authApi } from '../../apis'

const signInWithGithub = async () => {
  const { error } = await authApi.signIn.social({
    callbackURL: window.location.origin,
    errorCallbackURL: `${window.location.origin}/?error=oauth`,
    provider: 'github'
  })
  if (error) {
    throw new Error(error.message || 'GitHub 登录失败，请重试。')
  }
}

export const AuthForm = () => {
  const [register, setRegister] = useState(false)
  const [redirecting, setRedirecting] = useState(false)
  const [callbackError, setCallbackError] = useState(() => new URLSearchParams(window.location.search).has('error'))
  const mutation = useMutation({
    mutationFn: async (form: FormData | 'github') => {
      if (form === 'github') {
        await signInWithGithub()
        setRedirecting(true)
        return
      }
      const email = String(form.get('email') ?? '').trim()
      const password = String(form.get('password') ?? '')
      const name = String(form.get('name') ?? '').trim()
      if (register && !name) {
        throw new Error('请输入名称。')
      }
      const { error } = register
        ? await authApi.signUp.email({ email, name, password })
        : await authApi.signIn.email({ email, password })
      if (error) {
        throw new Error(error.message || '登录失败，请重试。')
      }
    }
  })
  const busy = mutation.isPending || redirecting

  return (
    <>
      <CardTitle className="text-2xl">
        <h1>{register ? '创建账户' : '欢迎回来'}</h1>
      </CardTitle>
      <CardDescription className="mt-2 mb-6">登录后，管理你的任务和个人资料。</CardDescription>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          setCallbackError(false)
          mutation.mutate(new FormData(event.currentTarget))
        }}
      >
        <FieldSet disabled={busy}>
          {register && (
            <Field className="gap-2">
              <FieldLabel htmlFor="auth-name">名称</FieldLabel>
              <Input autoComplete="name" id="auth-name" maxLength={100} name="name" required />
            </Field>
          )}
          <Field className="gap-2">
            <FieldLabel htmlFor="auth-email">邮箱</FieldLabel>
            <Input autoComplete="email" id="auth-email" name="email" required type="email" />
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="auth-password">密码</FieldLabel>
            <Input
              aria-describedby="password-help"
              autoComplete={register ? 'new-password' : 'current-password'}
              id="auth-password"
              maxLength={128}
              minLength={8}
              name="password"
              required
              type="password"
            />
            <FieldDescription id="password-help">密码长度为 8–128 个字符。</FieldDescription>
          </Field>
          <Button className="w-full" size="lg" type="submit">
            {mutation.isPending ? '正在处理…' : register ? '注册并登录' : '邮箱登录'}
          </Button>
          <FieldSeparator className="[&>span]:bg-card">或</FieldSeparator>
          <Button
            className="w-full"
            onClick={() => {
              setCallbackError(false)
              mutation.mutate('github')
            }}
            size="lg"
            type="button"
            variant="outline"
          >
            {redirecting ? '正在前往 GitHub…' : '使用 GitHub 登录'}
          </Button>
          <Button
            className="w-full"
            onClick={() => {
              setRegister(!register)
              mutation.reset()
              setCallbackError(false)
            }}
            type="button"
            variant="link"
          >
            {register ? '已有账户？去登录' : '没有账户？注册'}
          </Button>
        </FieldSet>
      </form>
      {mutation.error && <FieldError className="mt-4 wrap-break-word">{mutation.error.message}</FieldError>}
      {callbackError && <FieldError className="mt-4 wrap-break-word">GitHub 登录未完成，请重新尝试。</FieldError>}
    </>
  )
}
