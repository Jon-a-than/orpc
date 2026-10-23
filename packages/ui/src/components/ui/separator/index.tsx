import { Separator as SeparatorPrimitive } from '@base-ui/react/separator'
import { cn } from 'cn'

type SeparatorProps = SeparatorPrimitive.Props & {
  decorative?: boolean
}

const Separator = ({ className, decorative = true, orientation = 'horizontal', ...props }: SeparatorProps) => (
  <SeparatorPrimitive
    className={cn(
      'bg-border shrink-0 data-horizontal:h-px data-horizontal:w-full data-vertical:w-px data-vertical:self-stretch',
      className
    )}
    data-scope="separator"
    data-slot="root"
    orientation={orientation}
    {...(decorative ? { role: 'none' as const } : { 'aria-orientation': orientation, role: 'separator' as const })}
    {...props}
  />
)

export type { SeparatorProps }
export { Separator }
