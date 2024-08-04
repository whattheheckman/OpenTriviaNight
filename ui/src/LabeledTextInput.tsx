import { Label, TextInput } from "flowbite-react";

export default function LabeledTextInput({ className, label, name, type, value, onChange, placeholder, errorMessage }: { className?: string | undefined, label: string, name: string, type: React.HTMLInputTypeAttribute, value: string | number, onChange: React.ChangeEventHandler<HTMLInputElement>, placeholder?: string | undefined, errorMessage?: string }) {
    return (
        <div className={`flex flex-col ${className}`}>
            <Label value={label} />
            <TextInput id={name} name={name} type={type} required value={value} onChange={onChange} sizing="sm" step="100" placeholder={placeholder} color={errorMessage ? "failure" : ""} helperText={<span>{errorMessage}</span>} />
        </div>
    )
}