import Ajv, { type ErrorObject, type ValidateFunction } from "ajv";
import addFormats from "ajv-formats";

const ajv = new Ajv({
  allErrors: true,
  strict: false,
  allowUnionTypes: true,
});
addFormats(ajv);

const compileCache = new Map<string, ValidateFunction<unknown>>();

function schemaKey(schema: object): string {
  try {
    return JSON.stringify(schema);
  } catch {
    return String(Math.random());
  }
}

export function getValidator(
  schema: object
): { validate: ValidateFunction<unknown> } {
  const key = schemaKey(schema);
  let fn = compileCache.get(key);
  if (!fn) {
    fn = ajv.compile(schema) as ValidateFunction<unknown>;
    compileCache.set(key, fn);
  }
  return { validate: fn };
}

export function validateData(
  schema: object,
  data: unknown
): { ok: true } | { ok: false; errors: ErrorObject[] } {
  const { validate } = getValidator(schema);
  const ok = validate(data) as boolean;
  if (ok) return { ok: true };
  return { ok: false, errors: validate.errors ?? [] };
}
