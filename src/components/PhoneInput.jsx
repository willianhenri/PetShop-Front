import { formatPhone } from '../utils/validation';

export default function PhoneInput({ value, onChange, ...props }) {
  return (
    <input
      {...props}
      type="tel"
      inputMode="tel"
      autoComplete="tel-national"
      value={value}
      onChange={(event) => {
        const input = event.target;
        const digitsBeforeCursor = input.value
          .slice(0, input.selectionStart)
          .replace(/\D/g, '').length;
        const formatted = formatPhone(input.value);
        onChange(formatted);
        requestAnimationFrame(() => {
          if (document.activeElement !== input) return;
          let cursor = 0,
            digits = 0;
          while (cursor < formatted.length && digits < digitsBeforeCursor) {
            if (/\d/.test(formatted[cursor])) digits++;
            cursor++;
          }
          input.setSelectionRange(cursor, cursor);
        });
      }}
    />
  );
}
