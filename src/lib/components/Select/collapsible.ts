export function accordion(node: HTMLElement, isOpen: boolean) {
  node.style.overflow = 'hidden';
  node.style.height = isOpen ? 'auto' : '0';
  node.classList.add('accordion');
  return {
    update(isOpen: boolean) {
      const animation = node.animate(
        [
          {
            height: node.scrollHeight + 'px',
          },
          {
            height: 0,
          },
        ],
        { duration: 150, fill: 'both' }
      );
      animation.pause();
      if (!isOpen) {
        animation.play();
      } else {
        animation.reverse();
      }
      // Used for nested accordions
      animation.onfinish = () => {
        animation.cancel();
        node.style.height = isOpen ? 'auto' : '0';
      };
    },
  };
}
