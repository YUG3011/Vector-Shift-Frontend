import React from 'react';
import { useStore } from '../store';

export const Inspector = () => {
  const selected = useStore((s) => s.selectedNode);
  const nodes = useStore((s) => s.nodes);
  const updateNodeField = useStore((s) => s.updateNodeField);

  if (!selected) return null;

  const node = nodes.find((n) => n.id === selected);
  if (!node) return null;

  const onChange = (field) => (e) => updateNodeField(node.id, field, e.target.value);

  return (
    <div className="vs-inspector" role="dialog" aria-label="Node inspector">
      <h4>Inspector</h4>
      <div style={{fontSize:12,color:'var(--muted-text)',marginBottom:8}}>{node.type} • {node.id}</div>
      {node.type === 'text' && (
        <div>
          <label style={{fontSize:12,color:'var(--muted-text)'}}>Text</label>
          <textarea className="node-input" value={node.data?.text||''} onChange={onChange('text')} />
        </div>
      )}
      {node.type === 'customInput' && (
        <div>
          <label style={{fontSize:12,color:'var(--muted-text)'}}>Name</label>
          <input className="node-input" value={node.data?.inputName||''} onChange={onChange('inputName')} />
        </div>
      )}
      {node.type === 'customOutput' && (
        <div>
          <label style={{fontSize:12,color:'var(--muted-text)'}}>Name</label>
          <input className="node-input" value={node.data?.outputName||''} onChange={onChange('outputName')} />
        </div>
      )}
    </div>
  );
}

export default Inspector;
