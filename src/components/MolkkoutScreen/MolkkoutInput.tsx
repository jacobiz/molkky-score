import { NumberInput } from '../ui/NumberInput'

interface MolkkoutInputProps {
  onSubmit: (points: number) => void
}

export function MolkkoutInput({ onSubmit }: MolkkoutInputProps) {
  return <NumberInput onSubmit={onSubmit} variant="molkkout" />
}
