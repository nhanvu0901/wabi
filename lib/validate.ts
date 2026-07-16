export function validateContact(input: {
  name?: string
  contact?: string
  message?: string
}): { name: string; contact: string; message: string | null } | null {
  const name = input.name?.trim()
  const contact = input.contact?.trim()
  if (!name || !contact) return null
  const message = input.message?.trim()
  return { name, contact, message: message || null }
}
