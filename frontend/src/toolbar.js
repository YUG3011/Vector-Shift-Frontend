// toolbar.js

import { DraggableNode } from './draggableNode';
import { useStore } from './store';
import { useEffect, useState } from 'react';

export const PipelineToolbar = () => {
    const getNodeID = useStore((s) => s.getNodeID);
    const addNode = useStore((s) => s.addNode);
    const getNextPosition = useStore((s) => s.getNextPosition);
    const savePipeline = useStore((s) => s.savePipeline);
    const loadPipeline = useStore((s) => s.loadPipeline);
    const setToast = useStore((s) => s.setToast);
    const isFullscreen = useStore((s) => s.isFullscreen);
        const [theme, setTheme] = useState(() => {
            try { return localStorage.getItem('vs_theme') || 'light'; } catch { return 'light'; }
        });

        useEffect(() => {
            try { document.documentElement.setAttribute('data-theme', theme); localStorage.setItem('vs_theme', theme); } catch(e) {}
        }, [theme]);

    const createNode = (type) => {
        const nodeID = getNodeID(type);
        const data = { id: nodeID, nodeType: `${type}` };
        if (type === 'text') data.text = '';
        if (type === 'customInput') data.inputName = nodeID.replace('customInput-', 'input_');
        if (type === 'customOutput') data.outputName = nodeID.replace('customOutput-', 'output_');

        const node = {
            id: nodeID,
            type,
            position: getNextPosition(),
            data,
        };

        addNode(node);
    };

    return (
        <header className="vs-toolbar">
            <div className="toolbar-shell">
                <div className="toolbar-row">
                    <div className="toolbar-chips" role="group" aria-label="Node palette">
                        <DraggableNode onClick={() => createNode('customInput')} type='customInput' label='Input' />
                        <DraggableNode onClick={() => createNode('llm')} type='llm' label='LLM' />
                        <DraggableNode onClick={() => createNode('customOutput')} type='customOutput' label='Output' />
                        <DraggableNode onClick={() => createNode('text')} type='text' label='Text' />
                    </div>
                    <div className="toolbar-actions">
                        <button type="button" className="pill pill-primary" onClick={() => { const ok = savePipeline(); if (ok) setToast({message:'Pipeline saved', type:'info'}); else setToast({message:'Save failed', type:'error'}); setTimeout(()=> setToast(null),3000); }}>Save</button>
                        <button type="button" className="pill pill-ghost" onClick={() => { const p = loadPipeline(); if (p) setToast({message:'Pipeline loaded', type:'info'}); else setToast({message:'Nothing to load', type:'error'}); setTimeout(()=> setToast(null),3000); }}>Load</button>
                        <div className="toolbar-divider" aria-hidden="true" />
                        {!isFullscreen && (
                          <button className="pill icon-pill theme-toggle" type="button" aria-pressed={theme==='dark'} onClick={() => setTheme((t) => t === 'dark' ? 'light' : 'dark')}>
                              {theme === 'dark' ? (
                                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#0f172a" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
                              ) : (
                                  <svg width="16" height="16" viewBox="0 0 24 24"><path fill="#0f172a" d="M6.76 4.84l-1.8-1.79-1.42 1.41 1.79 1.8 1.43-1.42zM1 13h3v-2H1v2zm10 9h2v-3h-2v3zm7.66-2.34l1.79 1.8 1.41-1.41-1.8-1.79-1.4 1.4zM20 11v2h3v-2h-3zM12 2h-2v3h2V2zm4.24 2.84l1.42-1.41-1.8-1.79-1.41 1.41 1.79 1.79zM4.24 19.16l1.79-1.79-1.41-1.41-1.79 1.79 1.41 1.41zM12 6a6 6 0 100 12 6 6 0 000-12z"/></svg>
                              )}
                          </button>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};
