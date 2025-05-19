
import { FileEntry, TreeNode } from './FileTree';

// Build a nested tree from flat list of FileEntry
export function buildTree(files: FileEntry[]): TreeNode[] {
  const roots: TreeNode[] = [];
  const map = new Map<string, TreeNode>();
  files.forEach(({filename, status, patch}) => {
    const parts = filename.split('/');
    let nodes = roots;
    let prefix = '';
    parts.forEach((part, idx) => {
      prefix = prefix ? `${prefix}/${part}` : part;
      let node = map.get(prefix);
      const isFile = idx === parts.length - 1;
      if (!node) {
        node = {
          name: part,
          path: prefix,
          children: [],
          isFile,
          status: isFile ? status : undefined,
          patch: isFile ? patch : undefined,
        };
        map.set(prefix, node);
        nodes.push(node);
      }
      nodes = node.children;
    });
  });
  return roots;
}

// Collect folder paths for "expand all"
export function collectFolders(nodes: TreeNode[]): string[] {
  let out: string[] = [];
  nodes.forEach((n) => {
    if (!n.isFile) {
      out.push(n.path);
      out = out.concat(collectFolders(n.children));
    }
  });
  return out;
}
