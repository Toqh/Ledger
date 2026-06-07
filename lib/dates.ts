export const nowMo  = () => new Date().toISOString().slice(0, 7);
export const nowDay = () => new Date().toISOString().slice(0, 10);
export const toMo   = (d: string) => d.slice(0, 7);
export const prevMo = (m: string) => {
  const [y, mo] = m.split('-').map(Number);
  return mo === 1
    ? `${y - 1}-12`
    : `${y}-${String(mo - 1).padStart(2, '0')}`;
};
