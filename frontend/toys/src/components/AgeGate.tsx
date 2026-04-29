import { useEffect, useState } from "react"

const AGE_GATE_KEY = "toys_age_gate"

type AgeGateState = "unknown" | "accepted" | "declined"

export default function AgeGate() {
  const [state, setState] = useState<AgeGateState>("unknown")

  useEffect(() => {
    const stored = window.localStorage.getItem(AGE_GATE_KEY)
    if (stored === "accepted" || stored === "declined") {
      setState(stored)
    }
  }, [])

  useEffect(() => {
    if (state === "unknown") return
    window.localStorage.setItem(AGE_GATE_KEY, state)
  }, [state])

  useEffect(() => {
    document.body.style.overflow = state === "unknown" ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [state])

  if (state === "accepted") {
    return null
  }

  if (state === "declined") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
        <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
        <div className="lux-card-elevated relative w-full max-w-lg p-6 sm:p-8 text-center">
          <p className="lux-chip lux-chip-accent mx-auto w-fit">Access restricted</p>
          <h1 className="lux-title mt-4 text-3xl sm:text-4xl">This site is for adults only</h1>
          <p className="lux-subtitle mt-3">
            You indicated that you are under 18, so access to this store is not available.
          </p>
          <a
            href="https://www.google.com"
            className="lux-primary mt-6 inline-flex rounded-full px-5 py-3"
          >
            Leave site
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/85 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="age-gate-title"
        className="lux-card-elevated relative w-full max-w-xl p-6 sm:p-8"
      >
        <p className="lux-chip lux-chip-accent w-fit">Age check</p>
        <h1 id="age-gate-title" className="lux-title mt-4 text-3xl sm:text-4xl">
          Are you 18 or older?
        </h1>
        <p className="lux-subtitle mt-3">
          This store contains adult-themed products and is intended for adults only.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => setState("accepted")}
            className="lux-primary w-full rounded-full px-5 py-3"
          >
            Yes, I am 18+
          </button>
          <button
            type="button"
            onClick={() => setState("declined")}
            className="lux-secondary w-full rounded-full px-5 py-3"
          >
            No, I am under 18
          </button>
        </div>
      </div>
    </div>
  )
}
