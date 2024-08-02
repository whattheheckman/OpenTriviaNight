import { Label, TextInput } from "flowbite-react";

export default function LabeledTextInput({ className, label, name, type, value, onChange }: { className?: string | undefined, label: string, name: string, type: React.HTMLInputTypeAttribute, value: string | number, onChange: React.ChangeEventHandler<HTMLInputElement> }) {
    return (
        <div className={`flex flex-col ${className}`}>
            <Label value={label} />
            <TextInput id={name} name={name} type={type} required value={value} onChange={onChange} sizing="sm" />
        </div>
    )
}