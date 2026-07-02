'use client'

import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
    >
      {copied ? <Check size={12} className="text-primary" /> : <Copy size={12} />}
      {copied ? 'Copied!' : label}
    </button>
  )
}
