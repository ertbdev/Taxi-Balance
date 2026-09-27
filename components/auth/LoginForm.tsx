"use client";

import { Controller, useForm } from "react-hook-form";

import { Input } from "../ui/input";
import { Button } from "../ui/button";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import loginSchema from "@/schemas/loginSchema";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { cAuth } from "@/firebase/config/client";

const LoginForm = () => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onLogin = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    try {
      await signInWithEmailAndPassword(cAuth, data.email, data.password);
      router.push("/");
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const onGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      // Must be called immediately without any state updates (like setLoading) before it,
      // otherwise mobile browsers and strict mode treat it as an async popup and block it.
      await signInWithPopup(cAuth, provider);
      setLoading(true);
      router.push("/");
    } catch (e: any) {
      console.error(e);
      if (e.code === 'auth/popup-blocked') {
        alert("El navegador bloqueó la ventana emergente. Por favor, permite las ventanas emergentes para iniciar sesión.");
      } else {
        alert("Error Google Login: " + e.message);
      }
      setLoading(false);
    }
  };

  return (
    <Card className="w-87.5">
      <CardHeader>
        <CardTitle className="text-center">Ingresar</CardTitle>
        <CardDescription>Ingresar las credenciales</CardDescription>
      </CardHeader>
      <CardContent>
        <form
          id="login-form"
          className="space-y-8"
          onSubmit={form.handleSubmit(onLogin)}
        >
          <FieldGroup>
            <Controller
              name="email"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-email">
                    Correo Electrónico
                  </FieldLabel>
                  <Input
                    {...field}
                    id="form-email"
                    aria-invalid={fieldState.invalid}
                    // placeholder="user@mail.com"
                    autoComplete="off"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="password"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="form-password">Contraseña</FieldLabel>
                  <Input
                    {...field}
                    id="form-password"
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    type="password"
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter className="flex-col gap-4">
        <Field orientation="horizontal" className="w-full flex justify-between">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button disabled={loading} type="submit" form="login-form">
            Ingresar
          </Button>
        </Field>
        
        <div className="relative w-full">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white dark:bg-zinc-950 px-2 text-muted-foreground">O continuar con</span>
          </div>
        </div>

        <Button 
          type="button" 
          variant="outline" 
          className="w-full" 
          disabled={loading} 
          onClick={onGoogleLogin}
        >
          <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
