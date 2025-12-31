// llmNode.js

import NodeBase from './NodeBase';
import { useStore } from '../store';

export const LLMNode = ({ id, data }) => {
  const removeNode = useStore((s) => s.removeNode);
  const leftHandles = [
    { id: `${id}-system`, top: '33%', label: 'System' },
    { id: `${id}-prompt`, top: '66%', label: 'Prompt' },
  ];

  const rightHandles = [{ id: `${id}-response`, label: 'Response' }];

  return (
    <NodeBase
      id={id}
      label="LLM"
      leftHandles={leftHandles}
      rightHandles={rightHandles}
      onDelete={() => removeNode(id)}
    >
      <div style={{fontSize: 13, color: '#444'}}>This is an LLM node.</div>
    </NodeBase>
  );
}
