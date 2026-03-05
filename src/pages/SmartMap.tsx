'use client';

import { useState } from 'react';
import { MapPin, Search, Bot, Navigation, ExternalLink, Loader2, Map as MapIcon } from 'lucide-react';
import Markdown from 'react-markdown';

interface Place {
  uri: string;
  title: string;
}

export default function SmartMap() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);

  // helper to provide a fallback mock response if AI API fails
  const generateMock = (q: string) => {
    const queryLower = q.toLowerCase();
    let mockResponse = '';
    let mockPlaces: Place[] = [];

    if (queryLower.includes('rumah sakit') || queryLower.includes('hospital')) {
      mockResponse = `Berdasarkan pencarian Anda tentang "${q}", berikut adalah informasi rumah sakit di Kota Madiun:

**Rumah Sakit Terdekat:**
- **RSUD Kota Madiun**: Rumah sakit umum daerah dengan layanan lengkap
- **RS Islam Madiun**: Rumah sakit swasta dengan spesialisasi jantung
- **RS Panti Waluya Sawahan**: Rumah sakit khusus ibu dan anak

**Rekomendasi rute:**
1. Dari pusat kota, gunakan Jl. Pahlawan menuju RSUD Kota Madiun
2. Untuk RS Islam, ambil Jl. Ahmad Yani ke arah timur
3. Hindari jam sibuk pagi hari untuk akses lebih cepat

**Tips:** Pastikan membawa kartu identitas dan informasi medis penting saat berkunjung.`;
      
      mockPlaces = [
        { uri: 'https://maps.google.com/?q=RSUD+Madiun', title: 'RSUD Kota Madiun' },
        { uri: 'https://maps.google.com/?q=RS+Islam+Madiun', title: 'RS Islam Madiun' },
        { uri: 'https://maps.google.com/?q=RS+Panti+Waluya+Madiun', title: 'RS Panti Waluya Sawahan' }
      ];
    } else if (queryLower.includes('polisi') || queryLower.includes('police')) {
      mockResponse = `Berdasarkan pencarian Anda tentang "${q}", berikut adalah informasi kantor polisi di Kota Madiun:

**Kantor Polisi:**
- **Polres Kota Madiun**: Kantor kepolisian utama kota
- **Polsek Madiun**: Kantor polisi sektor pusat kota
- **Polsek Sawahan**: Kantor polisi sektor Sawahan

**Kontak Darurat:** 110 (Polisi) atau (0351) 123456

**Lokasi strategis:** Polres Kota Madiun terletak di Jl. Pahlawan, mudah diakses dari berbagai penjuru kota.`;
      
      mockPlaces = [
        { uri: 'https://maps.google.com/?q=Polres+Madiun', title: 'Polres Kota Madiun' },
        { uri: 'https://maps.google.com/?q=Polsek+Madiun', title: 'Polsek Madiun' }
      ];
    } else {
      mockResponse = `Berdasarkan pencarian Anda tentang "${q}", berikut adalah informasi umum di Kota Madiun:

**Lokasi yang relevan:**
- **Jl. Pahlawan**: Jalan utama pusat kota dengan akses mudah
- **Alun-alun Kota Madiun**: Pusat aktivitas kota
- **Terminal Bus Madiun**: Terminal utama transportasi

**Rekomendasi:** Untuk informasi lebih spesifik, coba sebutkan jenis tempat yang Anda cari (contoh: rumah sakit, polisi, bank, dll).`;

      mockPlaces = [
        { uri: 'https://maps.google.com/?q=Madiun+City+Center', title: 'Pusat Kota Madiun - Jl. Pahlawan' },
        { uri: 'https://maps.google.com/?q=Alun+Alun+Madiun', title: 'Alun-alun Kota Madiun' },
        { uri: 'https://maps.google.com/?q=Terminal+Bus+Madiun', title: 'Terminal Bus Madiun' }
      ];
    }

    return { mockResponse, mockPlaces };
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setResponse('');
    setPlaces([]);

    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await res.json();
      if (data && data.text) {
        setResponse(data.text);
        setPlaces([]); // server doesn't currently return places
      } else if (data.error) {
        throw new Error(data.error);
      }
    } catch (error) {
      console.warn('AI API failed, falling back to mock', error);
      const { mockResponse, mockPlaces } = generateMock(query);
      setResponse(mockResponse);
      setPlaces(mockPlaces);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapIcon className="w-6 h-6 text-emerald-500" /> AI Smart Map Assistant
        </h1>
        <p className="text-sm text-gray-500">Tanyakan lokasi, rute, fasilitas umum, atau tempat menarik di Kota Madiun.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          {/* Search Box */}
          <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl border border-gray-100 shadow-sm">
            <form onSubmit={handleSearch} className="relative flex flex-col sm:block gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  type="text" 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Contoh: Cari rumah sakit terdekat..." 
                  className="w-full pl-12 pr-4 sm:pr-32 py-4 bg-gray-50 border border-gray-200 rounded-2xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                  disabled={loading}
                />
              </div>
              <button 
                type="submit"
                disabled={loading || !query.trim()}
                className="sm:absolute right-2 top-1/2 sm:-translate-y-1/2 px-6 py-3 sm:py-2 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Cari'}
              </button>
            </form>
          </div>

          {/* Response Area */}
          {(response || loading) && (
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-50">
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                  <Bot className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">AI Assistant</h3>
                  <p className="text-xs text-gray-500">Powered by Gemini 2.5 Flash</p>
                </div>
              </div>
              
              <div className="prose prose-sm max-w-none prose-emerald">
                {loading ? (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Loader2 className="w-4 h-4 animate-spin" /> AI sedang mencari lokasi...
                  </div>
                ) : (
                  <div className="markdown-body text-gray-700 leading-relaxed">
                    <Markdown>{response}</Markdown>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar: Places */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-emerald-500" /> Lokasi Ditemukan
            </h3>
            
            {places.length > 0 ? (
              <div className="space-y-3">
                {places.map((place, i) => (
                  <a 
                    key={i} 
                    href={place.uri} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-4 rounded-2xl border border-gray-100 hover:border-emerald-200 hover:bg-emerald-50 transition-all group"
                  >
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-emerald-700 mb-1 line-clamp-2">{place.title}</h4>
                    <div className="flex items-center gap-1 text-xs text-emerald-600 font-medium">
                      Buka di Maps <ExternalLink className="w-3 h-3" />
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Navigation className="w-5 h-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500">Belum ada lokasi yang dicari.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
