// outputNode.js

import { useState } from 'react';
import NodeBase from './NodeBase';
import { useStore } from '../store';

export const OutputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.outputName || id.replace('customOutput-', 'output_'));
  const [outputType, setOutputType] = useState(data.outputType || 'Text');

  const updateNodeField = useStore((s) => s.updateNodeField);
  const removeNode = useStore((s) => s.removeNode);

  const handleNameChange = (e) => {
    const v = e.target.value;
    setCurrName(v);
    updateNodeField(id, 'outputName', v);
  };

  const handleTypeChange = (e) => {
    const v = e.target.value;
    setOutputType(v);
    updateNodeField(id, 'outputType', v);
  };

  return (
    <NodeBase
      id={id}
      label="Output"
      leftHandles={[{ id: `${id}-value`, label: 'Value' }]}
      onDelete={() => removeNode(id)}
    >
      <div>
        <label style={{display: 'block', marginBottom: 6}}>
          <div style={{fontSize: 12, color: '#555'}}>Name</div>
          <input 
            type="text" 
            value={currName} 
            onChange={handleNameChange} 
            className="node-input"
          />
        </label>
        <label style={{display: 'block'}}>
          <div style={{fontSize: 12, color: '#555'}}>Type</div>
          <select value={outputType} onChange={handleTypeChange} className="node-input">
            <option value="Text">Text</option>
            <option value="File">Image</option>
          </select>
        </label>
      </div>
    </NodeBase>
  );
}
