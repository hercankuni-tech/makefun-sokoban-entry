// sokoban-solver-01 entry (harness program/v1): answers every instance of a set in one run.
//
// Each /input/<id>/level.txt is read, solved push-optimally (P*), and the moves written to /output/<id>/solution.txt in
// LURD (an upper letter marks a push; the checker replays and does not read the case). A level solved in P* pushes
// scores its full 1,000 points.
//
// The solve is room by room over the whole board: make.fun's generator lays rooms off a hallway and a box pushed
// through a door can never come back, so each room's optimum adds to the level's P* and solving one room at a time
// meets its positions, not the product of them all. Each room's search is A* over pushes (solver.mjs) with a
// pull-distance heuristic and deadlock pruning. Nothing reads the clock, so two runs write the same bytes.
//
// The wall budget is spent by work, not time: each room's search stops at ROOM_STATES closed states, which keeps the
// set of five well inside the 60 seconds.

import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseLevel, packLevel, solveByRooms } from './solver.mjs';

const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
/** The most states one room's search closes before it gives up: work, never the clock. */
const ROOM_STATES = 1_000_000;

/** The moves that solve a level in as few pushes as it takes: a string of u, d, l and r (an upper letter a push). */
function solve(text: string): string {
  const level = packLevel(parseLevel(text));
  const solved = solveByRooms(level, ROOM_STATES);
  return solved === null ? '' : solved.moves;
}

const instances = readdirSync(I, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
for (const id of instances) {
  const moves = solve(readFileSync(join(I, id, 'level.txt'), 'utf8'));
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'solution.txt'), `${moves}\n`);
}
