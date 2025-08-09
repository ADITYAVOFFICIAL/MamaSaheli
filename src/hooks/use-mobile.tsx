import { useState, useEffect } from 'react';

/**
 * A hook to determine if the current viewport width is less than 768px.
 * Defaults to `false` on the server and updates on the client after mounting.
 * This prevents server-client hydration mismatches by always returning a boolean.
 */
const useIsMobile = (): boolean => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // This effect runs only on the client side.
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Perform the check immediately on mount.
    checkDevice();

    // Add a listener for window resize events.
    window.addEventListener('resize', checkDevice);

    // Cleanup function to remove the listener when the component unmounts.
    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []); // The empty dependency array ensures this effect runs only once.

  return isMobile;
};

export { useIsMobile };
