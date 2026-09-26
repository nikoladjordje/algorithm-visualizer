import type { TreeEvent } from './types'

export const treeAdapter = {
  id: 'binary-search-tree',
  title: 'Binary Search Tree',
  intro: 'Build a binary search tree from your insertion sequence, then inspect preorder traversal one node at a time.',
  warning: undefined,
  pseudocode: [
    { id: 'tree-initialize', text: 'start with an empty binary search tree' },
    { id: 'tree-insertion-visit', text: 'visit the current node while finding an insertion position' },
    { id: 'tree-insertion-compare', text: 'go left for smaller values; right for larger values' },
    { id: 'tree-attach-root', text: 'attach the first value as the root' },
    { id: 'tree-attach-child', text: 'attach the value as a child' },
    { id: 'tree-construction-complete', text: 'construction is complete' },
    { id: 'tree-preorder-visit', text: 'visit node, then left subtree, then right subtree' },
    { id: 'tree-operation-complete', text: 'return preorder traversal order' },
  ],
  complexity: [
    { label: 'Build', value: 'O(n²)', explanation: 'A skewed BST can make each insertion visit all prior nodes.' },
    { label: 'Traverse', value: 'O(n)', explanation: 'Preorder visits every node once.' },
    { label: 'Space', value: 'O(n)', explanation: 'The BST stores one node for each insertion value.' },
  ],
  explain(event: TreeEvent): string {
    if (event.type === 'TREE_INITIALIZED') return 'Start with an empty binary search tree.'
    if (event.type === 'INSERTION_NODE_VISITED') return `Visit ${event.state.nodes.find(node => node.id === event.data.nodeId)?.value} while finding its insertion position.`
    if (event.type === 'INSERTION_COMPARED') return `The next value is ${event.data.direction} of the current node.`
    if (event.type === 'NODE_ATTACHED') return event.data.position === 'root'
      ? `Attach ${event.state.nodes.find(node => node.id === event.data.nodeId)?.value} as the root.`
      : `Attach ${event.state.nodes.find(node => node.id === event.data.nodeId)?.value} as the ${event.data.position} child.`
    if (event.type === 'CONSTRUCTION_COMPLETED') return 'Construction is complete; preorder traversal begins next.'
    if (event.type === 'TRAVERSAL_NODE_VISITED') return `Visit ${event.state.nodes.find(node => node.id === event.data.nodeId)?.value} in preorder.`
    return `Preorder traversal complete: ${event.state.traversalOrder.join(' → ')}.`
  },
}
