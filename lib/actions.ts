'use server'

import { supabase } from './supabase'
import { validateContact } from './validate'

export async function submitContact(formData: FormData): Promise<{ ok: boolean }> {
  const valid = validateContact({
    name: formData.get('name')?.toString(),
    contact: formData.get('contact')?.toString(),
    message: formData.get('message')?.toString(),
  })
  if (!valid) return { ok: false }
  const { error } = await supabase().from('contact_submissions').insert(valid)
  return { ok: !error }
}
