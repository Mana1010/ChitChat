import React, { useEffect, useState } from "react";

function useDebounce(value: string, delay = 1000) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  console.log(value);
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedValue(value);
      console.log("Debounced Value:", value);
      return () => {
        clearTimeout(timeout);
      };
    }, delay);
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
