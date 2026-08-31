package com.nikola.algorithmvisualizer.algorithm;
import java.util.*; import org.springframework.stereotype.Service; import com.nikola.algorithmvisualizer.trace.*;
@Service public class SelectionSortAlgorithm extends AbstractSortingAlgorithm {
 public String id(){return "selection";} public AlgorithmInfo info(){return new AlgorithmInfo(id(),"Selection Sort");}
 public List<MetricType> metricTypes(){return List.of(MetricType.COMPARISONS,MetricType.READS,MetricType.WRITES,MetricType.SWAPS);}
 public VersionedAlgorithmTrace<EventData> execute(List<Integer> input){var a=items(input);var t=new TraceEventBuilder(MAX_EVENTS);int n=a.size();
  for(int i=0;i<n;i++){int min=i;var done=i==0?List.<SortedRange>of():ranges(new SortedRange(0,i-1));t.add(SemanticEventType.SELECT,"select-minimum",a,done,new SelectData(min,a.get(min)));
   for(int j=i+1;j<n;j++){var inds=List.of(min,j);var pair=List.of(a.get(min),a.get(j));t.add(SemanticEventType.READ,"read-candidate",a,done,new ReadData(inds,pair));t.add(SemanticEventType.COMPARE,"compare-candidate",a,done,new CompareData(inds,pair,compare(a.get(j),a.get(min))));if(a.get(j).value()<a.get(min).value()){min=j;t.add(SemanticEventType.MINIMUM_UPDATE,"update-minimum",a,done,new MinimumData(min,a.get(min)));}}
   if(min!=i){var inds=List.of(i,min);t.add(SemanticEventType.SWAP,"place-minimum",a,done,new SwapData(inds));Collections.swap(a,i,min);t.add(SemanticEventType.WRITE,"write-placement",a,done,new WriteData(inds,List.of(a.get(i),a.get(min))));}
   t.add(SemanticEventType.MARK_SORTED,"complete-position",a,ranges(new SortedRange(0,i)),new MarkSortedData(0,i));}
  return result(input,a,t);}
}
