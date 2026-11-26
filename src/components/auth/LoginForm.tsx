"use client";

import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Icon } from "@/components/ui/Icon";
import { Input } from "@/components/ui/Input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { useLoginForm } from "@/hooks/useLoginForm";

export function LoginForm() {
  const { values, errors, isSubmitting, formError, rememberMe, setRememberMe, handleChange, handleBlur, handleSubmit } =
    useLoginForm();

  return (
    <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5" aria-describedby={formError ? "login-error" : undefined}>
      {formError ? (
        <div id="login-error">
          <Alert tone="error">{formError}</Alert>
        </div>
      ) : null}

      <Input
        label="Username"
        name="username"
        type="text"
        autoComplete="username"
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        placeholder="Enter your username"
        required
        inputSize="lg"
        value={values.username}
        error={errors.username}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={isSubmitting}
        leftIcon={<Icon name="user" size={19} />}
      />

      <PasswordInput
        label="Password"
        name="password"
        autoComplete="current-password"
        placeholder="Enter your password"
        required
        inputSize="lg"
        value={values.password}
        error={errors.password}
        onChange={handleChange}
        onBlur={handleBlur}
        disabled={isSubmitting}
        leftIcon={<Icon name="lock" size={19} />}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Checkbox
          label="Remember me"
          name="remember"
          checked={rememberMe}
          onChange={(event) => setRememberMe(event.target.checked)}
          disabled={isSubmitting}
        />
      </div>

      <Button
        type="submit"
        size="xl"
        fullWidth
        isLoading={isSubmitting}
        loadingText="Signing in…"
        rightIcon={<Icon name="arrowRight" size={20} />}
        className="mt-1"
      >
        Sign In
      </Button>
    </form>
  );
}
