'use client'

import { useState } from 'react'
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

type Lotacao = {
  id: number
  escola: string
  escolaId: number
  turno: string
  turnoId: number
  turma: string
  oficina: string
  oficinaId: number
  oficineiro: string
  oficineiroId: number
  horasAula: number
  horasPlanejamento: number
  dias: string
}

interface Props {
  type: 'geral' | 'escola' | 'oficineiro'
  data: Lotacao[]
  filename: string
  label: string
}

export default function ReportGenerator({ type, data, filename, label }: Props) {
  const [generating, setGenerating] = useState(false)

  async function generate() {
    setGenerating(true)
    try {
      const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

      // Custom header drawing helper
      const drawHeader = (titleText: string) => {
        // Top border line (Indigo)
        doc.setDrawColor(79, 70, 229)
        doc.setLineWidth(1.2)
        doc.line(10, 8, 287, 8)

        // Administration Titles
        doc.setFont('Helvetica', 'bold')
        doc.setFontSize(9)
        doc.setTextColor(30, 41, 59) // Slate 800
        doc.text('PREFEITURA MUNICIPAL DE QUEIMADOS', 10, 15)

        doc.setFont('Helvetica', 'normal')
        doc.setFontSize(7)
        doc.setTextColor(148, 163, 184) // Slate 400
        doc.text('SECRETARIA MUNICIPAL DE EDUCAÇÃO - SME | DEPARTAMENTO DE TEMPO INTEGRAL', 10, 19)

        // Report Title
        doc.setFont('Helvetica', 'bold')
        doc.setFontSize(12)
        doc.setTextColor(79, 70, 229) // Indigo
        doc.text(titleText, 10, 27)

        // Horizontal divider
        doc.setDrawColor(226, 232, 240) // Slate 200
        doc.setLineWidth(0.5)
        doc.line(10, 31, 287, 31)
      }

      // Footer callback to add page numbers on each page
      const addFooter = (docInstance: jsPDF) => {
        const pageCount = (docInstance as any).internal.getNumberOfPages()
        for (let i = 1; i <= pageCount; i++) {
          docInstance.setPage(i)
          docInstance.setFont('Helvetica', 'normal')
          docInstance.setFontSize(7)
          docInstance.setTextColor(148, 163, 184)
          docInstance.text(
            `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} | Página ${i} de ${pageCount}`,
            10,
            202
          )
        }
      }

      if (type === 'geral') {
        drawHeader('RELATÓRIO GERAL — DE LOTAÇÕES EFETIVADAS')

        const tableHeaders = [['Escola', 'Turno', 'Turma', 'Oficina', 'Oficineiro', 'H. Aula', 'H. Plan.', 'Dias']]
        const tableRows = data.map((row) => [
          row.escola,
          row.turno,
          row.turma,
          row.oficina,
          row.oficineiro,
          `${row.horasAula}h`,
          `${row.horasPlanejamento}h`,
          row.dias,
        ])

        autoTable(doc, {
          startY: 35,
          head: tableHeaders,
          body: tableRows,
          theme: 'striped',
          headStyles: { fillColor: [79, 70, 229], fontSize: 8.5, fontStyle: 'bold' },
          styles: { fontSize: 8, cellPadding: 2.2 },
          margin: { left: 10, right: 10, bottom: 15 },
        })
      } else if (type === 'escola') {
        drawHeader('RELATÓRIO DE EQUIPE — POR UNIDADE ESCOLAR')

        const escolasSet = Array.from(new Set(data.map((d) => d.escola))).sort()
        let currentY = 35

        for (let i = 0; i < escolasSet.length; i++) {
          const escolaName = escolasSet[i]
          const escolaRows = data
            .filter((d) => d.escola === escolaName)
            .map((row) => [
              row.turno,
              row.turma,
              row.oficina,
              row.oficineiro,
              `${row.horasAula}h`,
              `${row.horasPlanejamento}h`,
              row.dias,
            ])

          if (currentY > 165) {
            doc.addPage()
            drawHeader('RELATÓRIO DE EQUIPE — POR UNIDADE ESCOLAR')
            currentY = 35
          }

          doc.setFont('Helvetica', 'bold')
          doc.setFontSize(9.5)
          doc.setTextColor(30, 41, 59)
          doc.text(`Unidade: ${escolaName}`, 10, currentY)

          autoTable(doc, {
            startY: currentY + 2,
            head: [['Turno', 'Turma', 'Oficina', 'Oficineiro', 'H. Aula', 'H. Plan.', 'Dias']],
            body: escolaRows,
            theme: 'grid',
            headStyles: { fillColor: [71, 85, 105], fontSize: 7.5, fontStyle: 'bold' }, // Slate 600
            styles: { fontSize: 7.5, cellPadding: 2 },
            margin: { left: 10, right: 10, bottom: 15 },
          })
          currentY = (doc as any).lastAutoTable.finalY + 8
        }
      } else if (type === 'oficineiro') {
        drawHeader('RELATÓRIO DE DISTRIBUIÇÃO — POR OFICINEIRO')

        const oficineirosSet = Array.from(new Set(data.map((d) => d.oficineiro))).sort()
        let currentY = 35

        for (let i = 0; i < oficineirosSet.length; i++) {
          const oficineiroName = oficineirosSet[i]
          const oficineiroRows = data
            .filter((d) => d.oficineiro === oficineiroName)
            .map((row) => [
              row.escola,
              row.turno,
              row.turma,
              row.oficina,
              `${row.horasAula}h`,
              `${row.horasPlanejamento}h`,
              row.dias,
            ])

          if (currentY > 165) {
            doc.addPage()
            drawHeader('RELATÓRIO DE DISTRIBUIÇÃO — POR OFICINEIRO')
            currentY = 35
          }

          doc.setFont('Helvetica', 'bold')
          doc.setFontSize(9.5)
          doc.setTextColor(30, 41, 59)
          doc.text(`Oficineiro: ${oficineiroName}`, 10, currentY)

          autoTable(doc, {
            startY: currentY + 2,
            head: [['Escola', 'Turno', 'Turma', 'Oficina', 'H. Aula', 'H. Plan.', 'Dias']],
            body: oficineiroRows,
            theme: 'grid',
            headStyles: { fillColor: [13, 148, 136], fontSize: 7.5, fontStyle: 'bold' }, // Teal 600
            styles: { fontSize: 7.5, cellPadding: 2 },
            margin: { left: 10, right: 10, bottom: 15 },
          })
          currentY = (doc as any).lastAutoTable.finalY + 8
        }
      }

      addFooter(doc)
      doc.save(filename)
    } catch (err) {
      console.error(err)
      alert('Erro ao gerar relatório PDF.')
    } finally {
      setGenerating(false)
    }
  }

  return (
    <button
      onClick={generate}
      disabled={generating}
      className="px-4 py-2.5 bg-red-600 text-white text-xs font-bold rounded-lg hover:bg-red-500 shadow-md shadow-red-600/10 hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
    >
      <span>📄</span>
      <span>{generating ? 'Gerando...' : label}</span>
    </button>
  )
}
