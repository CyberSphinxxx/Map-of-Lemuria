import { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  addEdge, 
  Background, 
  Controls, 
  applyEdgeChanges, 
  applyNodeChanges,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  MarkerType
} from 'reactflow';
import 'reactflow/dist/style.css';

export default function LineageBuilder() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [loading, setLoading] = useState(true);

  // Load existing data
  useEffect(() => {
    async function loadGraph() {
      try {
        setLoading(true);
        // 1. Fetch all entities that should be in the graph (could be filtered/paginated later)
        const entitiesRes = await fetch('/api/search-entities?q='); // Get initial set
        const entities = await entitiesRes.json();

        // 2. Fetch all relationships
        const relRes = await fetch('/api/relationships');
        const relationships = await relRes.json();

        // 3. Transform to ReactFlow format
        const newNodes: Node[] = entities.map((e: any, i: number) => ({
          id: e.id,
          data: { label: e.name },
          position: { x: (i % 3) * 250, y: Math.floor(i / 3) * 150 },
          type: e.type === 'location' ? 'input' : 'default',
          style: { 
            background: 'var(--bg-tertiary)', 
            color: 'var(--text-primary)',
            border: '1px solid var(--accent-primary)',
            borderRadius: '8px',
            padding: '10px'
          }
        }));

        const newEdges: Edge[] = relationships.map((r: any) => ({
          id: r.id,
          source: r.sourceId,
          target: r.targetId,
          animated: true,
          label: r.type || '',
          markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent-primary)' },
          style: { stroke: 'var(--accent-primary)' }
        }));

        setNodes(newNodes);
        setEdges(newEdges);
      } catch (err) {
        console.error('Failed to load lineage graph:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGraph();
  }, []);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [setNodes]
  );
  
  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [setEdges]
  );

  const onConnect: OnConnect = useCallback(
    async (params) => {
      if (!params.source || !params.target) return;

      // Optimistic update
      const newEdge: Edge = {
        id: `e-${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, color: 'var(--accent-primary)' },
        style: { stroke: 'var(--accent-primary)' }
      };
      setEdges((eds) => addEdge(newEdge, eds));

      // Save to DB
      try {
        await fetch('/api/relationships', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sourceId: params.source,
            targetId: params.target,
            type: 'link'
          })
        });
      } catch (err) {
        console.error('Failed to save relationship:', err);
      }
    },
    [setEdges]
  );

  if (loading) {
    return <div className="builder-loading">Consulting the Archives...</div>;
  }

  return (
    <div style={{ width: '100%', height: '600px', background: '#141417', borderRadius: '12px', overflow: 'hidden', border: '1px solid #27272a' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background color="#27272a" gap={20} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
