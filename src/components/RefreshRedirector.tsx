import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const RefreshRedirector: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check if the page was reloaded
    const navigationEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    
    if (navigationEntries.length > 0) {
      const navigationType = navigationEntries[0].type;
      
      // If the page was reloaded and we're not already on the homepage
      if (navigationType === 'reload' && location.pathname !== '/') {
        navigate('/', { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  // This component doesn't render anything
  return null;
};

export default RefreshRedirector;