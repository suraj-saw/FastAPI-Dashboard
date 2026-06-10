// import { useEffect, useState } from "react";

// export function useChartAnimation<T>(data: T[]) {
//   const [animate, setAnimate] = useState(false);
//   const [hasAnimated, setHasAnimated] = useState(false);

//   useEffect(() => {
//     if (!data.length || hasAnimated) return;

//     setAnimate(true);
//     setHasAnimated(true);

//     const timer = setTimeout(() => {
//       setAnimate(false);
//     }, 1000);

//     return () => clearTimeout(timer);

//   }, [data, hasAnimated]);


//   return animate;
// }