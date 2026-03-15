import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';

/**
 * BOM Export Component
 * Screen 3 - Printable materials requisition
 */
export default function BOMExport({ results, onBack }) {
  const { t, i18n } = useTranslation();
  const { shell, heads, input } = results;

  const [jobNumber, setJobNumber] = useState('');

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const formatDate = () => {
    const date = new Date();
    return date.toLocaleDateString(i18n.language === 'es' ? 'es-MX' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getGradeName = () => {
    return t(`form.steelGradeOptions.${input.steelGrade}`);
  };

  const totalWeight = (shell?.totalWeight || 0) + (heads?.totalWeight || 0);

  // Build line items for the BOM
  const lineItems = [];
  let itemNum = 1;

  // Shell sheets
  if (shell?.sheetDetails) {
    shell.sheetDetails.forEach(sheet => {
      lineItems.push({
        item: itemNum++,
        qty: sheet.count,
        unit: t('units.pcs'),
        description: t('bom.items.shellSheet'),
        dimensions: `${sheet.width}" x ${sheet.length}" (CORTAR A ${sheet.cutLength}") x ${input.thickness}"`,
        weight: sheet.weight
      });
    });
  }

  // Head sheets
  if (heads && !heads.error && input.numberOfHeads > 0) {
    lineItems.push({
      item: itemNum++,
      qty: heads.sheetsNeeded,
      unit: t('units.pcs'),
      description: t('bom.items.headSheet'),
      dimensions: `${heads.requiredSheetWidth}" x ${heads.requiredSheetLength}" x ${input.thickness}"`,
      weight: heads.totalWeight
    });
  }

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    const img = new Image();
    img.src = './assets/torco-logo.png';
    img.onload = () => generatePDF(img);
    img.onerror = () => generatePDF(null);
  };

  const generatePDF = (logoImg) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Logo — top-right corner
    if (logoImg) {
      doc.addImage(logoImg, 'PNG', pageWidth - 60, 8, 40, 20);
    }

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text(t('bom.title'), 20, 20);

    // Header info
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    let y = 35;

    doc.text(`${t('bom.date')}: ${formatDate()}`, 20, y);
    y += 8;
    doc.text(`${t('bom.jobNumber')}: ${jobNumber || '-'}`, 20, y);
    y += 8;
    doc.text(`${t('bom.steelGrade')}: ${getGradeName()}`, 20, y);
    y += 15;

    // Table header
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(43, 81, 144); // Navy
    doc.rect(20, y, pageWidth - 40, 10, 'F');
    doc.setTextColor(255, 255, 255);

    const colWidths = [15, 15, 20, 45, 45, 30];
    let x = 22;
    const headers = [
      t('bom.lineItems.item'),
      t('bom.lineItems.quantity'),
      t('bom.lineItems.unit'),
      t('bom.lineItems.description'),
      t('bom.lineItems.dimensions'),
      t('bom.lineItems.weight')
    ];

    headers.forEach((header, idx) => {
      doc.text(header, x, y + 7);
      x += colWidths[idx];
    });

    y += 15;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');

    // Table rows
    lineItems.forEach((item, idx) => {
      if (idx % 2 === 0) {
        doc.setFillColor(244, 246, 249); // Light gray
        doc.rect(20, y - 5, pageWidth - 40, 10, 'F');
      }

      x = 22;
      doc.text(String(item.item), x, y);
      x += colWidths[0];
      doc.text(String(item.qty), x, y);
      x += colWidths[1];
      doc.text(item.unit, x, y);
      x += colWidths[2];
      doc.text(item.description, x, y);
      x += colWidths[3];
      doc.text(item.dimensions, x, y);
      x += colWidths[4];
      doc.text(formatNumber(item.weight) + ' kg', x, y);

      y += 10;
    });

    // Total
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(245, 130, 31); // Orange
    doc.rect(20, y - 5, pageWidth - 40, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text(`${t('bom.totalWeight')}: ${formatNumber(totalWeight)} kg`, pageWidth / 2, y + 2, { align: 'center' });

    // Footer
    doc.setTextColor(128, 128, 128);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('UFuel BOM Steel Calculator - Torco de la Laguna', pageWidth / 2, 280, { align: 'center' });

    // Save
    const filename = jobNumber
      ? `BOM_${jobNumber}_${new Date().toISOString().split('T')[0]}.pdf`
      : `BOM_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Action buttons - hidden when printing */}
      <div className="no-print mb-6 flex gap-4 justify-end">
        <button onClick={handlePrint} className="btn-primary">
          {t('bom.print')}
        </button>
        <button onClick={handleDownloadPDF} className="btn-primary">
          {t('bom.downloadPDF')}
        </button>
        <button onClick={onBack} className="btn-secondary">
          {t('bom.back')}
        </button>
      </div>

      {/* Printable BOM */}
      <div className="bg-white p-8 border border-brand">
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b-4 border-navy pb-4">
          <div>
            <h1 className="font-heading text-2xl font-bold uppercase text-navy">
              {t('bom.title')}
            </h1>
            <p className="text-dark-gray mt-1">{t('bom.date')}: {formatDate()}</p>
          </div>
          <img
            src="./assets/torco-logo.png"
            alt="Torco de la Laguna"
            className="h-16 object-contain"
          />
        </div>

        {/* Job info */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-semibold text-dark-gray mb-1 no-print">
              {t('bom.jobNumber')}
            </label>
            <input
              type="text"
              value={jobNumber}
              onChange={(e) => setJobNumber(e.target.value)}
              placeholder={t('bom.enterJobNumber')}
              className="w-full no-print"
            />
            <p className="hidden print:block font-semibold">
              {t('bom.jobNumber')}: {jobNumber || '-'}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-dark-gray mb-1">{t('bom.steelGrade')}</p>
            <p className="text-lg font-bold text-navy">{getGradeName()}</p>
          </div>
        </div>

        {/* Line items table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-navy text-white">
              <th className="p-3 text-left font-heading uppercase">{t('bom.lineItems.item')}</th>
              <th className="p-3 text-center font-heading uppercase">{t('bom.lineItems.quantity')}</th>
              <th className="p-3 text-center font-heading uppercase">{t('bom.lineItems.unit')}</th>
              <th className="p-3 text-left font-heading uppercase">{t('bom.lineItems.description')}</th>
              <th className="p-3 text-left font-heading uppercase">{t('bom.lineItems.dimensions')}</th>
              <th className="p-3 text-right font-heading uppercase">{t('bom.lineItems.weight')}</th>
            </tr>
          </thead>
          <tbody>
            {lineItems.map((item, idx) => (
              <tr key={item.item} className={idx % 2 === 0 ? 'bg-light-gray' : 'bg-white'}>
                <td className="p-3 border-b border-brand">{item.item}</td>
                <td className="p-3 border-b border-brand text-center font-bold">{item.qty}</td>
                <td className="p-3 border-b border-brand text-center">{item.unit}</td>
                <td className="p-3 border-b border-brand">{item.description}</td>
                <td className="p-3 border-b border-brand font-mono">{item.dimensions}</td>
                <td className="p-3 border-b border-brand text-right font-bold">
                  {formatNumber(item.weight)} {t('units.kg')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Total */}
        <div className="flex justify-end">
          <div className="bg-orange text-white px-8 py-4">
            <span className="font-heading uppercase mr-4">{t('bom.totalWeight')}:</span>
            <span className="text-2xl font-bold">{formatNumber(totalWeight)} {t('units.kg')}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-brand text-center text-sm text-dark-gray opacity-60">
          UFuel BOM Steel Calculator - Torco de la Laguna
        </div>
      </div>
    </div>
  );
}
