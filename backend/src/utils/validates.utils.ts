import { z } from "zod";

type ZodIssues = z.ZodError["issues"];

export function formatZodErrors(issues: ZodIssues) {
  return issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
}
