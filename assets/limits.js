/* Official figures. Checked 2026-10-14. Sources listed on index.html. */
window.LIMITS = {
  checked: "2026-10-14",
  years: {
    "2026": { hsaSelf: 4400, hsaFamily: 8750, hdhpMinDedSelf: 1700, hdhpMinDedFamily: 3400, hdhpOopSelf: 8500, hdhpOopFamily: 17000, affordPct: 0.0996,
              fpl: { base: 15650, add: 5500, src: "2025 HHS poverty guidelines (used for 2026 coverage)" },
              ptcTable: [[0,133,0.0210,0.0210],[133,150,0.0314,0.0419],[150,200,0.0419,0.0660],[200,250,0.0660,0.0844],[250,300,0.0844,0.0996],[300,400,0.0996,0.0996]],
              src: "IRS Rev. Proc. 2025-19 (HSA/HDHP); IRS Rev. Proc. 2025-25 (9.96%)" },
    "2027": { hsaSelf: 4500, hsaFamily: 9000, hdhpMinDedSelf: 1750, hdhpMinDedFamily: 3500, hdhpOopSelf: 8700, hdhpOopFamily: 17400, affordPct: 0.1022,
              fpl: { base: 15960, add: 5680, src: "2026 HHS poverty guidelines (used for 2027 coverage)" },
              ptcTable: [[0,133,0.0215,0.0215],[133,150,0.0323,0.0430],[150,200,0.0430,0.0678],[200,250,0.0678,0.0866],[250,300,0.0866,0.1022],[300,400,0.1022,0.1022]],
              src: "IRS Rev. Proc. 2026-24 (HSA/HDHP); IRS Rev. Proc. 2026-26 (10.22%)" }
  },
  hsaCatchUp55: 1000,     // IRC 223(b)(3)
  fica: 0.0765,           // 6.2% Social Security + 1.45% Medicare employee share (SSA)
  cobraPct: 1.02,         // DOL: up to 102% of plan cost
  cobraDisabilityPct: 1.50 // DOL: up to 150% during disability extension months 19-29
};
