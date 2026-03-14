import { useTranslation } from 'react-i18next';

/**
 * Results Component
 * Screen 2 - Displays calculation results
 */
export default function Results({ results, onExportBOM, onNewCalculation }) {
  const { t } = useTranslation();
  const { shell, heads, input } = results;

  const formatNumber = (num, decimals = 2) => {
    if (num === undefined || num === null) return '-';
    return num.toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  };

  const totalWeight = (shell?.totalWeight || 0) + (heads?.totalWeight || 0);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-navy mb-6">
        {t('results.title')}
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Shell Panel */}
        <div className="result-panel">
          <h3 className="font-heading text-xl font-bold uppercase text-navy mb-4">
            {t('results.shell.title')}
          </h3>

          {shell?.error ? (
            <p className="text-red-500">{shell.error}</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between border-b border-brand pb-2">
                <span className="text-dark-gray">{t('results.shell.outerDiameter')}</span>
                <span className="font-bold text-navy text-lg">
                  {formatNumber(shell.od, 2)}"
                </span>
              </div>

              <div className="flex justify-between border-b border-brand pb-2">
                <span className="text-dark-gray">{t('results.shell.requiredLength')}</span>
                <span className="font-bold text-navy text-lg">
                  {formatNumber(shell.requiredLength, 1)}"
                </span>
              </div>

              <div className="flex justify-between border-b border-brand pb-2">
                <span className="text-dark-gray">{t('results.shell.recommendedSheets')}</span>
                <span className="font-bold text-navy">
                  {shell.combinationDescription}
                </span>
              </div>

              <div className="flex justify-between border-b border-brand pb-2">
                <span className="text-dark-gray">{t('results.shell.totalRawLength')}</span>
                <span className="font-bold text-navy text-lg">
                  {formatNumber(shell.totalRawLength, 0)}"
                </span>
              </div>

              <div className="flex justify-between border-b border-brand pb-2">
                <span className="text-dark-gray">{t('results.shell.waste')}</span>
                <span className="font-bold text-orange">
                  {formatNumber(shell.waste, 1)}" ({formatNumber(shell.wastePercent, 1)}%)
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-dark-gray font-semibold">{t('results.shell.weight')}</span>
                <span className="font-bold text-navy text-xl">
                  {formatNumber(shell.totalWeight, 2)} {t('units.kg')}
                </span>
              </div>

              {/* Sheet details */}
              <div className="mt-4 pt-4 border-t border-brand">
                <p className="text-sm text-dark-gray mb-2">
                  {t('results.shell.requiredLength')}: {shell.requiredSheetWidth}" {t('form.sheetWidths').toLowerCase()}
                </p>
                {shell.sheetDetails?.map((sheet, idx) => (
                  <p key={idx} className="text-sm text-dark-gray">
                    {sheet.count} x {sheet.width}" x {sheet.length}" = {formatNumber(sheet.weight, 2)} {t('units.kg')}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Heads Panel */}
        <div className="result-panel">
          <h3 className="font-heading text-xl font-bold uppercase text-navy mb-4">
            {t('results.heads.title')}
          </h3>

          {heads?.error ? (
            <p className="text-red-500">{heads.error}</p>
          ) : input.numberOfHeads === 0 ? (
            <p className="text-dark-gray italic">No heads required</p>
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between border-b border-brand pb-2">
                <span className="text-dark-gray">{t('results.heads.outerDiameter')}</span>
                <span className="font-bold text-navy text-lg">
                  {formatNumber(heads.od, 2)}"
                </span>
              </div>

              <div className="flex justify-between border-b border-brand pb-2">
                <span className="text-dark-gray">{t('results.heads.requiredSheetWidth')}</span>
                <span className="font-bold text-navy text-lg">
                  {formatNumber(heads.requiredSheetWidth, 0)}"
                </span>
              </div>

              <div className="flex justify-between border-b border-brand pb-2">
                <span className="text-dark-gray">{t('results.heads.sheetDimensions')}</span>
                <span className="font-bold text-navy">
                  {heads.sheetDimensions}
                </span>
              </div>

              <div className="flex justify-between border-b border-brand pb-2">
                <span className="text-dark-gray">{t('results.heads.sheetsNeeded')}</span>
                <span className="font-bold text-navy text-lg">
                  {heads.sheetsNeeded} {t('units.sheets')}
                </span>
              </div>

              <div className="flex justify-between pt-2">
                <span className="text-dark-gray font-semibold">{t('results.heads.weight')}</span>
                <span className="font-bold text-navy text-xl">
                  {formatNumber(heads.totalWeight, 2)} {t('units.kg')}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary Panel */}
      <div className="mt-6 bg-navy text-white p-6">
        <h3 className="font-heading text-xl font-bold uppercase mb-4">
          {t('results.summary.title')}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <p className="text-sm opacity-80">{t('results.summary.shellWeight')}</p>
            <p className="text-2xl font-bold">{formatNumber(shell?.totalWeight || 0, 2)} {t('units.kg')}</p>
          </div>
          <div className="text-center">
            <p className="text-sm opacity-80">{t('results.summary.headsWeight')}</p>
            <p className="text-2xl font-bold">{formatNumber(heads?.totalWeight || 0, 2)} {t('units.kg')}</p>
          </div>
          <div className="text-center bg-orange p-4 -m-2">
            <p className="text-sm opacity-80">{t('results.summary.totalWeight')}</p>
            <p className="text-3xl font-bold">{formatNumber(totalWeight, 2)} {t('units.kg')}</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4 justify-center">
        <button onClick={onExportBOM} className="btn-primary">
          {t('results.exportBOM')}
        </button>
        <button onClick={onNewCalculation} className="btn-secondary">
          {t('results.newCalculation')}
        </button>
      </div>
    </div>
  );
}
