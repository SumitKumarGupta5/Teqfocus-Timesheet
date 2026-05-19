'use server'

import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/logs')
}

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const fullName = formData.get('fullName') as string
  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    return redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`)
  }

  // If email confirmation is disabled, user is logged in automatically
  // If enabled, they need to check their email
  revalidatePath('/', 'layout')
  redirect('/auth/login?success=Account created! Please sign in.')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}
