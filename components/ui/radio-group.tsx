import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const radioGroupVariants = cva(
  "flex flex-col gap-2"
)

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof radioGroupVariants> {
  value?: string;
  onValueChange?: (value: string) => void;
  name?: string;
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
            const element = child as React.ReactElement<any, any>;
            if (typeof element.props.value === "string") {
              return React.cloneElement(element, {
                checked: value === element.props.value,
                onChange: () => onValueChange && onValueChange(element.props.value),
                name: props.name,
              });
            }
          }
          return child;
        })}
      </div>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

export interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string;
  name?: string;
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
