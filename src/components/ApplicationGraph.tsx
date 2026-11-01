import { useId } from 'react';
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
export const RING_RADIUS_X = 300;
export const RING_RADIUS_Y = 190;

interface GraphNode {
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
    label: member.name,
    caption: member.type,
    criticality: member.criticality,
  }));
  const links: GraphLink[] = nodes.map((target) => ({ source: centre, target }));
  return { centre, nodes: [centre, ...nodes], links };
}

function GraphLinkLine({ link }: { link: GraphLink }) {
  return (
    <line
      x1={link.source.x}
      y1={link.source.y}
      x2={link.target.x}
      y2={link.target.y}
      className="stroke-muted-foreground/40"
      strokeWidth={1.5}
    />
  );
}

function GraphNodeBox({ node }: { node: GraphNode }) {
  const { criticality } = node;
  return (
    // visx has already moved the group to the node's centre.
    <>
      <rect
        x={-NODE_WIDTH / 2}
        y={-NODE_HEIGHT / 2}
        width={NODE_WIDTH}
        height={NODE_HEIGHT}
        rx={10}
        className={cn(criticality ? nodeStyles[criticality] : 'fill-primary stroke-primary')}
        strokeWidth={1.5}
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
    </>
  );
}

interface ApplicationGraphProps {
  application: Application;
  /** The Application's resources, resolved from its `resourceIds`. */
  members: Resource[];
}

/** A star: the Application in the centre, one node per member resource on a ring around it. */
export function ApplicationGraph({ application, members }: ApplicationGraphProps) {
  const titleId = useId();
  const descriptionId = useId();
  const { nodes, links } = buildGraph(application, members);
  const count = `${members.length} ${members.length === 1 ? 'resource' : 'resources'}`;

  return (
    <div className="space-y-3">
      {/* Below this width the labels would shrink past reading, so scroll instead. */}
      <div className="overflow-x-auto rounded-lg border bg-card">
        <svg
          role="img"
          aria-labelledby={titleId}
          aria-describedby={descriptionId}
          viewBox={`0 0 ${GRAPH_WIDTH} ${GRAPH_HEIGHT}`}
          className="mx-auto h-auto min-w-[640px] w-full"
        >
          <title id={titleId}>{`Graph of ${application.name}`}</title>
          <desc id={descriptionId}>
            {`${application.name} with ${count}: ${members.map((m) => `${m.name} (${CRITICALITY_LABELS[m.criticality]})`).join(', ')}.`}
          </desc>
          <Graph<GraphLink, GraphNode>
            graph={{ nodes, links }}
            linkComponent={GraphLinkLine}
            nodeComponent={GraphNodeBox}
          />
        </svg>
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
