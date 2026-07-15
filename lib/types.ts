export type Service = {
  id: number
  sort_order: number
  name: string
  description: string
}

export type Therapist = {
  id: number
  sort_order: number
  name: string
  title: string
  specialties: string
  therapies: string
  price: string
  location: string
  photo_url: string | null
}
