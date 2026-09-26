import type { TreeEvent } from './types'

export const treeAdapter = {
  id: 'binary-search-tree',
  title: 'Binary Search Tree',
  intro: 'Build a binary search tree from your insertion sequence, then inspect preorder or inorder traversal, or lookup, one step at a time.',
  warning: undefined,
  pseudocode: [
    { id: 'tree-initialize', text: 'start with an empty binary search tree' },
    { id: 'tree-insertion-visit', text: 'visit the current node while finding an insertion position' },
    { id: 'tree-insertion-compare', text: 'go left for smaller values; right for larger values' },
    { id: 'tree-attach-root', text: 'attach the first value as the root' },
    { id: 'tree-attach-child', text: 'attach the value as a child' },
    { id: 'tree-construction-complete', text: 'construction is complete' },
    { id: 'tree-lookup-visit', text: 'visit the current node during lookup' },
    { id: 'tree-lookup-compare', text: 'go left for smaller targets; right for larger targets' },
    { id: 'tree-lookup-found', text: 'return the matching node' },
    { id: 'tree-lookup-not-found', text: 'stop when the selected child is absent' },
    { id: 'tree-lookup-complete', text: 'return the found or not-found lookup outcome' },
    { id: 'tree-preorder-visit', text: 'visit node, then left subtree, then right subtree' },
    { id: 'tree-inorder-visit', text: 'visit left subtree, then node, then right subtree' },
    { id: 'tree-operation-complete', text: 'return traversal order' },
  ],
  complexity: [
    { label: 'Build', value: 'O(n²)', explanation: 'A skewed BST can make each insertion visit all prior nodes.' },
    { label: 'Operate', value: 'O(n)', explanation: 'Traversal visits every node; lookup follows one root-to-leaf path.' },
    { label: 'Space', value: 'O(n)', explanation: 'The BST stores one node for each insertion value.' },
  ],
  explain(event: TreeEvent): string {
    if (event.type === 'TREE_INITIALIZED') return 'Start with an empty binary search tree.'
    if (event.type === 'INSERTION_NODE_VISITED') return `Visit ${event.state.nodes.find(node => node.id === event.data.nodeId)?.value} while finding its insertion position.`
    if (event.type === 'INSERTION_COMPARED') return `The next value is ${event.data.direction} of the current node.`
    if (event.type === 'NODE_ATTACHED') return event.data.position === 'root'
      ? `Attach ${event.state.nodes.find(node => node.id === event.data.nodeId)?.value} as the root.`
      : `Attach ${event.state.nodes.find(node => node.id === event.data.nodeId)?.value} as the ${event.data.position} child.`
    if (event.type === 'CONSTRUCTION_COMPLETED') return event.state.lookupTarget === null || event.state.lookupTarget === undefined ? 'Construction is complete; traversal begins next.' : `Construction is complete; lookup for ${event.state.lookupTarget} begins next.`
    if (event.type === 'LOOKUP_NODE_VISITED') return `Inspect ${event.state.nodes.find(node => node.id === event.data.nodeId)?.value} while looking for ${event.state.lookupTarget}.`
    if (event.type === 'LOOKUP_COMPARED') return `The target is ${event.data.direction} of the current node.`
    if (event.type === 'LOOKUP_FOUND') return `Found ${event.state.lookupTarget}.`
    if (event.type === 'LOOKUP_NOT_FOUND') return `${event.state.lookupTarget} is not in this binary search tree.`
    if (event.type === 'TRAVERSAL_NODE_VISITED') return event.pseudocodeLineId === 'tree-inorder-visit'
      ? `Visit ${event.state.nodes.find(node => node.id === event.data.nodeId)?.value} after its left subtree; inorder stays ascending in a valid binary search tree.`
      : `Visit ${event.state.nodes.find(node => node.id === event.data.nodeId)?.value} in preorder.`
    return `Traversal complete: ${event.state.traversalOrder.join(' → ')}.`
  },
}
