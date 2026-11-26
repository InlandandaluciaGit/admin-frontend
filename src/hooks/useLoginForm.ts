"use client";

import { useRouter } from "next/navigation";
import { useState, type ChangeEvent, type FocusEvent, type FormEvent } from "react";
import { ROUTES } from "@/constants/site";
import { login } from "@/services/auth.service";
import type { FieldErrors, LoginCredentials, LoginField } from "@/types/auth";
import { validateLogin, validateLoginField } from "@/utils/validation";

const INITIAL_VALUES: LoginCredentials = { username: "", password: "" };

export function useLoginForm() {
  const router = useRouter();
  const [values, setValues] = useState<LoginCredentials>(INITIAL_VALUES);
  const [errors, setErrors] = useState<FieldErrors<LoginField>>({});
  const [touched, setTouched] = useState<Partial<Record<LoginField, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const field = event.target.name as LoginField;
    const { value } = event.target;
    setValues((prev) => ({ ...prev, [field]: value }));
    setFormError(null);
    // Re-validate live only once the user has left the field.
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validateLoginField(field, value) }));
    }
  };

  const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
    const field = event.target.name as LoginField;
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validateLoginField(field, values[field]) }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const validationErrors = validateLogin(values);
    setErrors(validationErrors);
    setTouched({ username: true, password: true });
    if (Object.keys(validationErrors).length > 0) {
      const firstInvalid = Object.keys(validationErrors)[0];
      event.currentTarget.querySelector<HTMLInputElement>(`[name="${firstInvalid}"]`)?.focus();
      return;
    }

    setIsSubmitting(true);
    setFormError(null);
    try {
      await login({ username: values.username.trim(), password: values.password }, { remember: rememberMe });
      // Keep the loading state while the dashboard loads.
      router.replace(ROUTES.dashboard);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return { values, errors, isSubmitting, formError, rememberMe, setRememberMe, handleChange, handleBlur, handleSubmit };
}
