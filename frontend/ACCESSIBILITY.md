# Accessibility Verification

Target WCAG 2.2 AA for the sorting and graph-traversal workbench.

- Tab through the input, Visualize button, playback controls, speed selector, and Retry button. Confirm focus order follows the page and every focused control has a visible outline.
- Submit the array with Enter. Operate Play/Pause, Previous step, Next step, Reset, and speed selection with the keyboard.
- With a screen reader, confirm input help and errors are associated with the field and loading, event changes, completion, and service errors are announced.
- Confirm the chart announces indexed values and the current operation without depending on bar color.
- For BFS, confirm every node and state, queue, traversal order, examined edge, parents, and
  unreachable completion state are available as text and in the SVG description.
- Confirm symbols and border patterns distinguish all four node states without color, and that the
  dashed examined edge remains distinct from solid BFS-tree edges.
- Operate graph editing, start selection, presets, and playback entirely from the keyboard.
- Verify normal text reaches 4.5:1 contrast, large text and graphical controls reach 3:1, and focus indicators remain visible.
- Enable reduced motion at the operating-system level and confirm graph, bar, button, and loading
  animations are effectively removed.
