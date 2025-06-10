// src/types/react-terminal-ui.d.ts

declare module 'react-terminal-ui' {
  import * as React from 'react';

  /** Now a string‐union, not an enum */
  export type ColorMode = 'light' | 'dark';

  /** Now a string‐union, not an enum */
  export type LineType = 'input' | 'output' | 'group';

  interface TerminalProps {
    name?: string;
    colorMode?: ColorMode;
    hideTopBar?: boolean;
    className?: string;
    children?: React.ReactNode;
  }
  export class Terminal extends React.Component<TerminalProps> {}

  interface OutputProps {
    type: LineType;
    message: string;
    className?: string;
  }
  export class Output extends React.Component<OutputProps> {}
}
