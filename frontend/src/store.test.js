import { useStore } from './store';

const resetStore = () => {
  useStore.setState({ nodes: [], edges: [], nodeIDs: {}, _posCounter: 0 });
  window.localStorage.clear();
};

describe('useStore', () => {
  beforeEach(() => {
    resetStore();
  });

  it('generates sequential node IDs', () => {
    const { getNodeID } = useStore.getState();
    const first = getNodeID('customInput');
    const second = getNodeID('customInput');
    expect(first).toBe('customInput-1');
    expect(second).toBe('customInput-2');
  });

  it('saves and loads pipeline from localStorage', () => {
    useStore.setState({
      nodes: [{ id: 'customInput-1', type: 'customInput', data: {} }],
      edges: [],
      nodeIDs: { customInput: 1 },
    });
    expect(useStore.getState().savePipeline()).toBe(true);

    useStore.setState({ nodes: [], edges: [], nodeIDs: {} });
    const payload = useStore.getState().loadPipeline();
    expect(payload.nodes).toHaveLength(1);
    expect(useStore.getState().nodes).toHaveLength(1);
  });

  it('updates node field in place', () => {
    useStore.setState({
      nodes: [{ id: 'text-1', type: 'text', data: { text: '' } }],
      edges: [],
      nodeIDs: {},
    });

    useStore.getState().updateNodeField('text-1', 'text', 'updated');
    const updatedNode = useStore.getState().nodes.find((n) => n.id === 'text-1');
    expect(updatedNode.data.text).toBe('updated');
  });
});
