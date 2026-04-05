'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'
import { clearRttClientState } from '@/lib/progressStore'

type AccessRow = {
  is_pro: boolean
}

export default function AuthStatusNav() {
  const router = useRouter()
  const [email, setEmail] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)
  const [loading, setLoading] = useState(true)

  async function loadState() {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setEmail(null)
      setIsPro(false)
      setLoading(false)
      return
    }

    setEmail(user.email ?? null)

    const { data } = await supabase
      .from('user_access')
      .select('is_pro')
      .eq('user_id', user.id)
      .maybeSingle<AccessRow>()

    setIsPro(Boolean(data?.is_pro))
    setLoading(false)
  }

  useEffect(() => {
    loadState()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      loadState()
      router.refresh()
    })

    return () => subscription.unsubscribe()
  }, [router])

  async function onSignOut() {
    await supabase.auth.signOut()
    clearRttClientState()
    setEmail(null)
    setIsPro(false)
    window.location.assign('/app/login')
  }

  if (loading) {
    return (
      <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
        ...
      </div>
    )
  }

  if (!email) {
    return (
      <div className="flex items-center gap-2">
        <Link
          href="/app/upgrade"
          className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
        >
          Get Pro
        </Link>
        <Link
          href="/app/login"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
        >
          Sign In
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {isPro ? (
        <Link
          href="/app/dashboard"
          className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
        >
          RTT Mastery Method
        </Link>
      ) : (
        <Link
          href="/app/upgrade"
          className="rounded-full bg-yellow-400 px-4 py-2 text-sm font-semibold text-black hover:bg-yellow-300"
        >
          Get Pro
        </Link>
      )}

      <span className="hidden rounded-full bg-white/10 px-3 py-2 text-sm text-white/90 md:inline-flex">
        {email}
      </span>

      <button
        onClick={onSignOut}
        className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80 hover:bg-white/10"
      >
        Sign Out
      </button>
    </div>
  )
}
