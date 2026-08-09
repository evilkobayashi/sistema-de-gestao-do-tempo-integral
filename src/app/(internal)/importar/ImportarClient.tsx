'use client'

import { useState } from 'react'
import { importLotacoes } from '@/app/actions/importar'
import { Upload, Clipboard, FileText, CheckCircle, AlertTriangle, XCircle, ArrowRight } from 'lucide-react'

type CsvRow = {
  escola: string
  turno: string
  turma: string
  oficina: string
  oficineiro: string
  horasAula: number
  horasPlanejamento: number
  dias: string
}

type ImportResult = {
  success: boolean
  successCount: number
  errorCount: number
  errors: { row: number; data: CsvRow; error: string }[]
} | null

export default function ImportarClient() {
  const [activeTab, setActiveTab] = useState<'file' | 'text'>('file')
  const [pasteText, setPasteText] = useState('')
  const [dragActive, setDragActive] = useState(false)
  const [parsedData, setParsedData] = useState<CsvRow[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult>(null)

  function parseCSV(text: string) {
    setError(null)
    setResult(null)
    const lines = text.split(/\r?\n/).map((line) => line.trim()).filter(Boolean)
    if (lines.length === 0) {
      setError('O texto ou arquivo está vazio.')
      return
    }

    const sample = lines[0]
    const semicolons = (sample.match(/;/g) || []).length
    const commas = (sample.match(/,/g) || []).length
    const delimiter = semicolons >= commas ? ';' : ','

    const rows: CsvRow[] = []
    let hasHeader = false

    const firstLineCols = lines[0].split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim().toLowerCase())
    if (
      firstLineCols.some(
        (col) =>
          col.includes('escola') ||
          col.includes('oficineiro') ||
          col.includes('oficina') ||
          col.includes('turno') ||
          col.includes('turma')
      )
    ) {
      hasHeader = true
    }

    const startIdx = hasHeader ? 1 : 0

    for (let i = startIdx; i < lines.length; i++) {
      const cols = lines[i].split(delimiter).map((c) => c.replace(/^["']|["']$/g, '').trim())
      if (cols.length < 8) {
        while (cols.length < 8) cols.push('')
      }

      rows.push({
        escola: cols[0],
        turno: cols[1],
        turma: cols[2],
        oficina: cols[3],
        oficineiro: cols[4],
        horasAula: parseFloat(cols[5].replace(',', '.')) || 0,
        horasPlanejamento: parseFloat(cols[6].replace(',', '.')) || 0,
        dias: cols[7],
      })
    }

    if (rows.length === 0) {
      setError('Nenhuma linha de dados válida encontrada.')
    } else {
      setParsedData(rows)
    }
  }

  async function processFile(file: File) {
    setError(null)
    setResult(null)
    const fileName = file.name.toLowerCase()

    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      setLoading(true)
      const reader = new FileReader()
      reader.onload = async (event) => {
        try {
          const arrayBuffer = event.target?.result as ArrayBuffer
          const XLSX = await import('xlsx')
          const data = new Uint8Array(arrayBuffer)
          const workbook = XLSX.read(data, { type: 'array' })
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          const jsonRows = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][]

          if (jsonRows.length === 0) {
            setError('A planilha Excel está vazia.')
            setLoading(false)
            return
          }

          // Check if first row is header
          const firstRow = (jsonRows[0] || []).map((c) => String(c ?? '').toLowerCase().trim())
          const hasHeader = firstRow.some(
            (col) =>
              col.includes('escola') ||
              col.includes('oficineiro') ||
              col.includes('oficina') ||
              col.includes('turno') ||
              col.includes('turma')
          )

          const startIdx = hasHeader ? 1 : 0
          const rows: CsvRow[] = []

          for (let i = startIdx; i < jsonRows.length; i++) {
            const cols = jsonRows[i]
            if (!cols || cols.length === 0) continue

            // pad columns to avoid undefined errors
            const colData = Array.from({ length: 8 }).map((_, cIdx) => cols[cIdx] !== undefined ? String(cols[cIdx]) : '')

            rows.push({
              escola: colData[0].trim(),
              turno: colData[1].trim(),
              turma: colData[2].trim(),
              oficina: colData[3].trim(),
              oficineiro: colData[4].trim(),
              horasAula: parseFloat(colData[5].replace(',', '.')) || 0,
              horasPlanejamento: parseFloat(colData[6].replace(',', '.')) || 0,
              dias: colData[7].trim(),
            })
          }

          if (rows.length === 0) {
            setError('Nenhuma linha de dados válida encontrada na planilha.')
          } else {
            setParsedData(rows)
          }
        } catch (err: any) {
          setError(`Erro ao ler arquivo Excel: ${err.message}`)
        } finally {
          setLoading(false)
        }
      }
      reader.readAsArrayBuffer(file)
    } else {
      const reader = new FileReader()
      reader.onload = (event) => {
        const text = event.target?.result as string
        parseCSV(text)
      }
      reader.readAsText(file, 'UTF-8')
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    processFile(file)
  }

  function handleDrag(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  async function handleImport() {
    if (parsedData.length === 0) return
    setLoading(true)
    setError(null)
    try {
      const res = await importLotacoes(parsedData)
      setResult(res)
      setParsedData([])
      setPasteText('')
    } catch (err: any) {
      setError('Erro ao enviar dados para processamento no servidor.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-lg font-bold text-slate-800 tracking-tight uppercase">Importar Dados via Planilha</h2>
        <p className="text-xs text-slate-400">Importe a equipe e as lotações colando textos ou enviando arquivos de planilhas Excel ou CSV.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel Esquerdo - Instruções */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4 h-fit">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
            <FileText size={16} className="text-indigo-600" />
            Layout de Colunas
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Sua planilha ou texto deve seguir exatamente a ordem de colunas abaixo. No caso de texto/CSV, utilize <strong>ponto e vírgula (;)</strong> ou <strong>vírgula (,)</strong> como separadores.
          </p>
          <ol className="text-xs space-y-1.5 text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 font-medium">
            <li>1. Escola</li>
            <li>2. Turno (Manhã / Tarde / Noite)</li>
            <li>3. Turma (ex: 101-A)</li>
            <li>4. Oficina</li>
            <li>5. Oficineiro</li>
            <li>6. Horas Aula (ex: 8)</li>
            <li>7. Horas Planejamento (ex: 2)</li>
            <li>8. Dias (ex: Seg/Qua)</li>
          </ol>
          <div className="p-3 text-[11px] bg-indigo-50/70 border border-indigo-100 rounded-lg text-indigo-800 space-y-1.5">
            <p className="font-semibold">💡 Dicas Importantes:</p>
            <ul className="list-disc pl-4 space-y-1">
              <li>Escolas, oficinas e oficineiros novos serão criados automaticamente!</li>
              <li>A carga total de 40h e conflitos de horários são validados na importação.</li>
            </ul>
          </div>
        </div>

        {/* Painel Central/Direito - Input e Resultados */}
        <div className="lg:col-span-2 space-y-6">
          {/* Navegação de Abas */}
          <div className="bg-white p-1 rounded-lg border border-slate-200/60 shadow-sm flex w-fit gap-1">
            <button
              onClick={() => {
                setActiveTab('file')
                setParsedData([])
                setResult(null)
              }}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
                activeTab === 'file' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Upload size={14} />
              Enviar Planilha (Excel/CSV)
            </button>
            <button
              onClick={() => {
                setActiveTab('text')
                setParsedData([])
                setResult(null)
              }}
              className={`px-4 py-2 text-xs font-bold rounded-md transition-all flex items-center gap-2 ${
                activeTab === 'text' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Clipboard size={14} />
              Colar Planilha (Texto)
            </button>
          </div>

          {/* Área de Input de Arquivos */}
          {activeTab === 'file' && parsedData.length === 0 && !result && (
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center gap-3 transition-all min-h-[250px] bg-white ${
                dragActive ? 'border-indigo-600 bg-indigo-50/25' : 'border-slate-200 hover:border-indigo-400'
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-sm">
                <Upload size={24} />
              </div>
              <div className="text-center">
                <label className="text-xs font-bold text-indigo-600 hover:text-indigo-500 cursor-pointer">
                  Clique para selecionar arquivo Excel ou CSV
                  <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="hidden" />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">ou arraste e solte o arquivo aqui</p>
              </div>
            </div>
          )}

          {/* Área de Colar Texto */}
          {activeTab === 'text' && parsedData.length === 0 && !result && (
            <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">Cole os dados delimitados por vírgula ou ponto-e-vírgula</label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Exemplo:&#10;E. M. Castelo Branco;Manhã;101-A;Robótica;Carlos Eduardo Souza;8;2;Seg/Qua&#10;E. M. Santo Antônio;Tarde;202-B;Música;Ana Paula Costa;6;1.5;Ter/Qui"
                  rows={8}
                  className="w-full border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none rounded-lg p-3 text-xs text-slate-700 placeholder-slate-400 transition-all font-mono bg-slate-50/50"
                />
              </div>
              <button
                onClick={() => parseCSV(pasteText)}
                disabled={!pasteText.trim()}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold shadow-md shadow-indigo-600/10 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Analisar Texto
              </button>
            </div>
          )}

          {/* Banner de Erros Gerais */}
          {error && <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">{error}</div>}

          {/* Preview dos Dados Analisados */}
          {parsedData.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden space-y-4 p-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Pré-visualização dos Dados ({parsedData.length} linhas)</h3>
                  <p className="text-[10px] text-slate-400">Verifique os dados abaixo antes de confirmar a importação para o banco.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleImport}
                    disabled={loading}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {loading ? 'Processando...' : 'Confirmar Importação'}
                    <ArrowRight size={14} />
                  </button>
                  <button
                    onClick={() => setParsedData([])}
                    disabled={loading}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all"
                  >
                    Cancelar
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto border rounded-lg max-h-[300px]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[9px] font-bold tracking-wider border-b sticky top-0">
                    <tr>
                      <th className="px-3 py-2">Escola</th>
                      <th className="px-3 py-2">Turno</th>
                      <th className="px-3 py-2">Turma</th>
                      <th className="px-3 py-2">Oficina</th>
                      <th className="px-3 py-2">Oficineiro</th>
                      <th className="px-3 py-2 text-right">H. Aula</th>
                      <th className="px-3 py-2 text-right">H. Plan.</th>
                      <th className="px-3 py-2">Dias</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {parsedData.map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="px-3 py-2.5 font-medium">{row.escola}</td>
                        <td className="px-3 py-2.5">{row.turno}</td>
                        <td className="px-3 py-2.5">{row.turma}</td>
                        <td className="px-3 py-2.5">{row.oficina}</td>
                        <td className="px-3 py-2.5 font-medium">{row.oficineiro}</td>
                        <td className="px-3 py-2.5 text-right font-mono">{row.horasAula}h</td>
                        <td className="px-3 py-2.5 text-right font-mono">{row.horasPlanejamento}h</td>
                        <td className="px-3 py-2.5">{row.dias}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Painel de Resultados do Processamento */}
          {result && (
            <div className="space-y-4">
              {/* Card de Resumo do Resultado */}
              <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {result.errorCount === 0 ? (
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-sm">
                      <CheckCircle size={22} />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-sm">
                      <AlertTriangle size={22} />
                    </div>
                  )}
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-tight">Importação Finalizada</h3>
                    <p className="text-[10px] text-slate-400">O servidor concluiu o processamento da planilha.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="bg-emerald-50/70 border border-emerald-100 rounded-lg px-4 py-2 text-center min-w-[90px]">
                    <span className="block text-xl font-bold text-emerald-600">{result.successCount}</span>
                    <span className="text-[9px] uppercase font-bold text-emerald-700 tracking-wider">Sucesso</span>
                  </div>
                  <div className={`rounded-lg px-4 py-2 text-center min-w-[90px] ${
                    result.errorCount > 0 ? 'bg-rose-50 border border-rose-100 text-rose-600' : 'bg-slate-50 border border-slate-100 text-slate-400'
                  }`}>
                    <span className="block text-xl font-bold">{result.errorCount}</span>
                    <span className="text-[9px] uppercase font-bold tracking-wider">Falhas</span>
                  </div>
                </div>
              </div>

              {/* Lista Detalhada de Erros */}
              {result.errorCount > 0 && (
                <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide flex items-center gap-2">
                    <XCircle className="text-rose-500" size={16} />
                    Linhas Rejeitadas (Não importadas)
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    As linhas abaixo continham conflitos e foram ignoradas. Todas as outras linhas válidas foram importadas normalmente.
                  </p>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                    {result.errors.map((err, i) => (
                      <div key={i} className="p-3 text-xs bg-slate-50 border rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-700">Linha {err.row}</span>
                          <p className="text-[11px] text-slate-400 font-medium">
                            {err.data.oficineiro} | {err.data.escola} ({err.data.turno})
                          </p>
                        </div>
                        <span className="px-2 py-1 text-[10px] font-semibold text-rose-600 bg-rose-50 rounded-md border border-rose-100 max-w-fit">
                          {err.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
