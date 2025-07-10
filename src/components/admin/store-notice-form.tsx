"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { RichTextEditor } from "@/components/admin/rich-text-editor"
import { getStoreNotice, updateOrCreateStoreNotice } from "@/app/admin/store-notice/actions.ts" // Re-confirming this import
import { Loader2 } from "lucide-react"

const storeNoticeSchema = z.object({
  id: z.string().optional(), // ID is optional for new notices
  content: z.string().min(1, "Notice content cannot be empty."),
  is_active: z.boolean().default(true),
})

type StoreNoticeFormValues = z.infer<typeof storeNoticeSchema>

export function StoreNoticeForm() {
  const [loading, setLoading] = useState(true)
  const [initialNotice, setInitialNotice] = useState<StoreNoticeFormValues | null>(null)

  const form = useForm<StoreNoticeFormValues>({
    resolver: zodResolver(storeNoticeSchema),
    defaultValues: {
      content: "",
      is_active: true,
    },
  })

  useEffect(() => {
    const fetchNotice = async () => {
      setLoading(true)
      const { data, error } = await getStoreNotice()
      if (data) {
        setInitialNotice(data)
        form.reset(data)
      } else if (error) {
        toast.error(`Failed to load store notice: ${error}`)
      }
      setLoading(false)
    }
    fetchNotice()
  }, [form])

  const onSubmit = async (values: StoreNoticeFormValues) => {
    const toastId = toast.loading("Saving store notice...")
    try {
      const result = await updateOrCreateStoreNotice(values)
      if (result.error) {
        throw new Error(result.error)
      }
      toast.success("Store notice saved successfully!", { id: toastId })
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.", { id: toastId })
    }
  }

  if (loading) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader><CardTitle>Edit Store Notice</CardTitle></CardHeader>
        <CardContent className="flex justify-center items-center h-40">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="ml-4">Loading notice...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Edit Store Notice</CardTitle>
        <CardDescription>
          Configure the message displayed at the top of your store.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notice Content</FormLabel>
                  <FormControl>
                    <RichTextEditor value={field.value} onChange={field.onChange} />
                  </FormControl>
                  <FormDescription>
                    This message will appear at the top of your website.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Display Notice
                    </FormLabel>
                    <FormDescription>
                      Check this box to make the store notice visible on your website.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Notice"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}