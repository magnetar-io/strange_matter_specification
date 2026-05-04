import { faker } from "@faker-js/faker";
import {
  PLACEHOLDER_COMPONENT_CLASSIFICATION,
  PLACEHOLDER_COMPONENT_TYPE,
} from "@/lib/instance-identity";

type JsonSchema = {
  type?: string | string[];
  const?: unknown;
  enum?: unknown[];
  $ref?: string;
  $defs?: Record<string, unknown>;
  properties?: Record<string, unknown>;
  required?: string[];
  items?: unknown;
  minItems?: number;
  format?: string;
  title?: string;
  additionalProperties?: unknown;
  oneOf?: unknown[];
  anyOf?: unknown[];
  allOf?: unknown[];
};

function typesOf(s: JsonSchema | undefined): string[] {
  if (!s || typeof s !== "object") return ["object"];
  const t = s.type;
  if (!t) {
    if (s.properties) return ["object"];
    return ["object"];
  }
  return Array.isArray(t) ? t : [t];
}

function hasType(s: JsonSchema | undefined, t: string): boolean {
  if (t === "object" && s && !s.type && s.properties) return true;
  return typesOf(s).includes(t);
}

function pickFakerString(format?: string, keyHint = ""): string {
  if (format === "email" || /email|author|user/i.test(keyHint)) {
    return faker.internet.email();
  }
  if (format === "date-time" || /date|time|modified|created/i.test(keyHint)) {
    return new Date().toISOString();
  }
  if (format === "uri" || /url|context/i.test(keyHint)) {
    return "https://example.com/resource?" + faker.string.alphanumeric(8);
  }
  if (/guid|uuid|EntityGUID|ComponentGUID|Version/i.test(keyHint)) {
    return faker.string.uuid();
  }
  return faker.lorem.words(2);
}

function buildFromSubSchema(
  s: unknown,
  useFaker: boolean,
  root: JsonSchema,
  depth: number
): unknown {
  if (depth > 32) return null;
  if (s === null || s === undefined) return null;
  if (typeof s !== "object" || Array.isArray(s)) {
    return s;
  }
  const sch = s as JsonSchema;
  if (typeof sch.const !== "undefined") return sch.const;
  if (Array.isArray(sch.enum) && sch.enum.length > 0) {
    return sch.enum[0];
  }
  if (sch.$ref) {
    const defName = sch.$ref.replace("#/$defs/", "");
    if (root.$defs && root.$defs[defName]) {
      return buildFromSubSchema(
        root.$defs[defName] as unknown,
        useFaker,
        root,
        depth + 1
      );
    }
    return {};
  }
  for (const comb of [sch.allOf, sch.oneOf, sch.anyOf] as const) {
    if (Array.isArray(comb) && comb.length > 0) {
      return buildFromSubSchema(
        comb[0] as unknown,
        useFaker,
        root,
        depth + 1
      );
    }
  }
  if (hasType(sch, "object")) {
    if (sch.properties) {
      const out: Record<string, unknown> = {};
      for (const k of Object.keys(sch.properties)) {
        out[k] = buildFromSubSchema(
          sch.properties[k] as unknown,
          useFaker,
          root,
          depth + 1
        );
      }
      /** New instances must get explicit identity; do not keep generated stubs. */
      for (const key of [
        "ComponentType",
        "ComponentClassification",
      ] as const) {
        if (key in out) {
          out[key] =
            key === "ComponentType"
              ? PLACEHOLDER_COMPONENT_TYPE
              : PLACEHOLDER_COMPONENT_CLASSIFICATION;
        }
      }
      return out;
    }
    if (sch.additionalProperties) {
      if (useFaker) {
        return { rel: faker.string.uuid() };
      }
      return {};
    }
    return {};
  }
  if (hasType(sch, "array")) {
    const min = typeof sch.minItems === "number" ? sch.minItems : 0;
    const n = Math.max(min, 1);
    const items = sch.items as unknown;
    const acc: unknown[] = [];
    for (let i = 0; i < n; i += 1) {
      acc.push(
        buildFromSubSchema(
          items ?? { type: "string" },
          useFaker,
          root,
          depth + 1
        )
      );
    }
    return acc;
  }
  if (hasType(sch, "string")) {
    if (useFaker) {
      return pickFakerString(
        (sch as { format?: string }).format,
        (sch as { title?: string }).title ?? ""
      );
    }
    return "";
  }
  if (hasType(sch, "number") || hasType(sch, "integer")) {
    if (useFaker) {
      return hasType(sch, "integer")
        ? faker.number.int({ min: 0, max: 1000 })
        : faker.number.float({ min: 0, max: 100, fractionDigits: 2 });
    }
    return 0;
  }
  if (hasType(sch, "boolean")) {
    return useFaker ? faker.datatype.boolean() : false;
  }
  if (hasType(sch, "null")) {
    return null;
  }
  return {};
}

export function buildInstanceFromSchema(
  schema: object,
  options: { useFaker: boolean }
): unknown {
  return buildFromSubSchema(
    schema as unknown,
    options.useFaker,
    schema as JsonSchema,
    0
  );
}
