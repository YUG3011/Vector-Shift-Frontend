import NodeBase from './NodeBase';
import { useStore } from '../store';

export const FormNode = ({ id, data }) => {
  const label = data?.label || 'Form';
  const removeNode = useStore((s) => s.removeNode);

  return (
    <NodeBase
      id={id}
      label="Form"
      rightHandles={[{ id: `${id}-values`, label: 'Values' }]}
      onDelete={() => removeNode(id)}
    >
      <div style={{fontSize:13,color:'#444'}}>
        <div style={{marginBottom:6}}>{label}</div>
      </div>
    </NodeBase>
  );
}

export default FormNode;
