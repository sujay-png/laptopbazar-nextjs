"use server"

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
export async function getlogindetails() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()
  const email = data.user?.email
  const name = data.user?.user_metadata.full_name
  return { email, name }
}

export async function getUserAndBusinessDetails() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('Users')
    .select(`
      user_name,
      user_email,
      business:business_ref (
        business_name
      )
    `)
    .eq('id', user.id)
    .single()

  if (error) {
    console.error('Error fetching user and business:', error.message)
    return null
  }

  return {
    user_name: data?.user_name,
    user_email: data?.user_email,
    business_name: (data?.business as any)?.business_name,
  }
}
