const PUBLIC_SENSITIVE_KEYS = new Set([
  'birthday',
  'birthDate',
  'licence',
  'license',
  'registerId',
  'registerCode',
  'sigupId',
  'sourceLicence',
  'idCard',
  'idNo',
  'identityNo',
  'mobile',
  'phone',
  'telephone',
]);

export function sanitizePublicData(value) {
  if (Array.isArray(value)) return value.map(sanitizePublicData);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !PUBLIC_SENSITIVE_KEYS.has(key))
      .map(([key, item]) => [key, sanitizePublicData(item)]),
  );
}

export function hasPublicSensitiveKey(value) {
  if (Array.isArray(value)) return value.some(hasPublicSensitiveKey);
  if (!value || typeof value !== 'object') return false;

  return Object.entries(value).some(([key, item]) => (
    PUBLIC_SENSITIVE_KEYS.has(key) || hasPublicSensitiveKey(item)
  ));
}

export { PUBLIC_SENSITIVE_KEYS };
