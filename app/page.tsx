'use client';

import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ type: 'success', text: 'Sucesso! Dados integrados na planilha.' });
        setFile(null);
      } else {
        setMessage({ type: 'error', text: data.error || 'Erro ao enviar o arquivo.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Erro de conexão com o servidor.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-950 p-6 text-gray-100">
      <div className="w-full max-w-md rounded-2xl bg-gray-900 p-8 shadow-xl border border-gray-800">
        <h1 className="text-2xl font-bold text-center text-blue-500 mb-2">SISTEMA AYRONEX</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Importador de Planilha de Funcionários</p>

        <form onSubmit={handleUpload} className="space-y-4">
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-700 rounded-xl p-6 bg-gray-950 hover:border-blue-500 transition-colors cursor-pointer relative">
            <input
              type="file"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <svg className="w-10 h-10 text-gray-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-sm text-gray-300 text-center font-medium">
              {file ? file.name : 'Clique ou arraste o arquivo Excel aqui'}
            </p>
            <p className="text-xs text-gray-500 mt-1">Apenas arquivos .xlsx ou .xls</p>
          </div>

          <button
            type="submit"
            disabled={!file || loading}
            className={`w-full py-3 rounded-xl font-semibold text-white transition-all ${
              !file || loading
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-500 active:scale-[0.98]'
            }`}
          >
            {loading ? 'Processando e Enviando...' : 'Iniciar Upload para o Sheets'}
          </button>
        </form>

        {message && (
          <div className={`mt-4 p-4 rounded-xl text-sm border font-medium ${
            message.type === 'success' 
              ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400' 
              : 'bg-rose-950/50 border-rose-500 text-rose-400'
          }`}>
            {message.text}
          </div>
        )}
      </div>
    </main>
  );
}