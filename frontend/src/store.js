// store.js

import { create } from "zustand";
import {
    addEdge,
    applyNodeChanges,
    applyEdgeChanges,
    MarkerType,
  } from 'reactflow';
import { extractVariables, normalizeName } from './validation';

export const useStore = create((set, get) => ({
    nodes: [],
    edges: [],
  nodeIDs: {},
    isFullscreen: false,
    getNodeID: (type) => {
    const current = get().nodeIDs || {};
    const newIDs = { ...current };
    if (newIDs[type] === undefined) {
      newIDs[type] = 0;
    }
    newIDs[type] += 1;
    set({nodeIDs: newIDs});
    return `${type}-${newIDs[type]}`;
    },
    addNode: (node) => {
        set({
            nodes: [...get().nodes, node]
        });
    },
    // position counter to avoid stacking created nodes
    _posCounter: 0,
    getNextPosition: () => {
      const c = get()._posCounter || 0;
      const x = 120 + (c % 8) * 120; // wrap every 8 columns
      const y = 80 + Math.floor(c / 8) * 120;
      set({ _posCounter: c + 1 });
      return { x, y };
    },
      // toast support
      toast: null,
      setToast: (payload) => set({ toast: payload }),
    savePipeline: () => {
      const payload = { nodes: get().nodes, edges: get().edges };
      try {
        localStorage.setItem('vs_pipeline', JSON.stringify(payload));
        return true;
      } catch (e) {
        return false;
      }
    },
    loadPipeline: () => {
      try {
        const raw = localStorage.getItem('vs_pipeline');
        if (!raw) return null;
        const parsed = JSON.parse(raw);
        set({ nodes: parsed.nodes || [], edges: parsed.edges || [] });
          // rebuild nodeIDs map so getNodeID won't collide
          const nodeIDs = {};
          (parsed.nodes || []).forEach((n) => {
            const id = n.id || '';
            const parts = id.split('-');
            if (parts.length >= 2) {
              const type = parts.slice(0, parts.length - 1).join('-');
              const num = parseInt(parts[parts.length - 1]);
              if (!isNaN(num)) {
                nodeIDs[type] = Math.max(nodeIDs[type] || 0, num);
              }
            }
          });
          set({ nodeIDs, _posCounter: (parsed.nodes || []).length });
        return parsed;
      } catch (e) {
        return null;
      }
    },
    selectedNode: null,
    setSelectedNode: (id) => set({ selectedNode: id }),
    onNodesChange: (changes) => {
      set({
        nodes: applyNodeChanges(changes, get().nodes),
      });
    },
    onEdgesChange: (changes) => {
      set({
        edges: applyEdgeChanges(changes, get().edges),
      });
    },
    onConnect: (connection) => {
      set({
        edges: addEdge({...connection, type: 'smoothstep', animated: true, markerEnd: {type: MarkerType.Arrow, height: '20px', width: '20px'}}, get().edges),
      });
    },
    // remove a single edge by its id
    removeEdge: (edgeId) => {
      set({ edges: (get().edges || []).filter((e) => e.id !== edgeId) });
    },
    // remove all edges originating from a given node+handle (source)
    removeEdgesBySource: (nodeId, sourceHandleId) => {
      set({
        edges: (get().edges || []).filter((edge) => {
          if (edge.source !== nodeId) return true;
          const handleMatch = edge.sourceHandle ? edge.sourceHandle === sourceHandleId : true;
          return !handleMatch;
        }),
      });
    },
    removeNode: (nodeId) => {
      const allNodes = get().nodes || [];
      const allEdges = get().edges || [];

      // find if the node being removed is an Input node and capture its inputName
      const removed = allNodes.find((n) => n.id === nodeId);
      const removedName = removed?.data?.inputName || null;

      // filter out the node and its connected edges
      const remainingNodes = allNodes
        .filter((node) => node.id !== nodeId)
        .map((node) => {
          // if we removed an input with a name, strip any occurrences of its {{name}} from Text nodes
          if (removedName && node?.type === 'text' && typeof node?.data?.text === 'string') {
            try {
              const vars = extractVariables(node.data.text || '');
              let cleaned = node.data.text;
              vars.forEach((v) => {
                if (normalizeName(v) === normalizeName(removedName)) {
                  const esc = v.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&');
                  const re = new RegExp('\\{\\{\\s*' + esc + '\\s*\\}\\}', 'g');
                  cleaned = cleaned.replace(re, '');
                }
              });
              // collapse multiple spaces that may remain after removal
              cleaned = cleaned.replace(/\s{2,}/g, ' ').trim();
              return { ...node, data: { ...node.data, text: cleaned } };
            } catch (e) {
              return node;
            }
          }
          return node;
        });

      const remainingEdges = allEdges.filter((edge) => edge.source !== nodeId && edge.target !== nodeId);

      set({ nodes: remainingNodes, edges: remainingEdges });
    },
    updateNodeField: (nodeId, fieldName, fieldValue) => {
      set({
        nodes: get().nodes.map((node) => {
          if (node.id === nodeId) {
            node.data = { ...node.data, [fieldName]: fieldValue };
          }
  
          return node;
        }),
      });
    },
    setFullscreen: (value) => set({ isFullscreen: value }),
  }));
