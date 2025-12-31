import NodeBase from './NodeBase';
import { useStore } from '../store';

export const MathNode = ({ id, data }) => {
  const removeNode = useStore((s) => s.removeNode);
  return (
    <NodeBase
      id={id}
      label="Math"
      rightHandles={[{ id: `${id}-result`, label: 'Result' }]}
      onDelete={() => removeNode(id)}
    >
      <div style={{fontSize:13,color:'#444'}}>Simple math computation node.</div>
    </NodeBase>
  );
}

export default MathNode;
