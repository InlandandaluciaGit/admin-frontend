import type { FieldErrors, LoginCredentials, LoginField } from "@/types/auth";

export function validateLoginField(field: LoginField, value: string): string | undefined {
  switch (field) {
    case "username":
      if (!value.trim()) return "Username is required.";
      return undefined;
    case "password":
      if (!value) return "Password is required.";
      return undefined;
  }
}

export function validateLogin(values: LoginCredentials): FieldErrors<LoginField> {
  const errors: FieldErrors<LoginField> = {};
  (Object.keys(values) as LoginField[]).forEach((field) => {
    const message = validateLoginField(field, values[field]);
    if (message) errors[field] = message;
  });
  return errors;
}
