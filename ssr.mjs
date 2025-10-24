// ssr.mjs
import React from "react";
import { createInertiaApp } from "@inertiajs/react";
import { renderToString } from "react-dom/server";
import pretty from "pretty";

// ----------------------------------------------------------
// Ziggy setup
// ----------------------------------------------------------
import * as ZiggyImport from "ziggy-js";
import { Ziggy as ZiggyConfig } from "./ziggy";

const ZiggyJs = ZiggyImport;

// Expose global route() function
globalThis.route = (name, params, absolute) => {
  const routeFn = ZiggyJs.route ?? ZiggyJs.default?.route ?? ZiggyJs.default ?? ZiggyJs;
  return routeFn(name, params, absolute, ZiggyConfig);
};

// ----------------------------------------------------------
// HTML formatter
// ----------------------------------------------------------
const formatHtml = (html) =>
  process.env.NODE_ENV === "production" ? html : pretty(html, { ocd: true });

// ----------------------------------------------------------
// Exported render function for Express SSR server
// ----------------------------------------------------------
export default async function render(page) {
  let html = "";

  await createInertiaApp({
    page,
    // explicitly type el as any to bypass inference mismatch
    render: (el) => (html = renderToString(el)),
    // map all pages — you can paste your existing glob mapping here
    resolve: (name) => {
      const pages = {
        "./Pages/Annonce/ApprovedAnnonces.tsx": __vite_glob_0_0,
        "./Pages/Annonce/Create.tsx": __vite_glob_0_1,
        "./Pages/Annonce/Edit.tsx": __vite_glob_0_2,
        "./Pages/Annonce/Index.tsx": __vite_glob_0_3,
        "./Pages/Annonce/Journal/Index.tsx": __vite_glob_0_4,
        "./Pages/Annonce/Livrer.tsx": __vite_glob_0_5,
        "./Pages/Annonce/Show.tsx": __vite_glob_0_6,
        "./Pages/Annonce/Ticket/Index.tsx": __vite_glob_0_7,
        "./Pages/Annonce/Ticket/Show.tsx": __vite_glob_0_8,
        "./Pages/Annonce/Ticket/createTicket.tsx": __vite_glob_0_9,
        "./Pages/Annonce/Ticket/edit.tsx": __vite_glob_0_10,
        "./Pages/Annonce/UserAnnonces.tsx": __vite_glob_0_11,
        // ... continue copying all your pages from ssr.mjs
        "./Pages/Login.tsx": __vite_glob_0_65,
        "./Pages/Home.tsx": __vite_glob_0_64,
        "./Pages/Dashboard.tsx": __vite_glob_0_58,
        "./Pages/Error.tsx": __vite_glob_0_60,
        // and so on for all pages you currently have
      };

      const component = pages[`./Pages/${name}.tsx`];
      if (!component) {
        console.error(`❌ [SSR] Page not found: ${name}`);
        return null;
      }
      return component;
    },
    // setup function
    setup: ({ App, props }) => <App {...props} />,
  });

  return { head: [], body: formatHtml(html) };
}
