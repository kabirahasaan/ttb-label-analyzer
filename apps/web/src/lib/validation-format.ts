const fieldNameMap: Record<string, string> = {
  brandName: 'Brand Name',
  alcoholByVolume: 'Alcohol by Volume (ABV)',
  netContents: 'Net Contents',
  producerName: 'Producer Name',
  governmentWarning: 'Government Warning',
  colaNumber: 'TTB COLA ID',
  classType: 'Product Type',
};

export function formatValidationFieldName(field: string): string {
  return (
    fieldNameMap[field] ||
    field
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase())
      .trim()
  );
}
