export interface GraphPreset {
  label: string
  description: string
  input: string
  startNode: string
  destination?: string
}

export const graphPresets: GraphPreset[] = [
  {
    label: 'DFS depth',
    description: 'Compare how the DFS stack follows one branch before returning while the BFS queue works level by level.',
    input: 'A-B\nA-C\nB-D\nB-E\nC-F',
    startNode: 'A',
    destination: 'F',
  },
  {
    label: 'Cycle',
    description: 'See already-discovered checks prevent repeated work around a cycle.',
    input: 'A-B\nB-C\nC-D\nD-A\nB-D',
    startNode: 'A',
    destination: 'C',
  },
  {
    label: 'Disconnected',
    description: 'Traverse one component and identify nodes that remain unreachable.',
    input: 'A-B\nB-C\nD-E\nF',
    startNode: 'A',
    destination: 'E',
  },
  {
    label: 'Edges vs cost',
    description: 'BFS chooses the direct one-edge path; Dijkstra chooses the longer path with lower total cost.',
    input: 'A-D:9\nA-B:2\nB-C\nC-D:2',
    startNode: 'A',
    destination: 'D',
  },
  {
    label: 'Mixed weights',
    description: 'Compare explicitly weighted edges with unweighted edges, which cost one in Dijkstra.',
    input: 'A-B:4\nA-C\nB-D:2\nC-D',
    startNode: 'A',
    destination: 'D',
  },
  {
    label: 'Equal-cost tie',
    description: 'See declaration order retain the first parent when two routes have the same cost.',
    input: 'A-B:2\nA-C:2\nB-D:2\nC-D:2',
    startNode: 'A',
    destination: 'D',
  },
  {
    label: 'Unreachable destination',
    description: 'Complete normally with no path when the destination is in another component.',
    input: 'A-B\nC-D:5',
    startNode: 'A',
    destination: 'D',
  },
]
