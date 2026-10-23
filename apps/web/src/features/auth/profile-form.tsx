import {
  Button,
  CardDescription,
  CardTitle,
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
  FieldSet,
  Input
} from '@qingshaner/ui'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { authApi } from '../../apis'

type User = typeof authApi.$Infer.Session.user

const Avatar = ({ image, name }: Pick<User, 'image' | 'name'>) => {
  const [failed, setFailed] = useState(false)
  return image && !failed ? (
    <img
      alt={`${name}的头像`}
      className="size-16 shrink-0 rounded-full object-cover"
      onError={() => setFailed(true)}
      referrerPolicy="no-referrer"
      src={image}
    />
  ) : (
    <span
      aria-label={`${name}的默认头像`}
      className="bg-secondary text-secondary-foreground grid size-16 shrink-0 place-items-center rounded-full text-2xl"
      role="img"
    >
      {name.trim().slice(0, 1).toUpperCase() || '?'}
    </span>
  )
}

export const ProfileForm = ({ user }: { user: User }) => {
  const [name, setName] = useState(user.name)
  const [image, setImage] = useState(user.image ?? '')
  const save = useMutation({
    mutationFn: async () => {
      const nextName = name.trim()
      const nextImage = image.trim()
      if (!nextName) {
        throw new Error('名称不能为空。')
      }
      if (nextImage && !/^https?:\/\//i.test(nextImage)) {
        throw new Error('头像地址必须以 http:// 或 https:// 开头。')
      }
      const { error } = await authApi.updateUser({ image: nextImage || null, name: nextName })
      if (error) {
        throw new Error(error.message || '保存失败，请重试。')
      }
    }
  })
  const signOut = useMutation({
    mutationFn: async () => {
      const { error } = await authApi.signOut()
      if (error) {
        throw new Error(error.message || '退出失败，请重试。')
      }
    }
  })
  const busy = save.isPending || signOut.isPending

  return (
    <>
      <div className="mb-6 flex items-center gap-4">
        <Avatar image={user.image} key={user.image} name={user.name} />
        <div className="min-w-0">
          <CardTitle className="text-xl wrap-break-word">
            <h2>{user.name}</h2>
          </CardTitle>
          <CardDescription className="mt-2 wrap-break-word">{user.email}</CardDescription>
        </div>
      </div>
      <h3 className="mb-4 border-t pt-5 text-sm font-semibold">个人资料</h3>
      <form
        onSubmit={(event) => {
          event.preventDefault()
          save.mutate()
        }}
      >
        <FieldSet disabled={busy}>
          <Field className="gap-2">
            <FieldLabel htmlFor="profile-name">名称</FieldLabel>
            <Input
              autoComplete="name"
              id="profile-name"
              maxLength={100}
              name="name"
              onChange={(event) => {
                setName(event.target.value)
                save.reset()
              }}
              required
              value={name}
            />
          </Field>
          <Field className="gap-2">
            <FieldLabel htmlFor="profile-image">头像地址</FieldLabel>
            <Input
              aria-describedby="avatar-help"
              id="profile-image"
              name="image"
              onChange={(event) => {
                setImage(event.target.value)
                save.reset()
              }}
              placeholder="https://example.com/avatar.png"
              type="url"
              value={image}
            />
            <FieldDescription id="avatar-help">填写可公开访问的图片链接，留空可移除头像。</FieldDescription>
          </Field>
          <Button className="w-full" size="lg" type="submit">
            {save.isPending ? '正在保存…' : '保存资料'}
          </Button>
          <Button className="w-full" onClick={() => signOut.mutate()} size="lg" type="button" variant="outline">
            {signOut.isPending ? '正在退出…' : '退出登录'}
          </Button>
        </FieldSet>
      </form>
      {save.isSuccess && (
        <p className="text-foreground mt-4 text-sm" role="status">
          资料已保存。
        </p>
      )}
      {(save.error || signOut.error) && (
        <FieldError className="mt-4 wrap-break-word">{(save.error || signOut.error)?.message}</FieldError>
      )}
    </>
  )
}
