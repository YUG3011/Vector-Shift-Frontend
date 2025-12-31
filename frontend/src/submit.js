// submit.js

import { useCallback, useMemo, useState } from 'react';
import { useStore } from './store';
import Toast from './components/Toast';
import { collectVariableIssues } from './validation';

export const SubmitButton = ({ variant = 'footer' }) => {
        const nodes = useStore((s) => s.nodes);
        const edges = useStore((s) => s.edges);
        const setToast = useStore((s) => s.setToast);
        const toast = useStore((s) => s.toast);
        const [isSubmitting, setIsSubmitting] = useState(false);
    const mode = useMemo(() => variant === 'toolbar' ? 'toolbar' : 'footer', [variant]);

        const showValidationIssues = useCallback(() => {
            const variableIssues = collectVariableIssues(nodes, edges);
            if (!variableIssues.length) {
                return false;
            }
            const missingList = variableIssues
              .map((issue) => `${issue.nodeId}: ${issue.missing.join(', ')}`)
              .join(' | ');
            setToast({ message: `Missing inputs: ${missingList}`, type: 'error' });
            setTimeout(() => setToast(null), 6000);
            return true;
        }, [nodes, edges, setToast]);

        const runPipelineRequest = useCallback(async (path, successMessageBuilder) => {
            if (showValidationIssues()) return;
            setIsSubmitting(true);
            try {
                const res = await fetch(`http://localhost:8000${path}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nodes, edges }),
                });

                if (!res.ok) {
                    const errBody = await res.json().catch(() => ({}));
                    const detail = errBody.detail || `Server returned ${res.status}`;
                    throw new Error(detail);
                }
                const body = await res.json();
                const msg = successMessageBuilder(body);
                setToast({ message: msg, type: 'info' });
                setTimeout(() => setToast(null), 3500);
            } catch (err) {
                setToast({ message: 'Request failed: ' + err.message, type: 'error' });
                setTimeout(() => setToast(null), 6000);
            } finally {
                setIsSubmitting(false);
            }
        }, [edges, nodes, setToast, showValidationIssues]);

        const handleSubmit = useCallback(() => {
            runPipelineRequest('/pipelines/parse', (body) => `Nodes: ${body.num_nodes} | Edges: ${body.num_edges} | Is DAG: ${body.is_dag}`);
        }, [runPipelineRequest]);

        const handleExecute = useCallback(() => {
            runPipelineRequest('/pipelines/execute', (body) => `Execution queued (${body.num_nodes} nodes). First step: ${body.execution_order?.[0]?.id ?? 'n/a'}`);
        }, [runPipelineRequest]);

        return (
                <>
                    <div className={`vs-submit ${mode === 'toolbar' ? 'vs-submit-toolbar' : ''}`} role="group" aria-label="Pipeline actions">
                        {mode !== 'toolbar' && (
                          <div className="vs-submit-meta" role="contentinfo">
                              <span className="footer-name">Yug Vachhani — Fullstack Developer</span>
                              <span className="footer-links">
                                  <a href="https://www.linkedin.com/in/yug-vachhani-bb4133251/" target="_blank" rel="noreferrer">LinkedIn</a>
                                  <span className="dot">•</span>
                                  <a href="https://github.com/YUG3011" target="_blank" rel="noreferrer">GitHub</a>
                              </span>
                          </div>
                        )}
                        <div className="vs-submit-actions">
                            <button className="vs-btn" type="button" onClick={handleSubmit} disabled={isSubmitting}>
                                {isSubmitting ? 'Validating…' : 'Validate Pipeline'}
                            </button>
                            <button className="vs-btn secondary" type="button" onClick={handleExecute} disabled={isSubmitting}>
                                Execute Pipeline
                            </button>
                        </div>
                    </div>
                    {toast && <Toast message={toast.message} type={toast.type} />}
                </>
        );
}
