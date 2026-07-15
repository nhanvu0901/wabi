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
  description: string
  specialties: string
  price: string
  photo_url: string | null
}
