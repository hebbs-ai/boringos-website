"use client";

import { useEffect, useRef } from "react";

/**
 * BoringOS Hero — Pac-Man simulation.
 *
 * A real arcade-style Pac-Man playing out across the hero:
 *   - procedurally generated grid maze (long corridors, intersections)
 *   - 2 Pac-Men hunting for dots + power pellets, using look-ahead AI
 *   - 4 Ghosts in classic Blinky / Pinky / Inky / Clyde colors
 *     cycling between scatter mode (head to home corner) and chase
 *     mode (greedy pursuit of nearest Pac)
 *   - power-pellet frightened mode: ghosts turn blue, slow down,
 *     flash before recovering, and Pac-Men eat them for points
 *     (eaten ghosts return to maze center as floating eyes, very fast)
 *   - dots regenerate when the maze runs dry
 *   - mouse hover lights up the maze under the cursor
 *
 * Sub-second decisions happen per intersection so the field always
 * feels alive without being distracting under the hero copy.
 */
export function HeroCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // ── Constants ──────────────────────────────────────────────────
    const CELL = 28;

    const PAC_COLORS = [
      [255, 230, 60],   // classic yellow
      [0, 255, 136],    // BoringOS green
      [255, 140, 40],   // tangerine
      [180, 230, 255],  // ice blue
    ];

    const GHOST_COLORS = [
      [255, 60, 80],    // Blinky (red)
      [255, 150, 200],  // Pinky
      [80, 220, 255],   // Inky (cyan)
      [255, 170, 70],   // Clyde (orange)
      [140, 100, 255],  // Funky (purple)
      [180, 240, 110],  // Sue (lime)
    ];

    const FRIGHTENED = [60, 110, 255];
    const WALL_RGB = [40, 100, 255];

    type Dir = "up" | "down" | "left" | "right";
    const DIRS: Dir[] = ["up", "down", "left", "right"];
    const DELTA: Record<Dir, [number, number]> = {
      up: [0, -1],
      down: [0, 1],
      left: [-1, 0],
      right: [1, 0],
    };
    const OPP: Record<Dir, Dir> = {
      up: "down",
      down: "up",
      left: "right",
      right: "left",
    };

    const WALL = 0;
    const EMPTY = 1;
    const DOT = 2;
    const PELLET = 3;

    interface Entity {
      col: number; row: number;       // cell coords (integer)
      px: number; py: number;         // pixel coords (smooth)
      dir: Dir;
      speed: number;                  // cells per second
      color: number[];
    }
    interface Pac extends Entity {
      kind: "pac";
      alive: boolean;
      respawnAt: number;
      startCol: number;
      startRow: number;
    }
    interface Ghost extends Entity {
      kind: "ghost";
      baseColor: number[];
      mode: "chase" | "scatter" | "frightened" | "eaten";
      scatterCol: number;
      scatterRow: number;
      homeCol: number;
      homeRow: number;
    }

    // ── State ──────────────────────────────────────────────────────
    let W = 0, H = 0;
    let cols = 0, rows = 0;
    let maze: number[][] = [];
    let pacs: Pac[] = [];
    let ghosts: Ghost[] = [];
    const mouse = { x: -9999, y: -9999 };
    let time = 0;
    let frightenedUntil = 0;
    let lastTime = performance.now();
    let rafId = 0;

    // ── Maze generation ────────────────────────────────────────────
    function inBounds(c: number, r: number) {
      return c >= 0 && c < cols && r >= 0 && r < rows;
    }
    function isPath(c: number, r: number) {
      return inBounds(c, r) && maze[r][c] !== WALL;
    }

    function generateMaze() {
      maze = Array.from({ length: rows }, () => Array(cols).fill(WALL));

      // Horizontal corridors every 3 rows
      for (let r = 2; r < rows - 1; r += 3) {
        for (let c = 1; c < cols - 1; c++) maze[r][c] = DOT;
      }
      // Vertical corridors every 4 cols
      for (let c = 2; c < cols - 1; c += 4) {
        for (let r = 1; r < rows - 1; r++) maze[r][c] = DOT;
      }

      // A few extra random openings — break the strict grid
      const extras = Math.floor((cols * rows) * 0.015);
      for (let i = 0; i < extras; i++) {
        const c = 1 + Math.floor(Math.random() * (cols - 2));
        const r = 1 + Math.floor(Math.random() * (rows - 2));
        if (maze[r][c] !== WALL) continue;
        // Open only if 2+ neighbors are path (avoid creating dead pockets)
        let n = 0;
        if (isPath(c - 1, r)) n++;
        if (isPath(c + 1, r)) n++;
        if (isPath(c, r - 1)) n++;
        if (isPath(c, r + 1)) n++;
        if (n >= 2) maze[r][c] = DOT;
      }

      // Drop a small pillar every now and then INSIDE corridors so
      // long straights get broken up (more visual interest, more AI choices)
      const blocks = Math.floor((cols * rows) * 0.004);
      for (let i = 0; i < blocks; i++) {
        const c = 2 + Math.floor(Math.random() * (cols - 4));
        const r = 2 + Math.floor(Math.random() * (rows - 4));
        if (maze[r][c] === DOT) {
          // Don't seal off paths: require an alternate route nearby
          let pathNeighbors = 0;
          if (isPath(c - 1, r)) pathNeighbors++;
          if (isPath(c + 1, r)) pathNeighbors++;
          if (isPath(c, r - 1)) pathNeighbors++;
          if (isPath(c, r + 1)) pathNeighbors++;
          if (pathNeighbors >= 3) maze[r][c] = WALL;
        }
      }

      // Power pellets in the four corners (find nearest corridor cell)
      const targets: Array<[number, number]> = [
        [2, 2],
        [cols - 3, 2],
        [2, rows - 3],
        [cols - 3, rows - 3],
      ];
      for (const [tc, tr] of targets) {
        let best: [number, number] = [tc, tr];
        let bestDist = Infinity;
        for (let r = 1; r < rows - 1; r++) {
          for (let c = 1; c < cols - 1; c++) {
            if (maze[r][c] !== DOT) continue;
            const d = Math.abs(c - tc) + Math.abs(r - tr);
            if (d < bestDist) { bestDist = d; best = [c, r]; }
          }
        }
        maze[best[1]][best[0]] = PELLET;
      }
    }

    // ── AI ─────────────────────────────────────────────────────────
    function nearestPac(col: number, row: number): Pac | null {
      let best: Pac | null = null;
      let bestDist = Infinity;
      for (const p of pacs) {
        if (!p.alive) continue;
        const d = Math.abs(p.col - col) + Math.abs(p.row - row);
        if (d < bestDist) { bestDist = d; best = p; }
      }
      return best;
    }

    function pickDirForPac(p: Pac): Dir {
      const valid: Dir[] = [];
      for (const d of DIRS) {
        if (d === OPP[p.dir]) continue;
        const [dx, dy] = DELTA[d];
        if (isPath(p.col + dx, p.row + dy)) valid.push(d);
      }
      if (valid.length === 0) return OPP[p.dir];
      if (valid.length === 1) return valid[0];

      // Look ahead each option; prefer the one with a closer dot/pellet
      let best = valid[0];
      let bestScore = Infinity;
      for (const d of valid) {
        const [dx, dy] = DELTA[d];
        for (let i = 1; i < 15; i++) {
          const c = p.col + dx * i;
          const r = p.row + dy * i;
          if (!isPath(c, r)) break;
          const cell = maze[r][c];
          if (cell === DOT) {
            if (i < bestScore) { bestScore = i; best = d; }
            break;
          }
          if (cell === PELLET) {
            // Pellets are gold — heavy preference
            if (i - 5 < bestScore) { bestScore = i - 5; best = d; }
            break;
          }
        }
      }
      // 15% exploration so it doesn't lock into a loop
      if (Math.random() < 0.15) return valid[Math.floor(Math.random() * valid.length)];
      return best;
    }

    function pickDirForGhost(g: Ghost): Dir {
      const valid: Dir[] = [];
      for (const d of DIRS) {
        if (d === OPP[g.dir]) continue;
        const [dx, dy] = DELTA[d];
        if (isPath(g.col + dx, g.row + dy)) valid.push(d);
      }
      if (valid.length === 0) return OPP[g.dir];
      if (valid.length === 1) return valid[0];

      // Pick a target cell based on mode
      let tc = 0, tr = 0;
      if (g.mode === "eaten") {
        tc = g.homeCol; tr = g.homeRow;
      } else if (g.mode === "scatter") {
        tc = g.scatterCol; tr = g.scatterRow;
      } else if (g.mode === "frightened") {
        const p = nearestPac(g.col, g.row);
        if (p) {
          // pick direction that maximizes distance — invert the target
          tc = g.col * 2 - p.col;
          tr = g.row * 2 - p.row;
        } else {
          tc = g.col; tr = g.row;
        }
      } else {
        // chase
        const p = nearestPac(g.col, g.row);
        if (p) { tc = p.col; tr = p.row; }
        else { tc = g.col; tr = g.row; }
      }

      // Minimize Manhattan distance to target (Pinky/Inky personality
      // would add an offset; we keep it readable + cheap)
      let best = valid[0];
      let bestD = Infinity;
      for (const d of valid) {
        const [dx, dy] = DELTA[d];
        const nc = g.col + dx;
        const nr = g.row + dy;
        const dist = Math.abs(nc - tc) + Math.abs(nr - tr);
        if (dist < bestD) { bestD = dist; best = d; }
      }
      // Tiny bit of randomness so all four ghosts don't trace the same path
      if (Math.random() < 0.08) return valid[Math.floor(Math.random() * valid.length)];
      return best;
    }

    function pickInitialDir(col: number, row: number): Dir {
      const valid: Dir[] = [];
      for (const d of DIRS) {
        const [dx, dy] = DELTA[d];
        if (isPath(col + dx, row + dy)) valid.push(d);
      }
      return valid.length ? valid[Math.floor(Math.random() * valid.length)] : "right";
    }

    // ── Spawning ───────────────────────────────────────────────────
    function randomPathCell(): [number, number] {
      for (let i = 0; i < 200; i++) {
        const c = 1 + Math.floor(Math.random() * (cols - 2));
        const r = 1 + Math.floor(Math.random() * (rows - 2));
        if (maze[r][c] !== WALL) return [c, r];
      }
      return [1, 1];
    }

    function initEntities() {
      pacs = [];
      ghosts = [];

      const numPacs = Math.min(PAC_COLORS.length, Math.max(2, Math.floor(cols / 25) + 1));
      for (let i = 0; i < numPacs; i++) {
        const [c, r] = randomPathCell();
        pacs.push({
          kind: "pac",
          col: c, row: r,
          px: c * CELL + CELL / 2,
          py: r * CELL + CELL / 2,
          dir: pickInitialDir(c, r),
          speed: 5.2,
          color: PAC_COLORS[i],
          alive: true,
          respawnAt: 0,
          startCol: c,
          startRow: r,
        });
      }

      const homeCol = Math.floor(cols / 2);
      const homeRow = Math.floor(rows / 2);
      const lo = (frac: number, max: number) => Math.max(1, Math.min(max - 2, Math.floor(max * frac)));
      // 6 scatter targets — four corners + two mid-edge anchors so the
      // extra ghosts don't pile up on top of each other.
      const corners: Array<[number, number]> = [
        [lo(0.08, cols), lo(0.08, rows)],
        [lo(0.92, cols), lo(0.08, rows)],
        [lo(0.08, cols), lo(0.92, rows)],
        [lo(0.92, cols), lo(0.92, rows)],
        [lo(0.50, cols), lo(0.08, rows)],
        [lo(0.50, cols), lo(0.92, rows)],
      ];

      const numGhosts = Math.min(GHOST_COLORS.length, Math.max(3, Math.floor(cols / 16) + 1));
      for (let i = 0; i < numGhosts; i++) {
        const [c, r] = randomPathCell();
        ghosts.push({
          kind: "ghost",
          col: c, row: r,
          px: c * CELL + CELL / 2,
          py: r * CELL + CELL / 2,
          dir: pickInitialDir(c, r),
          speed: 4.0,
          color: GHOST_COLORS[i],
          baseColor: GHOST_COLORS[i],
          mode: "scatter",
          scatterCol: corners[i % corners.length][0],
          scatterRow: corners[i % corners.length][1],
          homeCol,
          homeRow,
        });
      }
    }

    // ── Update ─────────────────────────────────────────────────────
    function update(dt: number) {
      time += dt;

      // Scatter/chase cycle: scatter 6s, chase 18s, repeat
      const cycle = time % 24;
      const wantScatter = cycle < 6;

      // Refill dots if the maze is almost clean
      let dotCount = 0;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (maze[r][c] === DOT || maze[r][c] === PELLET) dotCount++;
        }
      }
      if (dotCount < 8) {
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (maze[r][c] === EMPTY) maze[r][c] = DOT;
          }
        }
        // re-add 4 pellets
        const targets: Array<[number, number]> = [
          [2, 2], [cols - 3, 2], [2, rows - 3], [cols - 3, rows - 3],
        ];
        for (const [tc, tr] of targets) {
          let best: [number, number] = [tc, tr];
          let bestDist = Infinity;
          for (let r = 1; r < rows - 1; r++) {
            for (let c = 1; c < cols - 1; c++) {
              if (maze[r][c] !== DOT) continue;
              const d = Math.abs(c - tc) + Math.abs(r - tr);
              if (d < bestDist) { bestDist = d; best = [c, r]; }
            }
          }
          maze[best[1]][best[0]] = PELLET;
        }
      }

      // Update ghost modes
      for (const g of ghosts) {
        if (g.mode === "eaten") {
          if (g.col === g.homeCol && g.row === g.homeRow) {
            g.mode = wantScatter ? "scatter" : "chase";
            g.speed = 4.0;
            g.color = g.baseColor;
          }
        } else if (g.mode === "frightened") {
          if (time > frightenedUntil) {
            g.mode = wantScatter ? "scatter" : "chase";
            g.speed = 4.0;
          }
        } else {
          g.mode = wantScatter ? "scatter" : "chase";
        }
      }

      const all: Entity[] = [...pacs, ...ghosts];
      for (const e of all) {
        const isPac = (e as Pac).kind === "pac";
        if (isPac && !(e as Pac).alive) {
          const p = e as Pac;
          if (time > p.respawnAt) {
            p.alive = true;
            p.col = p.startCol;
            p.row = p.startRow;
            p.px = p.col * CELL + CELL / 2;
            p.py = p.row * CELL + CELL / 2;
            p.dir = pickInitialDir(p.col, p.row);
          }
          continue;
        }

        const [dx, dy] = DELTA[e.dir];
        const targetX = (e.col + dx) * CELL + CELL / 2;
        const targetY = (e.row + dy) * CELL + CELL / 2;
        const move = e.speed * CELL * dt;
        const ddx = targetX - e.px;
        const ddy = targetY - e.py;
        e.px += Math.sign(ddx) * Math.min(move, Math.abs(ddx));
        e.py += Math.sign(ddy) * Math.min(move, Math.abs(ddy));

        if (Math.abs(e.px - targetX) < 0.5 && Math.abs(e.py - targetY) < 0.5) {
          e.col += dx;
          e.row += dy;
          e.px = targetX;
          e.py = targetY;

          if (isPac) {
            const p = e as Pac;
            const cell = maze[p.row][p.col];
            if (cell === DOT) {
              maze[p.row][p.col] = EMPTY;
            } else if (cell === PELLET) {
              maze[p.row][p.col] = EMPTY;
              frightenedUntil = time + 7;
              for (const g of ghosts) {
                if (g.mode !== "eaten") {
                  g.mode = "frightened";
                  g.speed = 2.6;
                }
              }
            }
            p.dir = pickDirForPac(p);
          } else {
            const g = e as Ghost;
            g.dir = pickDirForGhost(g);
            // Match speed to mode
            if (g.mode === "eaten") g.speed = 8.0;
            else if (g.mode === "frightened") g.speed = 2.6;
            else g.speed = 4.0;
          }
        }
      }

      // Collisions
      for (const p of pacs) {
        if (!p.alive) continue;
        for (const g of ghosts) {
          if (g.mode === "eaten") continue;
          const dx = p.px - g.px;
          const dy = p.py - g.py;
          if (dx * dx + dy * dy < (CELL * 0.55) ** 2) {
            if (g.mode === "frightened") {
              g.mode = "eaten";
              g.speed = 8.0;
              g.color = [180, 180, 200];
            } else {
              p.alive = false;
              p.respawnAt = time + 2.5;
            }
          }
        }
      }
    }

    // ── Render ─────────────────────────────────────────────────────
    function render() {
      // background
      ctx!.fillStyle = "#06060e";
      ctx!.fillRect(0, 0, W, H);

      // walls — only render wall cells that border a path (the "skin")
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (maze[r][c] !== WALL) continue;
          const adj =
            (r > 0 && maze[r - 1][c] !== WALL) ||
            (r < rows - 1 && maze[r + 1][c] !== WALL) ||
            (c > 0 && maze[r][c - 1] !== WALL) ||
            (c < cols - 1 && maze[r][c + 1] !== WALL);
          if (!adj) continue;

          // mouse reveal boost
          const wx = c * CELL + CELL / 2;
          const wy = r * CELL + CELL / 2;
          const mdx = wx - mouse.x;
          const mdy = wy - mouse.y;
          const md2 = mdx * mdx + mdy * mdy;
          const RAD = 220;
          const reveal = md2 < RAD * RAD ? (1 - Math.sqrt(md2) / RAD) : 0;

          const alpha = 0.14 + reveal * 0.42;
          ctx!.fillStyle = `rgba(${WALL_RGB[0]},${WALL_RGB[1]},${WALL_RGB[2]},${alpha})`;
          ctx!.fillRect(c * CELL + 3, r * CELL + 3, CELL - 6, CELL - 6);
        }
      }

      // dots + pellets
      ctx!.fillStyle = "rgba(255, 225, 175, 0.55)";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (maze[r][c] === DOT) {
            const x = c * CELL + CELL / 2;
            const y = r * CELL + CELL / 2;
            ctx!.beginPath();
            ctx!.arc(x, y, 1.7, 0, Math.PI * 2);
            ctx!.fill();
          }
        }
      }
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          if (maze[r][c] === PELLET) {
            const x = c * CELL + CELL / 2;
            const y = r * CELL + CELL / 2;
            const pulse = 0.7 + 0.3 * Math.sin(time * 5 + c + r);
            ctx!.beginPath();
            ctx!.arc(x, y, 7 * pulse, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(255, 230, 180, ${0.12 * pulse})`;
            ctx!.fill();
            ctx!.beginPath();
            ctx!.arc(x, y, 4.2, 0, Math.PI * 2);
            ctx!.fillStyle = "rgba(255, 235, 190, 0.95)";
            ctx!.fill();
          }
        }
      }

      // ghosts (below pacs)
      for (const g of ghosts) renderGhost(g);
      // pacs
      for (const p of pacs) {
        if (!p.alive) continue;
        renderPac(p);
      }
    }

    function renderPac(p: Pac) {
      const [dx, dy] = DELTA[p.dir];
      const angle = Math.atan2(dy, dx);
      const mouth = Math.abs(Math.sin(time * 11)) * 0.78;
      const radius = CELL * 0.42;

      const grad = ctx!.createRadialGradient(p.px, p.py, 0, p.px, p.py, radius * 3);
      grad.addColorStop(0, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0.22)`);
      grad.addColorStop(1, `rgba(${p.color[0]},${p.color[1]},${p.color[2]},0)`);
      ctx!.fillStyle = grad;
      ctx!.beginPath();
      ctx!.arc(p.px, p.py, radius * 3, 0, Math.PI * 2);
      ctx!.fill();

      ctx!.beginPath();
      ctx!.arc(p.px, p.py, radius, angle + mouth * 0.45, angle + Math.PI * 2 - mouth * 0.45);
      ctx!.lineTo(p.px, p.py);
      ctx!.closePath();
      ctx!.fillStyle = `rgb(${p.color[0]},${p.color[1]},${p.color[2]})`;
      ctx!.fill();

      // small eye perpendicular to direction
      const ea = angle - Math.PI / 2;
      const ex = p.px + Math.cos(ea) * radius * 0.45;
      const ey = p.py + Math.sin(ea) * radius * 0.45;
      ctx!.beginPath();
      ctx!.arc(ex, ey, 1.8, 0, Math.PI * 2);
      ctx!.fillStyle = "#06060e";
      ctx!.fill();
    }

    function renderGhost(g: Ghost) {
      const radius = CELL * 0.42;
      const x = g.px;
      const y = g.py;
      const eaten = g.mode === "eaten";
      const frightened = g.mode === "frightened";
      const remaining = frightenedUntil - time;
      const flashing = frightened && remaining < 2 && Math.floor(remaining * 5) % 2 === 0;

      const color = eaten
        ? [200, 200, 220]
        : frightened
          ? (flashing ? [255, 255, 255] : FRIGHTENED)
          : g.baseColor;

      if (!eaten) {
        // glow
        const grad = ctx!.createRadialGradient(x, y, 0, x, y, radius * 2.4);
        grad.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},0.18)`);
        grad.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`);
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(x, y, radius * 2.4, 0, Math.PI * 2);
        ctx!.fill();

        // body — semicircle top + scalloped skirt
        ctx!.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        ctx!.beginPath();
        ctx!.arc(x, y - radius * 0.15, radius, Math.PI, 0);

        const skirtY = y + radius * 0.7;
        const scallops = 4;
        const segW = (radius * 2) / scallops;
        const phase = time * 8 + (g.baseColor[0] / 30); // each ghost out of sync
        ctx!.lineTo(x + radius, skirtY);
        for (let i = 0; i < scallops; i++) {
          const startX = x + radius - i * segW;
          const midX = startX - segW / 2;
          const endX = startX - segW;
          const bump = Math.sin(phase + i) * 2.4;
          ctx!.lineTo(midX, skirtY - 4 + bump);
          ctx!.lineTo(endX, skirtY);
        }
        ctx!.closePath();
        ctx!.fill();
      }

      // eyes
      const [dx, dy] = DELTA[g.dir];
      const eyeR = radius * 0.26;
      const pupilR = radius * 0.14;
      const eyeOff = radius * 0.34;
      for (const side of [-1, 1]) {
        const ex = x + side * eyeOff;
        const ey = y - radius * 0.18;
        ctx!.fillStyle = "#ffffff";
        ctx!.beginPath();
        ctx!.arc(ex, ey, eyeR, 0, Math.PI * 2);
        ctx!.fill();

        const px = ex + dx * (eyeR - pupilR) * 0.9;
        const py = ey + dy * (eyeR - pupilR) * 0.9;
        ctx!.fillStyle = frightened && !flashing ? "#0a0a40" : "#0a0a20";
        ctx!.beginPath();
        ctx!.arc(px, py, pupilR, 0, Math.PI * 2);
        ctx!.fill();
      }

      // frightened mouth squiggle
      if (frightened) {
        ctx!.strokeStyle = flashing ? "#ff5588" : "#ffffff";
        ctx!.lineWidth = 1.6;
        ctx!.beginPath();
        for (let i = 0; i <= 8; i++) {
          const wx = x - radius * 0.55 + (radius * 1.1 / 8) * i;
          const wy = y + radius * 0.3 + (i % 2 === 0 ? -2 : 2);
          if (i === 0) ctx!.moveTo(wx, wy); else ctx!.lineTo(wx, wy);
        }
        ctx!.stroke();
      }
    }

    function loop() {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;
      update(dt);
      render();
      rafId = requestAnimationFrame(loop);
    }

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      const r = canvas!.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas!.width = W * dpr;
      canvas!.height = H * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

      cols = Math.max(8, Math.floor(W / CELL));
      rows = Math.max(8, Math.floor(H / CELL));

      generateMaze();
      initEntities();
    }

    function handleMouseMove(e: MouseEvent) {
      const r = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    }
    function handleMouseLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", resize);

    resize();
    lastTime = performance.now();
    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}
