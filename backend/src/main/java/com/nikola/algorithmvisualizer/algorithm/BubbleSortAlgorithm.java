package com.nikola.algorithmvisualizer.algorithm;
import java.util.*; import org.springframework.stereotype.Service; import com.nikola.algorithmvisualizer.trace.*;
@Service public class BubbleSortAlgorithm extends AbstractSortingAlgorithm {
 public String id(){return "bubble";} public AlgorithmInfo info(){return new AlgorithmInfo(id(),"Bubble Sort");}
 public List<MetricType> metricTypes(){return List.of(MetricType.COMPARISONS,MetricType.READS,MetricType.WRITES,MetricType.SWAPS);}
 public VersionedAlgorithmTrace<EventData> execute(List<Integer> input){var a=items(input);var t=new TraceEventBuilder(MAX_EVENTS);int n=a.size();
  if(n==1)t.add(SemanticEventType.MARK_SORTED,"complete-pass",a,ranges(new SortedRange(0,0)),new MarkSortedData(0,0));
  for(int pass=0;pass<n-1;pass++){boolean swapped=false;var sorted=pass==0?List.<SortedRange>of():ranges(new SortedRange(n-pass,n-1));t.add(SemanticEventType.PASS_START,"begin-pass",a,sorted,new PassData(pass+1,false));
   for(int j=0;j<n-pass-1;j++){var inds=List.of(j,j+1);var pair=List.of(a.get(j),a.get(j+1));t.add(SemanticEventType.READ,"read-adjacent",a,sorted,new ReadData(inds,pair));t.add(SemanticEventType.COMPARE,"compare-adjacent",a,sorted,new CompareData(inds,pair,compare(pair.get(0),pair.get(1))));if(pair.get(0).value()>pair.get(1).value()){t.add(SemanticEventType.SWAP,"swap-adjacent",a,sorted,new SwapData(inds));Collections.swap(a,j,j+1);t.add(SemanticEventType.WRITE,"write-swap",a,sorted,new WriteData(inds,List.of(a.get(j),a.get(j+1))));swapped=true;}}
   var complete=ranges(new SortedRange(0,swapped?n-pass-1:n-1));t.add(SemanticEventType.PASS_COMPLETE,"complete-pass",a,complete,new PassData(pass+1,swapped));if(!swapped){t.add(SemanticEventType.NO_SWAP_COMPLETE,"early-complete",a,complete,new PassData(pass+1,false));break;}}
  return result(input,a,t);}
}
