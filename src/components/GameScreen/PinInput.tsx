import { NumberInput } from '../ui/NumberInput'

interface PinInputProps {
  onSubmit: (points: number) => void
}

export function PinInput({ onSubmit }: PinInputProps) {
  return <NumberInput onSubmit={onSubmit} variant="game" />
}
