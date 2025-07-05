"use client"
import { useState } from "react"
import type { FormEvent, ChangeEvent } from "react"

export default function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [status, setStatus] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setStatus(null)
    const res = await fetch("/contact/api", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, message })
    })
    if (res.ok) {
      setStatus("Message sent!")
      setName("")
      setEmail("")
      setMessage("")
    } else {
      setStatus("Failed to send. Please try again.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto">
      <input required value={name} onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)} placeholder="Your Name" className="w-full border px-3 py-2 rounded" />
      <input required type="email" value={email} onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)} placeholder="Your Email" className="w-full border px-3 py-2 rounded" />
      <textarea required value={message} onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setMessage(e.target.value)} placeholder="Your Message" className="w-full border px-3 py-2 rounded" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Send</button>
      {status && <div className="text-sm text-center mt-2">{status}</div>}
    </form>
  )
}