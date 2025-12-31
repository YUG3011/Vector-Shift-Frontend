import { useEffect } from 'react';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import Inspector from './components/Inspector';
import { useStore } from './store';

function App() {
  const isFullscreen = useStore((s) => s.isFullscreen);
  const setFullscreen = useStore((s) => s.setFullscreen);

  useEffect(() => {
    const handler = () => {
      const active = Boolean(document.fullscreenElement);
      setFullscreen(active);
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, [setFullscreen]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.classList.toggle('is-fullscreen', isFullscreen);
  }, [isFullscreen]);

  return (
    <div>
      <PipelineToolbar />
      <PipelineUI />
      <SubmitButton variant={isFullscreen ? 'toolbar' : 'footer'} />
      <Inspector />
    </div>
  );
}

export default App;
