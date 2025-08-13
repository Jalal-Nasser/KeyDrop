"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { updateSiteSettings } from "../../app/admin/settings/actions"
import { Loader2 } from "lucide-react"

const settingsSchema = z.object({
  google_analytics_id: z.string().optional(),
  gtm_id: z.string().optional(),
  custom_header_scripts: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

interface SiteSetting {
  key: string;
  value: string | null;
  description: string | null;
}

interface SiteSettingsFormProps {
  settings: SiteSetting[];
}

export function SiteSettingsForm({ settings }: SiteSettingsFormProps) {
  const defaultValues = settings.reduce((acc, setting) => {
    acc[setting.key as keyof SettingsFormValues] = setting.value || "";
    return acc;
  }, {} as SettingsFormValues);

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues,
  })

  const onSubmit = async (values: SettingsFormValues) => {
    const toastId = toast.loading("Saving settings...")
    const settingsToUpdate = Object.entries(values).map(([key, value]) => ({
      key,
      value: value || "",
    }));

    try {
      const result = await updateSiteSettings(settingsToUpdate)
      if (result.error) {
        throw new Error(result.error)
      }
      toast.success("Settings saved successfully!", { id: toastId })
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.", { id: toastId })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {settings.map((setting) => (
          <FormField
            key={setting.key}
            control={form.control}
            name={setting.key as keyof SettingsFormValues}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-lg">{setting.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</FormLabel>
                <FormControl>
                  {setting.key === 'custom_header_scripts' ? (
                    <Textarea {...field} className="font-mono" rows={8} placeholder={`<script>...</script>\n<meta ...>`} />
                  ) : (
                    <Input {...field} placeholder={setting.description || ''} />
                  )}
                </FormControl>
                <FormDescription>{setting.description}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}
        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Settings"
          )}
        </Button>
      </form>
    </Form>
  )
}