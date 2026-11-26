"use client";

import { useState } from "react";
import { Icon } from "./Icon";
import { Input, type InputProps } from "./Input";

type PasswordInputProps = Omit<InputProps, "type" | "endAdornment">;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <Input
      {...props}
      type={visible ? "text" : "password"}
      endAdornment={
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={props.disabled}
          className="flex size-8 items-center justify-center rounded-md text-fg-subtle hover:bg-surface-muted hover:text-fg"
        >
          <Icon name={visible ? "eyeOff" : "eye"} size={18} />
        </button>
      }
    />
  );
}
