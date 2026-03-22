import { seededRandom, rollDice } from "../core/rng"

describe("seededRandom", () => {
  it("produces deterministic results for the same seed", () => {
    const rng1 = seededRandom("test-seed")
    const rng2 = seededRandom("test-seed")

    for (let i = 0; i < 10; i++) {
      expect(rng1()).toBe(rng2())
    }
  })

  it("produces different results for different seeds", () => {
    const rng1 = seededRandom("seed-a")
    const rng2 = seededRandom("seed-b")

    const values1 = Array.from({ length: 10 }, () => rng1())
    const values2 = Array.from({ length: 10 }, () => rng2())

    expect(values1).not.toEqual(values2)
  })

  it("produces values in [0, 1)", () => {
    const rng = seededRandom("range-test")
    for (let i = 0; i < 100; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe("rollDice", () => {
  it("rolls deterministically for the same seed", () => {
    const result1 = rollDice("2d6", "combat-seed")
    const result2 = rollDice("2d6", "combat-seed")
    expect(result1).toBe(result2)
  })

  it("rolls values within the expected range", () => {
    for (let i = 0; i < 20; i++) {
      const result = rollDice("1d6", `seed-${i}`)
      expect(result).toBeGreaterThanOrEqual(1)
      expect(result).toBeLessThanOrEqual(6)
    }
  })

  it("throws on invalid formula", () => {
    expect(() => rollDice("invalid", "seed")).toThrow()
  })

  it("sums multiple dice", () => {
    const result = rollDice("3d1", "fixed-seed")
    expect(result).toBe(3)
  })
})
