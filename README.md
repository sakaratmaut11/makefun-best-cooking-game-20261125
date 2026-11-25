# KEBAB NIGHTS — Vertical Spit Grill House

[![make.fun bounty](https://make.fun/badge/best-cooking-game-20261125-0137.svg)](https://make.fun/bounty/best-cooking-game-20261125-0137)
![rank](https://make.fun/badge/best-cooking-game-20261125-0137/sakaratmaut11/makefun-best-cooking-game-20261125/rank.svg)
![reward](https://make.fun/badge/best-cooking-game-20261125-0137/sakaratmaut11/makefun-best-cooking-game-20261125/reward.svg)

A night-market kebab stall under string lamps, open for one 180-second
shift. Orders land on the board — carve meat off the vertical spit,
warm the pita on the flat grill before it burns, build the wrap on the
assembly plate from the salad bins and sauce bottles, roll it onto the
pass and serve it while the guest's patience lasts. The rush deepens
every 45 seconds; three strikes and the night is over.

## Play it

Open `game/index.html` in a desktop browser, or serve it:

```sh
node serve.mjs   # http://127.0.0.1:8417/
```

- Click the spit (or Q) to carve; click the grill (or W) to warm a pita
  and again to plate it.
- Salad bins are keys 1–5, sauce bottles 6–8 — the ticket on the board
  says exactly what each wrap needs.
- R rolls the wrap onto the pass, Space serves it, Backspace clears
  the plate.

`main.ts` assembles the hand-in folder (game + screenshots) and stamps
`dossier.json` with the kit's `buildDossier`.

Bounty: https://make.fun/bounty/best-cooking-game-20261125-0137
