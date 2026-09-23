/**
 * Simplified interactive ontology graph for the case study page.
 * Interaction mirrors the live workbench: click nodes/edges, arrows, focus dimming, detail card.
 */
(function () {
  const frame = document.querySelector(".case-onto-graph__frame");
  if (!frame) return;

  const kindLabels = {
    type: "Test type",
    case: "Test case",
    condition: "Condition",
    action: "Action",
    expectation: "Expectation",
  };

  const kindColor = {
    type: "#14C9C9",
    case: "#F7BA1E",
    condition: "#8D4EDA",
    action: "#8D4EDA",
    expectation: "#8D4EDA",
  };

  const kindR = {
    type: 14,
    case: 10,
    condition: 6.5,
    action: 6.5,
    expectation: 6.5,
  };

  const relationLabels = {
    contains: "Contains case",
    condition: "Precondition",
    action: "Action",
    expectation: "Expectation",
  };

  const nodes = [
    { id: "type:voice", kind: "type", label: "Voice Control" },
    {
      id: "case:voice",
      kind: "case",
      label: "Voice drive mode · personalized",
      typeLabel: "Voice Control",
    },
    { id: "cond:voice:0", kind: "condition", label: "Speed 120 · power mode" },
    { id: "cond:voice:1", kind: "condition", label: "Rear-left wake" },
    { id: "type:input", kind: "type", label: "Input Method" },
    {
      id: "case:input",
      kind: "case",
      label: "Media search while driving",
      typeLabel: "Input Method",
    },
    { id: "cond:input:0", kind: "condition", label: "Run · 30 km/h" },
    { id: "act:input:0", kind: "action", label: "Open media search" },
    { id: "type:ac", kind: "type", label: "AC Memory" },
    {
      id: "case:ac",
      kind: "case",
      label: "AC settings across accounts",
      typeLabel: "AC Memory",
    },
    { id: "cond:ac:0", kind: "condition", label: "AC on" },
    { id: "act:ac:0", kind: "action", label: "Unlock with other account" },
    { id: "type:keys", kind: "type", label: "Shortcut Keys" },
    {
      id: "case:keys",
      kind: "case",
      label: "Pet mode shortcut on",
      typeLabel: "Shortcut Keys",
    },
    { id: "cond:keys:0", kind: "condition", label: "Run · fast charging" },
    { id: "act:keys:0", kind: "action", label: "Tap Pet Mode shortcut" },
  ];

  const edges = [
    { id: "e1", source: "type:voice", target: "case:voice", relation: "contains" },
    { id: "e2", source: "case:voice", target: "cond:voice:0", relation: "condition" },
    { id: "e3", source: "case:voice", target: "cond:voice:1", relation: "condition" },
    { id: "e4", source: "type:input", target: "case:input", relation: "contains" },
    { id: "e5", source: "case:input", target: "cond:input:0", relation: "condition" },
    { id: "e6", source: "case:input", target: "act:input:0", relation: "action" },
    { id: "e7", source: "type:ac", target: "case:ac", relation: "contains" },
    { id: "e8", source: "case:ac", target: "cond:ac:0", relation: "condition" },
    { id: "e9", source: "case:ac", target: "act:ac:0", relation: "action" },
    { id: "e10", source: "type:keys", target: "case:keys", relation: "contains" },
    { id: "e11", source: "case:keys", target: "cond:keys:0", relation: "condition" },
    { id: "e12", source: "case:keys", target: "act:keys:0", relation: "action" },
  ];

  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const casesByType = {};
  const detailsByCase = {};
  edges.forEach((edge) => {
    const s = byId[edge.source];
    const t = byId[edge.target];
    if (s.kind === "type" && t.kind === "case") {
      (casesByType[s.id] || (casesByType[s.id] = [])).push(t.id);
    } else if (s.kind === "case") {
      (detailsByCase[s.id] || (detailsByCase[s.id] = [])).push(t.id);
    }
  });

  const typeNodes = nodes.filter((n) => n.kind === "type");
  const placed = {};
  const ring = 168;
  typeNodes.forEach((typeNode, typeIndex) => {
    const angle = (typeIndex / typeNodes.length) * Math.PI * 2 - Math.PI / 2;
    placed[typeNode.id] = { x: Math.cos(angle) * ring, y: Math.sin(angle) * ring };
    const caseIds = casesByType[typeNode.id] || [];
    caseIds.forEach((caseId, caseIndex) => {
      const caseCount = Math.max(caseIds.length, 1);
      const petal = ((caseIndex - (caseCount - 1) / 2) / caseCount) * 0.55;
      const caseAngle = angle + petal;
      const caseRadius = ring - 52;
      placed[caseId] = {
        x: Math.cos(caseAngle) * caseRadius,
        y: Math.sin(caseAngle) * caseRadius,
      };
      const detailIds = detailsByCase[caseId] || [];
      detailIds.forEach((detailId, detailIndex) => {
        const spread =
          ((detailIndex - (detailIds.length - 1) / 2) / Math.max(detailIds.length, 1)) * 0.42;
        const detailAngle = caseAngle + spread;
        const detailRadius = caseRadius - 40 - (detailIndex % 2) * 8;
        placed[detailId] = {
          x: Math.cos(detailAngle) * detailRadius,
          y: Math.sin(detailAngle) * detailRadius,
        };
      });
    });
  });

  function esc(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function wrapLabel(label, max) {
    if (label.length <= max) return [label];
    if (label.includes(" · ")) return label.split(" · ");
    const mid = Math.ceil(label.length / 2);
    let i = label.lastIndexOf(" ", mid);
    if (i < 4) i = mid;
    return [label.slice(0, i).trim(), label.slice(i).trim()];
  }

  function nodeEdges(id) {
    return edges.filter((edge) => edge.source === id || edge.target === id);
  }

  function collectFocus(type, id) {
    const focusNodes = new Set();
    const focusEdges = new Set();
    if (!id) return { focusNodes, focusEdges };
    if (type === "node") {
      focusNodes.add(id);
      nodeEdges(id).forEach((edge) => {
        focusEdges.add(edge.id);
        focusNodes.add(edge.source);
        focusNodes.add(edge.target);
      });
    } else {
      const edge = edges.find((item) => item.id === id);
      if (edge) {
        focusEdges.add(edge.id);
        focusNodes.add(edge.source);
        focusNodes.add(edge.target);
      }
    }
    return { focusNodes, focusEdges };
  }

  const pad = 84;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  Object.values(placed).forEach((p) => {
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x);
    maxY = Math.max(maxY, p.y);
  });
  const width = Math.ceil(maxX - minX + pad * 2);
  const height = Math.ceil(maxY - minY + pad * 2 + 28);
  const ox = pad - minX;
  const oy = pad - minY;

  function edgeGeometryFromPoints(sourceId, targetId, points) {
    const a = points[sourceId];
    const b = points[targetId];
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const len = Math.hypot(dx, dy) || 1;
    const r1 = kindR[byId[sourceId].kind] || 6;
    const r2 = (kindR[byId[targetId].kind] || 6) + 5;
    return {
      x1: a.x + (dx / len) * r1,
      y1: a.y + (dy / len) * r1,
      x2: b.x - (dx / len) * r2,
      y2: b.y - (dy / len) * r2,
      mx: (a.x + b.x) / 2,
      my: (a.y + b.y) / 2,
    };
  }

  function clusterOf(nodeId) {
    const node = byId[nodeId];
    if (!node) return nodeId;
    if (node.kind === "type") return node.id;
    const incoming = edges.find((edge) => edge.target === nodeId);
    if (!incoming) return nodeId;
    return clusterOf(incoming.source);
  }

  const basePoints = {};
  nodes.forEach((node) => {
    const p = placed[node.id];
    basePoints[node.id] = { x: p.x + ox, y: p.y + oy };
  });

  const nodeMotion = {};
  nodes.forEach((node, index) => {
    const amp =
      node.kind === "type" ? 7 : node.kind === "case" ? 11 : 14;
    nodeMotion[node.id] = {
      phase: index * 1.37,
      speed: 0.55 + (index % 5) * 0.12,
      ampX: amp * (index % 2 === 0 ? 1 : 0.75),
      ampY: amp * (index % 3 === 0 ? 0.8 : 1.15),
    };
  });

  const clusterMotion = typeNodes.map((typeNode, index) => ({
    id: typeNode.id,
    phase: index * 1.9,
    speed: 0.28 + index * 0.05,
    ampX: 10 + index * 2,
    ampY: 12 - index * 1.5,
  }));
  const clusterMotionById = Object.fromEntries(clusterMotion.map((item) => [item.id, item]));

  frame.classList.add("case-onto-graph__frame--interactive");

  const canvas = document.createElement("div");
  canvas.className = "onto-canvas";
  canvas.setAttribute("role", "img");
  canvas.setAttribute("aria-label", "Interactive ontology graph");

  const card = document.createElement("aside");
  card.className = "onto-node-card";
  card.hidden = true;

  let edgeMarkup = "";
  edges.forEach((edge) => {
    const g = edgeGeometryFromPoints(edge.source, edge.target, basePoints);
    const rel = relationLabels[edge.relation] || edge.relation;
    edgeMarkup += `<g class="onto-edge-group" data-edge-id="${esc(edge.id)}" tabindex="0" role="button" aria-label="Relation ${esc(rel)}">
      <line class="onto-edge-hit" x1="${g.x1.toFixed(1)}" y1="${g.y1.toFixed(1)}" x2="${g.x2.toFixed(1)}" y2="${g.y2.toFixed(1)}"/>
      <line class="onto-edge" x1="${g.x1.toFixed(1)}" y1="${g.y1.toFixed(1)}" x2="${g.x2.toFixed(1)}" y2="${g.y2.toFixed(1)}" marker-end="url(#onto-arrow)"/>
      <text class="onto-edge-label" x="${g.mx.toFixed(1)}" y="${(g.my - 6).toFixed(1)}" text-anchor="middle">${esc(rel)}</text>
    </g>`;
  });

  let nodeMarkup = "";
  nodes.forEach((node) => {
    const p = basePoints[node.id];
    const r = kindR[node.kind];
    const color = kindColor[node.kind];
    const lines = wrapLabel(node.label, node.kind === "type" ? 15 : 18);
    const fs = node.kind === "type" ? 11 : node.kind === "case" ? 10 : 9;
    let text = "";
    lines.forEach((line, i) => {
      text += `<text data-line="${i}" x="${p.x.toFixed(1)}" y="${(p.y + r + 14 + i * 12).toFixed(1)}" text-anchor="middle" font-size="${fs}">${esc(line)}</text>`;
    });
    nodeMarkup += `<g class="onto-node" data-node-id="${esc(node.id)}" data-kind="${esc(node.kind)}" tabindex="0" role="button" aria-label="${esc(kindLabels[node.kind])}: ${esc(node.label)}">
      <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r}" fill="${color}"/>
      ${text}
    </g>`;
  });

  canvas.innerHTML = `<svg class="onto-graph-svg onto-graph-svg--live" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
    <defs>
      <marker id="onto-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="rgba(76, 96, 116, 0.55)"/>
      </marker>
      <marker id="onto-arrow-focus" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#14C9C9"/>
      </marker>
      <marker id="onto-arrow-dim" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#c5ccd4"/>
      </marker>
    </defs>
    <g class="onto-edges">${edgeMarkup}</g>
    <g class="onto-nodes">${nodeMarkup}</g>
  </svg>`;

  frame.insertBefore(canvas, frame.firstChild);
  frame.appendChild(card);

  const toolbar = document.createElement("div");
  toolbar.className = "onto-toolbar";
  toolbar.innerHTML = `
    <button type="button" data-onto-zoom="in" aria-label="Zoom in" title="Zoom in">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M7.2 2.2v10M2.2 7.2h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
    <button type="button" data-onto-zoom="out" aria-label="Zoom out" title="Zoom out">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M2.2 7.2h10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
    <button type="button" data-onto-pause aria-pressed="false" aria-label="Pause" title="Pause">
      <svg class="onto-icon-pause" viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6M11 3.2v9.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>
    </button>
    <button type="button" data-onto-reset aria-label="Reset view" title="Reset view">
      <svg viewBox="0 0 16 16" aria-hidden="true"><path d="M3.2 8a4.8 4.8 0 1 0 1.2-3.2" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/><path d="M3 2.6v2.8h2.8" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  `;
  frame.appendChild(toolbar);

  const svg = canvas.querySelector("svg");
  const nodeEls = Object.fromEntries(
    Array.from(svg.querySelectorAll(".onto-node")).map((el) => [el.getAttribute("data-node-id"), el])
  );
  const edgeEls = Object.fromEntries(
    Array.from(svg.querySelectorAll(".onto-edge-group")).map((el) => [
      el.getAttribute("data-edge-id"),
      el,
    ])
  );

  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let selected = { type: null, id: null };
  let frozen = false;
  let paused = false;
  const view = { scale: 1, x: 0, y: 0 };
  const minScale = 0.55;
  const maxScale = 2.6;

  function applyView() {
    const w = width / view.scale;
    const h = height / view.scale;
    const x = (width - w) / 2 + view.x;
    const y = (height - h) / 2 + view.y;
    svg.setAttribute("viewBox", `${x} ${y} ${w} ${h}`);
  }

  function setPaused(next) {
    paused = next;
    const button = toolbar.querySelector("[data-onto-pause]");
    button.setAttribute("aria-pressed", paused ? "true" : "false");
    button.setAttribute("aria-label", paused ? "Play" : "Pause");
    button.title = paused ? "Play" : "Pause";
    button.innerHTML = paused
      ? `<svg viewBox="0 0 16 16" aria-hidden="true"><polygon points="5.2,3.2 12.6,8 5.2,12.8"/></svg>`
      : `<svg viewBox="0 0 16 16" aria-hidden="true"><path d="M5 3.2v9.6M11 3.2v9.6" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>`;
  }

  toolbar.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    if (button.dataset.ontoZoom === "in") {
      view.scale = Math.min(maxScale, view.scale * 1.2);
      applyView();
    } else if (button.dataset.ontoZoom === "out") {
      view.scale = Math.max(minScale, view.scale / 1.2);
      applyView();
    } else if (button.hasAttribute("data-onto-pause")) {
      setPaused(!paused);
    } else if (button.hasAttribute("data-onto-reset")) {
      view.scale = 1;
      view.x = 0;
      view.y = 0;
      applyView();
    }
  });

  function livePoints(time) {
    const t = time * 0.001;
    const points = {};
    const clusterOffset = {};
    clusterMotion.forEach((motion) => {
      const wave = t * motion.speed + motion.phase;
      clusterOffset[motion.id] = {
        x: Math.sin(wave) * motion.ampX,
        y: Math.cos(wave * 0.9) * motion.ampY,
      };
    });
    nodes.forEach((node) => {
      const base = basePoints[node.id];
      if (reduceMotion) {
        points[node.id] = { x: base.x, y: base.y };
        return;
      }
      const motion = nodeMotion[node.id];
      const cluster = clusterOffset[clusterOf(node.id)] || { x: 0, y: 0 };
      const wave = t * motion.speed + motion.phase;
      points[node.id] = {
        x: base.x + cluster.x + Math.sin(wave) * motion.ampX,
        y: base.y + cluster.y + Math.cos(wave * 1.15 + 0.4) * motion.ampY,
      };
    });
    return points;
  }

  function renderMotion(time) {
    if (frozen || paused) return;
    const points = livePoints(time);
    nodes.forEach((node) => {
      const el = nodeEls[node.id];
      if (!el) return;
      const p = points[node.id];
      const r = kindR[node.kind];
      const circle = el.querySelector("circle");
      if (circle) {
        circle.setAttribute("cx", p.x.toFixed(1));
        circle.setAttribute("cy", p.y.toFixed(1));
      }
      el.querySelectorAll("text").forEach((textEl) => {
        const line = Number(textEl.getAttribute("data-line") || 0);
        textEl.setAttribute("x", p.x.toFixed(1));
        textEl.setAttribute("y", (p.y + r + 14 + line * 12).toFixed(1));
      });
    });
    edges.forEach((edge) => {
      const el = edgeEls[edge.id];
      if (!el) return;
      const g = edgeGeometryFromPoints(edge.source, edge.target, points);
      el.querySelectorAll("line").forEach((line) => {
        line.setAttribute("x1", g.x1.toFixed(1));
        line.setAttribute("y1", g.y1.toFixed(1));
        line.setAttribute("x2", g.x2.toFixed(1));
        line.setAttribute("y2", g.y2.toFixed(1));
      });
      const label = el.querySelector(".onto-edge-label");
      if (label) {
        label.setAttribute("x", g.mx.toFixed(1));
        label.setAttribute("y", (g.my - 6).toFixed(1));
      }
    });
  }

  if (!reduceMotion) {
    const tick = (time) => {
      renderMotion(time);
      window.requestAnimationFrame(tick);
    };
    window.requestAnimationFrame(tick);
  }

  function clearFocus() {
    selected = { type: null, id: null };
    frozen = false;
    svg.classList.remove("is-focused");
    svg.querySelectorAll(".onto-node, .onto-edge-group").forEach((el) => {
      el.classList.remove("is-focus", "is-dim", "is-selected");
    });
    card.hidden = true;
    card.innerHTML = "";
    svg.querySelectorAll(".onto-edge").forEach((line) => {
      line.setAttribute("marker-end", "url(#onto-arrow)");
    });
  }

  function applyFocus(type, id) {
    selected = { type, id };
    frozen = true;
    const focusNodes = new Set();
    const focusEdges = new Set();
    if (type === "node") {
      focusNodes.add(id);
    } else if (type === "edge") {
      const edge = edges.find((item) => item.id === id);
      if (edge) {
        focusEdges.add(edge.id);
        focusNodes.add(edge.source);
        focusNodes.add(edge.target);
      }
    }
    svg.classList.add("is-focused");
    svg.querySelectorAll(".onto-node").forEach((el) => {
      const nid = el.getAttribute("data-node-id");
      const on = focusNodes.has(nid);
      el.classList.toggle("is-focus", on);
      el.classList.toggle("is-dim", !on);
      el.classList.toggle("is-selected", type === "node" && nid === id);
    });
    svg.querySelectorAll(".onto-edge-group").forEach((el) => {
      const eid = el.getAttribute("data-edge-id");
      const on = focusEdges.has(eid);
      el.classList.toggle("is-focus", on);
      el.classList.toggle("is-dim", !on);
      el.classList.toggle("is-selected", type === "edge" && eid === id);
      const line = el.querySelector(".onto-edge");
      if (line) {
        line.setAttribute(
          "marker-end",
          on ? "url(#onto-arrow-focus)" : "url(#onto-arrow-dim)"
        );
      }
    });
  }

  function showNodeCard(node) {
    const connections = nodeEdges(node.id);
    const rows = connections
      .map((edge) => {
        const outgoing = edge.source === node.id;
        const other = byId[outgoing ? edge.target : edge.source];
        const rel = relationLabels[edge.relation] || edge.relation;
        return `<button type="button" class="onto-conn" data-edge-id="${esc(edge.id)}">
          <span class="onto-conn__dir">${outgoing ? "→" : "←"}</span>
          <span class="onto-conn__main">
            <span><em>Relation</em> ${esc(rel)}</span>
            <span><em>Node</em> ${esc(other.label)}</span>
          </span>
        </button>`;
      })
      .join("");

    card.innerHTML = `
      <div class="onto-node-card__head">
        <p class="onto-node-card__type">${esc(kindLabels[node.kind] || "Node")}</p>
        <button type="button" class="onto-node-card__close" aria-label="Close">×</button>
      </div>
      <h3 class="onto-node-card__title">${esc(node.label)}</h3>
      <div class="onto-node-card__prop"><span>ID</span><b>${esc(node.id)}</b></div>
      ${
        node.typeLabel
          ? `<div class="onto-node-card__prop"><span>Type</span><b>${esc(node.typeLabel)}</b></div>`
          : ""
      }
      <div class="onto-node-card__prop"><span>Connections</span><b>${connections.length}</b></div>
      <div class="onto-node-card__links">
        <h4>Connections &amp; relations</h4>
        ${rows || '<p class="onto-node-card__empty">No connections.</p>'}
      </div>`;
    card.hidden = false;
  }

  function showEdgeCard(edge) {
    const source = byId[edge.source];
    const target = byId[edge.target];
    const rel = relationLabels[edge.relation] || edge.relation;
    card.innerHTML = `
      <div class="onto-node-card__head">
        <p class="onto-node-card__type">Triple relation</p>
        <button type="button" class="onto-node-card__close" aria-label="Close">×</button>
      </div>
      <h3 class="onto-node-card__title">${esc(rel)}</h3>
      <div class="onto-node-card__prop"><span>Relation</span><b>${esc(rel)}</b></div>
      <div class="onto-node-card__prop"><span>From</span><b><button type="button" class="onto-inline-link" data-node-id="${esc(source.id)}">${esc(source.label)}</button></b></div>
      <div class="onto-node-card__prop"><span>To</span><b><button type="button" class="onto-inline-link" data-node-id="${esc(target.id)}">${esc(target.label)}</button></b></div>`;
    card.hidden = false;
  }

  function selectNode(id) {
    const node = byId[id];
    if (!node) return;
    applyFocus("node", id);
    showNodeCard(node);
  }

  function selectEdge(id) {
    const edge = edges.find((item) => item.id === id);
    if (!edge) return;
    applyFocus("edge", id);
    showEdgeCard(edge);
  }

  svg.addEventListener("mousedown", (event) => {
    if (event.target.closest(".onto-node, .onto-edge-group")) event.preventDefault();
  });

  svg.addEventListener("click", (event) => {
    const nodeEl = event.target.closest("[data-node-id]");
    if (nodeEl && svg.contains(nodeEl)) {
      if (nodeEl.blur) nodeEl.blur();
      selectNode(nodeEl.getAttribute("data-node-id"));
      return;
    }
    const edgeEl = event.target.closest("[data-edge-id]");
    if (edgeEl && svg.contains(edgeEl)) {
      if (edgeEl.blur) edgeEl.blur();
      selectEdge(edgeEl.getAttribute("data-edge-id"));
      return;
    }
    clearFocus();
  });

  svg.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const nodeEl = event.target.closest("[data-node-id]");
    if (nodeEl) {
      event.preventDefault();
      selectNode(nodeEl.getAttribute("data-node-id"));
      return;
    }
    const edgeEl = event.target.closest("[data-edge-id]");
    if (edgeEl) {
      event.preventDefault();
      selectEdge(edgeEl.getAttribute("data-edge-id"));
    }
  });

  card.addEventListener("click", (event) => {
    if (event.target.closest(".onto-node-card__close")) {
      clearFocus();
      return;
    }
    const edgeBtn = event.target.closest("[data-edge-id]");
    if (edgeBtn) {
      selectEdge(edgeBtn.getAttribute("data-edge-id"));
      return;
    }
    const nodeBtn = event.target.closest("[data-node-id]");
    if (nodeBtn) selectNode(nodeBtn.getAttribute("data-node-id"));
  });
})();
