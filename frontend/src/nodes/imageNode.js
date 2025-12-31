import NodeBase from './NodeBase';
import { useStore } from '../store';

export const ImageNode = ({ id, data }) => {
  const removeNode = useStore((s) => s.removeNode);
  return (
    <NodeBase
      id={id}
      label="Image"
      rightHandles={[{ id: `${id}-out`, label: 'Output' }]}
      onDelete={() => removeNode(id)}
    >
      <div style={{fontSize:13,color:'#444'}}>Displays an image source.</div>
    </NodeBase>
  );
}

export default ImageNode;
