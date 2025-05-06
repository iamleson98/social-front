interface Options {
  onMouseLeave?: (event: MouseEvent) => void;
}

export function mouseLeave(node: HTMLElement, options: Options = {}) {
  const { onMouseLeave } = options;

  const handleFocusOut = (event: MouseEvent) => {
    if (onMouseLeave && event.relatedTarget instanceof Node && !node.contains(event.relatedTarget as Node)) {
      onMouseLeave(event);
    }
  };

  node.addEventListener('mouseleave', handleFocusOut);

  return {
    destroy() {
      node.removeEventListener('mouseleave', handleFocusOut);
    },
  };
}
