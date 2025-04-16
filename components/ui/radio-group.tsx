import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const radioGroupVariants = cva(
  "flex flex-col gap-2"
)

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof radioGroupVariants> {
  value?: string
  onValueChange?: (value: string) => void
}

export const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <div
        role="radiogroup"
        className={cn(radioGroupVariants(), className)}
        ref={ref}
        {...props}
      >
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              checked: value === child.props.value,
              onChange: () => onValueChange && onValueChange(child.props.value),
              name: props.name,
            })
          }
          return child
        })}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, ...props }, ref) => {
    return (
      <input
        type="radio"
        className={cn("sr-only peer", className)}
        ref={ref}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"
