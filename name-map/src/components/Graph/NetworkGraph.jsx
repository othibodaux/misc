import { useEffect, useMemo, useRef, useState } from 'react';
import * as d3 from 'd3';
import Drawer from '../shared/Drawer';
import ProfileCard from '../Profile/ProfileCard';

export default function NetworkGraph({
  people,
  circles,
  byCircle,
  onUpdate,
  onDelete,
  connections = [],
  onAddConnection,
  onRemoveConnection,
}) {
  const svgRef = useRef(null);
  const wrapRef = useRef(null);
  const [selectedId, setSelectedId] = useState(null);
  const [tooltip, setTooltip] = useState(null);

  // Cluster centers, one per circle (+ a slot for "no circle").
  const centers = useMemo(() => {
    const groups = [...circles.map((c) => c.id), null];
    const map = new Map();
    const n = groups.length;
    groups.forEach((g, i) => {
      const angle = (i / n) * 2 * Math.PI;
      map.set(g, { x: Math.cos(angle), y: Math.sin(angle) });
    });
    return map;
  }, [circles]);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const width = wrap.clientWidth;
    const height = wrap.clientHeight;

    const svg = d3.select(svgRef.current).attr('width', width).attr('height', height);
    svg.selectAll('*').remove();
    const root = svg.append('g');

    const zoom = d3.zoom().scaleExtent([0.3, 4]).on('zoom', (e) => root.attr('transform', e.transform));
    svg.call(zoom);

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.32;

    const nodes = people.map((p) => {
      const noteLen = (p.notes || '').length;
      return { id: p.id, person: p, r: 10 + Math.min(14, noteLen / 25) };
    });

    function center(circleId) {
      const c = centers.get(circleId) || { x: 0, y: 0 };
      return { x: cx + c.x * radius, y: cy + c.y * radius };
    }

    const nodeIds = new Set(nodes.map((n) => n.id));
    const links = connections
      .filter((c) => nodeIds.has(c.person_a) && nodeIds.has(c.person_b))
      .map((c) => ({ source: c.person_a, target: c.person_b }));

    const sim = d3
      .forceSimulation(nodes)
      .force('charge', d3.forceManyBody().strength(-90))
      .force('collide', d3.forceCollide().radius((d) => d.r + 4))
      .force('link', d3.forceLink(links).id((d) => d.id).distance(70).strength(0.4))
      .force('x', d3.forceX((d) => center(d.person.circle_id).x).strength(0.18))
      .force('y', d3.forceY((d) => center(d.person.circle_id).y).strength(0.18));

    const link = root
      .append('g')
      .attr('stroke', '#4f8ef7')
      .attr('stroke-opacity', 0.35)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 1.5);

    const node = root
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3
          .drag()
          .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y; })
          .on('drag', (e, d) => { d.fx = e.x; d.fy = e.y; })
          .on('end', (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null; })
      )
      .on('click', (_e, d) => setSelectedId(d.id))
      .on('mouseenter', (e, d) => setTooltip({ x: e.clientX, y: e.clientY, p: d.person }))
      .on('mousemove', (e) => setTooltip((t) => (t ? { ...t, x: e.clientX, y: e.clientY } : t)))
      .on('mouseleave', () => setTooltip(null));

    node
      .append('circle')
      .attr('r', (d) => d.r)
      .attr('fill', (d) => byCircle(d.person.circle_id)?.color || '#9ca3af')
      .attr('stroke', '#0f1117')
      .attr('stroke-width', 2);

    node
      .append('text')
      .text((d) => d.person.name.split(' ')[0])
      .attr('text-anchor', 'middle')
      .attr('dy', (d) => d.r + 12)
      .attr('fill', '#cbd5e1')
      .attr('font-size', 10);

    sim.on('tick', () => {
      link
        .attr('x1', (d) => d.source.x)
        .attr('y1', (d) => d.source.y)
        .attr('x2', (d) => d.target.x)
        .attr('y2', (d) => d.target.y);
      node.attr('transform', (d) => `translate(${d.x},${d.y})`);
    });

    return () => sim.stop();
  }, [people, circles, centers, byCircle, connections]);

  const selected = people.find((p) => p.id === selectedId) || null;

  return (
    <div ref={wrapRef} className="relative h-[calc(100vh-56px)] w-full overflow-hidden">
      {people.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          Add people to see your network web.
        </div>
      )}
      <svg ref={svgRef} className="h-full w-full" />

      <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-2">
        {circles.map((c) => (
          <span key={c.id} className="flex items-center gap-1 rounded-full bg-panel/80 px-2 py-0.5 text-xs text-gray-300">
            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
            {c.name}
          </span>
        ))}
      </div>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-edge bg-panel px-2 py-1 text-xs text-gray-100 shadow"
          style={{ left: tooltip.x + 12, top: tooltip.y + 12 }}
        >
          <div className="font-medium">{tooltip.p.name}</div>
          {tooltip.p.headline && <div className="text-gray-400">{tooltip.p.headline}</div>}
        </div>
      )}

      <Drawer open={!!selected} onClose={() => setSelectedId(null)}>
        {selected && (
          <ProfileCard
            person={selected}
            circle={byCircle(selected.circle_id)}
            circles={circles}
            onUpdate={onUpdate}
            onDelete={async (id) => { await onDelete(id); setSelectedId(null); }}
            people={people}
            connections={connections}
            onAddConnection={onAddConnection}
            onRemoveConnection={onRemoveConnection}
          />
        )}
      </Drawer>
    </div>
  );
}
