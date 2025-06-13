import { HelperText, Label, TextInput, TextInputProps } from "flowbite-react";

export default function LabeledTextInput({
  className,
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  errorMessage,
  minLength,
  maxLength,
}: { className?: string | undefined; label: string; errorMessage?: string } & TextInputProps) {
  return (
    <div className={`flex flex-col ${className}`}>
      <Label>{label}</Label>
      <TextInput
        id={name}
        name={name}
        type={type}
        required
        value={value}
        onChange={onChange}
        sizing="sm"
        step="100"
        placeholder={placeholder}
        color={errorMessage ? "failure" : ""}
        minLength={minLength}
        maxLength={maxLength}
      />
      {errorMessage && <HelperText>{errorMessage}</HelperText>}
    </div>
  );
}
