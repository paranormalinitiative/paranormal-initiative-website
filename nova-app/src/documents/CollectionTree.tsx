import { Folder, Pencil } from "lucide-react";
import type { NovaCollection } from "../lib/types";
import { buildCollectionTree, type CollectionNode } from "../lib/tree";

interface Props {
  collections: NovaCollection[];
  selected: string;
  onSelect: (filter: string) => void;
  onRename: (collection: NovaCollection) => void;
}

function CollectionRow({ node, depth, selected, onSelect, onRename }: {
  node: CollectionNode;
  depth: number;
  selected: string;
  onSelect: (filter: string) => void;
  onRename: (collection: NovaCollection) => void;
}) {
  return (
    <li>
      <div className={`nova-folder-row${selected === node.id ? " is-selected" : ""}`} style={{ paddingLeft: `${10 + depth * 14}px` }}>
        <button
          type="button"
          className="nova-folder-select"
          data-testid="folder-select"
          data-folder-id={node.id}
          aria-current={selected === node.id ? "true" : undefined}
          onClick={() => onSelect(node.id)}
          title={node.name}
        >
          <Folder className="nova-folder-glyph" size={15} strokeWidth={1.9} aria-hidden="true" focusable="false" />
          <span className="nova-folder-name">{node.name}</span>
          <span className="nova-folder-count">{node.itemCount ?? 0}</span>
        </button>
        <button
          type="button"
          className="nova-folder-rename"
          data-testid="folder-rename"
          aria-label={`Rename ${node.name}`}
          title="Rename folder"
          onClick={() => onRename(node)}
        >
          <Pencil size={14} strokeWidth={1.9} aria-hidden="true" focusable="false" />
        </button>
      </div>
      {node.children.length > 0 ? (
        <ul className="nova-folder-children">
          {node.children.map(child => (
            <CollectionRow
              key={child.id}
              node={child}
              depth={depth + 1}
              selected={selected}
              onSelect={onSelect}
              onRename={onRename}
            />
          ))}
        </ul>
      ) : null}
    </li>
  );
}

export function CollectionTree({ collections, selected, onSelect, onRename }: Props) {
  const tree = buildCollectionTree(collections);

  return (
    <div className="nova-folders" data-testid="collection-tree">
      <div className="nova-sidebar-heading">
        <span>Folders</span>
      </div>
      <ul className="nova-folder-list">
        <li>
          <button
            type="button"
            className={`nova-folder-row nova-folder-unfiled${selected === "unfiled" ? " is-selected" : ""}`}
            data-testid="folder-unfiled"
            onClick={() => onSelect("unfiled")}
          >
            <span className="nova-folder-glyph" aria-hidden="true">◦</span>
            <span className="nova-folder-name">Unfiled</span>
          </button>
        </li>
        {tree.map(node => (
          <CollectionRow
            key={node.id}
            node={node}
            depth={0}
            selected={selected}
            onSelect={onSelect}
            onRename={onRename}
          />
        ))}
      </ul>
      {tree.length === 0 ? <p className="nova-sidebar-hint">No folders yet.</p> : null}
    </div>
  );
}
