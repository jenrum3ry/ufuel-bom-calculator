import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import LanguageToggle from './components/LanguageToggle';
import OrderForm from './components/OrderForm';
import Results from './components/Results';
import BOMExport from './components/BOMExport';

import { calculateShell } from './logic/shellCalc';
import { calculateHeads } from './logic/headCalc';

/**
 * Main App Component
 * Manages screen navigation and calculation state
 */
function App() {
  const { t } = useTranslation();

  // Screen state: 'form', 'results', or 'export'
  const [currentScreen, setCurrentScreen] = useState('form');

  // Calculation results
  const [results, setResults] = useState(null);

  const handleCalculate = (input) => {
    // Calculate shell
    const shellResult = calculateShell({
      tankDiameter: input.tankDiameter,
      tankLength: input.tankLength,
      thickness: input.thickness,
      availableWidths: input.availableWidths,
      availableLengths: input.availableLengths
    });

    // Calculate heads
    const headsResult = input.numberOfHeads > 0
      ? calculateHeads({
          tankDiameter: input.tankDiameter,
          thickness: input.thickness,
          numberOfHeads: input.numberOfHeads,
          availableWidths: input.availableWidths,
          availableLengths: input.availableLengths
        })
      : null;

    // Store results and navigate
    setResults({
      shell: shellResult,
      heads: headsResult,
      input
    });
    setCurrentScreen('results');
  };

  const handleExportBOM = () => {
    setCurrentScreen('export');
  };

  const handleNewCalculation = () => {
    setResults(null);
    setCurrentScreen('form');
  };

  const handleBackToResults = () => {
    setCurrentScreen('results');
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-navy py-4 px-6 flex justify-between items-center no-print">
        <div className="flex items-center gap-4">
          <img
            src="./assets/Ufuellogo.png"
            alt="U-Fuel"
            className="h-12 object-contain"
          />
          <h1 className="font-heading text-white text-xl font-bold uppercase tracking-wide hidden md:block">
            {t('app.title')}
          </h1>
        </div>
        <LanguageToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4">
        {currentScreen === 'form' && (
          <OrderForm onCalculate={handleCalculate} />
        )}

        {currentScreen === 'results' && results && (
          <Results
            results={results}
            onExportBOM={handleExportBOM}
            onNewCalculation={handleNewCalculation}
          />
        )}

        {currentScreen === 'export' && results && (
          <BOMExport
            results={results}
            onBack={handleBackToResults}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-navy py-3 px-6 text-center text-white text-sm opacity-80 no-print">
        UFuel BOM Steel Calculator - Torco de la Laguna
      </footer>
    </div>
  );
}

export default App;
