import NodeBase from './NodeBase';
import { useStore } from '../store';

export const APINode = ({ id, data }) => {
  const removeNode = useStore((s) => s.removeNode);
  return (
    <NodeBase
      id={id}
      label="API"
      leftHandles={[{ id: `${id}-in`, label: 'Request' }]}
      rightHandles={[{ id: `${id}-out`, label: 'Response' }]}
      onDelete={() => removeNode(id)}
    > 
      <div style={{fontSize:13,color:'#444'}}>Fetches from external API.</div>
    </NodeBase>
  );
}

export default APINode;
