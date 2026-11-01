import { createContext, use, useId, type KeyboardEvent, type ReactNode } from 'react';
import { Graph } from '@visx/network';
import { Badge } from '@/components/ui';
import {
  CRITICALITIES,
  CRITICALITY_LABELS,
  type Application,
  type Criticality,
  type Resource,
} from '@/domain';
import { circleLayout } from '@/lib/circleLayout';
import { cn } from '@/lib/utils';

export const GRAPH_WIDTH = 800;
export const GRAPH_HEIGHT = 500;
export const NODE_WIDTH = 132;
export const NODE_HEIGHT = 44;
// Wide enough that boxes of NODE_WIDTH x NODE_HEIGHT don't touch for up to 12 members.
const RING_RADIUS_X = 300;
const RING_RADIUS_Y = 190;

interface GraphNode {
  /** The resource's id; absent on the Application node. */
  resourceId?: string;
  x: number;
  y: number;
  label: string;
  caption: string;
  /** Absent on the Application node. */
  criticality?: Criticality;
}

interface GraphLink {
  source: GraphNode;
  target: GraphNode;
}

// The Badge palette in SVG form, so a node and the legend entry for its criticality match.
const nodeStyles: Record<Criticality, string> = {
  critical: 'fill-red-100 stroke-red-300 dark:fill-red-950 dark:stroke-red-800',
  high: 'fill-orange-100 stroke-orange-300 dark:fill-orange-950 dark:stroke-orange-800',
  medium: 'fill-yellow-100 stroke-yellow-300 dark:fill-yellow-950 dark:stroke-yellow-800',
  low: 'fill-blue-100 stroke-blue-300 dark:fill-blue-950 dark:stroke-blue-800',
};

const nodeTextStyles: Record<Criticality, string> = {
  critical: 'fill-red-800 dark:fill-red-200',
  high: 'fill-orange-800 dark:fill-orange-200',
  medium: 'fill-yellow-800 dark:fill-yellow-200',
  low: 'fill-blue-800 dark:fill-blue-200',
};

const noop = () => {};

