import NodeBase from './NodeBase';
import { useStore } from '../store';

export const DateNode = ({ id, data }) => {
  const removeNode = useStore((s) => s.removeNode);
  return (
    <NodeBase
      id={id}
      label="Date"
      rightHandles={[{ id: `${id}-date`, label: 'Timestamp' }]}
      onDelete={() => removeNode(id)}
    >
      <div style={{fontSize:13,color:'#444'}}>Provides a timestamp.</div>
    </NodeBase>
  );
}

export default DateNode;
