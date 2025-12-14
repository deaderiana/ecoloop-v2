'use server'

import { prisma } from './db'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

// === FITUR LOGIN ===
export async function login(formData: FormData) {
  const pin = formData.get('pin')
  if (pin === '123456') {
    cookies().set('session_ecoloop', 'true', { maxAge: 60 * 60 * 24 })
    redirect('/')
  }
}

export async function logout() {
  cookies().delete('session_ecoloop')
  redirect('/login')
}

// === FITUR CRUD ===

export async function simpanLimbah(formData: FormData) {
  await prisma.listing.create({
    data: {
      title: formData.get('nama') as string,
      description: formData.get('deskripsi') as string,
      price: Number(formData.get('harga')),
      quantity: Number(formData.get('berat')),
      category: formData.get('kategori') as string,
      status: 'Tersedia', // Default status
    },
  })
  revalidatePath('/')
}

export async function hapusLimbah(formData: FormData) {
  const id = formData.get('id') as string
  await prisma.listing.delete({ where: { id } })
  revalidatePath('/')
}

export async function updateLimbah(formData: FormData) {
  const id = formData.get('id') as string
  await prisma.listing.update({
    where: { id },
    data: {
      title: formData.get('nama') as string,
      description: formData.get('deskripsi') as string,
      price: Number(formData.get('harga')),
      quantity: Number(formData.get('berat')),
      category: formData.get('kategori') as string,
    },
  })
  revalidatePath('/')
  redirect('/')
}

// === FITUR BARU: TANDAI TERJUAL ===
export async function tandaiTerjual(formData: FormData) {
  const id = formData.get('id') as string
  
  await prisma.listing.update({
    where: { id },
    data: { status: 'Terjual' } // Ubah status jadi Terjual
  })
  
  revalidatePath('/')
}

// === FITUR BARU: BATALKAN TERJUAL (Jika salah pencet) ===
export async function batalkanTerjual(formData: FormData) {
  const id = formData.get('id') as string
  
  await prisma.listing.update({
    where: { id },
    data: { status: 'Tersedia' } // Kembalikan jadi Tersedia
  })
  
  revalidatePath('/')
}