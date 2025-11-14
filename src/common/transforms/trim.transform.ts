import { Transform } from 'class-transformer';

export function Trim() {
  return Transform(({ value }) => {
    if (value === undefined || value === null) {
      return value;
    }

    if (typeof value === 'string') {
      return value.trim();
    }
    return value;
  });
}
