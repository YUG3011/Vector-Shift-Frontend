// NodeBase.js

import React from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

export const NodeBase = ({ id, label, children, leftHandles = [], rightHandles = [], style = {}, className = '', onDelete }) => {
  const baseStyle = {
    width: 'auto',
    minWidth: 220,
    maxWidth: 420,
    minHeight: 64,
    padding: 12,
    borderRadius: 8,
    border: '1px solid var(--muted-border)',
    background: 'var(--panel)',
    boxShadow: 'var(--shadow-1)',
    fontFamily: 'var(--font-stack)',
    color: 'var(--text)',
    position: 'relative',
    ...style,
  };

  const handleStyleDefault = { width: 12, height: 12, borderRadius: 12, background: '#fff', border: '2px solid #CBD5E1', boxSizing: 'border-box' };
  const composedClassName = ['node-focusable', className].filter(Boolean).join(' ');
  const labelFor = (fallback) => (fallback ? fallback.toString().replace(/-/g, ' ') : '');
  const normalizeTop = (value) => (typeof value === 'number' ? `${value}px` : value);
  const edges = useStore((s) => s.edges);

  return (
    <div
      style={baseStyle}
      className={composedClassName}
      tabIndex={0}
      role="group"
      aria-label={`${label} node`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: 8, background: 'var(--primary)' }} />
        <div style={{ fontWeight: 600, fontSize: 13 }}>{label}</div>
        <div style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--muted-text)' }} />
        {onDelete && (
          <button
            type="button"
            className="node-delete-btn"
            onClick={onDelete}
            aria-label={`Delete ${label} node`}
          >
            ✕
          </button>
        )}
      </div>

      {leftHandles.map((h, idx) => (
        <React.Fragment key={`left-${h.id ?? idx}`}>
          <Handle
            type="target"
            position={Position.Left}
            id={h.id ?? `${id}-left-${idx}`}
            aria-label={h.label ?? h.id ?? `${id}-left-${idx}`}
            title={h.label ?? h.id ?? ''}
            style={{
              ...handleStyleDefault,
              top: h.top ?? `${(idx + 1) * (100 / (leftHandles.length + 1))}%`,
            }}
          />
          {h.label && (
            <span
              className={`handle-label handle-label-left ${h.accent ? 'handle-label-accented' : ''}`.trim()}
              style={{
                top: normalizeTop(h.top ?? `${(idx + 1) * (100 / (leftHandles.length + 1))}%`),
                '--handle-accent': h.accent || 'transparent',
              }}
            >
              {h.accent && <span className="handle-label-dot" aria-hidden="true" />}
              {labelFor(h.label)}
            </span>
          )}
        </React.Fragment>
      ))}

      <div style={{ marginTop: 2 }}>{children}</div>

      {rightHandles.map((h, idx) => {
        const handleId = h.id ?? `${id}-right-${idx}`;
        const computedTop = h.top ?? `${(idx + 1) * (100 / (rightHandles.length + 1))}%`;
        const topForCss = normalizeTop(computedTop);
        const hasConnections = (edges || []).some((edge) => {
          if (edge.source !== id) return false;
          if (!edge.sourceHandle) return true;
          return edge.sourceHandle === handleId;
        });
        return (
          <React.Fragment key={`right-${handleId}`}>
            <Handle
              type="source"
              position={Position.Right}
              id={handleId}
              aria-label={h.label ?? handleId}
              title={h.label ?? h.id ?? ''}
              style={{
                ...handleStyleDefault,
                top: computedTop,
              }}
            />
            {h.label && (
              <span
                className="handle-label handle-label-right"
                style={{ top: topForCss }}
              >
                {labelFor(h.label)}
              </span>
            )}
            {h.removable !== false && hasConnections && (
              <button
                type="button"
                className="handle-remove-overlay"
                title="Remove connection from this handle"
                onClick={() => {
                  try {
                    useStore.getState().removeEdgesBySource(id, handleId);
                  } catch (e) {
                    console.error('Failed to remove edges for', id, handleId, e);
                  }
                }}
                style={{ top: topForCss }}
                aria-label={`Remove connection ${handleId}`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default NodeBase;
