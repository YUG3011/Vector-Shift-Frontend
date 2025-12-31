// textNode.js


import { useState, useMemo, useCallback, useRef } from 'react';
import NodeBase from './NodeBase';
import { useStore } from '../store';
import { extractVariables, normalizeName, getReachableInputMeta } from '../validation';

export const TextNode = ({ id, data }) => {
  const [currText, setCurrText] = useState(data?.text ?? '');
  const textAreaRef = useRef(null);

  const updateNodeField = useStore((s) => s.updateNodeField);
  const removeNode = useStore((s) => s.removeNode);
  const nodes = useStore((s) => s.nodes);
  const edges = useStore((s) => s.edges);

  const commitTextUpdate = useCallback((value) => {
    setCurrText(value);
    updateNodeField(id, 'text', value);
  }, [id, updateNodeField]);

  const handleTextChange = (e) => {
    const v = e.target.value;
    commitTextUpdate(v);
  };

  // parse variables like {{ varName }}
  const variables = useMemo(() => extractVariables(currText), [currText]);
  const braceNames = useMemo(() => variables.map((v) => normalizeName(v)), [variables]);
  const braceNameSet = useMemo(() => new Set(braceNames.filter(Boolean)), [braceNames]);

  const reachableInputs = useMemo(
    () => getReachableInputMeta(id, nodes, edges),
    [id, nodes, edges]
  );

  const inputNameSet = useMemo(() => new Set(reachableInputs.map((m) => m.normalized)), [reachableInputs]);

  const insertVariable = useCallback((name) => {
    const target = textAreaRef.current;
    const normalized = normalizeName(name);
    if (!normalized || inputNameSet.size === 0) return;
    if (!inputNameSet.has(normalized)) return;
    if (braceNameSet.has(normalized)) return;
    const insertion = `{{${name}}}`;
    const start = target?.selectionStart ?? currText.length;
    const end = target?.selectionEnd ?? currText.length;

    // If the caret/selection is inside an existing {{...}} token, move insertion point
    // to the end of that token so we don't break it.
    const VAR_RE = /{{\s*([^{}]+?)\s*}}/g;
    let adjustedStart = start;
    let adjustedEnd = end;
    let m;
    while ((m = VAR_RE.exec(currText)) !== null) {
      const mStart = m.index;
      const mEnd = VAR_RE.lastIndex;
      // if caret is strictly inside token (not at boundaries), move to after token
      if ((start > mStart && start < mEnd) || (end > mStart && end < mEnd)) {
        adjustedStart = mEnd;
        adjustedEnd = mEnd;
        break;
      }
    }
    const final = `${currText.slice(0, adjustedStart)}${insertion}${currText.slice(adjustedEnd)}`;
    commitTextUpdate(final);
    requestAnimationFrame(() => {
      if (target) {
        const caret = adjustedStart + insertion.length;
        target.focus();
        target.setSelectionRange(caret, caret);
      }
    });
  }, [currText, commitTextUpdate, inputNameSet, braceNameSet]);

  const availableInputs = reachableInputs;
  const missingVariables = useMemo(
    () => variables.filter((v) => !inputNameSet.has(normalizeName(v))),
    [variables, inputNameSet]
  );

  const removeVariableTokens = useCallback((variableName) => {
    const normalizedTarget = normalizeName(variableName);
    if (!normalizedTarget) return;
    let updated = currText;
    const vars = extractVariables(currText);
    vars.forEach((raw) => {
      if (normalizeName(raw) === normalizedTarget) {
        const escaped = raw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(`\\{\\{\\s*${escaped}\\s*\\}\\}`, 'g');
        updated = updated.replace(pattern, '');
      }
    });
    updated = updated.replace(/\s{2,}/g, ' ').trim();
    commitTextUpdate(updated);
  }, [currText, commitTextUpdate]);

  // detect bare identifier-like tokens (in case user forgot {{}})
  const identifierMatches = useMemo(() => {
    const matches = Array.from(new Set((currText.match(/\b[A-Za-z_$][A-Za-z0-9_$]*\b/g) || [])));
    // remove keywords that are clearly not variables (basic filter)
    return matches.filter((t) => !['function','return','if','else','for','while','const','let','var'].includes(t));
  }, [currText]);

  const bareCandidates = useMemo(() => identifierMatches.map((t) => normalizeName(t)).filter((n) => !braceNames.includes(n)), [identifierMatches, braceNames]);
  const missingBareCandidates = useMemo(() => bareCandidates.filter((t) => !inputNameSet.has(t)), [bareCandidates, inputNameSet]);

  // auto-size the node based on text length
  const style = useMemo(() => {
    const baseW = 200;
    const extra = Math.min(300, currText.length * 8);
    const width = Math.max(160, baseW + extra);
    const height = Math.max(64, Math.ceil(currText.length / 30) * 24 + 40);
    return { width, minHeight: height };
  }, [currText]);

  const accentPalette = ['#22c55e', '#eab308', '#f97316', '#38bdf8', '#a855f7', '#f43f5e'];
  const useAccents = variables.length > 2;
  const baseHandle = { id: `${id}-input-hub`, label: '', accent: null, top: '12%' };
  const variableHandles = variables.map((v, idx) => ({
    id: `${id}-var-${v}`,
    label: v,
    accent: useAccents ? accentPalette[idx % accentPalette.length] : null,
  }));
  const leftHandles = [baseHandle, ...variableHandles];

  return (
    <NodeBase
      id={id}
      label="Text"
      rightHandles={[{ id: `${id}-output`, label: 'Output' }]}
      leftHandles={leftHandles}
      style={style}
      onDelete={() => removeNode(id)}
    >
      <div>
        <label style={{display: 'block'}}>
          <div style={{fontSize: 12, color: '#555'}}>Text</div>
          <textarea
            ref={textAreaRef}
            value={currText}
            onChange={handleTextChange}
            className="node-input"
            style={{minHeight: 36, resize: 'none', fontFamily:'inherit'}}
          />
        </label>
        {availableInputs.length > 0 && (
          <div style={{marginTop:6}} className="variable-available">
            <div style={{fontSize:12,color:'#9aa2b8',marginBottom:4}}>Available inputs:</div>
            <div style={{fontSize:11,color:'#7b849b',marginBottom:8}}>
              Click a chip to insert its variable once. Connect more Input nodes to unlock additional values.
            </div>
            <div className="variable-badges">
              {availableInputs.map(({ label, normalized }) => {
                const used = braceNames.includes(normalized);
                return (
                  <button
                    type="button"
                    key={normalized}
                    className={`var-badge insertable ${used ? 'ok-muted' : 'ok'}`}
                    onClick={() => insertVariable(label)}
                    disabled={used}
                    aria-disabled={used}
                    title={used ? 'Already inserted' : 'Insert variable'}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {availableInputs.length === 0 && (
          <div style={{marginTop:8,fontSize:12,color:'#9aa2b8'}}>
            No connected Input nodes detected. Connect an Input node upstream to unlock available variables here.
          </div>
        )}

        {variables.length > 0 && (
          <div style={{marginTop:8}} className="variable-badges">
            {variables.map((v) => {
              const ok = inputNameSet.has(normalizeName(v));
              if (ok) {
                return (
                  <span key={v} className="var-badge ok">{v}</span>
                );
              }
              return (
                <button
                  type="button"
                  key={v}
                  className="var-badge missing dismissable"
                  onClick={() => removeVariableTokens(v)}
                  title="Remove missing variable"
                >
                  <span>{v}</span>
                  <span aria-hidden="true" className="chip-close">✕</span>
                </button>
              );
            })}
          </div>
        )}

        {bareCandidates.length > 0 && (
          <div style={{marginTop:8}} className="variable-hints">
            <span style={{fontSize:12,color:'#9aa2b8',marginRight:8}}>Detected identifiers:</span>
            {bareCandidates.map((b) => {
              const ok = inputNameSet.has(b);
              return (
                <span key={b} className={`var-badge ${ok ? 'ok-muted' : 'hint'}`}>{b}</span>
              );
            })}
            {missingBareCandidates.length > 0 && (
              <div style={{marginTop:6}} className="node-warning" role="status">
                Hint: some identifiers look like variables but have no matching Input node: {missingBareCandidates.join(', ')}
              </div>
            )}
          </div>
        )}
        {missingVariables.length > 0 && (
          <div className="node-warning" role="alert" style={{marginTop:8}}>
            Missing inputs for: {missingVariables.join(', ')}
          </div>
        )}
      </div>
    </NodeBase>
  );
}
