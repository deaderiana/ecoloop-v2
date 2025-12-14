import { prisma } from '../../db'
import { updateLimbah } from '../../actions'
import { cookies } from 'next/headers'    // Import Wajib untuk Cek Login
import { redirect } from 'next/navigation' // Import Wajib untuk Usir User

export default async function EditPage({ params }: { params: { id: string } }) {
  
  // === 1. CEK KEAMANAN (SATPAM) ===
  // Sebelum ambil data, cek dulu apakah user punya izin?
  const session = cookies().get('session_ecoloop')
  if (!session) {
    redirect('/login') // Kalau tidak ada izin, tendang ke Login
  }
  // ================================

  // 2. Ambil data barang lama berdasarkan ID di URL
  const item = await prisma.listing.findUnique({
    where: { id: params.id }
  })

  // Jika barang tidak ketemu (misal ID ngawur)
  if (!item) return <div className="p-8 text-center text-red-500 font-bold">Barang tidak ditemukan</div>

  // 3. Tampilkan Formulir
  return (
    <div className="min-h-screen bg-gray-50 p-8 flex justify-center items-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-green-700 mb-6">✏️ Edit Barang</h1>
        
        <form action={updateLimbah} className="space-y-4">
          {/* ID Tersembunyi (JANGAN DIHAPUS, INI KUNCI UPDATE) */}
          <input type="hidden" name="id" value={item.id} />

          <div>
            <label className="text-sm font-bold text-gray-700">Nama Barang</label>
            <input name="nama" type="text" defaultValue={item.title} required 
              className="w-full p-2 border rounded mt-1" />
          </div>

          <div className="flex gap-4">
            <div className="w-1/2">
              <label className="text-sm font-bold text-gray-700">Berat (Kg)</label>
              <input name="berat" type="number" defaultValue={item.quantity} required 
                className="w-full p-2 border rounded mt-1" />
            </div>
            <div className="w-1/2">
              <label className="text-sm font-bold text-gray-700">Harga (Rp)</label>
              <input name="harga" type="number" defaultValue={item.price} required 
                className="w-full p-2 border rounded mt-1" />
            </div>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Kategori</label>
            <select name="kategori" defaultValue={item.category} className="w-full p-2 border rounded mt-1">
              <option value="Kertas">Kertas</option>
              <option value="Plastik">Plastik</option>
              <option value="Logam">Logam</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-bold text-gray-700">Deskripsi</label>
            <textarea name="deskripsi" defaultValue={item.description} 
              className="w-full p-2 border rounded mt-1 h-24"></textarea>
          </div>

          <div className="flex gap-2 pt-4">
            <a href="/" className="w-1/2 bg-gray-200 text-center py-2 rounded font-bold text-gray-700 hover:bg-gray-300 transition">
              Batal
            </a>
            <button type="submit" className="w-1/2 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700 transition">
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}