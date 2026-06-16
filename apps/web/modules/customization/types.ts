import { z } from "zod";
import { widgetSettingSchema } from "./schemas";

export type FormSchema = z.infer<typeof widgetSettingSchema>;