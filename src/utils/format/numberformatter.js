export const parseIndonesianNumber = (value) => {
  if (!value) return 0;
  const stringValue = value.toString().trim();
  
  if (stringValue.includes(',') && stringValue.includes('.')) {
    const lastDotIndex = stringValue.lastIndexOf('.');
    const afterLastDot = stringValue.substring(lastDotIndex + 1);
    
    if (afterLastDot.length <= 3 && afterLastDot.length > 0) {
      return parseFloat(stringValue.replace(/,/g, ''));
    } else {
      return parseFloat(stringValue.replace(/\./g, '').replace(',', '.'));
    }
  }
  if (stringValue.includes(',') && !stringValue.includes('.')) {
    return parseFloat(stringValue.replace(',', '.'));
  }
  if (stringValue.includes('.') && !stringValue.includes(',')) {
    return parseFloat(stringValue);
  }
  return parseFloat(stringValue) || 0;
};

export const formatNumber = (num, maxDecimals = 6, minDecimals = 0) => {
  const parsed = parseFloat(num);
  if (parsed === 0) return '0';
  
  if (Math.abs(parsed) < 0.000001) {
    return parsed.toExponential(3);
  }
  
  return parsed.toLocaleString('id-ID', { 
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals 
  });
};