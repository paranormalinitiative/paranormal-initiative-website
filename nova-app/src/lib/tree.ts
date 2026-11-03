import type { NovaCollection } from "./types";

export interface CollectionNode extends NovaCollection {
  children: CollectionNode[];
}

// Builds the owner's folder tree from the flat collection list. Unknown parents
// become roots so malformed data can never hide a folder from the UI, and a
// cycle in the data cannot recurse forever.
export function buildCollectionTree(collections: NovaCollection[]): CollectionNode[] {
  const nodes = new Map<string, CollectionNode>();
  for (const collection of collections) nodes.set(collection.id, { ...collection, children: [] });

  const roots: CollectionNode[] = [];
  for (const node of nodes.values()) {
    const parent = node.parentId ? nodes.get(node.parentId) : undefined;
    if (parent && parent.id !== node.id) parent.children.push(node);
    else roots.push(node);
  }

  const visited = new Set<string>();
  const sort = (list: CollectionNode[]): void => {
    list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }));
    for (const node of list) {
      if (visited.has(node.id)) {
        node.children = [];
        continue;
      }
      visited.add(node.id);
      sort(node.children);
    }
  };
  sort(roots);
  return roots;
}

export function flattenCollectionTree(nodes: CollectionNode[], depth = 0): Array<{ collection: NovaCollection; depth: number }> {
  const flat: Array<{ collection: NovaCollection; depth: number }> = [];
  for (const node of nodes) {
    flat.push({ collection: node, depth });
    flat.push(...flattenCollectionTree(node.children, depth + 1));
  }
  return flat;
}

export function collectionPath(collections: NovaCollection[], id: string | null): string {
  if (!id) return "Unfiled";
  const byId = new Map(collections.map(collection => [collection.id, collection]));
  const parts: string[] = [];
  let current = byId.get(id);
  let guard = 0;
  while (current && guard < 32) {
    parts.unshift(current.name);
    current = current.parentId ? byId.get(current.parentId) : undefined;
    guard += 1;
  }
  return parts.length ? parts.join(" / ") : "Unfiled";
}
