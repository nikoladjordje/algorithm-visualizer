import { fireEvent,render,screen,waitFor,within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest'
import App from './App'
const constraints={kind:'SORTING',minimumValues:1,maximumValues:50,minimumValue:-2147483648,maximumValue:2147483647}
const catalog=[{id:'insertion',name:'Insertion Sort',family:'SORTING',contractVersion:'2.0',constraints}]
const treeCatalog = { id: 'binary-search-tree', name: 'Binary Search Tree', family: 'TREE', contractVersion: '2.0', constraints: { kind: 'TREE', minimumValues: 1, maximumValues: 31, minimumValue: -2147483648, maximumValue: 2147483647, uniqueValues: true, operations: ['PREORDER'] } }
const graphCatalog={id:'bfs',name:'Breadth-First Search',family:'GRAPH_TRAVERSAL',contractVersion:'2.0',constraints:{kind:'GRAPH_TRAVERSAL',minimumNodes:1,maximumNodes:12,maximumEdges:66,nodeLabelPattern:'^[A-Za-z0-9_-]{1,16}$',directed:false,weighted:false}}
const dfsCatalog={...graphCatalog,id:'dfs',name:'Depth-First Search',constraints:{...graphCatalog.constraints,maximumNodes:12,maximumEdges:66}}
const pathCatalog={id:'dijkstra',name:"Dijkstra's Algorithm",family:'PATHFINDING',contractVersion:'2.0',constraints:{kind:'PATHFINDING',minimumNodes:1,maximumNodes:12,maximumEdges:66,nodeLabelPattern:'^[A-Za-z0-9_-]{1,16}$',directed:false,weighted:true,minimumWeight:1,maximumWeight:99,unweightedEdgeCost:1,destinationRequired:true}}
const fullCatalog=[...catalog,{id:'selection',name:'Selection Sort',family:'SORTING',contractVersion:'2.0',constraints},graphCatalog,pathCatalog]
const trace={apiVersion:'2.0',algorithm:{id:'insertion',name:'Insertion Sort',family:'SORTING'},input:{kind:'SORTING',values:[2,1]},result:{kind:'SORTING',values:[1,2]},limits:{maximumEvents:10000},events:[{sequence:1,type:'MARK_SORTED',pseudocodeLineId:'complete-pass',state:{kind:'SORTING',items:[{id:1,value:1},{id:0,value:2}],sortedRanges:[{fromIndex:0,throughIndex:1}]},data:{kind:'MARK_SORTED',fromIndex:0,throughIndex:1}}]}
beforeEach(()=>{history.replaceState(null,'','/');vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>new Response(JSON.stringify(String(input).endsWith('/api/v2/algorithms')?catalog:trace),{status:200,headers:{'Content-Type':'application/json'}})))})
afterEach(()=>vi.unstubAllGlobals())
describe('App algorithm workbench',()=>{
 it('runs linear search with a retained search draft and indexed playback state', async () => {
  const searchCatalog = { id: 'linear-search', name: 'Linear Search', family: 'SEARCH', contractVersion: '2.0', constraints: { kind: 'SEARCH', minimumValues: 0, maximumValues: 50, minimumValue: -2147483648, maximumValue: 2147483647, requiresNonDecreasingValues: false } }
  const searchTrace = { apiVersion: '2.0', algorithm: { id: 'linear-search', name: 'Linear Search', family: 'SEARCH' }, input: { kind: 'SEARCH', values: [8, 3, 5], target: 5 }, result: { kind: 'SEARCH', found: true, foundIndex: 2, comparisons: 3 }, limits: { maximumEvents: 10000 }, events: [{ sequence: 1, type: 'SEARCH_INITIALIZED', pseudocodeLineId: 'linear-initialize', state: { kind: 'SEARCH', values: [8, 3, 5], target: 5, inspectedIndices: [] }, data: { kind: 'SEARCH_INITIALIZED' } }, { sequence: 2, type: 'CANDIDATE_SELECTED', pseudocodeLineId: 'linear-select', state: { kind: 'SEARCH', values: [8, 3, 5], target: 5, selectedIndex: 0, inspectedIndices: [] }, data: { kind: 'CANDIDATE_SELECTED', index: 0, value: 8 } }, { sequence: 3, type: 'TARGET_COMPARED', pseudocodeLineId: 'linear-compare', state: { kind: 'SEARCH', values: [8, 3, 5], target: 5, selectedIndex: 0, inspectedIndices: [0] }, data: { kind: 'TARGET_COMPARED', index: 0, value: 8, found: false } }, { sequence: 4, type: 'CANDIDATE_SELECTED', pseudocodeLineId: 'linear-select', state: { kind: 'SEARCH', values: [8, 3, 5], target: 5, selectedIndex: 1, inspectedIndices: [0] }, data: { kind: 'CANDIDATE_SELECTED', index: 1, value: 3 } }, { sequence: 5, type: 'TARGET_COMPARED', pseudocodeLineId: 'linear-compare', state: { kind: 'SEARCH', values: [8, 3, 5], target: 5, selectedIndex: 1, inspectedIndices: [0, 1] }, data: { kind: 'TARGET_COMPARED', index: 1, value: 3, found: false } }, { sequence: 6, type: 'CANDIDATE_SELECTED', pseudocodeLineId: 'linear-select', state: { kind: 'SEARCH', values: [8, 3, 5], target: 5, selectedIndex: 2, inspectedIndices: [0, 1] }, data: { kind: 'CANDIDATE_SELECTED', index: 2, value: 5 } }, { sequence: 7, type: 'TARGET_COMPARED', pseudocodeLineId: 'linear-compare', state: { kind: 'SEARCH', values: [8, 3, 5], target: 5, selectedIndex: 2, inspectedIndices: [0, 1, 2] }, data: { kind: 'TARGET_COMPARED', index: 2, value: 5, found: true } }, { sequence: 8, type: 'SEARCH_FOUND', pseudocodeLineId: 'linear-found', state: { kind: 'SEARCH', values: [8, 3, 5], target: 5, selectedIndex: 2, inspectedIndices: [0, 1, 2] }, data: { kind: 'SEARCH_FOUND', index: 2, value: 5, found: true } }] }
  const fetchMock = vi.fn(async (request: RequestInfo | URL, init?: RequestInit) => (void init, new Response(JSON.stringify(String(request).endsWith('/api/v2/algorithms') ? [...catalog, searchCatalog] : searchTrace), { headers: { 'Content-Type': 'application/json' } })))
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<App />)
  await user.selectOptions(await screen.findByLabelText('Algorithm'), 'linear-search')
  await user.clear(screen.getByLabelText('Search values'))
  await user.type(screen.getByLabelText('Search values'), '8, 3, 5')
  await user.clear(screen.getByLabelText('Target'))
  await user.type(screen.getByLabelText('Target'), '5')
  await user.click(screen.getByRole('button', { name: 'Visualize' }))
  expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ kind: 'SEARCH', values: [8, 3, 5], target: 5 })
  expect(await screen.findByRole('img', { name: /Search values by index/ })).toBeInTheDocument()
  for (let step = 0; step < 4; step++) await user.click(screen.getByRole('button', { name: 'Next step' }))
  expect(screen.getByText('candidate')).toBeInTheDocument()
  await user.selectOptions(screen.getByLabelText('Algorithm'), 'insertion')
  await user.selectOptions(screen.getByLabelText('Algorithm'), 'linear-search')
  expect(screen.getByLabelText('Search values')).toHaveValue('8, 3, 5')
 expect(screen.getByLabelText('Target')).toHaveValue('5')
 })
  it('runs preorder playback with a retained BST insertion sequence', async () => {
    const treeTrace = {
      apiVersion: '2.0', algorithm: { id: 'binary-search-tree', name: 'Binary Search Tree', family: 'TREE' }, input: { kind: 'TREE', insertionValues: [8, 3, 10], operation: { kind: 'PREORDER' } }, result: { kind: 'PREORDER', visitedValues: [8, 3, 10], visitedNodeCount: 3, constructionComparisonCount: 2, constructionAttachmentCount: 3 }, limits: { maximumEvents: 10000 },
      events: [
        { sequence: 1, type: 'TREE_INITIALIZED', pseudocodeLineId: 'tree-initialize', state: { kind: 'TREE', nodes: [], rootId: null, activeNodeId: null, traversalOrder: [], comparisonDirection: null, attachedNodeId: null }, data: { kind: 'TREE_INITIALIZED', nodeId: null, parentId: null, position: null, direction: null, attachedNodeId: null } },
        { sequence: 2, type: 'NODE_ATTACHED', pseudocodeLineId: 'tree-attach-root', state: { kind: 'TREE', nodes: [{ id: 1, value: 8, parentId: null, leftId: null, rightId: null }], rootId: 1, activeNodeId: 1, traversalOrder: [], comparisonDirection: null, attachedNodeId: 1 }, data: { kind: 'NODE_ATTACHED', nodeId: 1, parentId: null, position: 'root', direction: null, attachedNodeId: 1 } },
        { sequence: 3, type: 'OPERATION_COMPLETED', pseudocodeLineId: 'tree-operation-complete', state: { kind: 'TREE', nodes: [{ id: 1, value: 8, parentId: null, leftId: 2, rightId: 3 }, { id: 2, value: 3, parentId: 1, leftId: null, rightId: null }, { id: 3, value: 10, parentId: 1, leftId: null, rightId: null }], rootId: 1, activeNodeId: null, traversalOrder: [8, 3, 10], comparisonDirection: null, attachedNodeId: null }, data: { kind: 'OPERATION_COMPLETED', nodeId: null, parentId: null, position: null, direction: null, attachedNodeId: null } },
      ],
    }
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => (void init, new Response(JSON.stringify(String(input).endsWith('/api/v2/algorithms') ? [...catalog, treeCatalog] : treeTrace), { headers: { 'Content-Type': 'application/json' } })))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<App />)
    await user.selectOptions(await screen.findByLabelText('Algorithm'), 'binary-search-tree')
    const insertionSequence = screen.getByLabelText('BST insertion sequence')
    await user.clear(insertionSequence)
    await user.type(insertionSequence, '8, 3, 10')
    await user.click(screen.getByRole('button', { name: 'Visualize preorder' }))
    expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({ kind: 'TREE', insertionValues: [8, 3, 10], operation: { kind: 'PREORDER' } })
    expect(await screen.findByRole('img', { name: 'Binary search tree' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Next step' }))
    await user.click(screen.getByRole('button', { name: 'Next step' }))
    await user.click(screen.getByRole('button', { name: 'Next step' }))
    expect(screen.getByText('Root 8. 8: left 3, right 10. 3: left none, right none. 10: left none, right none.')).toBeInTheDocument()
    expect(screen.getByText('Preorder: 8 → 3 → 10')).toBeInTheDocument()
    expect(screen.getByLabelText('Tree metrics')).toHaveTextContent('3visited2construction comparisons')
    await user.selectOptions(screen.getByLabelText('Algorithm'), 'insertion')
    await user.selectOptions(screen.getByLabelText('Algorithm'), 'binary-search-tree')
    expect(screen.getByLabelText('BST insertion sequence')).toHaveValue('8, 3, 10')
  })
  it.each(['8, 3, 8', '8, 3.5', '2147483648'])('rejects invalid BST insertion sequence %j before requesting a trace', async value => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(String(input).endsWith('/api/v2/algorithms') ? [...catalog, treeCatalog] : trace), { headers: { 'Content-Type': 'application/json' } }))
    vi.stubGlobal('fetch', fetchMock)
    const user = userEvent.setup()
    render(<App />)
    await user.selectOptions(await screen.findByLabelText('Algorithm'), 'binary-search-tree')
    await user.clear(screen.getByLabelText('BST insertion sequence'))
    await user.type(screen.getByLabelText('BST insertion sequence'), value)
    await user.click(screen.getByRole('button', { name: 'Visualize preorder' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Use 1–31 unique signed 32-bit whole numbers')
    expect(fetchMock).toHaveBeenCalledOnce()
  })
 it('applies search presets without execution and retains the shared search draft across families', async () => {
  const searchCatalog = [
   { id: 'linear-search', name: 'Linear Search', family: 'SEARCH', contractVersion: '2.0', constraints: { kind: 'SEARCH', minimumValues: 0, maximumValues: 50, minimumValue: -2147483648, maximumValue: 2147483647, requiresNonDecreasingValues: false } },
   { id: 'binary-search', name: 'Binary Search', family: 'SEARCH', contractVersion: '2.0', constraints: { kind: 'SEARCH', minimumValues: 0, maximumValues: 50, minimumValue: -2147483648, maximumValue: 2147483647, requiresNonDecreasingValues: true } },
  ]
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(String(input).endsWith('/api/v2/algorithms') ? [...catalog, ...searchCatalog] : trace), { headers: { 'Content-Type': 'application/json' } })))
  const user = userEvent.setup()
  render(<App />)
  const algorithm = await screen.findByLabelText('Algorithm')
  await user.selectOptions(algorithm, 'linear-search')
  const preset = screen.getByRole('button', { name: 'Narrow both ways' })
  expect(preset).toHaveAttribute('title', expect.stringContaining('right, then left'))
  await user.click(preset)
  expect(screen.getByLabelText('Search values')).toHaveValue('1, 3, 5, 7, 9, 11, 13')
  expect(screen.getByLabelText('Target')).toHaveValue('9')
  expect(fetch).toHaveBeenCalledTimes(1)
  await user.selectOptions(algorithm, 'binary-search')
  await user.selectOptions(algorithm, 'insertion')
  await user.selectOptions(algorithm, 'binary-search')
  expect(screen.getByLabelText('Search values')).toHaveValue('1, 3, 5, 7, 9, 11, 13')
  expect(screen.getByLabelText('Target')).toHaveValue('9')
  expect(screen.getByText('Ready')).toBeInTheDocument()
 })
 it.each([false, true])('filters incompatible adapters on catalog load and retry (%s)', async retry => {
  history.replaceState(null, '', '/?algorithm=dfs')
  const entries = [
   ...fullCatalog,
   dfsCatalog,
   { ...graphCatalog, id: 'insertion', name: 'Wrong graph family' },
   { ...catalog[0], id: 'bfs', name: 'Wrong sorting family' },
   { ...graphCatalog, id: 'future-bfs', contractVersion: '3.0', name: 'Future graph' },
   { ...catalog[0], id: 'toString', name: 'Unknown sorting algorithm' },
  ]
  const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify(entries)))
  if (retry) fetchMock.mockRejectedValueOnce(new Error('offline'))
  vi.stubGlobal('fetch', fetchMock)
  render(<App />)
  if (retry) await userEvent.click(await screen.findByRole('button', { name: 'Retry catalog' }))
  await screen.findByRole('option', { name: 'Breadth-First Search' })
  expect(within(screen.getByLabelText('Algorithm')).getAllByRole('option').map(option => option.textContent)).toEqual(['Insertion Sort', 'Selection Sort', 'Breadth-First Search', "Dijkstra's Algorithm", 'Depth-First Search'])
  expect(screen.getByLabelText('Algorithm')).toHaveValue('dfs')
 })
 it('submits mixed weights and keeps the BFS explanation visible during playback, reset, and draft changes', async () => {
  const graphTrace = {
   apiVersion: '2.0', algorithm: { id: 'bfs', name: 'Breadth-First Search', family: 'GRAPH_TRAVERSAL' },
   input: { kind: 'GRAPH_TRAVERSAL', nodes: ['A', 'B', 'C'], edges: [{ from: 'A', to: 'B', weight: 1 }, { from: 'B', to: 'C' }], startNode: 'A' },
   result: { kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A', 'B', 'C'], parents: { B: 'A', C: 'B' }, unreachableNodes: [], visitedNodeCount: 3, edgeExaminationCount: 4, maximumQueueSize: 1 },
   limits: { maximumEvents: 10000 },
   events: [{ sequence: 1, type: 'TRAVERSAL_COMPLETED', pseudocodeLineId: 'bfs-complete-traversal', state: { kind: 'GRAPH_TRAVERSAL', nodeStatuses: { A: 'PROCESSED', B: 'PROCESSED', C: 'PROCESSED' }, queue: [], traversalOrder: ['A', 'B', 'C'], parents: { B: 'A', C: 'B' }, examinedEdge: null }, data: { kind: 'TRAVERSAL_COMPLETED', traversalOrder: ['A', 'B', 'C'], unreachableNodes: [] } }],
  }
  const fetchMock = vi.fn(async (url: RequestInfo | URL) => new Response(JSON.stringify(String(url).endsWith('/api/v2/algorithms') ? fullCatalog : graphTrace)))
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('option', { name: 'Breadth-First Search' })
  await user.selectOptions(screen.getByLabelText('Algorithm'), 'bfs')
  expect(screen.queryByText(/ignores edge weights/)).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Graph input'), { target: { value: 'A-B:1\nB-C' } })
  expect(screen.getByText(/ignores edge weights.*minimize edge count, not total cost/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Visualize' }))
  await screen.findByRole('img')
  expect(fetch).toHaveBeenLastCalledWith('/api/v2/algorithms/bfs/trace', expect.objectContaining({ body: JSON.stringify(graphTrace.input) }))
  await user.click(screen.getByRole('button', { name: 'Next step' }))
  expect(screen.getByText(/ignores edge weights/)).toBeInTheDocument()
  expect(screen.getByRole('group', { name: 'A–B, weight 1' })).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Reset' }))
  fireEvent.change(screen.getByLabelText('Graph input'), { target: { value: 'A-B' } })
  expect(screen.getByText(/ignores edge weights/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'DFS depth' }))
  expect(screen.queryByText(/ignores edge weights/)).not.toBeInTheDocument()
  fireEvent.change(screen.getByLabelText('Graph input'), { target: { value: 'A-B:0' } })
  await user.click(screen.getByRole('button', { name: 'Visualize' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Line 1: edge weight must be an integer from 1 through 99')
  expect(fetchMock).toHaveBeenCalledTimes(2)
 })

 it('loads the v2 insertion algorithm',async()=>{render(<App/>);expect(await screen.findByRole('option',{name:'Insertion Sort'})).toBeInTheDocument()})
 it('keeps the input unchanged while building a trace',async()=>{const user=userEvent.setup();render(<App/>);await screen.findByRole('option',{name:'Insertion Sort'});const input=screen.getByLabelText('Array values');await user.clear(input);await user.type(input,'9, 4');await user.click(screen.getByRole('button',{name:'Visualize'}));await screen.findByRole('img');expect(input).toHaveValue('9, 4');expect(fetch).toHaveBeenCalledTimes(2)})
 it('executes only on request and supports navigation',async()=>{const user=userEvent.setup();render(<App/>);await screen.findByRole('option',{name:'Insertion Sort'});expect(fetch).toHaveBeenCalledTimes(1);await user.click(screen.getByRole('button',{name:'Visualize'}));await screen.findByRole('img');expect(fetch).toHaveBeenCalledTimes(2);await user.click(screen.getByRole('button',{name:'Next step'}));expect(screen.getByText('Complete')).toBeInTheDocument()})
 it('shows retry when catalog fails',async()=>{vi.mocked(fetch).mockRejectedValueOnce(new Error('offline')).mockResolvedValueOnce(new Response(JSON.stringify(catalog),{status:200}));const user=userEvent.setup();render(<App/>);expect(await screen.findByText('Algorithms unavailable')).toBeInTheDocument();await user.click(screen.getByRole('button',{name:'Retry catalog'}));await waitFor(()=>expect(screen.getByRole('option',{name:'Insertion Sort'})).toBeInTheDocument())})
 it('runs and plays the single-node BFS trace',async()=>{const graphCatalog={id:'bfs',name:'Breadth-First Search',family:'GRAPH_TRAVERSAL',contractVersion:'2.0',constraints:{kind:'GRAPH_TRAVERSAL',minimumNodes:1,maximumNodes:12,maximumEdges:66,nodeLabelPattern:'^[A-Za-z0-9_-]{1,16}$',directed:false,weighted:false}};const graphTrace={apiVersion:'2.0',algorithm:{id:'bfs',name:'Breadth-First Search',family:'GRAPH_TRAVERSAL'},input:{kind:'GRAPH_TRAVERSAL',nodes:['A'],edges:[],startNode:'A'},result:{kind:'GRAPH_TRAVERSAL',traversalOrder:['A'],parents:{},unreachableNodes:[],visitedNodeCount:1,edgeExaminationCount:0,maximumQueueSize:1},limits:{maximumEvents:10000},events:[{sequence:1,type:'TRAVERSAL_INITIALIZED',pseudocodeLineId:'bfs-initialize',state:{kind:'GRAPH_TRAVERSAL',nodeStatuses:{A:'DISCOVERED'},queue:['A'],traversalOrder:[],parents:{},examinedEdge:null},data:{kind:'TRAVERSAL_INITIALIZED',startNode:'A'}},{sequence:2,type:'NODE_DEQUEUED',pseudocodeLineId:'bfs-dequeue',state:{kind:'GRAPH_TRAVERSAL',nodeStatuses:{A:'ACTIVE'},queue:[],traversalOrder:['A'],parents:{},examinedEdge:null},data:{kind:'NODE_DEQUEUED',node:'A'}}]};vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>new Response(JSON.stringify(String(input).endsWith('/api/v2/algorithms')?[...catalog,graphCatalog]:graphTrace),{status:200,headers:{'Content-Type':'application/json'}})));const user=userEvent.setup();render(<App/>);await user.selectOptions(await screen.findByLabelText('Algorithm'),'bfs');expect(screen.getByLabelText('Graph input')).toHaveValue('A');expect(screen.getByLabelText('Start node')).toHaveValue('A');await user.click(screen.getByRole('button',{name:'Visualize'}));expect(await screen.findByRole('img',{name:/Breadth-first traversal graph/})).toBeInTheDocument();await user.click(screen.getByRole('button',{name:'Next step'}));expect(screen.getByText('A: discovered')).toBeInTheDocument();await user.click(screen.getByRole('button',{name:'Next step'}));expect(screen.getByText('A: active')).toBeInTheDocument()})

 it('authors a connected graph and submits its derived order and selected start',async()=>{const graphCatalog={id:'bfs',name:'Breadth-First Search',family:'GRAPH_TRAVERSAL',contractVersion:'2.0',constraints:{kind:'GRAPH_TRAVERSAL',minimumNodes:1,maximumNodes:12,maximumEdges:66,nodeLabelPattern:'^[A-Za-z0-9_-]{1,16}$',directed:false,weighted:false}};const graphTrace={apiVersion:'2.0',algorithm:{id:'bfs',name:'Breadth-First Search',family:'GRAPH_TRAVERSAL'},input:{kind:'GRAPH_TRAVERSAL',nodes:['A','C','B','node-one'],edges:[{from:'A',to:'C'},{from:'A',to:'B'},{from:'node-one',to:'C'}],startNode:'C'},result:{kind:'GRAPH_TRAVERSAL',traversalOrder:['C','A','node-one','B'],parents:{A:'C','node-one':'C',B:'A'},unreachableNodes:[],visitedNodeCount:4,edgeExaminationCount:6,maximumQueueSize:2},limits:{maximumEvents:10000},events:[]};const fetchMock=vi.fn(async(input:RequestInfo|URL,init?:RequestInit)=>(void init,new Response(JSON.stringify(String(input).endsWith('/api/v2/algorithms')?[...catalog,graphCatalog]:graphTrace),{status:200,headers:{'Content-Type':'application/json'}})));vi.stubGlobal('fetch',fetchMock);const user=userEvent.setup();render(<App/>);await user.selectOptions(await screen.findByLabelText('Algorithm'),'bfs');fireEvent.change(screen.getByLabelText('Graph input'),{target:{value:'A-C\nA-B\n"node-one" - C'}});const start=screen.getByLabelText('Start node');expect(Array.from((start as HTMLSelectElement).options).map(option=>option.textContent)).toEqual(['A','C','B','node-one']);await user.selectOptions(start,'C');await user.click(screen.getByRole('button',{name:'Visualize'}));await waitFor(()=>expect(fetchMock).toHaveBeenCalledTimes(2));expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual({kind:'GRAPH_TRAVERSAL',nodes:['A','C','B','node-one'],edges:[{from:'A',to:'C'},{from:'A',to:'B'},{from:'node-one',to:'C'}],startNode:'C'});const graph=await screen.findByRole('img',{name:/Breadth-first traversal graph/});for(const node of ['A','C','B','node-one'])expect(within(graph).getByText(node)).toBeInTheDocument();const edges=graph.querySelectorAll('line');expect(edges).toHaveLength(3);for(const edge of edges)expect(edge).toHaveAttribute('stroke')})

 it('applies comparison presets with their destinations without executing',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify(fullCatalog),{status:200,headers:{'Content-Type':'application/json'}})));const user=userEvent.setup();render(<App/>);await user.selectOptions(await screen.findByLabelText('Algorithm'),'bfs');const preset=screen.getByRole('button',{name:'Edges vs cost'});expect(preset).toHaveAttribute('title',expect.stringContaining('one-edge path'));await user.click(preset);expect(screen.getByLabelText('Graph input')).toHaveValue('A-D:9\nA-B:2\nB-C\nC-D:2');expect(screen.getByLabelText('Start node')).toHaveValue('A');expect(screen.getByLabelText('Destination')).toHaveValue('D');expect(fetch).toHaveBeenCalledOnce();await user.click(screen.getByRole('button',{name:'Unreachable destination'}));expect(screen.getByLabelText('Graph input')).toHaveValue('A-B\nC-D:5');expect(screen.getByLabelText('Destination')).toHaveValue('D');expect(fetch).toHaveBeenCalledOnce()})

 it('retains separate family drafts and clears run state on algorithm changes',async()=>{vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>new Response(JSON.stringify(String(input).endsWith('/api/v2/algorithms')?fullCatalog:trace),{status:200,headers:{'Content-Type':'application/json'}})));const user=userEvent.setup();render(<App/>);const algorithm=await screen.findByLabelText('Algorithm');const array=screen.getByLabelText('Array values');await user.clear(array);await user.type(array,'9, 4');await user.click(screen.getByRole('button',{name:'Visualize'}));await screen.findByRole('img');await user.selectOptions(algorithm,'bfs');expect(screen.queryByRole('img')).not.toBeInTheDocument();expect(screen.getByText('Ready')).toBeInTheDocument();fireEvent.change(screen.getByLabelText('Graph input'),{target:{value:'X-Y\nZ'}});await user.selectOptions(screen.getByLabelText('Start node'),'Y');await user.selectOptions(algorithm,'selection');expect(screen.getByLabelText('Array values')).toHaveValue('9, 4');await user.selectOptions(algorithm,'bfs');expect(screen.getByLabelText('Graph input')).toHaveValue('X-Y\nZ');expect(screen.getByLabelText('Start node')).toHaveValue('Y');expect(fetch).toHaveBeenCalledTimes(2)})

 it('submits an optional BFS destination and reveals its selected path only at completion', async () => {
  const targetedTrace = {
   apiVersion: '2.0', algorithm: { id: 'bfs', name: 'Breadth-First Search', family: 'GRAPH_TRAVERSAL' },
   input: { kind: 'GRAPH_TRAVERSAL', nodes: ['A', 'B', 'C', 'D'], edges: [{ from: 'A', to: 'B' }, { from: 'B', to: 'C' }, { from: 'A', to: 'D' }], startNode: 'A', destination: 'C' },
   result: { kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A', 'B', 'D', 'C'], parents: { B: 'A', D: 'A', C: 'B' }, unreachableNodes: [], pathFound: true, path: ['A', 'B', 'C'], pathEdgeCount: 2, unexploredNodes: [], visitedNodeCount: 4, edgeExaminationCount: 5, maximumQueueSize: 2 },
   limits: { maximumEvents: 10000 },
   events: [{ sequence: 1, type: 'PATH_RECONSTRUCTED', pseudocodeLineId: 'bfs-reconstruct-path', state: { kind: 'GRAPH_TRAVERSAL', nodeStatuses: { A: 'PROCESSED', B: 'PROCESSED', C: 'ACTIVE', D: 'PROCESSED' }, queue: [], traversalOrder: ['A', 'B', 'D', 'C'], parents: { B: 'A', D: 'A', C: 'B' }, examinedEdge: null, selectedPath: ['A', 'B', 'C'] }, data: { kind: 'PATH_RECONSTRUCTED', destination: 'C', pathFound: true, path: ['A', 'B', 'C'], pathEdgeCount: 2 } }],
  }
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
   void init
   return new Response(JSON.stringify(String(input).endsWith('/api/v2/algorithms') ? fullCatalog : targetedTrace), {
    headers: { 'Content-Type': 'application/json' },
   })
  })
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  const { container } = render(<App />)
  await screen.findByRole('option', { name: 'Breadth-First Search' })
  await user.selectOptions(screen.getByLabelText('Algorithm'), 'bfs')
  fireEvent.change(screen.getByLabelText('Graph input'), { target: { value: 'A-B\nB-C\nA-D' } })
  await user.selectOptions(screen.getByLabelText('Destination'), 'C')
  await user.click(screen.getByRole('button', { name: 'Visualize' }))

  await screen.findByRole('img', { name: /Breadth-first traversal graph/ })
  expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual(targetedTrace.input)
  expect(container.querySelector('.graph-edge--selected-path')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Next step' }))
  expect(screen.getByText('Fewest-edge path found: A → B → C (2 edges).')).toBeInTheDocument()
  expect(screen.getByText('A → B → C')).toBeInTheDocument()
  expect(container.querySelectorAll('.graph-edge--selected-path')).toHaveLength(2)
 })

 it('retains a BFS destination across graph-algorithm switches and clears it when removed', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify([...fullCatalog, dfsCatalog]), {
   headers: { 'Content-Type': 'application/json' },
  })))
  const user = userEvent.setup()
  render(<App />)
  await screen.findByRole('option', { name: 'Depth-First Search' })
  const algorithm = screen.getByLabelText('Algorithm')
  await user.selectOptions(algorithm, 'bfs')
  fireEvent.change(screen.getByLabelText('Graph input'), { target: { value: 'X-Y\nY-Z' } })
  await user.selectOptions(screen.getByLabelText('Destination'), 'Y')
  await user.selectOptions(algorithm, 'dfs')
  expect(screen.queryByLabelText('Destination')).not.toBeInTheDocument()
  await user.selectOptions(algorithm, 'bfs')
  expect(screen.getByLabelText('Destination')).toHaveValue('Y')
  fireEvent.change(screen.getByLabelText('Graph input'), { target: { value: 'X-Z' } })
  expect(screen.getByLabelText('Destination')).toHaveValue('')
 })

 it('reuses one weighted experiment across BFS, DFS, and Dijkstra while clearing the old run', async () => {
  const graphTrace = {
   apiVersion: '2.0', algorithm: { id: 'bfs', name: 'Breadth-First Search', family: 'GRAPH_TRAVERSAL' },
   input: { kind: 'GRAPH_TRAVERSAL', nodes: ['A', 'D', 'B', 'C'], edges: [{ from: 'A', to: 'D', weight: 9 }, { from: 'A', to: 'B', weight: 2 }, { from: 'B', to: 'C' }, { from: 'C', to: 'D', weight: 2 }], startNode: 'A', destination: 'D' },
   result: { kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A', 'D'], parents: { D: 'A' }, unreachableNodes: [], pathFound: true, path: ['A', 'D'], pathEdgeCount: 1, unexploredNodes: ['B', 'C'], visitedNodeCount: 2, edgeExaminationCount: 2, maximumQueueSize: 2 },
   limits: { maximumEvents: 10000 }, events: [],
  }
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
   void init
   return new Response(JSON.stringify(
    String(input).endsWith('/api/v2/algorithms') ? [...fullCatalog, dfsCatalog] : graphTrace,
   ), { headers: { 'Content-Type': 'application/json' } })
  })
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<App />)
  const algorithm = await screen.findByLabelText('Algorithm')
  await user.selectOptions(algorithm, 'bfs')
  await user.click(screen.getByRole('button', { name: 'Edges vs cost' }))
  await user.click(screen.getByRole('button', { name: 'Visualize' }))
  expect(await screen.findByRole('img', { name: /Breadth-first traversal graph/ })).toBeInTheDocument()

  await user.selectOptions(algorithm, 'dijkstra')
  expect(screen.getByLabelText('Graph input')).toHaveValue('A-D:9\nA-B:2\nB-C\nC-D:2')
  expect(screen.getByLabelText('Start node')).toHaveValue('A')
  expect(screen.getByLabelText('Destination')).toHaveValue('D')
  expect(screen.queryByRole('img')).not.toBeInTheDocument()
  expect(screen.getByText('Ready')).toBeInTheDocument()
  expect(screen.getByText(/priority ordered by tentative distance/i)).toBeInTheDocument()

  await user.selectOptions(algorithm, 'dfs')
  expect(screen.queryByLabelText('Destination')).not.toBeInTheDocument()
  expect(screen.getByText(/DFS reports traversal order and does not use a destination/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Visualize' }))
  await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(3))
  expect(JSON.parse(String(fetchMock.mock.calls[2][1]?.body))).toEqual({
   kind: 'GRAPH_TRAVERSAL', nodes: ['A', 'D', 'B', 'C'],
   edges: [{ from: 'A', to: 'D', weight: 9 }, { from: 'A', to: 'B', weight: 2 }, { from: 'B', to: 'C' }, { from: 'C', to: 'D', weight: 2 }],
   startNode: 'A',
  })
  await user.selectOptions(algorithm, 'bfs')
  expect(screen.getByLabelText('Destination')).toHaveValue('D')
 })

 it('keeps graph authoring and playback controls in keyboard order', async () => {
  history.replaceState(null, '', '/?algorithm=bfs')
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify(fullCatalog), {
   headers: { 'Content-Type': 'application/json' },
  })))
  const user = userEvent.setup()
  render(<App />)
  await waitFor(() => expect(screen.getByLabelText('Algorithm')).toHaveValue('bfs'))
  await user.tab()
  expect(screen.getByLabelText('Algorithm')).toHaveFocus()
  await user.tab()
  expect(screen.getByLabelText('Graph input')).toHaveFocus()
  await user.tab()
  expect(screen.getByRole('button', { name: 'Visualize' })).toHaveFocus()
  await user.tab()
  expect(screen.getByRole('button', { name: 'DFS depth' })).toHaveFocus()
 })

 it('requires a Dijkstra destination and plays the complete minimum-cost path', async () => {
  const pathTrace = {
   apiVersion: '2.0', algorithm: { id: 'dijkstra', name: "Dijkstra's Algorithm", family: 'PATHFINDING' },
   input: { kind: 'PATHFINDING', nodes: ['A', 'D', 'B', 'C'], edges: [{ from: 'A', to: 'D', weight: 9 }, { from: 'A', to: 'B', weight: 2 }, { from: 'B', to: 'C' }, { from: 'C', to: 'D', weight: 2 }], startNode: 'A', destination: 'D' },
   result: { kind: 'PATHFINDING', pathFound: true, path: ['A', 'B', 'C', 'D'], totalCost: 5, settledOrder: ['A', 'B', 'C', 'D'], parents: { D: 'A', B: 'A', C: 'B' }, settledNodeCount: 4, relaxationAttemptCount: 6, successfulUpdateCount: 4, rejectedUpdateCount: 2, maximumFrontierSize: 2 },
   limits: { maximumEvents: 10000 },
   events: [{ sequence: 1, type: 'PATH_RECONSTRUCTED', pseudocodeLineId: 'dijkstra-reconstruct-path', state: { kind: 'PATHFINDING', nodeStatuses: { A: 'SETTLED', B: 'SETTLED', C: 'SETTLED', D: 'SETTLED' }, tentativeDistances: { A: 0, B: 2, C: 3, D: 5 }, parents: { D: 'C', B: 'A', C: 'B' }, frontier: [], examinedEdge: null, selectedPath: ['A', 'B', 'C', 'D'] }, data: { kind: 'PATH_RECONSTRUCTED', destination: 'D', pathFound: true, path: ['A', 'B', 'C', 'D'], totalCost: 5 } }],
  }
  const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
   void init
   return new Response(JSON.stringify(String(input).endsWith('/api/v2/algorithms') ? fullCatalog : pathTrace), {
    headers: { 'Content-Type': 'application/json' },
   })
  })
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  const { container } = render(<App />)
  await screen.findByRole('option', { name: "Dijkstra's Algorithm" })
  await user.selectOptions(screen.getByLabelText('Algorithm'), 'dijkstra')
  fireEvent.change(screen.getByLabelText('Graph input'), { target: { value: 'A-D:9\nA-B:2\nB-C\nC-D:2' } })
  expect(screen.getByText('Dijkstra treats every unweighted edge as cost 1.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Visualize' }))
  expect(screen.getByRole('alert')).toHaveTextContent('Select a destination node.')
  expect(fetchMock).toHaveBeenCalledOnce()
  await user.selectOptions(screen.getByLabelText('Destination'), 'D')
  await user.click(screen.getByRole('button', { name: 'Visualize' }))

  expect(await screen.findByRole('img', { name: /Dijkstra pathfinding graph/ })).toBeInTheDocument()
  expect(JSON.parse(String(fetchMock.mock.calls[1][1]?.body))).toEqual(pathTrace.input)
  expect(screen.getByLabelText('Pathfinding metrics')).toHaveTextContent('4settled6relaxations4updates2rejected2max frontier')
  expect(container.querySelector('.graph-edge--selected-path')).not.toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Next step' }))
  expect(screen.getByText('Minimum-cost path found: A → B → C → D (total cost 5).')).toBeInTheDocument()
  expect(screen.getByText('A: 0; D: 5; B: 2; C: 3')).toBeInTheDocument()
  expect(container.querySelectorAll('.graph-edge--selected-path')).toHaveLength(3)
  expect(screen.getAllByRole('status')).toEqual(expect.arrayContaining([
   expect.objectContaining({ textContent: 'Dijkstra pathfinding complete.' }),
  ]))
 })

 it('selects either family from the URL without encoding drafts',async()=>{history.replaceState(null,'','/?algorithm=bfs');vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify(fullCatalog),{status:200,headers:{'Content-Type':'application/json'}})));render(<App/>);await waitFor(()=>expect(screen.getByLabelText('Algorithm')).toHaveValue('bfs'));expect(screen.getByLabelText('Graph input')).toHaveValue('A');expect(location.search).toBe('?algorithm=bfs');expect(fetch).toHaveBeenCalledOnce()})

 it('cancels an in-flight trace and ignores its stale response across graph API families',async()=>{let resolveTrace!:(response:Response)=>void;const pending=new Promise<Response>(resolve=>{resolveTrace=resolve});let traceSignal:AbortSignal|undefined;const fetchMock=vi.fn((input:RequestInfo|URL,init?:RequestInit)=>{if(String(input).endsWith('/api/v2/algorithms'))return Promise.resolve(new Response(JSON.stringify(fullCatalog),{status:200,headers:{'Content-Type':'application/json'}}));traceSignal=init?.signal as AbortSignal;return pending});vi.stubGlobal('fetch',fetchMock);const user=userEvent.setup();render(<App/>);const algorithm=await screen.findByLabelText('Algorithm');await user.selectOptions(algorithm,'bfs');await user.click(screen.getByRole('button',{name:'Visualize'}));expect(screen.getByRole('button',{name:'Building…'})).toBeDisabled();await user.selectOptions(algorithm,'dijkstra');expect(traceSignal?.aborted).toBe(true);resolveTrace(new Response(JSON.stringify({apiVersion:'2.0',algorithm:{family:'GRAPH_TRAVERSAL'},events:[]}),{status:200,headers:{'Content-Type':'application/json'}}));await waitFor(()=>expect(screen.getByLabelText('Destination')).toBeInTheDocument());expect(screen.queryByRole('img',{name:/Breadth-first traversal graph/})).not.toBeInTheDocument();expect(screen.getByText('Ready')).toBeInTheDocument()})

 it('runs and plays the complete single-node DFS experience', async () => {
  const dfsTrace = {
   apiVersion: '2.0', algorithm: { id: 'dfs', name: 'Depth-First Search', family: 'GRAPH_TRAVERSAL' },
   input: { kind: 'GRAPH_TRAVERSAL', nodes: ['A'], edges: [], startNode: 'A' },
   result: { kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A'], parents: {}, unreachableNodes: [], visitedNodeCount: 1, edgeExaminationCount: 0, maximumStackSize: 1 },
   limits: { maximumEvents: 10000 },
   events: [
    { sequence: 1, type: 'TRAVERSAL_INITIALIZED', pseudocodeLineId: 'dfs-initialize', state: { kind: 'GRAPH_TRAVERSAL', nodeStatuses: { A: 'DISCOVERED' }, stack: ['A'], traversalOrder: [], parents: {}, examinedEdge: null }, data: { kind: 'TRAVERSAL_INITIALIZED', startNode: 'A' } },
    { sequence: 2, type: 'NODE_POPPED', pseudocodeLineId: 'dfs-pop', state: { kind: 'GRAPH_TRAVERSAL', nodeStatuses: { A: 'ACTIVE' }, stack: [], traversalOrder: ['A'], parents: {}, examinedEdge: null }, data: { kind: 'NODE_POPPED', node: 'A' } },
    { sequence: 3, type: 'NODE_COMPLETED', pseudocodeLineId: 'dfs-complete-node', state: { kind: 'GRAPH_TRAVERSAL', nodeStatuses: { A: 'PROCESSED' }, stack: [], traversalOrder: ['A'], parents: {}, examinedEdge: null }, data: { kind: 'NODE_COMPLETED', node: 'A' } },
    { sequence: 4, type: 'TRAVERSAL_COMPLETED', pseudocodeLineId: 'dfs-complete-traversal', state: { kind: 'GRAPH_TRAVERSAL', nodeStatuses: { A: 'PROCESSED' }, stack: [], traversalOrder: ['A'], parents: {}, examinedEdge: null }, data: { kind: 'TRAVERSAL_COMPLETED', traversalOrder: ['A'], unreachableNodes: [] } },
   ],
  }
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(
   String(input).endsWith('/api/v2/algorithms') ? [...catalog, graphCatalog, dfsCatalog] : dfsTrace,
  ), { headers: { 'Content-Type': 'application/json' } }))
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<App />)
  await user.selectOptions(await screen.findByLabelText('Algorithm'), 'dfs')
  expect(screen.getByRole('heading', { name: 'Depth-First Search' })).toBeInTheDocument()
  expect(screen.getByText('mark start discovered; push start onto stack')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Visualize' }))
  expect(fetchMock).toHaveBeenLastCalledWith('/api/v2/algorithms/dfs/trace', expect.objectContaining({
   body: JSON.stringify(dfsTrace.input),
  }))
  expect(await screen.findByRole('img', { name: /Depth-first traversal graph/ })).toBeInTheDocument()
  expect(screen.getByLabelText('Traversal metrics')).toHaveTextContent('1visited0edges examined1max stack')
  await user.click(screen.getByRole('button', { name: 'Next step' }))
  expect(screen.getAllByText('Discover and push A onto the stack.')).toHaveLength(2)
  expect(screen.getByText('A: discovered')).toBeInTheDocument()
  expect(screen.getByText('Stack (top first)').nextSibling).toHaveTextContent('A')
  await user.click(screen.getByRole('button', { name: 'Next step' }))
  expect(screen.getAllByText('Pop and visit A.')).toHaveLength(2)
  expect(screen.getByText('A: active')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Next step' }))
  expect(screen.getByText('A: processed')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Next step' }))
  expect(screen.getByText('Depth-first traversal is complete. Unreachable nodes: none.')).toBeInTheDocument()
  expect(screen.getAllByRole('status')).toEqual(expect.arrayContaining([
   expect.objectContaining({ textContent: 'Depth-first traversal complete.' }),
  ]))
 })

 it('plays connected weighted DFS while keeping stack and ignored-weight semantics visible', async () => {
  const dfsTrace = {
   apiVersion: '2.0', algorithm: { id: 'dfs', name: 'Depth-First Search', family: 'GRAPH_TRAVERSAL' },
   input: { kind: 'GRAPH_TRAVERSAL', nodes: ['A', 'B', 'C', 'D', 'Z'], edges: [{ from: 'A', to: 'B', weight: 9 }, { from: 'A', to: 'C' }, { from: 'B', to: 'D' }], startNode: 'A' },
   result: { kind: 'GRAPH_TRAVERSAL', traversalOrder: ['A', 'B', 'D', 'C'], parents: { C: 'A', B: 'A', D: 'B' }, unreachableNodes: ['Z'], visitedNodeCount: 4, edgeExaminationCount: 6, maximumStackSize: 2 },
   limits: { maximumEvents: 10000 },
   events: [
    { sequence: 1, type: 'NODE_DISCOVERED', pseudocodeLineId: 'dfs-push-neighbor', state: { kind: 'GRAPH_TRAVERSAL', nodeStatuses: { A: 'ACTIVE', B: 'DISCOVERED', C: 'DISCOVERED', D: 'UNREACHED', Z: 'UNREACHED' }, stack: ['B', 'C'], traversalOrder: ['A'], parents: { C: 'A', B: 'A' }, examinedEdge: { from: 'A', to: 'B' } }, data: { kind: 'NODE_DISCOVERED', node: 'B', parent: 'A' } },
    { sequence: 2, type: 'TRAVERSAL_COMPLETED', pseudocodeLineId: 'dfs-complete-traversal', state: { kind: 'GRAPH_TRAVERSAL', nodeStatuses: { A: 'PROCESSED', B: 'PROCESSED', C: 'PROCESSED', D: 'PROCESSED', Z: 'UNREACHED' }, stack: [], traversalOrder: ['A', 'B', 'D', 'C'], parents: { C: 'A', B: 'A', D: 'B' }, examinedEdge: null }, data: { kind: 'TRAVERSAL_COMPLETED', traversalOrder: ['A', 'B', 'D', 'C'], unreachableNodes: ['Z'] } },
   ],
  }
  const fetchMock = vi.fn(async (input: RequestInfo | URL) => new Response(JSON.stringify(
   String(input).endsWith('/api/v2/algorithms') ? [...catalog, graphCatalog, dfsCatalog] : dfsTrace,
  ), { headers: { 'Content-Type': 'application/json' } }))
  vi.stubGlobal('fetch', fetchMock)
  const user = userEvent.setup()
  render(<App />)
  await user.selectOptions(await screen.findByLabelText('Algorithm'), 'dfs')
  fireEvent.change(screen.getByLabelText('Graph input'), { target: { value: 'A-B:9\nA-C\nB-D\nZ' } })
  expect(screen.getByText(/Depth-first search ignores edge weights/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Visualize' }))
  expect(fetchMock).toHaveBeenLastCalledWith('/api/v2/algorithms/dfs/trace', expect.objectContaining({
   body: JSON.stringify(dfsTrace.input),
  }))
  await user.click(screen.getByRole('button', { name: 'Next step' }))
  expect(screen.getAllByText('Discover B from A and push it onto the stack.')).toHaveLength(2)
  expect(screen.getByText('B → C')).toBeInTheDocument()
  expect(screen.getByRole('group', { name: 'A–B, weight 9' })).toBeInTheDocument()
  expect(screen.getByText(/Depth-first search ignores edge weights/)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Next step' }))
  expect(screen.getByText('Depth-first traversal is complete. Unreachable nodes: Z.')).toBeInTheDocument()
  expect(screen.getByText('Z', { selector: 'dd' })).toBeInTheDocument()
 })
})
