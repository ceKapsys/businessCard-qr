import type { FieldErrors, Resolver } from "react-hook-form";
import { z, type ZodType } from "zod";

import type { FieldDef, FormValues } from "./types";
import { isVisible } from "./values";

function schemaFor(field: FieldDef): ZodType {
  if (field.repeatable) return z.array(z.object({ type: z.string(), value: field.zod }));
  return field.zod;
}

/** Zod schema for the fields currently visible given `values`. */
export function buildSchema(fields: FieldDef[], values: FormValues) {
  const shape = Object.fromEntries(
    fields.filter((f) => isVisible(f, values)).map((f) => [f.id, schemaFor(f)]),
  );
  return z.object(shape);
}

type ErrorTree = { [key: string]: ErrorTree | { type: string; message: string } };

function setError(tree: ErrorTree, path: PropertyKey[], message: string) {
  let node = tree;
  path.forEach((segment, i) => {
    const key = String(segment);
    if (i === path.length - 1) {
      node[key] ??= { type: "validation", message };
      return;
    }
    node[key] ??= {};
    node = node[key] as ErrorTree;
  });
}

export function validateValues(fields: FieldDef[], values: FormValues): ErrorTree {
  const result = buildSchema(fields, values).safeParse(values);
  const errors: ErrorTree = {};
  if (!result.success) {
    for (const issue of result.error.issues) setError(errors, issue.path, issue.message);
  }
  return errors;
}

/** react-hook-form resolver that validates only visible fields. */
export function createResolver(fields: FieldDef[]): Resolver<FormValues> {
  return async (values) => {
    const errors = validateValues(fields, values);
    return Object.keys(errors).length === 0
      ? { values, errors: {} }
      : { values: {}, errors: errors as FieldErrors<FormValues> };
  };
}
