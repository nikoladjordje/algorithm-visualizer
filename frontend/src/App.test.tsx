import { fireEvent,render,screen,waitFor,within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach,beforeEach,describe,expect,it,vi } from 'vitest'
import App from './App'
const constraints={kind:'SORTING',minimumValues:1,maximumValues:50,minimumValue:-2147483648,maximumValue:2147483647}
const catalog=[{id:'insertion',name:'Insertion Sort',family:'SORTING',contractVersion:'2.0',constraints}]
const graphCatalog={id:'bfs',name:'Breadth-First Search',family:'GRAPH_TRAVERSAL',contractVersion:'2.0',constraints:{kind:'GRAPH_TRAVERSAL',minimumNodes:1,maximumNodes:12,maximumEdges:66,nodeLabelPattern:'^[A-Za-z0-9_-]{1,16}$',directed:false,weighted:false}}
const dfsCatalog={...graphCatalog,id:'dfs',name:'Depth-First Search',constraints:{...graphCatalog.constraints,maximumNodes:12,maximumEdges:66}}
const fullCatalog=[...catalog,{id:'selection',name:'Selection Sort',family:'SORTING',contractVersion:'2.0',constraints},graphCatalog]
const trace={apiVersion:'2.0',algorithm:{id:'insertion',name:'Insertion Sort',family:'SORTING'},input:{kind:'SORTING',values:[2,1]},result:{kind:'SORTING',values:[1,2]},limits:{maximumEvents:10000},events:[{sequence:1,type:'MARK_SORTED',pseudocodeLineId:'complete-pass',state:{kind:'SORTING',items:[{id:1,value:1},{id:0,value:2}],sortedRanges:[{fromIndex:0,throughIndex:1}]},data:{kind:'MARK_SORTED',fromIndex:0,throughIndex:1}}]}
beforeEach(()=>{history.replaceState(null,'','/');vi.stubGlobal('fetch',vi.fn(async(input:RequestInfo|URL)=>new Response(JSON.stringify(String(input).endsWith('/api/v2/algorithms')?catalog:trace),{status:200,headers:{'Content-Type':'application/json'}})))})
afterEach(()=>vi.unstubAllGlobals())
describe('App algorithm workbench',()=>{
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
  expect(within(screen.getByLabelText('Algorithm')).getAllByRole('option').map(option => option.textContent)).toEqual(['Insertion Sort', 'Selection Sort', 'Breadth-First Search', 'Depth-First Search'])
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
  await user.click(screen.getByRole('button', { name: 'Branching' }))
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

 it('applies fixed graph presets without executing',async()=>{vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify(fullCatalog),{status:200,headers:{'Content-Type':'application/json'}})));const user=userEvent.setup();render(<App/>);await user.selectOptions(await screen.findByLabelText('Algorithm'),'bfs');await user.click(screen.getByRole('button',{name:'Branching'}));expect(screen.getByLabelText('Graph input')).toHaveValue('A-B\nA-C\nB-D\nB-E\nC-F');expect(screen.getByLabelText('Start node')).toHaveValue('A');expect(fetch).toHaveBeenCalledOnce();await user.click(screen.getByRole('button',{name:'Disconnected'}));expect(screen.getByLabelText('Graph input')).toHaveValue('A-B\nB-C\nD-E\nF');expect(screen.getByLabelText('Start node')).toHaveValue('A');expect(fetch).toHaveBeenCalledOnce()})

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

 it('selects either family from the URL without encoding drafts',async()=>{history.replaceState(null,'','/?algorithm=bfs');vi.stubGlobal('fetch',vi.fn(async()=>new Response(JSON.stringify(fullCatalog),{status:200,headers:{'Content-Type':'application/json'}})));render(<App/>);await waitFor(()=>expect(screen.getByLabelText('Algorithm')).toHaveValue('bfs'));expect(screen.getByLabelText('Graph input')).toHaveValue('A');expect(location.search).toBe('?algorithm=bfs');expect(fetch).toHaveBeenCalledOnce()})

 it('cancels an in-flight trace and ignores its stale response after switching families',async()=>{let resolveTrace!:(response:Response)=>void;const pending=new Promise<Response>(resolve=>{resolveTrace=resolve});let traceSignal:AbortSignal|undefined;const fetchMock=vi.fn((input:RequestInfo|URL,init?:RequestInit)=>{if(String(input).endsWith('/api/v2/algorithms'))return Promise.resolve(new Response(JSON.stringify(fullCatalog),{status:200,headers:{'Content-Type':'application/json'}}));traceSignal=init?.signal as AbortSignal;return pending});vi.stubGlobal('fetch',fetchMock);const user=userEvent.setup();render(<App/>);const algorithm=await screen.findByLabelText('Algorithm');await user.selectOptions(algorithm,'bfs');await user.click(screen.getByRole('button',{name:'Visualize'}));expect(screen.getByRole('button',{name:'Building…'})).toBeDisabled();await user.selectOptions(algorithm,'insertion');expect(traceSignal?.aborted).toBe(true);resolveTrace(new Response(JSON.stringify({apiVersion:'2.0',algorithm:{family:'GRAPH_TRAVERSAL'},events:[]}),{status:200,headers:{'Content-Type':'application/json'}}));await waitFor(()=>expect(screen.getByLabelText('Array values')).toBeInTheDocument());expect(screen.queryByRole('img',{name:/Breadth-first traversal graph/})).not.toBeInTheDocument();expect(screen.getByText('Ready')).toBeInTheDocument()})

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
