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
  const isInitializedRef = useRef(false);
  const onUpdateRef = useRef(null);
  const [values, setValues] = useState(initialValues);

  // Store onChange in a ref to prevent it from causing re-renders
  onUpdateRef.current = (values) => {
    const numericValues = values.map(v => parseInt(v));
    setValues(numericValues);
    if (onChange) {
      onChange(numericValues);
    }
  };

  // Create the slider only once
  useEffect(() => {
    // Skip if already initialized or ref not available
    if (isInitializedRef.current || !sliderRef.current) {
      return;
    }

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

    // Use a stable callback reference
    const handleUpdate = (values) => {
      if (onUpdateRef.current) {
        onUpdateRef.current(values);
      }
    };

    sliderRef.current.noUiSlider.on('update', handleUpdate);
    isInitializedRef.current = true;

    // Cleanup function
    return () => {
      if (sliderRef.current && sliderRef.current.noUiSlider) {
        sliderRef.current.noUiSlider.off('update');
        sliderRef.current.noUiSlider.destroy();
        isInitializedRef.current = false;
      }
    };
  }, []); // Empty dependency array, so this only runs once on mount

  // Update slider if min, max, or step changes
  useEffect(() => {
    if (!isInitializedRef.current || !sliderRef.current || !sliderRef.current.noUiSlider) {
      return;
    }

    // Update range if min or max changes
    sliderRef.current.noUiSlider.updateOptions({
      range: {
        'min': min,
        'max': max
      },
      step: step
    });
  }, [min, max, step]);

  // Update slider if initialValues changes externally
  useEffect(() => {
    if (!isInitializedRef.current || !sliderRef.current || !sliderRef.current.noUiSlider) {
      return;
    }

    // Only update if values are different
    const currentValues = sliderRef.current.noUiSlider.get().map(v => parseInt(v));
    if (initialValues[0] !== currentValues[0] || initialValues[1] !== currentValues[1]) {
      sliderRef.current.noUiSlider.set(initialValues);
    }
  }, [initialValues]);

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
    
    if (sliderRef.current && sliderRef.current.noUiSlider) {
      sliderRef.current.noUiSlider.set(newValues);
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