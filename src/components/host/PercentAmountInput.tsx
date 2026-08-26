import { parsePercentInput } from "@/lib/money";
import { cn } from "@/lib/utils";

type PercentAmountInputProps = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
  readOnly?: boolean;
  placeholder?: string;
  className?: string;
  id?: string;
  name?: string;
};

/** Text input for percentages — matches RupeeAmountInput styling (no number spinners). */
export function PercentAmountInput({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  placeholder = "0",
  className,
  id,
  name,
}: PercentAmountInputProps) {
  const displayValue = value > 0 ? String(value) : "";

  return (
    <input
      id={id}
      name={name}
      type="text"
      inputMode="decimal"
      autoComplete="off"
      spellCheck={false}
      disabled={disabled}
      readOnly={readOnly}
      placeholder={placeholder}
      value={displayValue}
      onChange={(event) => onChange(parsePercentInput(event.target.value))}
      className={cn(className)}
    />
  );
}