/** Clips with an ellipsis; SVG text doesn't wrap or truncate on its own. */
const truncate = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1)}…` : text;

function buildGraph(application: Application, members: Resource[]) {
  const centre: GraphNode = {
    x: GRAPH_WIDTH / 2,
    y: GRAPH_HEIGHT / 2,
    label: application.name,
    caption: `${members.length} ${members.length === 1 ? 'resource' : 'resources'}`,
  };
  const points = circleLayout(members.length, RING_RADIUS_X, RING_RADIUS_Y);
  const nodes = members.map((member, index): GraphNode => ({
    x: centre.x + (points[index]?.x ?? 0),
    y: centre.y + (points[index]?.y ?? 0),
    resourceId: member.id,
    label: member.name,
    caption: member.type,
    criticality: member.criticality,
  }));
  const links: GraphLink[] = nodes.map((target) => ({ source: centre, target }));
  return { centre, nodes: [centre, ...nodes], links };
}

/** What the graph tells its parent about, and what the parent tells it to emphasise. */
/** What the details give focus back to: a list row (HTML) or a graph node (SVG). */
export type Focusable = HTMLElement | SVGElement;

interface GraphInteraction {
  highlightedId: string | null;
  selectedId: string | null;
  onHighlight: (resourceId: string | null) => void;
  /** `trigger` is the element to give focus back to when the details are dismissed. */
  onSelect: (resourceId: string, trigger: Focusable) => void;
}

const GraphInteractionContext = createContext<GraphInteraction | null>(null);

function useGraphInteraction() {
  const context = use(GraphInteractionContext);
  if (!context) throw new Error('Graph parts must render inside ApplicationGraph');
  return context;
}

const isDimmed = (highlightedId: string | null, resourceId: string | undefined) =>
  highlightedId !== null && resourceId !== highlightedId;

function GraphLinkLine({ link }: { link: GraphLink }) {
  const { highlightedId } = useGraphInteraction();
  const active = highlightedId !== null && link.target.resourceId === highlightedId;
  return (
    <line
      x1={link.source.x}
      y1={link.source.y}
      x2={link.target.x}
      y2={link.target.y}
      className={cn(
        'transition-opacity',
        active ? 'stroke-foreground' : 'stroke-muted-foreground/40',
        isDimmed(highlightedId, link.target.resourceId) && 'opacity-25',
      )}
      strokeWidth={active ? 2.5 : 1.5}
    />
  );
}

function GraphNodeBox({ node }: { node: GraphNode }) {
  const { highlightedId, selectedId, onHighlight, onSelect } = useGraphInteraction();
  const { criticality, resourceId } = node;
  const interactive = resourceId !== undefined;
  const selected = interactive && resourceId === selectedId;
  const dimmed = interactive && isDimmed(highlightedId, resourceId);

  const onKeyDown = (event: KeyboardEvent<SVGGElement>) => {
    if (!interactive || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    onSelect(resourceId, event.currentTarget);
  };

  return (
    // visx has already moved the group to the node's centre.
    <g
      {...(interactive && {
        role: 'button',
        tabIndex: 0,
        'aria-label': `${node.label}, ${node.caption}, ${CRITICALITY_LABELS[criticality!]}`,
        'aria-pressed': selected,
        onClick: (event) => onSelect(resourceId, event.currentTarget),
        onKeyDown,
        onMouseEnter: () => onHighlight(resourceId),
        onMouseLeave: () => onHighlight(null),
        onFocus: () => onHighlight(resourceId),
        onBlur: () => onHighlight(null),
      })}
      className={cn(
        'outline-none transition-opacity',
        interactive &&
          'cursor-pointer focus-visible:[&>rect]:stroke-ring focus-visible:[&>rect]:stroke-[3]',
        dimmed && 'opacity-30',
      )}
    >
      <rect
        x={-NODE_WIDTH / 2}
        y={-NODE_HEIGHT / 2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={10}
        className={cn(criticality ? nodeStyles[criticality] : 'fill-primary stroke-primary')}
        strokeWidth={selected ? 3 : 1.5}
      />
      <text
        x={0}
        y={-3}
        textAnchor="middle"
        className={cn(
          'text-[13px] font-semibold',
          criticality ? nodeTextStyles[criticality] : 'fill-primary-foreground',
        )}
      >
        {truncate(node.label, 17)}
      </text>
      <text
        x={0}
        y={13}
        textAnchor="middle"
        className={cn(
          'text-[11px]',
          criticality ? nodeTextStyles[criticality] : 'fill-primary-foreground',
        )}
      >
        {truncate(node.caption, 20)}
      </text>
    </g>
  );
}

interface ApplicationGraphProps {
  application: Application;
  /** The Application's resources, resolved from its `resourceIds`. */
  members: Resource[];
  highlightedId?: string | null;
  selectedId?: string | null;
  onHighlight?: (resourceId: string | null) => void;
  onSelect?: (resourceId: string, trigger: Focusable) => void;
  /** Shown beside the graph, as tall as it is; scrolls inside when it needs more room. */
  aside?: ReactNode;
}

/** A star: the Application in the centre, one node per member resource on a ring around it. */
export function ApplicationGraph({
  application,
  members,
  highlightedId = null,
  selectedId = null,
  onHighlight = noop,
  onSelect = noop,
  aside,
}: ApplicationGraphProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { nodes, links } = buildGraph(application, members);
  const count = `${members.length} ${members.length === 1 ? 'resource' : 'resources'}`;

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          {/* Below this width the labels would shrink past reading, so scroll instead. */}
          <div className="overflow-x-auto rounded-lg border bg-card">
            <svg
              // Not "img": that would hide the focusable nodes from assistive technology.
              role="group"
              aria-labelledby={titleId}
              aria-describedby={descriptionId}
              viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
              className="mx-auto h-auto min-w-[640px] w-full"
            >
              <title id={titleId}>{`Graph of ${application.name}`}</title>
              <desc id={descriptionId}>
                {`${application.name} with ${count}: ${members.map((m) => `${m.name} (${CRITICALITY_LABELS[m.criticality]})`).join(', ')}.`}
              </desc>
              <GraphInteractionContext value={{ highlightedId, selectedId, onHighlight, onSelect }}>
                <Graph<GraphLink, GraphNode>
                  graph={{ nodes, links }}
                  linkComponent={GraphLinkLine}
                  nodeComponent={GraphNodeBox}
                />
              </GraphInteractionContext>
            </svg>
          </div>
        </div>
        {aside && (
          <div className="relative lg:w-60 lg:shrink-0">
            {/* Out of flow on wide screens, so the graph alone sets the height. */}
            <div className="lg:absolute lg:inset-0 lg:overflow-y-auto scrollbar-subtle">
              {aside}
            </div>
          </div>
        )}
      </div>
      <div className="rounded-lg border bg-muted/40 px-3 py-2">
        <p className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">
          Legend
        </p>
        <ul
          aria-label="Criticality legend"
          className="mt-1.5 flex flex-wrap items-center gap-2 text-xs"
        >
          <li className="text-muted-foreground">Node colour shows criticality:</li>
          {CRITICALITIES.map((criticality) => (
            <li key={criticality}>
              <Badge variant={criticality}>{CRITICALITY_LABELS[criticality]}</Badge>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
