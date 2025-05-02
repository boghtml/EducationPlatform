import React, { useState, useEffect, useRef } from 'react';
import noUiSlider from 'nouislider';
import 'nouislider/dist/nouislider.css';

const RangeSlider = ({ 
  min, 
  max, 
  step = 1,
  initialValues = [min, max],
  onChange,
  formatPrefix = '',
  formatSuffix = '',
  label
}) => {
  const sliderRef = useRef(null);
  const [values, setValues] = useState(initialValues);
  
  useEffect(() => {
    if (sliderRef.current && !sliderRef.current.noUiSlider) {
      noUiSlider.create(sliderRef.current, {
        start: initialValues,
        connect: true,
        step: step,
        range: {
          'min': min,
          'max': max
        },
        format: {
          to: value => Math.round(value),
          from: value => Number(value)
        }
      });

      sliderRef.current.noUiSlider.on('update', (values) => {
        const numericValues = values.map(v => parseInt(v));
        setValues(numericValues);
        if (onChange) {
          onChange(numericValues);
        }
      });
    }

    return () => {
      if (sliderRef.current && sliderRef.current.noUiSlider) {
        sliderRef.current.noUiSlider.destroy();
      }
    };
  }, [min, max, step, onChange]);

  const handleInputChange = (index, event) => {
    const newValue = parseInt(event.target.value);
    
    if (isNaN(newValue)) return;
    
    const newValues = [...values];
    newValues[index] = newValue;
    
    if (index === 0 && newValue > values[1]) {
      newValues[index] = values[1];
    } else if (index === 1 && newValue < values[0]) {
      newValues[index] = values[0];
    }
    
    setValues(newValues);
    
    if (sliderRef.current && sliderRef.current.noUiSlider) {
      sliderRef.current.noUiSlider.set(newValues);
    }
    
    if (onChange) {
      onChange(newValues);
    }
  };

  return (
    <div className="range-slider-container">
      {label && <h5 className="slider-label">{label}</h5>}
      
      <div className="range-inputs">
        <div className="range-input-group">
          <span className="range-input-prefix">{formatPrefix}</span>
          <input
            type="number"
            value={values[0]}
            onChange={(e) => handleInputChange(0, e)}
            min={min}
            max={values[1]}
            className="range-input"
          />
        </div>
        
        <span className="range-separator">to</span>
        
        <div className="range-input-group">
          <span className="range-input-prefix">{formatPrefix}</span>
          <input
            type="number"
            value={values[1]}
            onChange={(e) => handleInputChange(1, e)}
            min={values[0]}
            max={max}
            className="range-input"
          />
        </div>
      </div>
      
      <div ref={sliderRef} className="range-slider"></div>
      
      <div className="range-values">
        <span>{formatPrefix}{values[0]}{formatSuffix}</span>
        <span>{formatPrefix}{values[1]}{formatSuffix}</span>
      </div>
    </div>
  );
};

export default RangeSlider;