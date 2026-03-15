import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { standardWidths, standardLengths } from '../logic/weightTable.js';

/**
 * Tooltip Component
 */
function Tooltip({ text }) {
  return (
    <span className="tooltip-wrapper">
      <span className="tooltip-icon">?</span>
      <span className="tooltip-text">{text}</span>
    </span>
  );
}

/**
 * Order Form Component
 * Screen 1 - Input form for tank configuration
 */
export default function OrderForm({ onCalculate }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    steelGrade: 'a36',
    thickness: '1/4',
    tankDiameter: '',
    tankLength: '',
    numberOfHeads: 2,
    selectedWidths: [...standardWidths],
    selectedLengths: [...standardLengths]
  });

  const [errors, setErrors] = useState({});

  const gradeOptions = ['a36', '304ss', '316ss'];

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? '' : parseFloat(value)) : value
    }));
    // Clear error when field is modified
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const toggleWidth = (width) => {
    setFormData(prev => {
      const newWidths = prev.selectedWidths.includes(width)
        ? prev.selectedWidths.filter(w => w !== width)
        : [...prev.selectedWidths, width].sort((a, b) => a - b);
      return { ...prev, selectedWidths: newWidths };
    });
  };

  const toggleLength = (length) => {
    setFormData(prev => {
      const newLengths = prev.selectedLengths.includes(length)
        ? prev.selectedLengths.filter(l => l !== length)
        : [...prev.selectedLengths, length].sort((a, b) => a - b);
      return { ...prev, selectedLengths: newLengths };
    });
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.tankDiameter) {
      newErrors.tankDiameter = t('form.validation.diameterRequired');
    } else if (formData.tankDiameter < 36 || formData.tankDiameter > 120) {
      newErrors.tankDiameter = t('form.validation.diameterRange');
    }

    if (!formData.tankLength) {
      newErrors.tankLength = t('form.validation.lengthRequired');
    } else if (formData.tankLength <= 0) {
      newErrors.tankLength = t('form.validation.lengthPositive');
    }

    if (formData.numberOfHeads < 0) {
      newErrors.numberOfHeads = t('form.validation.headsPositive');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onCalculate({
        steelGrade: formData.steelGrade,
        thickness: formData.thickness,
        tankDiameter: formData.tankDiameter,
        tankLength: formData.tankLength,
        numberOfHeads: formData.numberOfHeads,
        availableWidths: formData.selectedWidths,
        availableLengths: formData.selectedLengths
      });
    }
  };

  const handleReset = () => {
    setFormData({
      steelGrade: 'a36',
      thickness: '1/4',
      tankDiameter: '',
      tankLength: '',
      numberOfHeads: 2,
      selectedWidths: [...standardWidths],
      selectedLengths: [...standardLengths]
    });
    setErrors({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 max-w-3xl mx-auto">
      <h2 className="font-heading text-2xl font-bold uppercase tracking-wide text-navy mb-4">
        {t('form.title')}
      </h2>

      {/* Instructions Box */}
      <div className="instructions-box">
        <h3>{t('form.instructions.title')}</h3>
        <ol>
          <li>{t('form.instructions.step1')}</li>
          <li>{t('form.instructions.step2')}</li>
          <li>{t('form.instructions.step3')}</li>
        </ol>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Steel Grade */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-dark-gray">
            {t('form.steelGrade')} <Tooltip text={t('form.tooltips.steelGrade')} />
          </label>
          <select
            name="steelGrade"
            value={formData.steelGrade}
            onChange={handleChange}
            className="w-full"
          >
            {gradeOptions.map(grade => (
              <option key={grade} value={grade}>
                {t(`form.steelGradeOptions.${grade}`)}
              </option>
            ))}
          </select>
        </div>

        {/* Thickness — fixed at 1/4" (6.3mm), only option from supplier */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-dark-gray">
            {t('form.thickness')}
          </label>
          <div className="w-full px-3 py-2 border border-brand bg-light-gray text-dark-gray font-semibold">
            1/4" (6.3 mm)
          </div>
        </div>

        {/* Tank Diameter */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-dark-gray">
            {t('form.tankDiameter')} ({t('form.inches')}) <Tooltip text={t('form.tooltips.diameter')} />
          </label>
          <input
            type="number"
            name="tankDiameter"
            value={formData.tankDiameter}
            onChange={handleChange}
            min="36"
            max="120"
            step="0.1"
            className={`w-full ${errors.tankDiameter ? 'border-red-500' : ''}`}
            placeholder="36 - 120"
          />
          {errors.tankDiameter && (
            <p className="text-red-500 text-sm mt-1">{errors.tankDiameter}</p>
          )}
        </div>

        {/* Tank Length */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-dark-gray">
            {t('form.tankLength')} ({t('form.inches')}) <Tooltip text={t('form.tooltips.length')} />
          </label>
          <input
            type="number"
            name="tankLength"
            value={formData.tankLength}
            onChange={handleChange}
            min="1"
            step="0.1"
            className={`w-full ${errors.tankLength ? 'border-red-500' : ''}`}
            placeholder="e.g. 144"
          />
          {errors.tankLength && (
            <p className="text-red-500 text-sm mt-1">{errors.tankLength}</p>
          )}
        </div>

        {/* Number of Heads */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-dark-gray">
            {t('form.numberOfHeads')} <Tooltip text={t('form.tooltips.heads')} />
          </label>
          <input
            type="number"
            name="numberOfHeads"
            value={formData.numberOfHeads}
            onChange={handleChange}
            min="0"
            max="10"
            step="1"
            className={`w-full ${errors.numberOfHeads ? 'border-red-500' : ''}`}
          />
          {errors.numberOfHeads && (
            <p className="text-red-500 text-sm mt-1">{errors.numberOfHeads}</p>
          )}
        </div>
      </div>

      {/* Available Sheet Widths */}
      <div className="mt-6">
        <label className="block text-sm font-semibold mb-2 text-dark-gray">
          {t('form.sheetWidths')} ({t('form.inches')}) <Tooltip text={t('form.tooltips.sheetWidths')} />
        </label>
        <p className="field-help mb-2">{t('form.sheetWidthsHelp')}</p>
        <div className="flex flex-wrap gap-2">
          {standardWidths.map(width => (
            <button
              key={width}
              type="button"
              onClick={() => toggleWidth(width)}
              className={`px-4 py-2 border transition-colors ${
                formData.selectedWidths.includes(width)
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-dark-gray border-brand hover:border-navy'
              }`}
            >
              {width}"
            </button>
          ))}
        </div>
      </div>

      {/* Available Sheet Lengths */}
      <div className="mt-6">
        <label className="block text-sm font-semibold mb-2 text-dark-gray">
          {t('form.sheetLengths')} ({t('form.inches')}) <Tooltip text={t('form.tooltips.sheetLengths')} />
        </label>
        <p className="field-help mb-2">{t('form.sheetLengthsHelp')}</p>
        <div className="flex flex-wrap gap-2">
          {standardLengths.map(length => (
            <button
              key={length}
              type="button"
              onClick={() => toggleLength(length)}
              className={`px-4 py-2 border transition-colors ${
                formData.selectedLengths.includes(length)
                  ? 'bg-navy text-white border-navy'
                  : 'bg-white text-dark-gray border-brand hover:border-navy'
              }`}
            >
              {length}"
            </button>
          ))}
        </div>
      </div>

      {/* Buttons */}
      <div className="mt-8 flex gap-4">
        <button type="submit" className="btn-primary flex-1">
          {t('form.calculate')}
        </button>
        <button type="button" onClick={handleReset} className="btn-secondary">
          {t('form.reset')}
        </button>
      </div>
    </form>
  );
}
