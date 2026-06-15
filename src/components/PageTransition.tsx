import { useEffect, useState, useRef } from 'react';
import { useLocation, Outlet } from 'react-router-dom';

/**
 * Wraps page content with smooth fade+slide enter/exit animations.
 * Uses CSS transitions triggered on route change.
 */
export default function PageTransition() {
  const location = useLocation();
  const [transitionStage, setTransitionStage] = useState('fadeIn');
  const prevLocation = useRef(location);

  useEffect(() => {
    if (location.pathname !== prevLocation.current.pathname) {
      setTransitionStage('fadeOut');
      prevLocation.current = location;
    }
  }, [location]);

  return (
    <div
      onAnimationEnd={() => {
        if (transitionStage === 'fadeOut') {
          setTransitionStage('fadeIn');
        }
      }}
    >
      <div
        className={
          transitionStage === 'fadeIn'
            ? 'animate-page-enter'
            : 'animate-page-exit'
        }
      >
        <Outlet />
      </div>
    </div>
  );
}
