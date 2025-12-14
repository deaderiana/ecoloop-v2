import { prisma } from './db'
import { simpanLimbah, hapusLimbah, logout, tandaiTerjual, batalkanTerjual } from './actions'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'

export default async function Home({ searchParams }: { searchParams: { search?: string } }) {
  // 1. Cek Login
  const session = cookies().get('session_ecoloop')
  if (!session) redirect('/login')

  // 2. Ambil Data
  const query = searchParams?.search || ""
  const listings = await prisma.listing.findMany({
    where: {
      OR: [
        { title: { contains: query } },
        { category: { contains: query } },
      ]
    },
    orderBy: { createdAt: 'desc' }
  })

  // 3. Pisahkan Data (Stok vs Terjual)
  const barangTersedia = listings.filter((item: any) => item.status === 'Tersedia')
  const barangTerjual = listings.filter((item: any) => item.status === 'Terjual')

  // 4. Hitung Statistik (Dashboard Pintar)
  const stokGudang = barangTersedia.reduce((total: number, item: any) => total + item.quantity, 0)
  const potensiCuan = barangTersedia.reduce((total: number, item: any) => total + item.price, 0)
  const uangMasuk = barangTerjual.reduce((total: number, item: any) => total + item.price, 0)

  // Helper untuk Ikon
  const getIcon = (kategori: string) => {
    if (kategori === 'Kertas') return '📄'
    if (kategori === 'Plastik') return '🥤'
    if (kategori === 'Logam') return '🔩'
    return '📦'
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-3xl font-bold text-green-700 flex items-center gap-2">
            ♻️ EcoLoop <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Pro</span>
          </h1>
          <p className="text-gray-500 italic text-sm mt-1">Sistem Manajemen Limbah Terpadu</p>
        </div>
        <form action={logout}>
          <button className="bg-red-50 text-red-600 px-5 py-2 rounded-lg font-bold hover:bg-red-100 transition flex items-center gap-2 text-sm border border-red-200">
            🔓 Logout
          </button>
        </form>
      </div>

      {/* DASHBOARD KEUANGAN (UPDATE BESAR) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {/* Card 1: Stok Gudang */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">📦</div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Stok Gudang</p>
          <p className="text-4xl font-bold text-gray-800 mt-2">{stokGudang} <span className="text-base font-normal text-gray-400">Kg</span></p>
          <p className="text-xs text-blue-500 mt-2 font-medium">{barangTersedia.length} barang tersedia</p>
        </div>

        {/* Card 2: Potensi Cuan (Aset) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition text-6xl">⏳</div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">Potensi Aset</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">Rp {potensiCuan.toLocaleString('id-ID')}</p>
          <p className="text-xs text-gray-400 mt-2">Belum terjual</p>
        </div>

        {/* Card 3: Uang Masuk (Real) */}
        <div className="bg-gradient-to-br from-green-600 to-emerald-800 p-6 rounded-2xl shadow-lg text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-20 text-6xl">💰</div>
          <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Total Pendapatan</p>
          <p className="text-4xl font-bold mt-2">Rp {uangMasuk.toLocaleString('id-ID')}</p>
          <p className="text-xs text-green-200 mt-2">{barangTerjual.length} barang terjual</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM INPUT (KIRI) */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-8">
          <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2">📝 Input Barang</h2>
          <form action={simpanLimbah} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Nama Barang</label>
              <input name="nama" type="text" placeholder="Contoh: Kardus Bekas" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:bg-white transition" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Berat (Kg)</label>
                <input name="berat" type="number" placeholder="0" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:bg-white transition" />
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase">Harga (Rp)</label>
                <input name="harga" type="number" placeholder="0" required className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:bg-white transition" />
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Kategori</label>
              <select name="kategori" className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:bg-white transition">
                <option value="Kertas">📄 Kertas</option>
                <option value="Plastik">🥤 Plastik</option>
                <option value="Logam">🔩 Logam</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase">Catatan</label>
              <textarea name="deskripsi" placeholder="Kondisi barang..." className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500 focus:bg-white transition h-20"></textarea>
            </div>
            <button type="submit" className="w-full bg-gray-900 text-white py-3 rounded-lg font-bold hover:bg-black transition shadow-lg">
              + Simpan ke Gudang
            </button>
          </form>
        </div>

        {/* DAFTAR BARANG (KANAN) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-lg font-bold text-gray-800">Daftar Inventaris</h2>
            <form className="flex gap-2">
              <input name="search" defaultValue={query} placeholder="Cari..." className="p-2 bg-gray-50 border rounded-lg text-sm w-40 focus:w-56 transition-all" />
              <button type="submit" className="bg-gray-200 text-gray-600 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300 transition">🔍</button>
            </form>
          </div>

          {/* LIST BARANG */}
          {listings.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-gray-200">
              <p className="text-gray-400 font-medium">Belum ada data</p>
            </div>
          ) : (
            <div className="space-y-4">
              {listings.map((item: any) => {
                const isTerjual = item.status === 'Terjual'
                
                return (
                  <div key={item.id} className={`p-5 rounded-xl border transition-all duration-200 ${isTerjual ? 'bg-gray-100 border-gray-200 opacity-75' : 'bg-white border-gray-100 shadow-sm hover:shadow-md'}`}>
                    <div className="flex justify-between items-start">
                      
                      {/* INFORMASI BARANG */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getIcon(item.category)}</span>
                          <h3 className={`font-bold text-lg ${isTerjual ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                            {item.title}
                          </h3>
                          {isTerjual && <span className="bg-green-100 text-green-700 text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider border border-green-200">Terjual</span>}
                        </div>
                        
                        <div className="flex gap-2 text-xs pl-9">
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{item.category}</span>
                          <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded font-medium">{item.quantity} Kg</span>
                        </div>
                        <p className="text-sm text-gray-400 pl-9 line-clamp-1">{item.description}</p>
                        <p className="text-xs text-gray-300 pl-9 mt-1">
                          📅 {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>

                      {/* HARGA & TOMBOL AKSI */}
                      <div className="flex flex-col items-end gap-3">
                        <p className={`font-bold text-xl ${isTerjual ? 'text-gray-500' : 'text-green-600'}`}>
                          Rp {item.price.toLocaleString('id-ID')}
                        </p>

                        <div className="flex items-center gap-2">
                          
                          {/* JIKA MASIH TERSEDIA: Tampilkan tombol Edit & Jual */}
                          {!isTerjual && (
                            <>
                              <a href={`/edit/${item.id}`} className="bg-gray-50 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 p-2 rounded-lg transition border border-gray-200" title="Edit">
                                ✏️
                              </a>
                              <form action={tandaiTerjual}>
                                <input type="hidden" name="id" value={item.id} />
                                <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-green-700 transition shadow-sm flex items-center gap-1">
                                  ✅ Laku
                                </button>
                              </form>
                            </>
                          )}

                          {/* JIKA SUDAH TERJUAL: Tampilkan tombol Batal & Hapus */}
                          {isTerjual && (
                            <>
                              <form action={batalkanTerjual}>
                                <input type="hidden" name="id" value={item.id} />
                                <button type="submit" className="text-xs text-gray-400 hover:text-blue-500 underline mr-2">
                                  Batal
                                </button>
                              </form>
                              <form action={hapusLimbah}>
                                <input type="hidden" name="id" value={item.id} />
                                <button type="submit" className="bg-red-50 text-red-400 p-2 rounded-lg hover:bg-red-100 hover:text-red-600 transition" title="Hapus Permanen">
                                  🗑️
                                </button>
                              </form>
                            </>
                          )}
                          
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}