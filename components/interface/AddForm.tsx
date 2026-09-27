"use client";

import { Controller, useForm } from "react-hook-form";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { DatePickerInput } from "@/components/interface/DatePicker";
import { addRecord, RecordData } from "@/firebase/addRecord";

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
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Field, FieldError, FieldGroup, FieldLabel } from "../ui/field";

const AddForm = () => {
  const [loading, setLoading] = useState(false);

  const router = useRouter();

  type fromField = {
    id: string;
    label: string;
    name: string;
    type: "text" | "number" | "date";
    errorMessage: string;
    required: boolean;
    initialValue: string | number;
  };

  const loginFormData: fromField[] = [
    {
      id: "date-form",
      label: "Fecha",
      name: "fecha",
      type: "date",
      errorMessage: "La fecha es requerida",
      required: true,
      initialValue: Date.now(),
    },
    {
      id: "servicios-form",
      label: "Servicios totales",
      name: "services",
      type: "number",
      errorMessage: "Servicios totales es requerido",
      required: true,
      initialValue: "",
    },
    {
      id: "cash-form",
      label: "Efectivo",
      name: "efectivo",
      type: "number",
      errorMessage: "El valor es requerido",
      required: true,
      initialValue: "",
    },
    {
      id: "card-form",
      label: "Tarjeta",
      name: "tarjeta",
      type: "number",
      errorMessage: "El valor es requerido",
      required: true,
      initialValue: "",
    },
    {
      id: "notes-form",
      label: "Notas",
      name: "notas",
      type: "text",
      errorMessage: "NA",
      required: false,
      initialValue: "",
    },
  ];

  const dinamicSchema = z.object(
    loginFormData.reduce(
      (acc, field) => {
        if (field.required) {
          if (field.type === "text") {
            acc[field.name] = z
              .string()
              .min(1, { message: field.errorMessage });
          } else if (field.type === "date") {
            acc[field.name] = z
              .number({ message: field.errorMessage })
              .min(1, { message: field.errorMessage });
          } else {
            acc[field.name] = z
              .union([z.string(), z.number()])
              .refine((val) => val !== "", { message: field.errorMessage })
              .transform((val) => Number(val))
              .pipe(z.number({ message: "El valor debe ser un número" }));
          }
        } else {
          if (field.type === "text") {
            acc[field.name] = z.string().optional();
          } else if (field.type === "date") {
            acc[field.name] = z.number().optional();
          } else {
            acc[field.name] = z
              .union([z.string(), z.number()])
              .transform((val) => (val === "" ? undefined : Number(val)))
              .pipe(
                z.number({ message: "El valor debe ser un número" }).optional(),
              );
          }
        }
        return acc;
      },
      {} as Record<string, z.ZodType>,
    ),
  );

  const form = useForm<z.infer<typeof dinamicSchema>>({
    resolver: zodResolver(dinamicSchema),
    defaultValues: loginFormData.reduce(
      (acc, field) => {
        acc[field.name] = field.initialValue;
        return acc;
      },
      {} as Record<string, any>,
    ),
  });

  const onSubmit = async (data: z.infer<typeof dinamicSchema>) => {
    setLoading(true);
    try {
      await addRecord(data as unknown as RecordData);
      form.reset();
      router.push("/");
    } catch (e) {
      console.error("Error adding record:", e);
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
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            {loginFormData.map((field) => (
              <Controller
                key={field.id}
                name={field.name as keyof z.infer<typeof dinamicSchema>}
                control={form.control}
                render={({ field: controllerField, fieldState }) =>
                  field.type === "date" ? (
                    <DatePickerInput
                      label={field.label}
                      value={controllerField.value as number | undefined}
                      onChange={(timestamp) => controllerField.onChange(timestamp)}
                    />
                  ) : (
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel htmlFor={field.id}>{field.label}</FieldLabel>
                      <Input
                        {...controllerField}
                        id={field.id}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        type={field.type === "text" ? "text" : "number"}
                        value={controllerField.value as string | number}
                      />
                      {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                      )}
                    </Field>
                  )
                }
              />
            ))}
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

export default AddForm;
