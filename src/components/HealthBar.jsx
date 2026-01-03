// import React, { useEffect, useState } from "react";
// import { healthApi, API_BASE } from "../api";
// import "../HealthBar.css";

// function HealthBar() {
//   const [accountsStatus, setAccountsStatus] = useState(null);
//   const [userAuthStatus, setUserAuthStatus] = useState(null);
//   const [cacheStatus, setCacheStatus] = useState(null);
//   const [error, setError] = useState(null);
//   const [loading, setLoading] = useState(false);


//   async function checkHealth() {
//     setLoading(true);
//     setError(null);
//     setAccountsStatus(null);
//     setUserAuthStatus(null);
//     setCacheStatus(null);

//     try {
//       const acc = await healthApi.accounts();
//       setAccountsStatus(acc?.status || "UP");
//     } catch (err) {
//       console.error(err);
//       setAccountsStatus("DOWN");
//       setError((prev) => prev || "Error al comprobar accounts");
//     }

//     try {
//       const auth = await healthApi.userAuth();
//       setUserAuthStatus(auth?.status || "UP");
//     } catch (err) {
//       console.error(err);
//       setUserAuthStatus("DOWN");
//       setError((prev) => prev || "Error al comprobar auth");
//     }

//     try {
//       const cache = await healthApi.cache();
//       const ok = cache?.ok === true || cache?.cache === "ok";
//       setCacheStatus(ok ? "UP" : "DOWN");
//       if (!ok) {
//         setError((prev) => prev || "Caché Redis no disponible");
//       }
//     } catch (err) {
//       console.error(err);
//       setCacheStatus("DOWN");
//       setError((prev) => prev || "Caché Redis no disponible");
//     } finally {
//       setLoading(false);
//     }
//   }


//   useEffect(() => {
//     checkHealth();
//   }, []);

//   // accounts
//   let accountsText = "...";
//   let accountsClass = "hb-chip hb-chip--neutral";
//   if (accountsStatus) {
//     const normalized = String(accountsStatus).toUpperCase();
//     if (normalized === "UP" || normalized === "OK") {
//       accountsText = "UP";
//       accountsClass = "hb-chip hb-chip--ok";
//     } else if (normalized === "STARTING") {
//       accountsText = "STARTING";
//       accountsClass = "hb-chip hb-chip--neutral";
//     } else {
//       accountsText = normalized;
//       accountsClass = "hb-chip hb-chip--error";
//     }
//   }


  
//   let userAuthText = "...";
//   let userAuthClass = "hb-chip hb-chip--neutral";
//   if (userAuthStatus) {
//     const normalized = String(userAuthStatus).toUpperCase();
//     if (normalized === "UP" || normalized === "OK") {
//       userAuthText = "UP";
//       userAuthClass = "hb-chip hb-chip--ok";
//     } else if (normalized === "STARTING") {
//       userAuthText = "STARTING";
//       userAuthClass = "hb-chip hb-chip--neutral";
//     } else {
//       userAuthText = normalized;
//       userAuthClass = "hb-chip hb-chip--error";
//     }
//   }


  
//   let cacheText = "...";
//   let cacheClass = "hb-chip hb-chip--neutral";
//   if (cacheStatus) {
//     const normalized = String(cacheStatus).toUpperCase();
//     if (normalized === "UP" || normalized === "OK" || normalized === "TRUE") {
//       cacheText = "UP";
//       cacheClass = "hb-chip hb-chip--ok";
//     } else if (normalized === "STARTING") {
//       cacheText = "STARTING";
//       cacheClass = "hb-chip hb-chip--neutral";
//     } else {
//       cacheText = normalized;
//       cacheClass = "hb-chip hb-chip--error";
//     }
//   }

//   return (
//     <div className="healthbar">
//       <div className="page-inner healthbar-inner">
//         <div className="healthbar-left">
//           <span className="health-label">API</span>
//           <code className="health-code">{API_BASE}</code>
//         </div>

//         <div className="healthbar-right">
//           <button
//             type="button"
//             className="hb-refresh"
//             onClick={checkHealth}
//             disabled={loading}
//           >
//             {loading ? "Comprobando..." : "Refrescar estado"}
//           </button>

//           <span className={accountsClass}>accounts: {accountsText}</span>
//           <span className={userAuthClass}>auth: {userAuthText}</span>
//           <span className={cacheClass}>cache: {cacheText}</span>

//           {error && (
//             <span className="hb-chip hb-chip--error hb-error-text">
//               {error}
//             </span>
//           )}
//         </div>
//       </div>
//     </div>
//   );


// export default HealthBar;
