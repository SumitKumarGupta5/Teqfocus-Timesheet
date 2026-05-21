'use server'

import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signIn(formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase()
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
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string
  const fullName = formData.get('fullName') as string

  if (password !== confirmPassword) {
    return redirect(`/auth/signup?error=${encodeURIComponent('Passwords do not match.')}`)
  }

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

  revalidatePath('/', 'layout')
  redirect('/auth/login?success=Account created! Please sign in.')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/auth/login')
}

export async function checkEmailAndSendResetLink(email: string, origin: string) {
  if (!email) {
    return { error: 'Email address is required.' }
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    const supabase = await createClient()

    // Check if the user exists in Supabase Auth via our security definer RPC function
    const { data: exists, error: existsError } = await supabase.rpc('check_user_exists_by_email', {
      email_to_check: normalizedEmail
    })

    if (existsError) {
      console.error('check_user_exists_by_email RPC Error:', existsError)
      return { error: `Database error checking email: ${existsError.message}` }
    }

    if (!exists) {
      return { error: 'No user registered with this email address.' }
    }

    const { error } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
      redirectTo: `${origin}/auth/callback?next=/auth/reset-password`,
    })

    if (error) {
      console.error('resetPasswordForEmail Error:', error)
      return { error: error.message }
    }

    return { success: true }
  } catch (err: unknown) {
    console.error('Unexpected error in checkEmailAndSendResetLink:', err)
    return { error: err instanceof Error ? err.message : 'An unexpected error occurred.' }
  }
}

export async function updateUserPassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return redirect(`/auth/reset-password?error=${encodeURIComponent('All fields are required.')}`)
  }

  if (password !== confirmPassword) {
    return redirect(`/auth/reset-password?error=${encodeURIComponent('Passwords do not match.')}`)
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password })

  if (error) {
    return redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  // Force sign out to clean up session and require logging in with the new password
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/auth/login?success=Password updated successfully. Please sign in.')
}

