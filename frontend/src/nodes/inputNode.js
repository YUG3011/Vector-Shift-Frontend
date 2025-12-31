// inputNode.js

import { useState } from 'react';
import NodeBase from './NodeBase';
import { useStore } from '../store';

export const InputNode = ({ id, data }) => {
  const [currName, setCurrName] = useState(data?.inputName || id.replace('customInput-', 'input_'));
  const [inputType, setInputType] = useState(data.inputType || 'Text');

  const updateNodeField = useStore((s) => s.updateNodeField);
  const removeNode = useStore((s) => s.removeNode);

  const handleNameChange = (e) => {
    const v = e.target.value;
    setCurrName(v);
    updateNodeField(id, 'inputName', v);
  };

  const handleTypeChange = (e) => {
    const v = e.target.value;
    setInputType(v);
    updateNodeField(id, 'inputType', v);
  };

  return (
    <NodeBase
      id={id}
      label="Input"
      rightHandles={[{ id: `${id}-value`, label: 'Value' }]}
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
          <select value={inputType} onChange={handleTypeChange} className="node-input">
            <option value="Text">Text</option>
            <option value="File">File</option>
          </select>
        </label>
      </div>
    </NodeBase>
  );
}
