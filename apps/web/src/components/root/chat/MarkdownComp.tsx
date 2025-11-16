import type { Components } from "react-markdown";

export const markdownComponents: Components = {
  p: ({ children }) => (
    <p className="text-neutral-200 leading-relaxed mb-4 last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }) => (
    <ul className="text-neutral-200 space-y-2 my-4 list-disc pl-6">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="text-neutral-200 space-y-2 my-4 list-decimal pl-6">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="text-neutral-200 leading-relaxed">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="text-neutral-100 font-semibold">{children}</strong>
  ),
  code: ({ children }) => (
    <code className="bg-neutral-800 text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono">
      {children}
    </code>
  ),
  pre: ({ children }) => (
    <pre className="bg-neutral-800 rounded-lg p-4 overflow-x-auto my-4">
      {children}
    </pre>
  ),
  h1: ({ children }) => (
    <h1 className="text-neutral-100 text-2xl font-bold mt-6 mb-4">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-neutral-100 text-xl font-bold mt-5 mb-3">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-neutral-100 text-lg font-semibold mt-4 mb-2">
      {children}
    </h3>
  ),
};
