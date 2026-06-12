import { parseRupeeMajorInput } from "@/lib/money";
import { cn } from "@/lib/utils";

type RupeeAmountInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
};

/** Text input for rupee amounts — no number spinners or leading-zero quirks. */
export function RupeeAmountInput({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  placeholder = "0",
  className,
  id,
  name,
}: RupeeAmountInputProps) {
  const displayValue = value > 0 ? String(value) : "";

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="numeric"
      autoComplete="off"
      spellCheck={false}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      value={displayValue}
      onChange={(event) => onChange(parseRupeeMajorInput(event.target.value))}
      className={cn(className)}
    />
  );
}
