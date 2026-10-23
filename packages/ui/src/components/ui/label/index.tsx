import { cn } from 'cn'

import type { ComponentProps } from 'react'

type LabelProps = ComponentProps<'label'>

const Label = ({ className, ...props }: LabelProps) => (
  // biome-ignore lint/a11y/noLabelWithoutControl: consumers pass htmlFor or wrap the associated control.
  <label
    className={cn(
      'flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none peer-disabled:cursor-not-allowed peer-disabled:opacity-50',
      className
    )}
    data-scope="label"
    data-slot="root"
    {...props}
  />
)

export type { LabelProps }
export { Label }
