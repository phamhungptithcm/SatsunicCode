// Original trusted reference, never imported into apps/web or used to execute submissions.
export function peakRequests(timestamps:number[],width:number):number {
 if(!Number.isInteger(width)||width<1)throw new Error('INVALID_WIDTH');
 if(timestamps.some((t,i)=>!Number.isInteger(t)||t<0||(i>0&&t<timestamps[i-1]!)))throw new Error('INVALID_TIMESTAMPS');
 let right=0,best=0;
 for(let left=0;left<timestamps.length;left++){
  while(right<timestamps.length&&timestamps[right]!-timestamps[left]!<width)right++;
  best=Math.max(best,right-left);
 }
 return best;
}
