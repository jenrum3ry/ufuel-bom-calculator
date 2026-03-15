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

const fractionOptions = [
  { label: '0',     value: 0 },
  { label: '1/16',  value: 1/16 },
  { label: '1/8',   value: 2/16 },
  { label: '3/16',  value: 3/16 },
  { label: '1/4',   value: 4/16 },
  { label: '5/16',  value: 5/16 },
  { label: '3/8',   value: 6/16 },
  { label: '7/16',  value: 7/16 },
  { label: '1/2',   value: 8/16 },
  { label: '9/16',  value: 9/16 },
  { label: '5/8',   value: 10/16 },
  { label: '11/16', value: 11/16 },
  { label: '3/4',   value: 12/16 },
  { label: '13/16', value: 13/16 },
  { label: '7/8',   value: 14/16 },
  { label: '15/16', value: 15/16 },
];

/**
 * Order Form Component
 * Screen 1 - Input form for tank configuration
 */
export default function OrderForm({ onCalculate }) {
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    steelGrade: 'a36',
    thickness: '1/4',
    diameterWhole: '',
    diameterFraction: '0',
    tankLength: ''
  });

  const computeDiameter = () => {
    const whole = formData.diameterWhole === '' ? NaN : Number(formData.diameterWhole);
    const frac = fractionOptions.find(f => f.label === formData.diameterFraction)?.value ?? 0;
    return whole + frac;
  };

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

    const diam = computeDiameter();
    if (!formData.diameterWhole) {
      newErrors.tankDiameter = t('form.validation.diameterRequired');
    } else if (diam < 36 || diam > 120) {
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
        tankDiameter: computeDiameter(),
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
      diameterWhole: '',
      diameterFraction: '0',
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

        {/* Tank Diameter — whole inches + fraction dropdown */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-dark-gray">
            {t('form.tankDiameter')} ({t('form.inches')}) <Tooltip text={t('form.tooltips.diameter')} />
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              name="diameterWhole"
              value={formData.diameterWhole}
              onChange={handleChange}
              min="36"
              max="120"
              step="1"
              className={`flex-1 ${errors.tankDiameter ? 'border-red-500' : ''}`}
              placeholder="36 – 120"
            />
            <select
              name="diameterFraction"
              value={formData.diameterFraction}
              onChange={handleChange}
              className="w-28"
            >
              {fractionOptions.map(opt => (
                <option key={opt.label} value={opt.label}>{opt.label}"</option>
              ))}
            </select>
          </div>
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
