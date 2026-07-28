import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

interface FormFieldProps {
  id: string;
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
}

function FormField({
  id,
  label,
  children,
  error,
  hint,
  required = false,
  className,
}: FormFieldProps) {
  const descriptionId = error
    ? `${id}-error`
    : hint
      ? `${id}-hint`
      : undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}

        {required && (
          <span className="ml-1 text-destructive" aria-hidden="true">
            *
          </span>
        )}
      </label>

      {children}

      {error ? (
        <p
          id={descriptionId}
          role="alert"
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : hint ? (
        <p id={descriptionId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export { FormField };