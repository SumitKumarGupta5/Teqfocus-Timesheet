'use server'

import { createClient } from '@/lib/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function signIn(formData: FormData) {
  const email = (formData.get('email') as string || '').trim().toLowerCase()
  const password = formData.get('password') as string
  const supabase = await createClient()

  const { data: signInData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  if (signInData?.user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_active, requires_password_change')
      .eq('id', signInData.user.id)
      .single()

    if (profile && !profile.is_active) {
      revalidatePath('/', 'layout')
      redirect('/inactive')
    }

    if (profile && profile.requires_password_change) {
      revalidatePath('/', 'layout')
      redirect('/auth/change-password')
    }
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
  const { data: userData, error } = await supabase.auth.updateUser({ password })

  if (error) {
    return redirect(`/auth/reset-password?error=${encodeURIComponent(error.message)}`)
  }

  // If user successfully updated password via reset token, clear first-time change flag
  if (userData?.user) {
    await supabase
      .from('profiles')
      .update({
        requires_password_change: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userData.user.id)
  }

  // Force sign out to clean up session and require logging in with the new password
  await supabase.auth.signOut()

  revalidatePath('/', 'layout')
  redirect('/auth/login?success=Password updated successfully. Please sign in.')
}

export async function updateFirstTimePassword(formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return redirect(`/auth/change-password?error=${encodeURIComponent('All fields are required.')}`)
  }

  if (password.length < 6) {
    return redirect(`/auth/change-password?error=${encodeURIComponent('Password must be at least 6 characters.')}`)
  }

  if (password !== confirmPassword) {
    return redirect(`/auth/change-password?error=${encodeURIComponent('Passwords do not match.')}`)
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/auth/login')
  }

  const { error: authError } = await supabase.auth.updateUser({ password })

  if (authError) {
    return redirect(`/auth/change-password?error=${encodeURIComponent(authError.message)}`)
  }

  // Update profile status in database
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      requires_password_change: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (profileError) {
    console.error('Error clearing requires_password_change flag:', profileError)
    return redirect(`/auth/change-password?error=${encodeURIComponent('Failed to update user profile.')}`)
  }

  revalidatePath('/', 'layout')
  redirect('/logs')
}

export async function verifyChangePasswordCredentials(email: string, currentPassword: string) {
  if (!email || !currentPassword) {
    return { error: 'Email and current password are required.' }
  }

  const normalizedEmail = email.trim().toLowerCase()
  
  // Create a stateless client to verify credentials without setting cookies
  const supabase = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email: normalizedEmail,
    password: currentPassword,
  })

  if (error) {
    return { error: error.message }
  }

  if (data?.user) {
    // Check if the user is active using the admin key to bypass RLS since we aren't using session cookies
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false
        }
      }
    )

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('is_active')
      .eq('id', data.user.id)
      .single()

    if (profile && !profile.is_active) {
      return { error: 'Account is inactive. Please contact administration.' }
    }
  }

  return { success: true }
}

export async function updateVerifiedPasswordAndLogin(
  email: string,
  currentPassword: string,
  password: string,
  confirmPassword: string
) {
  if (!email || !currentPassword || !password || !confirmPassword) {
    return { error: 'All fields are required.' }
  }

  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters.' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match.' }
  }

  const normalizedEmail = email.trim().toLowerCase()

  // 1. Stateless verification of old credentials
  const supabaseStateless = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )

  const { data: verifyData, error: verifyError } = await supabaseStateless.auth.signInWithPassword({
    email: normalizedEmail,
    password: currentPassword,
  })

  if (verifyError || !verifyData?.user) {
    return { error: 'Verification failed: Current credentials are invalid.' }
  }

  const userId = verifyData.user.id

  // 2. Admin client to update user password
  const supabaseAdmin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    }
  )

  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    password: password
  })

  if (authError) {
    return { error: authError.message }
  }

  // Update profile status in database to clear requirements if present
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      requires_password_change: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)

  if (profileError) {
    console.error('Error clearing requires_password_change flag on profile:', profileError)
  }

  // 3. Cookie-based login with the NEW password to establish session in browser
  const supabaseSSR = await createClient()
  const { error: loginError } = await supabaseSSR.auth.signInWithPassword({
    email: normalizedEmail,
    password: password,
  })

  if (loginError) {
    return { error: `Password updated, but failed to log in automatically: ${loginError.message}` }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

