import { useState, useEffect } from 'react'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { formatCurrency } from '@/lib/utils'

interface GameParametersProps {
  slots: number
  setSlots: (slots: number) => void
  targetSlot: number
  setTargetSlot: (slot: number) => void
  costPerSpin: number
  setCostPerSpin: (cost: number) => void
  nonTargetPrize: number
  setNonTargetPrize: (prize: number) => void
  targetPrize: number
  setTargetPrize: (prize: number) => void
}

const GameParameters = ({
  slots,
  setSlots,
  targetSlot,
  setTargetSlot,
  costPerSpin,
  setCostPerSpin,
  nonTargetPrize,
  setNonTargetPrize,
  targetPrize,
  setTargetPrize
}: GameParametersProps) => {
  const [targetSlotError, setTargetSlotError] = useState('')

  // Validate that target slot is within range whenever slots or targetSlot changes
  useEffect(() => {
    if (targetSlot > slots) {
      setTargetSlotError(`Target slot must be between 1 and ${slots}`)
    } else {
      setTargetSlotError('')
    }
  }, [slots, targetSlot])

  const handleSlotsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setSlots(value)
    }
  }

  const handleTargetSlotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value > 0) {
      setTargetSlot(value)
    }
  }

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setCostPerSpin(value)
    }
  }

  const handleNonTargetPrizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setNonTargetPrize(value)
    }
  }

  const handleTargetPrizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value)
    if (!isNaN(value) && value >= 0) {
      setTargetPrize(value)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="slots">Number of Slots</Label>
        <Input
          id="slots"
          type="number"
          min="2"
          value={slots}
          onChange={handleSlotsChange}
        />
        <p className="text-xs text-muted-foreground">Total slots on the wheel</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="targetSlot">Target Slot</Label>
        <Input
          id="targetSlot"
          type="number"
          min="1"
          max={slots}
          value={targetSlot}
          onChange={handleTargetSlotChange}
          className={targetSlotError ? "border-red-500" : ""}
        />
        {targetSlotError && (
          <p className="text-xs text-red-500">{targetSlotError}</p>
        )}
        <p className="text-xs text-muted-foreground">The slot you're betting on</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="costPerSpin">Cost per Spin</Label>
        <Input
          id="costPerSpin"
          type="number"
          min="0"
          value={costPerSpin}
          onChange={handleCostChange}
        />
        <p className="text-xs text-muted-foreground">Current: {formatCurrency(costPerSpin)}</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="nonTargetPrize">Non-Target Prize</Label>
        <Input
          id="nonTargetPrize"
          type="number"
          min="0"
          value={nonTargetPrize}
          onChange={handleNonTargetPrizeChange}
        />
        <p className="text-xs text-muted-foreground">Current: {formatCurrency(nonTargetPrize)}</p>
      </div>

      <div className="grid gap-2">
        <Label htmlFor="targetPrize">Target Prize</Label>
        <Input
          id="targetPrize"
          type="number"
          min="0"
          value={targetPrize}
          onChange={handleTargetPrizeChange}
        />
        <p className="text-xs text-muted-foreground">Current: {formatCurrency(targetPrize)}</p>
      </div>
    </div>
  )
}

export default GameParameters
