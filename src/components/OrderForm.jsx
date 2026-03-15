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
    tankLength: ''
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
        numberOfHeads: 2,
        availableWidths: [...standardWidths],
        availableLengths: [...standardLengths]
      });
    }
  };

  const handleReset = () => {
    setFormData({
      steelGrade: 'a36',
      thickness: '1/4',
      tankDiameter: '',
      tankLength: ''
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
