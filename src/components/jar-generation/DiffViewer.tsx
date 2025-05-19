
import React from 'react';
import { Diff, Hunk, parseDiff } from 'react-diff-view';
import 'react-diff-view/style/index.css';

type FileEntry = { 
  filename: string; 
  status: string; 
  patch?: string;
};

// Enhanced DiffViewer with header-dedup and error handling
const DiffViewer = ({ filename, patch }: FileEntry) => {
  if (!patch) return <p className="text-sm text-muted">No changes</p>;

  const header = [
    `diff --git a/${filename} b/${filename}`,
    `--- a/${filename}`,
    `+++ b/${filename}`,
  ].join('\n');

  const unified = patch.startsWith('diff --git')
    ? patch
    : header + '\n' + patch;

  let files;
  try {
    files = parseDiff(unified);
  } catch (err) {
    console.error('parseDiff error', err);
    return (
      <pre className="p-2 bg-muted rounded overflow-auto text-sm whitespace-pre-wrap">
        {unified}
      </pre>
    );
  }

  if (!files.length) return <p className="text-sm text-muted">Empty diff</p>;

  const file = files.find((f) => f.hunks.length) || files[0];

  return (
    <Diff
      viewType="split"
      diffType="modify"
      hunks={file.hunks}
    >
      {(hunks) => hunks.map((h, idx) => <Hunk key={idx} hunk={h}/>)}
    </Diff>
  );
};

export default DiffViewer;
