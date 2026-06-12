"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock, LockOpen } from "lucide-react";

interface PasswordInputProps {
  value:       string;
  onChange:    (val: string) => void;
  label?:      string;
  placeholder?: string;
  hint?:       string;
}

export function PasswordInput({
  value,
  onChange,
  label      = "Password protection",
  placeholder = "Enter a password",
  hint,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor="link-password" className="flex items-center gap-2">
        {value
          ? <Lock     className="w-3.5 h-3.5 text-primary" />
          : <LockOpen className="w-3.5 h-3.5 text-muted-foreground" />
        }
        {label}{" "}
        <span className="text-muted-foreground font-normal">(optional)</span>
      </Label>

      <div className="relative">
        <Input
          id="link-password"
          type={show ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="pr-10"
          minLength={4}
          maxLength={72}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show
            ? <EyeOff className="w-4 h-4" />
            : <Eye    className="w-4 h-4" />
          }
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        {hint ?? "Visitors will be prompted for this password before being redirected."}
      </p>
    </div>
  );
}