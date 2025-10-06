import { ZodError } from "zod";

export function formatZodErrors(error: ZodError): Record<string, string> {
  const fieldToMessage: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path?.[0]?.toString() || "_error";
    if (!(field in fieldToMessage)) fieldToMessage[field] = issue.message;
  }

  return fieldToMessage;
}
