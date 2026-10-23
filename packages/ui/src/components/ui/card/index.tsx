import { cn } from 'cn'

import type { ComponentProps } from 'react'

type CardProps = ComponentProps<'div'> & {
  size?: 'md' | 'sm'
}

const Card = ({ className, size = 'md', ...props }: CardProps) => (
  <div
    className={cn(
      'group/card bg-card text-card-foreground flex flex-col gap-6 rounded-lg border py-6 shadow-sm data-[size=sm]:gap-4 data-[size=sm]:py-4',
      className
    )}
    data-scope="card"
    data-size={size}
    data-slot="root"
    {...props}
  />
)

const CardHeader = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn(
      'group/card-header @container/card-header grid auto-rows-min items-start gap-1.5 px-6 group-data-[size=sm]/card:px-4 has-[[data-scope=card][data-slot=action]]:grid-cols-[1fr_auto] has-[[data-scope=card][data-slot=description]]:grid-rows-[auto_auto]',
      className
    )}
    data-scope="card"
    data-slot="header"
    {...props}
  />
)

const CardTitle = ({ className, ...props }: ComponentProps<'div'>) => (
  <div className={cn('leading-none font-semibold', className)} data-scope="card" data-slot="title" {...props} />
)

const CardDescription = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn('text-muted-foreground text-sm', className)}
    data-scope="card"
    data-slot="description"
    {...props}
  />
)

const CardAction = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn('col-start-2 row-span-2 row-start-1 self-start justify-self-end', className)}
    data-scope="card"
    data-slot="action"
    {...props}
  />
)

const CardContent = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn('px-6 group-data-[size=sm]/card:px-4', className)}
    data-scope="card"
    data-slot="content"
    {...props}
  />
)

const CardFooter = ({ className, ...props }: ComponentProps<'div'>) => (
  <div
    className={cn('flex items-center px-6 group-data-[size=sm]/card:px-4', className)}
    data-scope="card"
    data-slot="footer"
    {...props}
  />
)

export type { CardProps }
export { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
