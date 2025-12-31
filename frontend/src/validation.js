// match anything inside {{...}} (trimmed), so input names with spaces are supported
// eslint-disable-next-line no-useless-escape
const VARIABLE_REGEX = /\{\{\s*([^\{\}]+?)\s*\}\}/g;

export const extractVariables = (text = '') => {
  const result = new Set();
  if (typeof text !== 'string') return [];
  let match;
  while ((match = VARIABLE_REGEX.exec(text)) !== null) {
    result.add(match[1]);
  }
  return Array.from(result);
};

export const normalizeName = (value) => value?.toString().trim().toLowerCase();

const buildNodeMap = (nodes = []) => {
  const map = new Map();
  nodes.forEach((node) => map.set(node.id, node));
  return map;
};

const buildIncomingEdgeMap = (edges = []) => {
  const map = new Map();
  edges.forEach((edge) => {
    if (!edge?.target) return;
    if (!map.has(edge.target)) {
      map.set(edge.target, []);
    }
    map.get(edge.target).push(edge.source);
  });
  return map;
};

export const getReachableInputMeta = (nodeId, nodes = [], edges = []) => {
  const incomingMap = buildIncomingEdgeMap(edges);
  const nodeMap = buildNodeMap(nodes);
  const stack = [nodeId];
  const visited = new Set();
  const seenInputs = new Set();
  const meta = [];

  while (stack.length) {
    const current = stack.pop();
    const incoming = incomingMap.get(current) || [];
    incoming.forEach((sourceId) => {
      if (!sourceId || visited.has(sourceId)) return;
      visited.add(sourceId);
      stack.push(sourceId);
      const node = nodeMap.get(sourceId);
      if (node?.type === 'customInput') {
        const label = (node?.data?.inputName || node.id || '').trim() || node.id;
        const normalized = normalizeName(label || node.id);
        if (normalized && !seenInputs.has(normalized)) {
          seenInputs.add(normalized);
          meta.push({ label, normalized });
        }
      }
    });
  }

  return meta;
};

export const collectVariableIssues = (nodes = [], edges = []) => {
  const issues = [];

  nodes.forEach((node) => {
    if (node?.type !== 'text') return;
    const text = node?.data?.text || '';
    const variables = extractVariables(text);
    const reachableInputs = getReachableInputMeta(node.id, nodes, edges);
    const inputSet = new Set(reachableInputs.map((entry) => entry.normalized));

    // missing variables explicitly referenced with {{var}}
    const missingFromBraces = variables.filter((v) => !inputSet.has(normalizeName(v)));

    // detect bare identifier-like tokens for hints
    const identifierMatches = Array.from(new Set((text.match(/\b[A-Za-z_$][A-Za-z0-9_$]*\b/g) || [])));
    const braceNames = variables.map((v) => normalizeName(v));
    const bareCandidates = identifierMatches
      .map((token) => normalizeName(token))
      .filter((token) => token && !braceNames.includes(token));
    const missingBare = bareCandidates.filter((token) => !inputSet.has(token));

    const missing = missingFromBraces.length ? missingFromBraces : missingBare;
    if (missing.length) {
      issues.push({ nodeId: node.id, missing });
    }
  });

  return issues;
};
