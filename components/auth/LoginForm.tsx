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
import { signInWithEmailAndPassword } from "firebase/auth";
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
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Cancelar
          </Button>
          <Button disabled={loading} type="submit" form="login-form">
            Ingresar
          </Button>
        </Field>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
