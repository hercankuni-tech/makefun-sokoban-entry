# sokoban-pstar

A Sokoban solver for make.fun's `sokoban-solver-01-run-20261121` bounty (harness `program/v1`).

It solves every instance **push-optimally**: a level takes exactly its P* pushes, which the checker
scores 1,000 points. The entry is `main.ts` at the repository root plus `solver.mjs`, the search core.

## How it works

`make.fun`'s generator lays rooms off a one-square hallway; a box pushed through a door can never come
back. So each room is a separate problem and the rooms' push optima add up to the level's P*. The
solver cuts the level into rooms along the dead squares of the player's row, solves each room on its
own (with the other rooms' boxes standing as walls), and concatenates the walks.

Each room's search is A* over **pushes**, not moves:

- **State** = the boxes' squares plus the player's reachable region (named by its lowest square), so
  positions the player can walk between are one state.
- **Cost** = pushes made. **Heuristic** = each box's BFS push distance to its nearest goal, summed. One
  push moves one box one square and costs one, so the estimate never overestimates and the first
  solution found is push-optimal.
- **Visited set** = `(boxes, region)` keys in a `Map`, which collapses transpositions.
- **Deadlock pruning** = dead squares (no push alone reaches a goal, flagged by the same BFS) and frozen
  2x2 blocks of walls and boxes holding a box off its goal. Neither prunes a solvable position.

Ties break on the larger `g` and every array is filled in square order, so the answer is identical on
every run — the harness runs the entry twice and requires byte-identical output, so the code reads no
clock and no environment variation.

The `60 s` wall budget across the 5 instances is spent by work, not time: each room's search stops at
`ROOM_STATES` closed states. On 20 freshly drawn practice-like sets the whole set took 0.25-0.8 s.

## Running

```
mkdir -p out
MAKEFUN_INPUT_DIR=<kit>/practice/input MAKEFUN_OUTPUT_DIR=out node --experimental-strip-types main.ts
```

On the grader's Node 22.23 (which strips types natively) `node /bot/main.ts` needs no flag. The entry
reads `/input/<id>/level.txt` and writes `/output/<id>/solution.txt`, the moves in LURD, an upper letter
marking a push.

## Verification

On the kit's practice set, replaying the answers with the checker's own rules scores 1,000,000 /
1,000,000: all five instances solved in exactly P* pushes (13, 16, 29, 47, 60). Over 20 sets freshly
drawn from the kit's own generator, 100/100 instances solved at P*.

Licensed MIT.
