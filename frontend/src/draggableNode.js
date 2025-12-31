// draggableNode.js

export const DraggableNode = ({ type, label, onClick }) => {
    const onDragStart = (event, nodeType) => {
      const appData = { nodeType }
      event.target.style.cursor = 'grabbing';
      event.dataTransfer.setData('application/reactflow', JSON.stringify(appData));
      event.dataTransfer.effectAllowed = 'move';
    };
  
    const icon = (
      <span style={{
        width: 8,
        height: 8,
        borderRadius: 999,
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        display: 'inline-block',
        marginRight: 8
      }} />
    );

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        event.currentTarget.click();
      }
    };

    return (
      <div
        className="draggable-card"
        onDragStart={(event) => onDragStart(event, type)}
        onDragEnd={(event) => (event.target.style.cursor = 'grab')}
        onClick={(e) => { if (onClick) onClick(e); }}
        onKeyDown={handleKeyDown}
        draggable
        role="button"
        tabIndex={0}
        aria-label={`Add ${label} node`}
      >
          <div style={{display:'flex',alignItems:'center',gap:6}}>{icon}<span style={{ color: 'var(--text)' }}>{label}</span></div>
      </div>
    );
  };
  