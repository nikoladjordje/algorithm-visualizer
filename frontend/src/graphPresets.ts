export interface GraphPreset {
  label: string
  input: string
  startNode: string
}

export const graphPresets: GraphPreset[] = [
  {
    label: 'Branching',
    input: 'A-B\nA-C\nB-D\nB-E\nC-F',
    startNode: 'A',
  },
  {
    label: 'Cycle',
    input: 'A-B\nB-C\nC-D\nD-A\nB-D',
    startNode: 'A',
  },
  {
    label: 'Disconnected',
    input: 'A-B\nB-C\nD-E\nF',
    startNode: 'A',
  },
]
