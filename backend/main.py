from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Allow CORS from frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get('/')
def read_root():
    return {'Ping': 'Pong'}


def is_dag_from_edges(nodes, edges):
    # build adjacency list
    adj = {n.get('id', n) if isinstance(n, dict) else n: [] for n in nodes}
    for e in edges:
        src = e.get('source') if isinstance(e, dict) else None
        tgt = e.get('target') if isinstance(e, dict) else None
        if src is None or tgt is None:
            continue
        if src not in adj:
            adj[src] = []
        adj[src].append(tgt)

    # DFS cycle detection
    visited = set()
    onstack = set()

    def dfs(u):
        visited.add(u)
        onstack.add(u)
        for v in adj.get(u, []):
            if v not in visited:
                if dfs(v):
                    return True
            elif v in onstack:
                return True
        onstack.remove(u)
        return False

    for node in list(adj.keys()):
        if node not in visited:
            if dfs(node):
                return False
    return True


def topological_order(nodes, edges):
    node_ids = [n.get('id', n) if isinstance(n, dict) else n for n in nodes]
    indegree = {node_id: 0 for node_id in node_ids}
    adjacency = {node_id: [] for node_id in node_ids}

    for edge in edges:
        src = edge.get('source') if isinstance(edge, dict) else None
        tgt = edge.get('target') if isinstance(edge, dict) else None
        if src not in adjacency:
            adjacency[src] = []
            indegree.setdefault(src, 0)
        if tgt not in adjacency:
            adjacency[tgt] = []
            indegree.setdefault(tgt, 0)
        adjacency[src].append(tgt)
        indegree[tgt] = indegree.get(tgt, 0) + 1

    queue = [node_id for node_id, deg in indegree.items() if deg == 0]
    order = []
    while queue:
        current = queue.pop(0)
        order.append(current)
        for neighbor in adjacency.get(current, []):
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                queue.append(neighbor)

    if len(order) != len(indegree):
        return []
    return order


@app.post('/pipelines/parse')
async def parse_pipeline(req: Request):
    payload = await req.json()
    nodes = payload.get('nodes', [])
    edges = payload.get('edges', [])

    num_nodes = len(nodes)
    num_edges = len(edges)
    dag = is_dag_from_edges(nodes, edges)

    return { 'num_nodes': num_nodes, 'num_edges': num_edges, 'is_dag': dag }


@app.post('/pipelines/execute')
async def execute_pipeline(req: Request):
    payload = await req.json()
    nodes = payload.get('nodes', [])
    edges = payload.get('edges', [])

    if not nodes:
        raise HTTPException(status_code=400, detail='No nodes to execute')

    if not is_dag_from_edges(nodes, edges):
        raise HTTPException(status_code=400, detail='Pipeline contains cycles. Resolve them before execution.')

    order = topological_order(nodes, edges)
    if not order:
        raise HTTPException(status_code=400, detail='Unable to derive execution order')

    node_lookup = {n.get('id'): n for n in nodes if isinstance(n, dict)}
    steps = []
    for node_id in order:
        node = node_lookup.get(node_id, {})
        label = node.get('type') or node.get('nodeType') or 'node'
        steps.append({'id': node_id, 'type': label})

    return {
        'status': 'queued',
        'num_nodes': len(nodes),
        'num_edges': len(edges),
        'execution_order': steps,
    }
