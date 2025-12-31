// ui.js
// Displays the drag-and-drop UI
// --------------------------------------------------

import { useState, useRef, useCallback } from 'react';
import ReactFlow, { Controls, Background, MiniMap } from 'reactflow';
import { useStore } from './store';
import { shallow } from 'zustand/shallow';
import { InputNode } from './nodes/inputNode';
import { LLMNode } from './nodes/llmNode';
import { OutputNode } from './nodes/outputNode';
import { TextNode } from './nodes/textNode';
import { ImageNode } from './nodes/imageNode';
import { DateNode } from './nodes/dateNode';
import { MathNode } from './nodes/mathNode';
import { APINode } from './nodes/apiNode';
import { FormNode } from './nodes/formNode';

import 'reactflow/dist/style.css';

const gridSize = 20;
const proOptions = { hideAttribution: true };
const nodeTypes = {
  customInput: InputNode,
  llm: LLMNode,
  customOutput: OutputNode,
  text: TextNode,
  image: ImageNode,
  date: DateNode,
  math: MathNode,
  api: APINode,
  form: FormNode,
};

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  getNodeID: state.getNodeID,
  addNode: state.addNode,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  setSelectedNode: state.setSelectedNode,
});

export const PipelineUI = () => {
    const reactFlowWrapper = useRef(null);
    const [reactFlowInstance, setReactFlowInstance] = useState(null);
    const {
      nodes,
      edges,
      getNodeID,
      addNode,
      onNodesChange,
      onEdgesChange,
      onConnect,
      setSelectedNode,
    } = useStore(selector, shallow);
    const isFullscreen = useStore((s) => s.isFullscreen);

    const getInitNodeData = (nodeID, type) => {
      let nodeData = { id: nodeID, nodeType: `${type}` };
      // sensible defaults so nodes have initial editable data
      if (type === 'text') nodeData.text = '';
      if (type === 'customInput') nodeData.inputName = nodeID.replace('customInput-', 'input_');
      if (type === 'customOutput') nodeData.outputName = nodeID.replace('customOutput-', 'output_');
      return nodeData;
    }

    const onDrop = useCallback(
        (event) => {
          event.preventDefault();
    
          const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
          if (event?.dataTransfer?.getData('application/reactflow')) {
            const appData = JSON.parse(event.dataTransfer.getData('application/reactflow'));
            const type = appData?.nodeType;
      
            // check if the dropped element is valid
            if (typeof type === 'undefined' || !type) {
              return;
            }
      
            const position = reactFlowInstance.project({
              x: event.clientX - reactFlowBounds.left,
              y: event.clientY - reactFlowBounds.top,
            });

            const nodeID = getNodeID(type);
            const newNode = {
              id: nodeID,
              type,
              position,
              data: getInitNodeData(nodeID, type),
            };
      
            addNode(newNode);
          }
        },
        [reactFlowInstance, getNodeID, addNode]
    );

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const toggleFullscreen = useCallback(async () => {
      try {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        } else {
          await document.exitFullscreen();
        }
      } catch (err) {
        console.error('Fullscreen toggle failed', err);
      }
    }, []);

    return (
        <>
        <div
          ref={reactFlowWrapper}
          style={{
            width: '100vw',
            height: isFullscreen ? 'calc(100vh - 96px)' : '70vh',
            marginTop: isFullscreen ? 8 : 0,
            transition: 'height 0.2s ease, margin-top 0.2s ease',
          }}
        >
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
          onNodeClick={(evt, node) => setSelectedNode(node.id)}
                onDrop={onDrop}
                onDragOver={onDragOver}
                onInit={setReactFlowInstance}
                nodeTypes={nodeTypes}
                proOptions={proOptions}
                snapGrid={[gridSize, gridSize]}
                connectionLineType='smoothstep'
            >
                <Background color="#aaa" gap={gridSize} />
                <Controls>
                  <button
                    type="button"
                    className="react-flow__controls-button"
                    onClick={toggleFullscreen}
                    title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                    aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
                  >
                    {isFullscreen ? '⤡' : '⤢'}
                  </button>
                </Controls>
                <MiniMap />
            </ReactFlow>
        </div>
        </>
    )
}
