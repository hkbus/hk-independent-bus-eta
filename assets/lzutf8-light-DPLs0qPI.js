import{aj as B}from"./index-kqgpsvLZ.js";var m={exports:{}};/*!
 LZ-UTF8-LIGHT v0.6.2

 Copyright (c) 2021, Rotem Dan
 Released under the MIT license.

 Build date: 2022-04-22 

 Please report any issue at https://github.com/chunlaw/lzutf8-light.js/issues
*/m.exports;(function(v){var h;(function(n){n.runningInNodeJS=function(){return typeof process=="object"&&typeof process.versions=="object"&&typeof process.versions.node=="string"},n.runningInMainNodeJSModule=function(){return n.runningInNodeJS()&&require.main===v},n.commonJSAvailable=function(){return!0},n.runningInWebWorker=function(){return typeof window>"u"&&typeof self=="object"&&typeof self.addEventListener=="function"&&typeof self.close=="function"},n.runningInNodeChildProcess=function(){return n.runningInNodeJS()&&typeof process.send=="function"},n.runningInNullOrigin=function(){return typeof window!="object"||typeof window.location!="object"||typeof document!="object"?!1:document.location.protocol!=="http:"&&document.location.protocol!=="https:"},n.webWorkersAvailable=function(){return!(typeof Worker!="function"||n.runningInNullOrigin()||n.runningInNodeJS()||navigator&&navigator.userAgent&&navigator.userAgent.indexOf("Android 4.3")>=0)},n.log=function(f,t){t===void 0&&(t=!1),typeof console=="object"&&(console.log(f),t&&typeof document=="object"&&(document.body.innerHTML+=f+"<br/>"))},n.createErrorMessage=function(f,t){if(t===void 0&&(t="Unhandled exception"),f==null)return t;if(t+=": ",typeof f.content=="object"){if(n.runningInNodeJS())return t+f.content.stack;var e=JSON.stringify(f.content);return e!=="{}"?t+e:t+f.content}else return typeof f.content=="string"?t+f.content:t+f},n.printExceptionAndStackTraceToConsole=function(f,t){t===void 0&&(t="Unhandled exception"),n.log(n.createErrorMessage(f,t))},n.getGlobalObject=function(){return typeof B=="object"?B:typeof window=="object"?window:typeof self=="object"?self:{}},n.toString=Object.prototype.toString,n.commonJSAvailable()&&(v.exports=n)})(h||(h={})),function(n){if(typeof Uint8Array=="function"&&new Uint8Array(1).subarray(1).byteLength!==0){var f=function(r,i){var u=function(c,p,a){return c<p?p:c>a?a:c};r=r|0,i=i|0,arguments.length<1&&(r=0),arguments.length<2&&(i=this.length),r<0&&(r=this.length+r),i<0&&(i=this.length+i),r=u(r,0,this.length),i=u(i,0,this.length);var s=i-r;return s<0&&(s=0),new this.constructor(this.buffer,this.byteOffset+r*this.BYTES_PER_ELEMENT,s)},t=["Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Uint16Array","Int32Array","Uint32Array","Float32Array","Float64Array"],e=void 0;if(typeof window=="object"?e=window:typeof self=="object"&&(e=self),e!==void 0)for(var o=0;o<t.length;o++)e[t[o]]&&(e[t[o]].prototype.subarray=f)}}();var h;(function(n){var f=function(){function t(e,o,r){this.container=e,this.startPosition=o,this.length=r}return t.prototype.get=function(e){return this.container[this.startPosition+e]},t.prototype.getInReversedOrder=function(e){return this.container[this.startPosition+this.length-1-e]},t.prototype.set=function(e,o){this.container[this.startPosition+e]=o},t}();n.ArraySegment=f})(h||(h={}));var h;(function(n){(function(f){f.copyElements=function(t,e,o,r,i){for(;i--;)o[r++]=t[e++]},f.zeroElements=function(t,e,o){for(;o--;)t[e++]=0},f.countNonzeroValuesInArray=function(t){for(var e=0,o=0;o<t.length;o++)t[o]&&e++;return e},f.truncateStartingElements=function(t,e){if(t.length<=e)throw new RangeError("truncateStartingElements: Requested length should be smaller than array length");for(var o=t.length-e,r=0;r<e;r++)t[r]=t[o+r];t.length=e},f.doubleByteArrayCapacity=function(t){var e=new Uint8Array(t.length*2);return e.set(t),e},f.concatUint8Arrays=function(t){for(var e=0,o=0,r=t;o<r.length;o++){var i=r[o];e+=i.length}for(var u=new Uint8Array(e),s=0,c=0,p=t;c<p.length;c++){var i=p[c];u.set(i,s),s+=i.length}return u},f.splitByteArray=function(t,e){for(var o=[],r=0;r<t.length;){var i=Math.min(e,t.length-r);o.push(t.subarray(r,r+i)),r+=i}return o}})(n.ArrayTools||(n.ArrayTools={}))})(h||(h={}));var h;(function(n){(function(f){f.convertToUint8ArrayIfNeeded=function(t){return typeof Buffer=="function"&&Buffer.isBuffer(t)?f.bufferToUint8Array(t):t},f.uint8ArrayToBuffer=function(t){if(Buffer.prototype instanceof Uint8Array){var e=new Uint8Array(t.buffer,t.byteOffset,t.byteLength);return Object.setPrototypeOf(e,Buffer.prototype),e}else{for(var o=t.length,r=new Buffer(o),i=0;i<o;i++)r[i]=t[i];return r}},f.bufferToUint8Array=function(t){if(Buffer.prototype instanceof Uint8Array)return new Uint8Array(t.buffer,t.byteOffset,t.byteLength);for(var e=t.length,o=new Uint8Array(e),r=0;r<e;r++)o[r]=t[r];return o}})(n.BufferTools||(n.BufferTools={}))})(h||(h={}));var h;(function(n){(function(f){f.getCroppedBuffer=function(t,e,o,r){r===void 0&&(r=0);var i=new Uint8Array(o+r);return i.set(t.subarray(e,e+o)),i},f.getCroppedAndAppendedByteArray=function(t,e,o,r){return n.ArrayTools.concatUint8Arrays([t.subarray(e,e+o),r])},f.detectCompressionSourceEncoding=function(t){if(t==null)throw new TypeError("detectCompressionSourceEncoding: input is null or undefined");if(typeof t=="string")return"String";if(t instanceof Uint8Array||typeof Buffer=="function"&&Buffer.isBuffer(t))return"ByteArray";throw new TypeError("detectCompressionSourceEncoding: input must be of type 'string', 'Uint8Array' or 'Buffer'")},f.encodeCompressedBytes=function(t,e){switch(e){case"ByteArray":return t;case"Buffer":return n.BufferTools.uint8ArrayToBuffer(t);case"Base64":return n.encodeBase64(t);case"BinaryString":return n.encodeBinaryString(t);case"StorageBinaryString":return n.encodeStorageBinaryString(t);default:throw new TypeError("encodeCompressedBytes: invalid output encoding requested")}},f.decodeCompressedBytes=function(t,e){if(e==null)throw new TypeError("decodeCompressedData: Input is null or undefined");switch(e){case"ByteArray":case"Buffer":var o=n.BufferTools.convertToUint8ArrayIfNeeded(t);if(!(o instanceof Uint8Array))throw new TypeError("decodeCompressedData: 'ByteArray' or 'Buffer' input type was specified but input is not a Uint8Array or Buffer");return o;case"Base64":if(typeof t!="string")throw new TypeError("decodeCompressedData: 'Base64' input type was specified but input is not a string");return n.decodeBase64(t);case"BinaryString":if(typeof t!="string")throw new TypeError("decodeCompressedData: 'BinaryString' input type was specified but input is not a string");return n.decodeBinaryString(t);case"StorageBinaryString":if(typeof t!="string")throw new TypeError("decodeCompressedData: 'StorageBinaryString' input type was specified but input is not a string");return n.decodeStorageBinaryString(t);default:throw new TypeError("decodeCompressedData: invalid input encoding requested: '".concat(e,"'"))}},f.encodeDecompressedBytes=function(t,e){switch(e){case"String":return n.decodeUTF8(t);case"ByteArray":return t;case"Buffer":if(typeof Buffer!="function")throw new TypeError("encodeDecompressedBytes: a 'Buffer' type was specified but is not supported at the current envirnment");return n.BufferTools.uint8ArrayToBuffer(t);default:throw new TypeError("encodeDecompressedBytes: invalid output encoding requested")}}})(n.CompressionCommon||(n.CompressionCommon={}))})(h||(h={}));var h;(function(n){var f;(function(t){var e=[],o;t.enqueueImmediate=function(r){e.push(r),e.length===1&&o()},t.initializeScheduler=function(){var r=function(){for(var c=0,p=e;c<p.length;c++){var a=p[c];try{a.call(void 0)}catch(d){n.printExceptionAndStackTraceToConsole(d,"enqueueImmediate exception")}}e.length=0};if(n.runningInNodeJS()&&(o=function(){return setImmediate(function(){return r()})}),typeof window=="object"&&typeof window.addEventListener=="function"&&typeof window.postMessage=="function"){var i="enqueueImmediate-"+Math.random().toString();window.addEventListener("message",function(c){c.data===i&&r()});var u;n.runningInNullOrigin()?u="*":u=window.location.href,o=function(){return window.postMessage(i,u)}}else if(typeof MessageChannel=="function"&&typeof MessagePort=="function"){var s=new MessageChannel;s.port1.onmessage=function(){return r()},o=function(){return s.port2.postMessage(0)}}else o=function(){return setTimeout(function(){return r()},0)}},t.initializeScheduler()})(f=n.EventLoop||(n.EventLoop={})),n.enqueueImmediate=function(t){return f.enqueueImmediate(t)}})(h||(h={}));var h;(function(n){(function(f){f.override=function(t,e){return f.extend(t,e)},f.extend=function(t,e){if(t==null)throw new TypeError("obj is null or undefined");if(typeof t!="object")throw new TypeError("obj is not an object");if(e==null&&(e={}),typeof e!="object")throw new TypeError("newProperties is not an object");if(e!=null)for(var o in e)t[o]=e[o];return t}})(n.ObjectTools||(n.ObjectTools={}))})(h||(h={}));var h;(function(n){n.getRandomIntegerInRange=function(f,t){return f+Math.floor(Math.random()*(t-f))},n.getRandomUTF16StringOfLength=function(f){for(var t="",e=0;e<f;e++){var o=void 0;do o=n.getRandomIntegerInRange(0,1114112);while(o>=55296&&o<=57343);t+=n.Encoding.CodePoint.decodeToString(o)}return t}})(h||(h={}));var h;(function(n){var f=function(){function t(e){e===void 0&&(e=1024),this.outputBufferCapacity=e,this.outputPosition=0,this.outputString="",this.outputBuffer=new Uint16Array(this.outputBufferCapacity)}return t.prototype.appendCharCode=function(e){this.outputBuffer[this.outputPosition++]=e,this.outputPosition===this.outputBufferCapacity&&this.flushBufferToOutputString()},t.prototype.appendCharCodes=function(e){for(var o=0,r=e.length;o<r;o++)this.appendCharCode(e[o])},t.prototype.appendString=function(e){for(var o=0,r=e.length;o<r;o++)this.appendCharCode(e.charCodeAt(o))},t.prototype.appendCodePoint=function(e){if(e<=65535)this.appendCharCode(e);else if(e<=1114111)this.appendCharCode(55296+(e-65536>>>10)),this.appendCharCode(56320+(e-65536&1023));else throw new Error("appendCodePoint: A code point of ".concat(e," cannot be encoded in UTF-16"))},t.prototype.getOutputString=function(){return this.flushBufferToOutputString(),this.outputString},t.prototype.flushBufferToOutputString=function(){this.outputPosition===this.outputBufferCapacity?this.outputString+=String.fromCharCode.apply(null,this.outputBuffer):this.outputString+=String.fromCharCode.apply(null,this.outputBuffer.subarray(0,this.outputPosition)),this.outputPosition=0},t}();n.StringBuilder=f})(h||(h={}));var h;(function(n){var f=function(){function t(){this.restart()}return t.prototype.restart=function(){this.startTime=t.getTimestamp()},t.prototype.getElapsedTime=function(){return t.getTimestamp()-this.startTime},t.prototype.getElapsedTimeAndRestart=function(){var e=this.getElapsedTime();return this.restart(),e},t.prototype.logAndRestart=function(e,o){o===void 0&&(o=!0);var r=this.getElapsedTime(),i="".concat(e,": ").concat(r.toFixed(3),"ms");return n.log(i,o),this.restart(),r},t.getTimestamp=function(){return this.timestampFunc||this.createGlobalTimestampFunction(),this.timestampFunc()},t.getMicrosecondTimestamp=function(){return Math.floor(t.getTimestamp()*1e3)},t.createGlobalTimestampFunction=function(){if(typeof process=="object"&&typeof process.hrtime=="function"){var e=0;this.timestampFunc=function(){var u=process.hrtime(),s=u[0]*1e3+u[1]/1e6;return e+s},e=Date.now()-this.timestampFunc()}else if(typeof chrome=="object"&&chrome.Interval){var o=Date.now(),r=new chrome.Interval;r.start(),this.timestampFunc=function(){return o+r.microseconds()/1e3}}else if(typeof performance=="object"&&performance.now){var i=Date.now()-performance.now();this.timestampFunc=function(){return i+performance.now()}}else Date.now?this.timestampFunc=function(){return Date.now()}:this.timestampFunc=function(){return new Date().getTime()}},t}();n.Timer=f})(h||(h={}));var h;(function(n){var f=function(){function t(e){e===void 0&&(e=!0),this.MinimumSequenceLength=4,this.MaximumSequenceLength=31,this.MaximumMatchDistance=32767,this.PrefixHashTableSize=65537,this.inputBufferStreamOffset=1,e&&typeof Uint32Array=="function"?this.prefixHashTable=new n.CompressorCustomHashTable(this.PrefixHashTableSize):this.prefixHashTable=new n.CompressorSimpleHashTable(this.PrefixHashTableSize)}return t.prototype.compressBlock=function(e){if(e==null)throw new TypeError("compressBlock: undefined or null input received");return typeof e=="string"&&(e=n.encodeUTF8(e)),e=n.BufferTools.convertToUint8ArrayIfNeeded(e),this.compressUtf8Block(e)},t.prototype.compressUtf8Block=function(e){if(!e||e.length==0)return new Uint8Array(0);var o=this.cropAndAddNewBytesToInputBuffer(e),r=this.inputBuffer,i=this.inputBuffer.length;this.outputBuffer=new Uint8Array(e.length),this.outputBufferPosition=0;for(var u=0,s=o;s<i;s++){var c=r[s],p=s<u;if(s>i-this.MinimumSequenceLength){p||this.outputRawByte(c);continue}var a=this.getBucketIndexForPrefix(s);if(!p){var d=this.findLongestMatch(s,a);d!=null&&(this.outputPointerBytes(d.length,d.distance),u=s+d.length,p=!0)}p||this.outputRawByte(c);var l=this.inputBufferStreamOffset+s;this.prefixHashTable.addValueToBucket(a,l)}return this.outputBuffer.subarray(0,this.outputBufferPosition)},t.prototype.findLongestMatch=function(e,o){var r=this.prefixHashTable.getArraySegmentForBucketIndex(o,this.reusableArraySegmentObject);if(r==null)return null;for(var i=this.inputBuffer,u,s=0,c=0;c<r.length;c++){var p=r.getInReversedOrder(c)-this.inputBufferStreamOffset,a=e-p,d=void 0;if(u===void 0?d=this.MinimumSequenceLength-1:u<128&&a>=128?d=s+(s>>>1):d=s,a>this.MaximumMatchDistance||d>=this.MaximumSequenceLength||e+d>=i.length)break;if(i[p+d]===i[e+d]){for(var l=0;;l++)if(e+l===i.length||i[p+l]!==i[e+l]){l>d&&(u=a,s=l);break}else if(l===this.MaximumSequenceLength)return{distance:a,length:this.MaximumSequenceLength}}}return u!==void 0?{distance:u,length:s}:null},t.prototype.getBucketIndexForPrefix=function(e){return(this.inputBuffer[e]*7880599+this.inputBuffer[e+1]*39601+this.inputBuffer[e+2]*199+this.inputBuffer[e+3])%this.PrefixHashTableSize},t.prototype.outputPointerBytes=function(e,o){o<128?(this.outputRawByte(192|e),this.outputRawByte(o)):(this.outputRawByte(224|e),this.outputRawByte(o>>>8),this.outputRawByte(o&255))},t.prototype.outputRawByte=function(e){this.outputBuffer[this.outputBufferPosition++]=e},t.prototype.cropAndAddNewBytesToInputBuffer=function(e){if(this.inputBuffer===void 0)return this.inputBuffer=e,0;var o=Math.min(this.inputBuffer.length,this.MaximumMatchDistance),r=this.inputBuffer.length-o;return this.inputBuffer=n.CompressionCommon.getCroppedAndAppendedByteArray(this.inputBuffer,r,o,e),this.inputBufferStreamOffset+=r,o},t}();n.Compressor=f})(h||(h={}));var h;(function(n){var f=function(){function t(e){this.minimumBucketCapacity=4,this.maximumBucketCapacity=64,this.bucketLocators=new Uint32Array(e*2),this.storage=new Uint32Array(e*2),this.storageIndex=1}return t.prototype.addValueToBucket=function(e,o){e<<=1,this.storageIndex>=this.storage.length>>>1&&this.compact();var r=this.bucketLocators[e],i;if(r===0)r=this.storageIndex,i=1,this.storage[this.storageIndex]=o,this.storageIndex+=this.minimumBucketCapacity;else{i=this.bucketLocators[e+1],i===this.maximumBucketCapacity-1&&(i=this.truncateBucketToNewerElements(r,i,this.maximumBucketCapacity/2));var u=r+i;this.storage[u]===0?(this.storage[u]=o,u===this.storageIndex&&(this.storageIndex+=i)):(n.ArrayTools.copyElements(this.storage,r,this.storage,this.storageIndex,i),r=this.storageIndex,this.storageIndex+=i,this.storage[this.storageIndex++]=o,this.storageIndex+=i),i++}this.bucketLocators[e]=r,this.bucketLocators[e+1]=i},t.prototype.truncateBucketToNewerElements=function(e,o,r){var i=e+o-r;return n.ArrayTools.copyElements(this.storage,i,this.storage,e,r),n.ArrayTools.zeroElements(this.storage,e+r,o-r),r},t.prototype.compact=function(){var e=this.bucketLocators,o=this.storage;this.bucketLocators=new Uint32Array(this.bucketLocators.length),this.storageIndex=1;for(var r=0;r<e.length;r+=2){var i=e[r+1];i!==0&&(this.bucketLocators[r]=this.storageIndex,this.bucketLocators[r+1]=i,this.storageIndex+=Math.max(Math.min(i*2,this.maximumBucketCapacity),this.minimumBucketCapacity))}this.storage=new Uint32Array(this.storageIndex*8);for(var r=0;r<e.length;r+=2){var u=e[r];if(u!==0){var s=this.bucketLocators[r],c=this.bucketLocators[r+1];n.ArrayTools.copyElements(o,u,this.storage,s,c)}}},t.prototype.getArraySegmentForBucketIndex=function(e,o){e<<=1;var r=this.bucketLocators[e];return r===0?null:(o===void 0&&(o=new n.ArraySegment(this.storage,r,this.bucketLocators[e+1])),o)},t.prototype.getUsedBucketCount=function(){return Math.floor(n.ArrayTools.countNonzeroValuesInArray(this.bucketLocators)/2)},t.prototype.getTotalElementCount=function(){for(var e=0,o=0;o<this.bucketLocators.length;o+=2)e+=this.bucketLocators[o+1];return e},t}();n.CompressorCustomHashTable=f})(h||(h={}));var h;(function(n){var f=function(){function t(e){this.maximumBucketCapacity=64,this.buckets=new Array(e)}return t.prototype.addValueToBucket=function(e,o){var r=this.buckets[e];r===void 0?this.buckets[e]=[o]:(r.length===this.maximumBucketCapacity-1&&n.ArrayTools.truncateStartingElements(r,this.maximumBucketCapacity/2),r.push(o))},t.prototype.getArraySegmentForBucketIndex=function(e,o){var r=this.buckets[e];return r===void 0?null:(o===void 0&&(o=new n.ArraySegment(r,0,r.length)),o)},t.prototype.getUsedBucketCount=function(){return n.ArrayTools.countNonzeroValuesInArray(this.buckets)},t.prototype.getTotalElementCount=function(){for(var e=0,o=0;o<this.buckets.length;o++)this.buckets[o]!==void 0&&(e+=this.buckets[o].length);return e},t}();n.CompressorSimpleHashTable=f})(h||(h={}));var h;(function(n){var f=function(){function t(){this.MaximumMatchDistance=32767,this.outputPosition=0}return t.prototype.decompressBlockToString=function(e){return e=n.BufferTools.convertToUint8ArrayIfNeeded(e),n.decodeUTF8(this.decompressBlock(e))},t.prototype.decompressBlock=function(e){this.inputBufferRemainder&&(e=n.ArrayTools.concatUint8Arrays([this.inputBufferRemainder,e]),this.inputBufferRemainder=void 0);for(var o=this.cropOutputBufferToWindowAndInitialize(Math.max(e.length*4,1024)),r=0,i=e.length;r<i;r++){var u=e[r];if(u>>>6!=3){this.outputByte(u);continue}var s=u>>>5;if(r==i-1||r==i-2&&s==7){this.inputBufferRemainder=e.subarray(r);break}if(e[r+1]>>>7===1)this.outputByte(u);else{var c=u&31,p=void 0;s==6?(p=e[r+1],r+=1):(p=e[r+1]<<8|e[r+2],r+=2);for(var a=this.outputPosition-p,d=0;d<c;d++)this.outputByte(this.outputBuffer[a+d])}}return this.rollBackIfOutputBufferEndsWithATruncatedMultibyteSequence(),n.CompressionCommon.getCroppedBuffer(this.outputBuffer,o,this.outputPosition-o)},t.prototype.outputByte=function(e){this.outputPosition===this.outputBuffer.length&&(this.outputBuffer=n.ArrayTools.doubleByteArrayCapacity(this.outputBuffer)),this.outputBuffer[this.outputPosition++]=e},t.prototype.cropOutputBufferToWindowAndInitialize=function(e){if(!this.outputBuffer)return this.outputBuffer=new Uint8Array(e),0;var o=Math.min(this.outputPosition,this.MaximumMatchDistance);if(this.outputBuffer=n.CompressionCommon.getCroppedBuffer(this.outputBuffer,this.outputPosition-o,o,e),this.outputPosition=o,this.outputBufferRemainder){for(var r=0;r<this.outputBufferRemainder.length;r++)this.outputByte(this.outputBufferRemainder[r]);this.outputBufferRemainder=void 0}return o},t.prototype.rollBackIfOutputBufferEndsWithATruncatedMultibyteSequence=function(){for(var e=1;e<=4&&this.outputPosition-e>=0;e++){var o=this.outputBuffer[this.outputPosition-e];if(e<4&&o>>>3===30||e<3&&o>>>4===14||e<2&&o>>>5===6){this.outputBufferRemainder=this.outputBuffer.subarray(this.outputPosition-e,this.outputPosition),this.outputPosition-=e;return}}},t}();n.Decompressor=f})(h||(h={}));var h;(function(n){(function(f){(function(t){var e=new Uint8Array([65,66,67,68,69,70,71,72,73,74,75,76,77,78,79,80,81,82,83,84,85,86,87,88,89,90,97,98,99,100,101,102,103,104,105,106,107,108,109,110,111,112,113,114,115,116,117,118,119,120,121,122,48,49,50,51,52,53,54,55,56,57,43,47]),o=new Uint8Array([255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,255,62,255,255,255,63,52,53,54,55,56,57,58,59,60,61,255,255,255,0,255,255,255,0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,255,255,255,255,255,255,26,27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,255,255,255,255]),r="=",i=61;t.encode=function(u){return!u||u.length==0?"":n.runningInNodeJS()?n.BufferTools.uint8ArrayToBuffer(u).toString("base64"):t.encodeWithJS(u)},t.decode=function(u){return u?n.runningInNodeJS()?n.BufferTools.bufferToUint8Array(Buffer.from(u,"base64")):t.decodeWithJS(u):new Uint8Array(0)},t.encodeWithJS=function(u,s){if(s===void 0&&(s=!0),!u||u.length==0)return"";for(var c=e,p=new n.StringBuilder,a,d=0,l=u.length;d<l;d+=3)d<=l-3?(a=u[d]<<16|u[d+1]<<8|u[d+2],p.appendCharCode(c[a>>>18&63]),p.appendCharCode(c[a>>>12&63]),p.appendCharCode(c[a>>>6&63]),p.appendCharCode(c[a&63]),a=0):d===l-2?(a=u[d]<<16|u[d+1]<<8,p.appendCharCode(c[a>>>18&63]),p.appendCharCode(c[a>>>12&63]),p.appendCharCode(c[a>>>6&63]),s&&p.appendCharCode(i)):d===l-1&&(a=u[d]<<16,p.appendCharCode(c[a>>>18&63]),p.appendCharCode(c[a>>>12&63]),s&&(p.appendCharCode(i),p.appendCharCode(i)));return p.getOutputString()},t.decodeWithJS=function(u,s){if(!u||u.length==0)return new Uint8Array(0);var c=u.length%4;if(c===1)throw new Error("Invalid Base64 string: length % 4 == 1");c===2?u+=r+r:c===3&&(u+=r),s||(s=new Uint8Array(u.length));for(var p=0,a=u.length,d=0;d<a;d+=4){var l=o[u.charCodeAt(d)]<<18|o[u.charCodeAt(d+1)]<<12|o[u.charCodeAt(d+2)]<<6|o[u.charCodeAt(d+3)];s[p++]=l>>>16&255,s[p++]=l>>>8&255,s[p++]=l&255}return u.charCodeAt(a-1)==i&&p--,u.charCodeAt(a-2)==i&&p--,s.subarray(0,p)}})(f.Base64||(f.Base64={}))})(n.Encoding||(n.Encoding={}))})(h||(h={}));var h;(function(n){(function(f){(function(t){t.encode=function(e){if(e==null)throw new TypeError("BinaryString.encode: undefined or null input received");if(e.length===0)return"";for(var o=e.length,r=new n.StringBuilder,i=0,u=1,s=0;s<o;s+=2){var c=void 0;s==o-1?c=e[s]<<8:c=e[s]<<8|e[s+1],r.appendCharCode(i<<16-u|c>>>u),i=c&(1<<u)-1,u===15?(r.appendCharCode(i),i=0,u=1):u+=1,s>=o-2&&r.appendCharCode(i<<16-u)}return r.appendCharCode(32768|o%2),r.getOutputString()},t.decode=function(e){if(typeof e!="string")throw new TypeError("BinaryString.decode: invalid input type");if(e=="")return new Uint8Array(0);for(var o=new Uint8Array(e.length*3),r=0,i=function(a){o[r++]=a>>>8,o[r++]=a&255},u=0,s=0,c=0;c<e.length;c++){var p=e.charCodeAt(c);if(p>=32768){p==32769&&r--,s=0;continue}s==0?u=p:(i(u<<s|p>>>15-s),u=p&(1<<15-s)-1),s==15?s=0:s+=1}return o.subarray(0,r)}})(f.BinaryString||(f.BinaryString={}))})(n.Encoding||(n.Encoding={}))})(h||(h={}));var h;(function(n){(function(f){(function(t){t.encodeFromString=function(e,o){var r=e.charCodeAt(o);if(r<55296||r>56319)return r;var i=e.charCodeAt(o+1);if(i>=56320&&i<=57343)return 65536+((r-55296<<10)+(i-56320));throw new Error("getUnicodeCodePoint: Received a lead surrogate character, char code ".concat(r,", followed by ").concat(i,", which is not a trailing surrogate character code."))},t.decodeToString=function(e){if(e<=65535)return String.fromCharCode(e);if(e<=1114111)return String.fromCharCode(55296+(e-65536>>>10),56320+(e-65536&1023));throw new Error("getStringFromUnicodeCodePoint: A code point of ".concat(e," cannot be encoded in UTF-16"))}})(f.CodePoint||(f.CodePoint={}))})(n.Encoding||(n.Encoding={}))})(h||(h={}));var h;(function(n){(function(f){(function(t){var e=["000","001","002","003","004","005","006","007","008","009","010","011","012","013","014","015","016","017","018","019","020","021","022","023","024","025","026","027","028","029","030","031","032","033","034","035","036","037","038","039","040","041","042","043","044","045","046","047","048","049","050","051","052","053","054","055","056","057","058","059","060","061","062","063","064","065","066","067","068","069","070","071","072","073","074","075","076","077","078","079","080","081","082","083","084","085","086","087","088","089","090","091","092","093","094","095","096","097","098","099","100","101","102","103","104","105","106","107","108","109","110","111","112","113","114","115","116","117","118","119","120","121","122","123","124","125","126","127","128","129","130","131","132","133","134","135","136","137","138","139","140","141","142","143","144","145","146","147","148","149","150","151","152","153","154","155","156","157","158","159","160","161","162","163","164","165","166","167","168","169","170","171","172","173","174","175","176","177","178","179","180","181","182","183","184","185","186","187","188","189","190","191","192","193","194","195","196","197","198","199","200","201","202","203","204","205","206","207","208","209","210","211","212","213","214","215","216","217","218","219","220","221","222","223","224","225","226","227","228","229","230","231","232","233","234","235","236","237","238","239","240","241","242","243","244","245","246","247","248","249","250","251","252","253","254","255"];t.encode=function(o){for(var r=[],i=0;i<o.length;i++)r.push(e[o[i]]);return r.join(" ")}})(f.DecimalString||(f.DecimalString={}))})(n.Encoding||(n.Encoding={}))})(h||(h={}));var h;(function(n){(function(f){(function(t){t.encode=function(e){return f.BinaryString.encode(e).replace(/\0/g,"耂")},t.decode=function(e){return f.BinaryString.decode(e.replace(/\u8002/g,"\0"))}})(f.StorageBinaryString||(f.StorageBinaryString={}))})(n.Encoding||(n.Encoding={}))})(h||(h={}));var h;(function(n){(function(f){(function(t){var e,o;t.encode=function(r){return!r||r.length==0?new Uint8Array(0):n.runningInNodeJS()?n.BufferTools.bufferToUint8Array(Buffer.from(r,"utf8")):t.createNativeTextEncoderAndDecoderIfAvailable()?e.encode(r):t.encodeWithJS(r)},t.decode=function(r){return!r||r.length==0?"":n.runningInNodeJS()?n.BufferTools.uint8ArrayToBuffer(r).toString("utf8"):t.createNativeTextEncoderAndDecoderIfAvailable()?o.decode(r):t.decodeWithJS(r)},t.encodeWithJS=function(r,i){if(!r||r.length==0)return new Uint8Array(0);i||(i=new Uint8Array(r.length*4));for(var u=0,s=0;s<r.length;s++){var c=f.CodePoint.encodeFromString(r,s);if(c<=127)i[u++]=c;else if(c<=2047)i[u++]=192|c>>>6,i[u++]=128|c&63;else if(c<=65535)i[u++]=224|c>>>12,i[u++]=128|c>>>6&63,i[u++]=128|c&63;else if(c<=1114111)i[u++]=240|c>>>18,i[u++]=128|c>>>12&63,i[u++]=128|c>>>6&63,i[u++]=128|c&63,s++;else throw new Error("Invalid UTF-16 string: Encountered a character unsupported by UTF-8/16 (RFC 3629)")}return i.subarray(0,u)},t.decodeWithJS=function(r,i,u){if(i===void 0&&(i=0),!r||r.length==0)return"";u===void 0&&(u=r.length);for(var s=new n.StringBuilder,c,p,a=i,d=u;a<d;){if(p=r[a],!(p>>>7))c=p,a+=1;else if(p>>>5===6){if(a+1>=u)throw new Error("Invalid UTF-8 stream: Truncated codepoint sequence encountered at position "+a);c=(p&31)<<6|r[a+1]&63,a+=2}else if(p>>>4===14){if(a+2>=u)throw new Error("Invalid UTF-8 stream: Truncated codepoint sequence encountered at position "+a);c=(p&15)<<12|(r[a+1]&63)<<6|r[a+2]&63,a+=3}else if(p>>>3===30){if(a+3>=u)throw new Error("Invalid UTF-8 stream: Truncated codepoint sequence encountered at position "+a);c=(p&7)<<18|(r[a+1]&63)<<12|(r[a+2]&63)<<6|r[a+3]&63,a+=4}else throw new Error("Invalid UTF-8 stream: An invalid lead byte value encountered at position "+a);s.appendCodePoint(c)}return s.getOutputString()},t.createNativeTextEncoderAndDecoderIfAvailable=function(){return e?!0:typeof TextEncoder=="function"?(e=new TextEncoder("utf-8"),o=new TextDecoder("utf-8"),!0):!1}})(f.UTF8||(f.UTF8={}))})(n.Encoding||(n.Encoding={}))})(h||(h={}));var h;(function(n){function f(a,d){if(d===void 0&&(d={}),a==null)throw new TypeError("compress: undefined or null input received");var l=n.CompressionCommon.detectCompressionSourceEncoding(a);d=n.ObjectTools.override({inputEncoding:l,outputEncoding:"ByteArray"},d);var g=new n.Compressor,y=g.compressBlock(a);return n.CompressionCommon.encodeCompressedBytes(y,d.outputEncoding)}n.compress=f;function t(a,d){if(d===void 0&&(d={}),a==null)throw new TypeError("decompress: undefined or null input received");d=n.ObjectTools.override({inputEncoding:"ByteArray",outputEncoding:"String"},d);var l=n.CompressionCommon.decodeCompressedBytes(a,d.inputEncoding),g=new n.Decompressor,y=g.decompressBlock(l);return n.CompressionCommon.encodeDecompressedBytes(y,d.outputEncoding)}n.decompress=t;function e(a){return n.Encoding.UTF8.encode(a)}n.encodeUTF8=e;function o(a){return n.Encoding.UTF8.decode(a)}n.decodeUTF8=o;function r(a){return n.Encoding.Base64.encode(a)}n.encodeBase64=r;function i(a){return n.Encoding.Base64.decode(a)}n.decodeBase64=i;function u(a){return n.Encoding.BinaryString.encode(a)}n.encodeBinaryString=u;function s(a){return n.Encoding.BinaryString.decode(a)}n.decodeBinaryString=s;function c(a){return n.Encoding.StorageBinaryString.encode(a)}n.encodeStorageBinaryString=c;function p(a){return n.Encoding.StorageBinaryString.decode(a)}n.decodeStorageBinaryString=p})(h||(h={}))})(m);var C=m.exports;export{C as l};
