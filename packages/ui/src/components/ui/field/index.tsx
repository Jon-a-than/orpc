import { cva, type VariantProps } from '@qingshaner/ui/lib/cva'
import { cn } from 'cn'
import { type ComponentProps, type ReactNode, useMemo } from 'react'

import { Label, type LabelProps } from '../label'
import { Separator } from '../separator'

const fieldLegendVariants = cva({
  base: 'text-foreground font-medium',
  variants: {
    variant: {
      label: 'text-sm leading-none',
      legend: 'mb-2 text-base'
    }
  }
})

type FieldVariantsProps = VariantProps<typeof fieldVariants>

const fieldVariants = cva({
  base: 'group/field flex w-full',
  defaultVariants: {
    orientation: 'vertical'
  },
  variants: {
    orientation: {
      horizontal:
        'flex-row items-center has-[>[data-scope=field][data-slot=content]]:items-start *:data-[scope=field]:data-[slot=label]:flex-auto has-[>[data-scope=field][data-slot=content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      responsive:
        'flex-col *:w-full @md/field-group:flex-row @md/field-group:items-center @md/field-group:*:w-auto @md/field-group:has-[>[data-scope=field][data-slot=content]]:items-start @md/field-group:*:data-[scope=field]:data-[slot=label]:flex-auto [&>.sr-only]:w-auto @md/field-group:has-[>[data-scope=field][data-slot=content]]:[&>[role=checkbox],[role=radio]]:mt-px',
      vertical: 'flex-col *:w-full [&>.sr-only]:w-auto'
    }
  }
})

type FieldProps = ComponentProps<'div'> & FieldVariantsProps
type FieldLabelProps = LabelProps
type FieldDescriptionProps = ComponentProps<'p'>
type FieldErrorProps = ComponentProps<'div'> & {
  errors?: Array<{ message?: string } | undefined>
}
type FieldGroupProps = ComponentProps<'div'>
type FieldContentProps = ComponentProps<'div'>
type FieldSetProps = ComponentProps<'fieldset'>
type FieldLegendProps = ComponentProps<'legend'> & VariantProps<typeof fieldLegendVariants>
type FieldTitleProps = ComponentProps<'div'>
type FieldSeparatorProps = ComponentProps<'div'> & {
  children?: ReactNode
}

const Field = ({ className, orientation = 'vertical', ...props }: FieldProps) => (
  // biome-ignore lint/a11y/useSemanticElements: shadcn v4 uses role="group" for field layout without fieldset semantics.
  <div
    className={fieldVariants({ className, orientation })}
    data-orientation={orientation}
    data-scope="field"
    data-slot="root"
    role="group"
    {...props}
  />
)

const FieldGroup = ({ className, ...props }: FieldGroupProps) => (
  <div
    className={cn('group/field-group @container/field-group flex w-full flex-col gap-4', className)}
    data-scope="field"
    data-slot="group"
    {...props}
  />
)

const FieldSet = ({ className, ...props }: FieldSetProps) => (
  <fieldset className={cn('flex flex-col gap-4', className)} data-scope="field" data-slot="set" {...props} />
)

const FieldLegend = ({ className, variant = 'legend', ...props }: FieldLegendProps) => (
  <legend
    className={fieldLegendVariants({ className, variant })}
    data-scope="field"
    data-slot="legend"
    data-variant={variant}
    {...props}
  />
)

const FieldContent = ({ className, ...props }: FieldContentProps) => (
  <div
    className={cn('group/field-content flex flex-1 flex-col gap-1.5 leading-snug', className)}
    data-scope="field"
    data-slot="content"
    {...props}
  />
)

const FieldLabel = ({ className, ...props }: FieldLabelProps) => (
  <Label
    className={cn(
      'group/field-label peer/field-label flex w-fit has-[>[data-scope=field][data-slot=root]]:w-full has-[>[data-scope=field][data-slot=root]]:flex-col',

      className
    )}
    data-scope="field"
    data-slot="label"
    {...props}
  />
)

const FieldDescription = ({ className, ...props }: FieldDescriptionProps) => (
  <p
    className={cn(
      'text-muted-foreground [&>a:hover]:text-primary text-sm leading-normal font-normal group-has-data-[orientation=horizontal]/field:text-balance last:mt-0 nth-last-2:-mt-1 [&>a]:underline [&>a]:underline-offset-4',

      className
    )}
    data-scope="field"
    data-slot="description"
    {...props}
  />
)

const FieldTitle = ({ className, ...props }: FieldTitleProps) => (
  <div
    className={cn('flex w-fit items-center text-sm leading-none font-medium', className)}
    data-scope="field"
    data-slot="title"
    {...props}
  />
)

const FieldSeparator = ({ children, className, ...props }: FieldSeparatorProps) => (
  <div
    className={cn('relative flex h-5 items-center', className)}
    data-content={!!children}
    data-scope="field"
    data-slot="separator"
    {...props}
  >
    <Separator className="absolute inset-x-0 top-1/2" />
    {children && (
      <span
        className="bg-background text-muted-foreground relative mx-auto block w-fit px-2 text-sm"
        data-scope="field"
        data-slot="separator-content"
      >
        {children}
      </span>
    )}
  </div>
)

const FieldError = ({ children, className, errors, ...props }: FieldErrorProps) => {
  const content = useMemo(() => {
    if (children) {
      return children
    }

    if (!errors || errors.length === 0) {
      return null
    }

    const uniqueErrorMessages = [...new Set(errors.map((error) => error?.message).filter((message) => message))]

    if (uniqueErrorMessages.length === 1) {
      return uniqueErrorMessages[0]
    }

    return (
      <ul className="ml-4 flex list-disc flex-col gap-1">
        {uniqueErrorMessages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
    )
  }, [children, errors])

  if (!content) {
    return null
  }

  return (
    <div
      className={cn('text-destructive text-sm font-normal', className)}
      data-scope="field"
      data-slot="error"
      role="alert"
      {...props}
    >
      {content}
    </div>
  )
}

export type {
  FieldContentProps,
  FieldDescriptionProps,
  FieldErrorProps,
  FieldGroupProps,
  FieldLabelProps,
  FieldLegendProps,
  FieldProps,
  FieldSeparatorProps,
  FieldSetProps,
  FieldTitleProps
}
export {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle
}
