var Eg=Object.defineProperty;var zg=(e,t,r)=>t in e?Eg(e,t,{enumerable:!0,configurable:!0,writable:!0,value:r}):e[t]=r;var Js=(e,t,r)=>zg(e,typeof t!="symbol"?t+"":t,r);/*!
 * ONNX Runtime Web v1.24.3
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */var Ca=Object.defineProperty,Cg=Object.getOwnPropertyDescriptor,Ag=Object.getOwnPropertyNames,Og=Object.prototype.hasOwnProperty,Rg=(e=>typeof require<"u"?require:typeof Proxy<"u"?new Proxy(e,{get:(t,r)=>(typeof require<"u"?require:t)[r]}):e)(function(e){if(typeof require<"u")return require.apply(this,arguments);throw Error('Dynamic require of "'+e+'" is not supported')}),q=(e,t)=>()=>(e&&(t=e(e=0)),t),Wt=(e,t)=>{for(var r in t)Ca(e,r,{get:t[r],enumerable:!0})},Bg=(e,t,r,i)=>{if(t&&typeof t=="object"||typeof t=="function")for(let a of Ag(t))!Og.call(e,a)&&a!==r&&Ca(e,a,{get:()=>t[a],enumerable:!(i=Cg(t,a))||i.enumerable});return e},dr=e=>Bg(Ca({},"__esModule",{value:!0}),e),Kt,ct,Dt,eo,Bd,Nd=q(()=>{Kt=new Map,ct=[],Dt=(e,t,r)=>{if(t&&typeof t.init=="function"&&typeof t.createInferenceSessionHandler=="function"){let i=Kt.get(e);if(i===void 0)Kt.set(e,{backend:t,priority:r});else{if(i.priority>r)return;if(i.priority===r&&i.backend!==t)throw new Error(`cannot register backend "${e}" using priority ${r}`)}if(r>=0){let a=ct.indexOf(e);a!==-1&&ct.splice(a,1);for(let n=0;n<ct.length;n++)if(Kt.get(ct[n]).priority<=r){ct.splice(n,0,e);return}ct.push(e)}return}throw new TypeError("not a valid backend")},eo=async e=>{let t=Kt.get(e);if(!t)return"backend not found.";if(t.initialized)return t.backend;if(t.aborted)return t.error;{let r=!!t.initPromise;try{return r||(t.initPromise=t.backend.init(e)),await t.initPromise,t.initialized=!0,t.backend}catch(i){return r||(t.error=`${i}`,t.aborted=!0),t.error}finally{delete t.initPromise}}},Bd=async e=>{let t=e.executionProviders||[],r=t.map(d=>typeof d=="string"?d:d.name),i=r.length===0?ct:r,a,n=[],s=new Set;for(let d of i){let p=await eo(d);typeof p=="string"?n.push({name:d,err:p}):(a||(a=p),a===p&&s.add(d))}if(!a)throw new Error(`no available backend found. ERR: ${n.map(d=>`[${d.name}] ${d.err}`).join(", ")}`);for(let{name:d,err:p}of n)r.includes(d)&&console.warn(`removing requested execution provider "${d}" from session options because it is not available: ${p}`);let u=t.filter(d=>s.has(typeof d=="string"?d:d.name));return[a,new Proxy(e,{get:(d,p)=>p==="executionProviders"?u:Reflect.get(d,p)})]}}),Ng=q(()=>{Nd()}),Md,Mg=q(()=>{Md="1.24.3"}),_i,ke,Dd=q(()=>{Mg(),_i="warning",ke={wasm:{},webgl:{},webgpu:{},versions:{common:Md},set logLevel(e){if(e!==void 0){if(typeof e!="string"||["verbose","info","warning","error","fatal"].indexOf(e)===-1)throw new Error(`Unsupported logging level: ${e}`);_i=e}},get logLevel(){return _i}},Object.defineProperty(ke,"logLevel",{enumerable:!0})}),$e,Dg=q(()=>{Dd(),$e=ke}),Ud,Pd,Ug=q(()=>{Ud=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas"):new OffscreenCanvas(1,1);r.width=e.dims[3],r.height=e.dims[2];let i=r.getContext("2d");if(i!=null){let a,n;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[3]):(a=e.dims[3],n=e.dims[2]);let s=(t==null?void 0:t.format)!==void 0?t.format:"RGB",u=t==null?void 0:t.norm,d,p;u===void 0||u.mean===void 0?d=[255,255,255,255]:typeof u.mean=="number"?d=[u.mean,u.mean,u.mean,u.mean]:(d=[u.mean[0],u.mean[1],u.mean[2],0],u.mean[3]!==void 0&&(d[3]=u.mean[3])),u===void 0||u.bias===void 0?p=[0,0,0,0]:typeof u.bias=="number"?p=[u.bias,u.bias,u.bias,u.bias]:(p=[u.bias[0],u.bias[1],u.bias[2],0],u.bias[3]!==void 0&&(p[3]=u.bias[3]));let h=n*a,f=0,g=h,y=h*2,_=-1;s==="RGBA"?(f=0,g=h,y=h*2,_=h*3):s==="RGB"?(f=0,g=h,y=h*2):s==="RBG"&&(f=0,y=h,g=h*2);for(let w=0;w<n;w++)for(let S=0;S<a;S++){let x=(e.data[f++]-p[0])*d[0],b=(e.data[g++]-p[1])*d[1],I=(e.data[y++]-p[2])*d[2],k=_===-1?255:(e.data[_++]-p[3])*d[3];i.fillStyle="rgba("+x+","+b+","+I+","+k+")",i.fillRect(S,w,1,1)}if("toDataURL"in r)return r.toDataURL();throw new Error("toDataURL is not supported")}else throw new Error("Can not access image data")},Pd=(e,t)=>{let r=typeof document<"u"?document.createElement("canvas").getContext("2d"):new OffscreenCanvas(1,1).getContext("2d"),i;if(r!=null){let a,n,s;(t==null?void 0:t.tensorLayout)!==void 0&&t.tensorLayout==="NHWC"?(a=e.dims[2],n=e.dims[1],s=e.dims[3]):(a=e.dims[3],n=e.dims[2],s=e.dims[1]);let u=t!==void 0&&t.format!==void 0?t.format:"RGB",d=t==null?void 0:t.norm,p,h;d===void 0||d.mean===void 0?p=[255,255,255,255]:typeof d.mean=="number"?p=[d.mean,d.mean,d.mean,d.mean]:(p=[d.mean[0],d.mean[1],d.mean[2],255],d.mean[3]!==void 0&&(p[3]=d.mean[3])),d===void 0||d.bias===void 0?h=[0,0,0,0]:typeof d.bias=="number"?h=[d.bias,d.bias,d.bias,d.bias]:(h=[d.bias[0],d.bias[1],d.bias[2],0],d.bias[3]!==void 0&&(h[3]=d.bias[3]));let f=n*a;if(t!==void 0&&(t.format!==void 0&&s===4&&t.format!=="RGBA"||s===3&&t.format!=="RGB"&&t.format!=="BGR"))throw new Error("Tensor format doesn't match input tensor dims");let g=4,y=0,_=1,w=2,S=3,x=0,b=f,I=f*2,k=-1;u==="RGBA"?(x=0,b=f,I=f*2,k=f*3):u==="RGB"?(x=0,b=f,I=f*2):u==="RBG"&&(x=0,I=f,b=f*2),i=r.createImageData(a,n);for(let E=0;E<n*a;y+=g,_+=g,w+=g,S+=g,E++)i.data[y]=(e.data[x++]-h[0])*p[0],i.data[_]=(e.data[b++]-h[1])*p[1],i.data[w]=(e.data[I++]-h[2])*p[2],i.data[S]=k===-1?255:(e.data[k++]-h[3])*p[3]}else throw new Error("Can not access image data");return i}}),kr,qd,Wd,Ld,Vd,Gd,Pg=q(()=>{Aa(),kr=(e,t)=>{if(e===void 0)throw new Error("Image buffer must be defined");if(t.height===void 0||t.width===void 0)throw new Error("Image height and width must be defined");if(t.tensorLayout==="NHWC")throw new Error("NHWC Tensor layout is not supported yet");let{height:r,width:i}=t,a=t.norm??{mean:255,bias:0},n,s;typeof a.mean=="number"?n=[a.mean,a.mean,a.mean,a.mean]:n=[a.mean[0],a.mean[1],a.mean[2],a.mean[3]??255],typeof a.bias=="number"?s=[a.bias,a.bias,a.bias,a.bias]:s=[a.bias[0],a.bias[1],a.bias[2],a.bias[3]??0];let u=t.format!==void 0?t.format:"RGBA",d=t.tensorFormat!==void 0&&t.tensorFormat!==void 0?t.tensorFormat:"RGB",p=r*i,h=d==="RGBA"?new Float32Array(p*4):new Float32Array(p*3),f=4,g=0,y=1,_=2,w=3,S=0,x=p,b=p*2,I=-1;u==="RGB"&&(f=3,g=0,y=1,_=2,w=-1),d==="RGBA"?I=p*3:d==="RBG"?(S=0,b=p,x=p*2):d==="BGR"&&(b=0,x=p,S=p*2);for(let k=0;k<p;k++,g+=f,_+=f,y+=f,w+=f)h[S++]=(e[g]+s[0])/n[0],h[x++]=(e[y]+s[1])/n[1],h[b++]=(e[_]+s[2])/n[2],I!==-1&&w!==-1&&(h[I++]=(e[w]+s[3])/n[3]);return d==="RGBA"?new Ne("float32",h,[1,4,r,i]):new Ne("float32",h,[1,3,r,i])},qd=async(e,t)=>{let r=typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement,i=typeof ImageData<"u"&&e instanceof ImageData,a=typeof ImageBitmap<"u"&&e instanceof ImageBitmap,n=typeof e=="string",s,u=t??{},d=()=>{if(typeof document<"u")return document.createElement("canvas");if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(1,1);throw new Error("Canvas is not supported")},p=h=>typeof HTMLCanvasElement<"u"&&h instanceof HTMLCanvasElement||h instanceof OffscreenCanvas?h.getContext("2d"):null;if(r){let h=d();h.width=e.width,h.height=e.height;let f=p(h);if(f!=null){let g=e.height,y=e.width;if(t!==void 0&&t.resizedHeight!==void 0&&t.resizedWidth!==void 0&&(g=t.resizedHeight,y=t.resizedWidth),t!==void 0){if(u=t,t.tensorFormat!==void 0)throw new Error("Image input config format must be RGBA for HTMLImageElement");u.tensorFormat="RGBA",u.height=g,u.width=y}else u.tensorFormat="RGBA",u.height=g,u.width=y;f.drawImage(e,0,0),s=f.getImageData(0,0,y,g).data}else throw new Error("Can not access image data")}else if(i){let h,f;if(t!==void 0&&t.resizedWidth!==void 0&&t.resizedHeight!==void 0?(h=t.resizedHeight,f=t.resizedWidth):(h=e.height,f=e.width),t!==void 0&&(u=t),u.format="RGBA",u.height=h,u.width=f,t!==void 0){let g=d();g.width=f,g.height=h;let y=p(g);if(y!=null)y.putImageData(e,0,0),s=y.getImageData(0,0,f,h).data;else throw new Error("Can not access image data")}else s=e.data}else if(a){if(t===void 0)throw new Error("Please provide image config with format for Imagebitmap");let h=d();h.width=e.width,h.height=e.height;let f=p(h);if(f!=null){let g=e.height,y=e.width;return f.drawImage(e,0,0,y,g),s=f.getImageData(0,0,y,g).data,u.height=g,u.width=y,kr(s,u)}else throw new Error("Can not access image data")}else{if(n)return new Promise((h,f)=>{let g=d(),y=p(g);if(!e||!y)return f();let _=new Image;_.crossOrigin="Anonymous",_.src=e,_.onload=()=>{g.width=_.width,g.height=_.height,y.drawImage(_,0,0,g.width,g.height);let w=y.getImageData(0,0,g.width,g.height);u.height=g.height,u.width=g.width,h(kr(w.data,u))}});throw new Error("Input data provided is not supported - aborted tensor creation")}if(s!==void 0)return kr(s,u);throw new Error("Input data provided is not supported - aborted tensor creation")},Wd=(e,t)=>{let{width:r,height:i,download:a,dispose:n}=t,s=[1,i,r,4];return new Ne({location:"texture",type:"float32",texture:e,dims:s,download:a,dispose:n})},Ld=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Ne({location:"gpu-buffer",type:r??"float32",gpuBuffer:e,dims:i,download:a,dispose:n})},Vd=(e,t)=>{let{dataType:r,dims:i,download:a,dispose:n}=t;return new Ne({location:"ml-tensor",type:r??"float32",mlTensor:e,dims:i,download:a,dispose:n})},Gd=(e,t,r)=>new Ne({location:"cpu-pinned",type:e,data:t,dims:r??[t.length]})}),St,nr,wi,Hd,qg=q(()=>{St=new Map([["float32",Float32Array],["uint8",Uint8Array],["int8",Int8Array],["uint16",Uint16Array],["int16",Int16Array],["int32",Int32Array],["bool",Uint8Array],["float64",Float64Array],["uint32",Uint32Array],["int4",Uint8Array],["uint4",Uint8Array]]),nr=new Map([[Float32Array,"float32"],[Uint8Array,"uint8"],[Int8Array,"int8"],[Uint16Array,"uint16"],[Int16Array,"int16"],[Int32Array,"int32"],[Float64Array,"float64"],[Uint32Array,"uint32"]]),wi=!1,Hd=()=>{if(!wi){wi=!0;let e=typeof BigInt64Array<"u"&&BigInt64Array.from,t=typeof BigUint64Array<"u"&&BigUint64Array.from,r=globalThis.Float16Array,i=typeof r<"u"&&r.from;e&&(St.set("int64",BigInt64Array),nr.set(BigInt64Array,"int64")),t&&(St.set("uint64",BigUint64Array),nr.set(BigUint64Array,"uint64")),i?(St.set("float16",r),nr.set(r,"float16")):St.set("float16",Uint16Array)}}}),Fd,jd,Wg=q(()=>{Aa(),Fd=e=>{let t=1;for(let r=0;r<e.length;r++){let i=e[r];if(typeof i!="number"||!Number.isSafeInteger(i))throw new TypeError(`dims[${r}] must be an integer, got: ${i}`);if(i<0)throw new RangeError(`dims[${r}] must be a non-negative integer, got: ${i}`);t*=i}return t},jd=(e,t)=>{switch(e.location){case"cpu":return new Ne(e.type,e.data,t);case"cpu-pinned":return new Ne({location:"cpu-pinned",data:e.data,type:e.type,dims:t});case"texture":return new Ne({location:"texture",texture:e.texture,type:e.type,dims:t});case"gpu-buffer":return new Ne({location:"gpu-buffer",gpuBuffer:e.gpuBuffer,type:e.type,dims:t});case"ml-tensor":return new Ne({location:"ml-tensor",mlTensor:e.mlTensor,type:e.type,dims:t});default:throw new Error(`tensorReshape: tensor location ${e.location} is not supported`)}}}),Ne,Aa=q(()=>{Ug(),Pg(),qg(),Wg(),Ne=class{constructor(e,t,r){Hd();let i,a;if(typeof e=="object"&&"location"in e)switch(this.dataLocation=e.location,i=e.type,a=e.dims,e.location){case"cpu-pinned":{let s=St.get(i);if(!s)throw new TypeError(`unsupported type "${i}" to create tensor from pinned buffer`);if(!(e.data instanceof s))throw new TypeError(`buffer should be of type ${s.name}`);this.cpuData=e.data;break}case"texture":{if(i!=="float32")throw new TypeError(`unsupported type "${i}" to create tensor from texture`);this.gpuTextureData=e.texture,this.downloader=e.download,this.disposer=e.dispose;break}case"gpu-buffer":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from gpu buffer`);this.gpuBufferData=e.gpuBuffer,this.downloader=e.download,this.disposer=e.dispose;break}case"ml-tensor":{if(i!=="float32"&&i!=="float16"&&i!=="int32"&&i!=="int64"&&i!=="uint32"&&i!=="uint64"&&i!=="int8"&&i!=="uint8"&&i!=="bool"&&i!=="uint4"&&i!=="int4")throw new TypeError(`unsupported type "${i}" to create tensor from MLTensor`);this.mlTensorData=e.mlTensor,this.downloader=e.download,this.disposer=e.dispose;break}default:throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`)}else{let s,u;if(typeof e=="string")if(i=e,u=r,e==="string"){if(!Array.isArray(t))throw new TypeError("A string tensor's data must be a string array.");s=t}else{let d=St.get(e);if(d===void 0)throw new TypeError(`Unsupported tensor type: ${e}.`);if(Array.isArray(t)){if(e==="float16"&&d===Uint16Array||e==="uint4"||e==="int4")throw new TypeError(`Creating a ${e} tensor from number array is not supported. Please use ${d.name} as data.`);e==="uint64"||e==="int64"?s=d.from(t,BigInt):s=d.from(t)}else if(t instanceof d)s=t;else if(t instanceof Uint8ClampedArray)if(e==="uint8")s=Uint8Array.from(t);else throw new TypeError("A Uint8ClampedArray tensor's data must be type of uint8");else if(e==="float16"&&t instanceof Uint16Array&&d!==Uint16Array)s=new globalThis.Float16Array(t.buffer,t.byteOffset,t.length);else throw new TypeError(`A ${i} tensor's data must be type of ${d}`)}else if(u=t,Array.isArray(e)){if(e.length===0)throw new TypeError("Tensor type cannot be inferred from an empty array.");let d=typeof e[0];if(d==="string")i="string",s=e;else if(d==="boolean")i="bool",s=Uint8Array.from(e);else throw new TypeError(`Invalid element type of data array: ${d}.`)}else if(e instanceof Uint8ClampedArray)i="uint8",s=Uint8Array.from(e);else{let d=nr.get(e.constructor);if(d===void 0)throw new TypeError(`Unsupported type for tensor data: ${e.constructor}.`);i=d,s=e}if(u===void 0)u=[s.length];else if(!Array.isArray(u))throw new TypeError("A tensor's dims must be a number array");a=u,this.cpuData=s,this.dataLocation="cpu"}let n=Fd(a);if(this.cpuData&&n!==this.cpuData.length&&!((i==="uint4"||i==="int4")&&Math.ceil(n/2)===this.cpuData.length))throw new Error(`Tensor's size(${n}) does not match data length(${this.cpuData.length}).`);this.type=i,this.dims=a,this.size=n}static async fromImage(e,t){return qd(e,t)}static fromTexture(e,t){return Wd(e,t)}static fromGpuBuffer(e,t){return Ld(e,t)}static fromMLTensor(e,t){return Vd(e,t)}static fromPinnedBuffer(e,t,r){return Gd(e,t,r)}toDataURL(e){return Ud(this,e)}toImageData(e){return Pd(this,e)}get data(){if(this.ensureValid(),!this.cpuData)throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");return this.cpuData}get location(){return this.dataLocation}get texture(){if(this.ensureValid(),!this.gpuTextureData)throw new Error("The data is not stored as a WebGL texture.");return this.gpuTextureData}get gpuBuffer(){if(this.ensureValid(),!this.gpuBufferData)throw new Error("The data is not stored as a WebGPU buffer.");return this.gpuBufferData}get mlTensor(){if(this.ensureValid(),!this.mlTensorData)throw new Error("The data is not stored as a WebNN MLTensor.");return this.mlTensorData}async getData(e){switch(this.ensureValid(),this.dataLocation){case"cpu":case"cpu-pinned":return this.data;case"texture":case"gpu-buffer":case"ml-tensor":{if(!this.downloader)throw new Error("The current tensor is not created with a specified data downloader.");if(this.isDownloading)throw new Error("The current tensor is being downloaded.");try{this.isDownloading=!0;let t=await this.downloader();return this.downloader=void 0,this.dataLocation="cpu",this.cpuData=t,e&&this.disposer&&(this.disposer(),this.disposer=void 0),t}finally{this.isDownloading=!1}}default:throw new Error(`cannot get data from location: ${this.dataLocation}`)}}dispose(){if(this.isDownloading)throw new Error("The current tensor is being downloaded.");this.disposer&&(this.disposer(),this.disposer=void 0),this.cpuData=void 0,this.gpuTextureData=void 0,this.gpuBufferData=void 0,this.mlTensorData=void 0,this.downloader=void 0,this.isDownloading=void 0,this.dataLocation="none"}ensureValid(){if(this.dataLocation==="none")throw new Error("The tensor is disposed.")}reshape(e){if(this.ensureValid(),this.downloader||this.disposer)throw new Error("Cannot reshape a tensor that owns GPU resource.");return jd(this,e)}}}),Ye,Kd=q(()=>{Aa(),Ye=Ne}),Wr,bi,Xe,Fe,It,Et,Qd=q(()=>{Dd(),Wr=(e,t)=>{(typeof ke.trace>"u"?!ke.wasm.trace:!ke.trace)||console.timeStamp(`${e}::ORT::${t}`)},bi=(e,t)=>{var a;let r=((a=new Error().stack)==null?void 0:a.split(/\r\n|\r|\n/g))||[],i=!1;for(let n=0;n<r.length;n++){if(i&&!r[n].includes("TRACE_FUNC")){let s=`FUNC_${e}::${r[n].trim().split(" ")[1]}`;t&&(s+=`::${t}`),Wr("CPU",s);return}r[n].includes("TRACE_FUNC")&&(i=!0)}},Xe=e=>{(typeof ke.trace>"u"?!ke.wasm.trace:!ke.trace)||bi("BEGIN",e)},Fe=e=>{(typeof ke.trace>"u"?!ke.wasm.trace:!ke.trace)||bi("END",e)},It=e=>{(typeof ke.trace>"u"?!ke.wasm.trace:!ke.trace)||console.time(`ORT::${e}`)},Et=e=>{(typeof ke.trace>"u"?!ke.wasm.trace:!ke.trace)||console.timeEnd(`ORT::${e}`)}}),Zd,Lg=q(()=>{Nd(),Kd(),Qd(),Zd=class Yd{constructor(t){this.handler=t}async run(t,r,i){Xe(),It("InferenceSession.run");let a={},n={};if(typeof t!="object"||t===null||t instanceof Ye||Array.isArray(t))throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");let s=!0;if(typeof r=="object"){if(r===null)throw new TypeError("Unexpected argument[1]: cannot be null.");if(r instanceof Ye)throw new TypeError("'fetches' cannot be a Tensor");if(Array.isArray(r)){if(r.length===0)throw new TypeError("'fetches' cannot be an empty array.");s=!1;for(let p of r){if(typeof p!="string")throw new TypeError("'fetches' must be a string array or an object.");if(this.outputNames.indexOf(p)===-1)throw new RangeError(`'fetches' contains invalid output name: ${p}.`);a[p]=null}if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else{let p=!1,h=Object.getOwnPropertyNames(r);for(let f of this.outputNames)if(h.indexOf(f)!==-1){let g=r[f];(g===null||g instanceof Ye)&&(p=!0,s=!1,a[f]=g)}if(p){if(typeof i=="object"&&i!==null)n=i;else if(typeof i<"u")throw new TypeError("'options' must be an object.")}else n=r}}else if(typeof r<"u")throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");for(let p of this.inputNames)if(typeof t[p]>"u")throw new Error(`input '${p}' is missing in 'feeds'.`);if(s)for(let p of this.outputNames)a[p]=null;let u=await this.handler.run(t,a,n),d={};for(let p in u)if(Object.hasOwnProperty.call(u,p)){let h=u[p];h instanceof Ye?d[p]=h:d[p]=new Ye(h.type,h.data,h.dims)}return Et("InferenceSession.run"),Fe(),d}async release(){return this.handler.dispose()}static async create(t,r,i,a){Xe(),It("InferenceSession.create");let n,s={};if(typeof t=="string"){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof Uint8Array){if(n=t,typeof r=="object"&&r!==null)s=r;else if(typeof r<"u")throw new TypeError("'options' must be an object.")}else if(t instanceof ArrayBuffer||typeof SharedArrayBuffer<"u"&&t instanceof SharedArrayBuffer){let h=t,f=0,g=t.byteLength;if(typeof r=="object"&&r!==null)s=r;else if(typeof r=="number"){if(f=r,!Number.isSafeInteger(f))throw new RangeError("'byteOffset' must be an integer.");if(f<0||f>=h.byteLength)throw new RangeError(`'byteOffset' is out of range [0, ${h.byteLength}).`);if(g=t.byteLength-f,typeof i=="number"){if(g=i,!Number.isSafeInteger(g))throw new RangeError("'byteLength' must be an integer.");if(g<=0||f+g>h.byteLength)throw new RangeError(`'byteLength' is out of range (0, ${h.byteLength-f}].`);if(typeof a=="object"&&a!==null)s=a;else if(typeof a<"u")throw new TypeError("'options' must be an object.")}else if(typeof i<"u")throw new TypeError("'byteLength' must be a number.")}else if(typeof r<"u")throw new TypeError("'options' must be an object.");n=new Uint8Array(h,f,g)}else throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");let[u,d]=await Bd(s),p=await u.createInferenceSessionHandler(n,d);return Et("InferenceSession.create"),Fe(),new Yd(p)}startProfiling(){this.handler.startProfiling()}endProfiling(){this.handler.endProfiling()}get inputNames(){return this.handler.inputNames}get outputNames(){return this.handler.outputNames}get inputMetadata(){return this.handler.inputMetadata}get outputMetadata(){return this.handler.outputMetadata}}}),Xd,Vg=q(()=>{Lg(),Xd=Zd}),Gg=q(()=>{}),Hg=q(()=>{}),Fg=q(()=>{}),jg=q(()=>{}),Jd={};Wt(Jd,{InferenceSession:()=>Xd,TRACE:()=>Wr,TRACE_EVENT_BEGIN:()=>It,TRACE_EVENT_END:()=>Et,TRACE_FUNC_BEGIN:()=>Xe,TRACE_FUNC_END:()=>Fe,Tensor:()=>Ye,env:()=>$e,registerBackend:()=>Dt});var Ue=q(()=>{Ng(),Dg(),Vg(),Kd(),Gg(),Hg(),Qd(),Fg(),jg()}),Oa=q(()=>{}),ep={};Wt(ep,{default:()=>tp});var $i,vi,tp,Kg=q(()=>{var e;of(),Ot(),Ra(),$i="ort-wasm-proxy-worker",vi=((e=globalThis.self)==null?void 0:e.name)===$i,vi&&(self.onmessage=t=>{let{type:r,in:i}=t.data;try{switch(r){case"init-wasm":Ba(i.wasm).then(()=>{Ya(i).then(()=>{postMessage({type:r})},a=>{postMessage({type:r,err:a})})},a=>{postMessage({type:r,err:a})});break;case"init-ep":{let{epName:a,env:n}=i;Xa(n,a).then(()=>{postMessage({type:r})},s=>{postMessage({type:r,err:s})});break}case"copy-from":{let{buffer:a}=i,n=Kr(a);postMessage({type:r,out:n});break}case"create":{let{model:a,options:n}=i;Ja(a,n).then(s=>{postMessage({type:r,out:s})},s=>{postMessage({type:r,err:s})});break}case"release":en(i),postMessage({type:r});break;case"run":{let{sessionId:a,inputIndices:n,inputs:s,outputIndices:u,options:d}=i;tn(a,n,s,u,new Array(u.length).fill(null),d).then(p=>{p.some(h=>h[3]!=="cpu")?postMessage({type:r,err:"Proxy does not support non-cpu tensor location."}):postMessage({type:r,out:p},an([...s,...p]))},p=>{postMessage({type:r,err:p})});break}case"end-profiling":rn(i),postMessage({type:r});break;default:}}catch(a){postMessage({type:r,err:a})}}),tp=vi?null:t=>new Worker(t??Be,{type:"module",name:$i})}),rp={};Wt(rp,{default:()=>ip});async function to(e={}){var Ys,Xs;var t=e,r=!!globalThis.window,i=!!globalThis.WorkerGlobalScope,a=i&&((Ys=self.name)==null?void 0:Ys.startsWith("em-pthread"));t.mountExternalData=(o,l)=>{o.startsWith("./")&&(o=o.substring(2)),(t.Zc||(t.Zc=new Map)).set(o,l)},t.unmountExternalData=()=>{delete t.Zc},globalThis.SharedArrayBuffer??new WebAssembly.Memory({initial:0,maximum:0,ae:!0}).buffer.constructor;let n=o=>async(...l)=>{var m;try{if(t.$c)throw Error("Session already started");let c=t.$c={Nd:l[0],errors:[]},$=await o(...l);if(t.$c!==c)throw Error("Session mismatch");(m=t.gd)==null||m.flush();let T=c.errors;if(0<T.length){let z=await Promise.all(T);if(z=z.filter(B=>B),0<z.length)throw Error(z.join(`
`))}return $}finally{t.$c=null}};t.jsepInit=(o,l)=>{if(o==="webgpu"){[t.gd,t.Dd,t.Hd,t.jd,t.Gd,t.ac,t.Id,t.Kd,t.Ed,t.Fd,t.Jd]=l;let m=t.gd;t.jsepRegisterBuffer=(c,$,T,z)=>m.registerBuffer(c,$,T,z),t.jsepGetBuffer=c=>m.getBuffer(c),t.jsepCreateDownloader=(c,$,T)=>m.createDownloader(c,$,T),t.jsepOnCreateSession=c=>{m.onCreateSession(c)},t.jsepOnReleaseSession=c=>{m.onReleaseSession(c)},t.jsepOnRunStart=c=>m.onRunStart(c),t.Ld=(c,$)=>{m.upload(c,$)}}else if(o==="webnn"){let m=l[0];[t.Zd,t.vd,t.webnnEnsureTensor,t.xd,t.webnnDownloadTensor,t.Yd,t.webnnEnableTraceEvent]=l.slice(1),t.webnnReleaseTensorId=t.vd,t.webnnUploadTensor=t.xd,t.webnnRegisterMLContext=t.Yd,t.webnnOnRunStart=c=>m.onRunStart(c),t.webnnOnRunEnd=m.onRunEnd.bind(m),t.webnnOnReleaseSession=c=>{m.onReleaseSession(c)},t.webnnCreateMLTensorDownloader=(c,$)=>m.createMLTensorDownloader(c,$),t.webnnRegisterMLTensor=(c,$,T,z)=>m.registerMLTensor(c,$,T,z),t.webnnCreateMLContext=c=>m.createMLContext(c),t.webnnRegisterMLConstant=(c,$,T,z,B,L)=>m.registerMLConstant(c,$,T,z,B,t.Zc,L),t.webnnRegisterGraphInput=m.registerGraphInput.bind(m),t.webnnIsGraphInput=m.isGraphInput.bind(m),t.webnnRegisterGraphOutput=m.registerGraphOutput.bind(m),t.webnnIsGraphOutput=m.isGraphOutput.bind(m),t.webnnCreateTemporaryTensor=m.createTemporaryTensor.bind(m),t.webnnIsGraphInputOutputTypeSupported=m.isGraphInputOutputTypeSupported.bind(m)}};let s=()=>{let o=l=>(...m)=>{let c=Ke;return m=l(...m),Ke!=c?new Promise(($,T)=>{ni={resolve:$,reject:T}}):m};(()=>{for(let l of["_OrtAppendExecutionProvider","_OrtCreateSession","_OrtRun","_OrtRunWithBinding","_OrtBindInput"])t[l]=o(t[l])})(),n!==void 0&&(t._OrtRun=n(t._OrtRun),t._OrtRunWithBinding=n(t._OrtRunWithBinding)),s=void 0};t.asyncInit=()=>{s==null||s()};var u,d,p=(o,l)=>{throw l},h=import.meta.url,f="";if(r||i){try{f=new URL(".",h).href}catch{}i&&(d=o=>{var l=new XMLHttpRequest;return l.open("GET",o,!1),l.responseType="arraybuffer",l.send(null),new Uint8Array(l.response)}),u=async o=>{if(A(o))return new Promise((m,c)=>{var $=new XMLHttpRequest;$.open("GET",o,!0),$.responseType="arraybuffer",$.onload=()=>{$.status==200||$.status==0&&$.response?m($.response):c($.status)},$.onerror=c,$.send(null)});var l=await fetch(o,{credentials:"same-origin"});if(l.ok)return l.arrayBuffer();throw Error(l.status+" : "+l.url)}}var g,y,_,w,S,x,b=console.log.bind(console),I=console.error.bind(console),k=b,E=I,C=!1,A=o=>o.startsWith("file://");function v(){ut.buffer!=D.buffer&&P()}if(a){let o=function(l){try{var m=l.data,c=m.Uc;if(c==="load"){let $=[];self.onmessage=T=>$.push(T),x=()=>{postMessage({Uc:"loaded"});for(let T of $)o(T);self.onmessage=o};for(let T of m.Ad)t[T]&&!t[T].proxy||(t[T]=(...z)=>{postMessage({Uc:"callHandler",zd:T,args:z})},T=="print"&&(k=t[T]),T=="printErr"&&(E=t[T]));ut=m.Vd,P(),y=m.Wd,at(),Tr()}else if(c==="run"){(function($){var T=(v(),j)[$+52>>>2>>>0];$=(v(),j)[$+56>>>2>>>0],ss(T,T-$),se(T)})(m.Tc),di(m.Tc,0,0,1,0,0),on(),ri(m.Tc),M||(es(),M=!0);try{wf(m.Pd,m.dd)}catch($){if($!="unwind")throw $}}else m.target!=="setimmediate"&&(c==="checkMailbox"?M&&_r():c&&(E(`worker: received unknown command ${c}`),E(m)))}catch($){throw ts(),$}};var M=!1;self.onunhandledrejection=l=>{throw l.reason||l},self.onmessage=o}var D,H,G,Q,R,j,F,X,le,W,me,U=!1;function P(){var o=ut.buffer;t.HEAP8=D=new Int8Array(o),G=new Int16Array(o),t.HEAPU8=H=new Uint8Array(o),Q=new Uint16Array(o),t.HEAP32=R=new Int32Array(o),t.HEAPU32=j=new Uint32Array(o),F=new Float32Array(o),X=new Float64Array(o),le=new BigInt64Array(o),W=new BigUint64Array(o)}function J(){U=!0,a?x():et.tb()}function ee(o){throw E(o="Aborted("+o+")"),C=!0,o=new WebAssembly.RuntimeError(o+". Build with -sASSERTIONS for more info."),S==null||S(o),o}function be(){return{a:{ma:Lm,hb:Wm,g:bf,J:$f,f:vf,o:xf,h:Sf,ha:Tf,b:kf,T:If,Ia:hn,n:Ef,_:yn,Ya:_n,Ea:wn,Ga:bn,Za:$n,Wa:vn,Pa:xn,Va:Sn,ka:Tn,Fa:kn,Ca:In,Xa:En,Da:zn,cb:zf,ea:Cf,xa:Af,va:Rf,da:Nf,O:Mf,H:Df,wa:Uf,Z:Hf,ya:Ff,Sa:jf,Aa:Qf,Ja:Zf,ta:Yf,fa:Xf,Ra:ri,$a:Jf,R:im,s:um,c:ei,ib:lm,y:dm,M:pm,D:cm,m:hm,t:Dn,jb:fm,I:mm,S:gm,j:ym,v:_m,r:wm,l:bm,Ma:$m,Na:vm,Oa:xm,Ka:Wn,La:Ln,ua:Vn,eb:Tm,bb:Im,u:Em,aa:zm,ga:Cm,ab:km,V:Am,_a:Om,Ba:Rm,F:Sm,U:Bm,la:xr,za:Mm,gb:Nm,fb:Dm,Ta:jn,Ua:Kn,Ha:Vt,$:Qn,ja:Zn,Qa:Yn,ia:Xn,lb:Tg,na:_g,mb:Sg,oa:yg,G:ug,d:Fm,q:Gm,w:Vm,B:rg,pb:fg,K:ng,x:Km,pa:mg,X:wg,ba:hg,nb:xg,ob:vg,ra:lg,qa:cg,qb:dg,N:sg,Y:gg,e:jm,A:Qm,k:Hm,kb:kg,p:Ym,z:Xm,C:Zm,E:Jm,L:ig,rb:og,Q:bg,ca:ag,W:$g,sb:tg,sa:eg,P:pg,i:Pm,a:ut,db:Re}}}async function at(){function o(c,$){var T=et=c.exports;c={};for(let[z,B]of Object.entries(T))typeof B=="function"?(T=em(B),c[z]=T):c[z]=B;return et=c,et=(function(){var z=et,B=V=>ne=>V(ne)>>>0,L=V=>()=>V()>>>0;return(z=Object.assign({},z)).ub=B(z.ub),z.Yb=L(z.Yb),z._b=B(z._b),z.mc=B(z.mc),z.nc=L(z.nc),z.rc=B(z.rc),z})(),nn.push(et.$b),Jn=(c=et).ub,es=c.vb,t._OrtInit=c.wb,t._OrtGetLastError=c.xb,t._OrtCreateSessionOptions=c.yb,t._OrtAppendExecutionProvider=c.zb,t._OrtAddFreeDimensionOverride=c.Ab,t._OrtAddSessionConfigEntry=c.Bb,t._OrtReleaseSessionOptions=c.Cb,t._OrtCreateSession=c.Db,t._OrtReleaseSession=c.Eb,t._OrtGetInputOutputCount=c.Fb,t._OrtGetInputOutputMetadata=c.Gb,t._OrtFree=c.Hb,t._OrtCreateTensor=c.Ib,t._OrtGetTensorData=c.Jb,t._OrtReleaseTensor=c.Kb,t._OrtCreateRunOptions=c.Lb,t._OrtAddRunConfigEntry=c.Mb,t._OrtReleaseRunOptions=c.Nb,t._OrtCreateBinding=c.Ob,t._OrtBindInput=c.Pb,t._OrtBindOutput=c.Qb,t._OrtClearBoundOutputs=c.Rb,t._OrtReleaseBinding=c.Sb,t._OrtRunWithBinding=c.Tb,t._OrtRun=c.Ub,t._OrtEndProfiling=c.Vb,t._JsepOutput=c.Wb,t._JsepGetNodeName=c.Xb,Sr=c.Yb,Qe=t._free=c.Zb,Ft=t._malloc=c._b,di=c.bc,ts=c.cc,rs=c.dc,is=c.ec,pi=c.fc,as=c.gc,ns=c.hc,ue=c.ic,jt=c.jc,ss=c.kc,se=c.lc,ci=c.mc,oe=c.nc,os=c.oc,hi=c.pc,us=c.qc,ls=c.rc,ds=c.sc,fi=c.tc,ps=c.uc,cs=c.vc,hs=c.wc,fs=c.xc,ms=c.yc,gs=c.zc,ys=c.Ac,_s=c.Bc,ws=c.Cc,bs=c.Dc,$s=c.Ec,vs=c.Fc,xs=c.Gc,Ss=c.Hc,Ts=c.Ic,ks=c.Jc,Is=c.Kc,Es=c.Lc,zs=c.Mc,Cs=c.Nc,As=c.Oc,Os=c.Pc,Rs=c.Rc,Bs=c.Sc,Ns=c.bd,Ms=c.cd,Ds=c.hd,Us=c.kd,Ps=c.ld,qs=c.md,Ws=c.nd,Ls=c.od,Vs=c.pd,Gs=c.qd,Hs=c.rd,Fs=c.wd,js=c.Rd,Ks=c.Sd,Qs=c.Td,Zs=c.Ud,y=$,et}var l,m=be();return t.instantiateWasm?new Promise(c=>{t.instantiateWasm(m,($,T)=>{c(o($,T))})}):a?o(new WebAssembly.Instance(y,be()),y):(me??(me=t.locateFile?t.locateFile?t.locateFile("ort-wasm-simd-threaded.jsep.wasm",f):f+"ort-wasm-simd-threaded.jsep.wasm":new URL("/FreeTool/assets/ort-wasm-simd-threaded.jsep-C887KxcQ.wasm",import.meta.url).href),l=await(async function(c){var $=me;if(!g&&!A($))try{var T=fetch($,{credentials:"same-origin"});return await WebAssembly.instantiateStreaming(T,c)}catch(z){E(`wasm streaming compile failed: ${z}`),E("falling back to ArrayBuffer instantiation")}return(async function(z,B){try{var L=await(async function(V){if(!g)try{var ne=await u(V);return new Uint8Array(ne)}catch{}if(V==me&&g)V=new Uint8Array(g);else{if(!d)throw"both async and sync fetching of the wasm failed";V=d(V)}return V})(z);return await WebAssembly.instantiate(L,B)}catch(V){E(`failed to asynchronously prepare wasm: ${V}`),ee(V)}})($,c)})(m),o(l.instance,l.module))}class nt{constructor(l){Js(this,"name","ExitStatus");this.message=`Program terminated with exit(${l})`,this.status=l}}var Lt=o=>{o.terminate(),o.onmessage=()=>{}},cr=[],Oe=0,Ce=null,st=o=>{ot.length==0&&(ln(),un(ot[0]));var l=ot.pop();if(!l)return 6;Gt.push(l),yt[o.Tc]=l,l.Tc=o.Tc;var m={Uc:"run",Pd:o.Od,dd:o.dd,Tc:o.Tc};return l.postMessage(m,o.ud),0},_e=0,re=(o,l,...m)=>{var c,$=16*m.length,T=oe(),z=ci($),B=z>>>3;for(c of m)typeof c=="bigint"?((v(),le)[B++>>>0]=1n,(v(),le)[B++>>>0]=c):((v(),le)[B++>>>0]=0n,(v(),X)[B++>>>0]=c);return o=rs(o,0,$,z,l),se(T),o};function Re(o){if(a)return re(0,1,o);if(_=o,!(0<_e)){for(var l of Gt)Lt(l);for(l of ot)Lt(l);ot=[],Gt=[],yt={},C=!0}p(0,new nt(o))}function hr(o){if(a)return re(1,0,o);Vt(o)}var Vt=o=>{if(_=o,a)throw hr(o),"unwind";Re(o)},ot=[],Gt=[],nn=[],yt={},sn=o=>{var l=o.Tc;delete yt[l],ot.push(o),Gt.splice(Gt.indexOf(o),1),o.Tc=0,is(l)};function on(){nn.forEach(o=>o())}var un=o=>new Promise(l=>{o.onmessage=$=>{var T=$.data;if($=T.Uc,T.ad&&T.ad!=Sr()){var z=yt[T.ad];z?z.postMessage(T,T.ud):E(`Internal error! Worker sent a message "${$}" to target pthread ${T.ad}, but that thread no longer exists!`)}else $==="checkMailbox"?_r():$==="spawnThread"?st(T):$==="cleanupThread"?yr(()=>{sn(yt[T.Qd])}):$==="loaded"?(o.loaded=!0,l(o)):T.target==="setimmediate"?o.postMessage(T):$==="uncaughtException"?o.onerror(T.error):$==="callHandler"?t[T.zd](...T.args):$&&E(`worker sent an unknown command ${$}`)},o.onerror=$=>{throw E(`worker sent an error! ${$.filename}:${$.lineno}: ${$.message}`),$};var m,c=[];for(m of[])t.propertyIsEnumerable(m)&&c.push(m);o.postMessage({Uc:"load",Ad:c,Vd:ut,Wd:y})});function ln(){var o=new Worker((()=>{let l=URL;return import.meta.url>"file:"&&import.meta.url<"file;"?new l("ort.bundle.min.mjs",import.meta.url):new URL(import.meta.url)})(),{type:"module",workerData:"em-pthread",name:"em-pthread"});ot.push(o)}var ut,wf=(o,l)=>{_e=0,o=fi(o,l),0<_e?_=o:pi(o)},fr=[],mr=0;function bf(o){var l=new Zr(o>>>=0);return(v(),D)[l.Vc+12>>>0]==0&&(dn(l,!0),mr--),pn(l,!1),fr.push(l),ls(o)}var Bt=0,$f=()=>{ue(0,0);var o=fr.pop();os(o.ed),Bt=0};function dn(o,l){l=l?1:0,(v(),D)[o.Vc+12>>>0]=l}function pn(o,l){l=l?1:0,(v(),D)[o.Vc+13>>>0]=l}class Zr{constructor(l){this.ed=l,this.Vc=l-24}}var Yr=o=>{var l=Bt;if(!l)return jt(0),0;var m=new Zr(l);(v(),j)[m.Vc+16>>>2>>>0]=l;var c=(v(),j)[m.Vc+4>>>2>>>0];if(!c)return jt(0),l;for(var $ of o){if($===0||$===c)break;if(us($,c,m.Vc+16))return jt($),l}return jt(c),l};function vf(){return Yr([])}function xf(o){return Yr([o>>>0])}function Sf(o,l,m,c){return Yr([o>>>0,l>>>0,m>>>0,c>>>0])}var Tf=()=>{var o=fr.pop();o||ee("no exception to throw");var l=o.ed;throw(v(),D)[o.Vc+13>>>0]==0&&(fr.push(o),pn(o,!0),dn(o,!1),mr++),hi(l),Bt=l};function kf(o,l,m){var c=new Zr(o>>>=0);throw l>>>=0,m>>>=0,(v(),j)[c.Vc+16>>>2>>>0]=0,(v(),j)[c.Vc+4>>>2>>>0]=l,(v(),j)[c.Vc+8>>>2>>>0]=m,hi(o),mr++,Bt=o}var If=()=>mr;function cn(o,l,m,c){return a?re(2,1,o,l,m,c):hn(o,l,m,c)}function hn(o,l,m,c){if(o>>>=0,l>>>=0,m>>>=0,c>>>=0,!globalThis.SharedArrayBuffer)return 6;var $=[];return a&&$.length===0?cn(o,l,m,c):(o={Od:m,Tc:o,dd:c,ud:$},a?(o.Uc="spawnThread",postMessage(o,$),0):st(o))}function Ef(o){throw Bt||(Bt=o>>>0),Bt}var fn=globalThis.TextDecoder&&new TextDecoder,mn=(o,l,m,c)=>{if(m=l+m,c)return m;for(;o[l]&&!(l>=m);)++l;return l},gn=(o,l=0,m,c)=>{if(16<(m=mn(o,l>>>=0,m,c))-l&&o.buffer&&fn)return fn.decode(o.buffer instanceof ArrayBuffer?o.subarray(l,m):o.slice(l,m));for(c="";l<m;){var $=o[l++];if(128&$){var T=63&o[l++];if((224&$)==192)c+=String.fromCharCode((31&$)<<6|T);else{var z=63&o[l++];65536>($=(240&$)==224?(15&$)<<12|T<<6|z:(7&$)<<18|T<<12|z<<6|63&o[l++])?c+=String.fromCharCode($):($-=65536,c+=String.fromCharCode(55296|$>>10,56320|1023&$))}}else c+=String.fromCharCode($)}return c},Se=(o,l,m)=>(o>>>=0)?gn((v(),H),o,l,m):"";function yn(o,l,m){return a?re(3,1,o,l,m):0}function _n(o,l){if(a)return re(4,1,o,l)}function wn(o,l){if(a)return re(5,1,o,l)}function bn(o,l,m){if(a)return re(6,1,o,l,m)}function $n(o,l,m){return a?re(7,1,o,l,m):0}function vn(o,l){if(a)return re(8,1,o,l)}function xn(o,l,m){if(a)return re(9,1,o,l,m)}function Sn(o,l,m,c){if(a)return re(10,1,o,l,m,c)}function Tn(o,l,m,c){if(a)return re(11,1,o,l,m,c)}function kn(o,l,m,c){if(a)return re(12,1,o,l,m,c)}function In(o){if(a)return re(13,1,o)}function En(o,l){if(a)return re(14,1,o,l)}function zn(o,l,m){if(a)return re(15,1,o,l,m)}var zf=()=>ee(""),je=o=>{o>>>=0;for(var l="";;){var m=(v(),H)[o++>>>0];if(!m)return l;l+=String.fromCharCode(m)}},Xr={},Jr={},Nt=class extends Error{constructor(o){super(o),this.name="BindingError"}};function Je(o,l,m={}){return(function(c,$,T={}){var z=$.name;if(!c)throw new Nt(`type "${z}" must have a positive integer typeid pointer`);if(Jr.hasOwnProperty(c)){if(T.Bd)return;throw new Nt(`Cannot register type '${z}' twice`)}Jr[c]=$,Xr.hasOwnProperty(c)&&($=Xr[c],delete Xr[c],$.forEach(B=>B()))})(o,l,m)}var Cn=(o,l,m)=>{switch(l){case 1:return m?c=>(v(),D)[c>>>0]:c=>(v(),H)[c>>>0];case 2:return m?c=>(v(),G)[c>>>1>>>0]:c=>(v(),Q)[c>>>1>>>0];case 4:return m?c=>(v(),R)[c>>>2>>>0]:c=>(v(),j)[c>>>2>>>0];case 8:return m?c=>(v(),le)[c>>>3>>>0]:c=>(v(),W)[c>>>3>>>0];default:throw new TypeError(`invalid integer width (${l}): ${o}`)}};function Cf(o,l,m,c,$){o>>>=0,m>>>=0,l=je(l>>>0);let T=z=>z;if(c=c===0n){let z=8*m;T=B=>BigInt.asUintN(z,B),$=T($)}Je(o,{name:l,Qc:T,Xc:(z,B)=>(typeof B=="number"&&(B=BigInt(B)),B),Wc:Cn(l,m,!c),Yc:null})}function Af(o,l,m,c){Je(o>>>=0,{name:l=je(l>>>0),Qc:function($){return!!$},Xc:function($,T){return T?m:c},Wc:function($){return this.Qc((v(),H)[$>>>0])},Yc:null})}var An=[],_t=[0,1,,1,null,1,!0,1,!1,1];function ei(o){9<(o>>>=0)&&--_t[o+1]==0&&(_t[o]=void 0,An.push(o))}var De=o=>{if(!o)throw new Nt(`Cannot use deleted val. handle = ${o}`);return _t[o]},Pe=o=>{switch(o){case void 0:return 2;case null:return 4;case!0:return 6;case!1:return 8;default:let l=An.pop()||_t.length;return _t[l]=o,_t[l+1]=1,l}};function ti(o){return this.Qc((v(),j)[o>>>2>>>0])}var Of={name:"emscripten::val",Qc:o=>{var l=De(o);return ei(o),l},Xc:(o,l)=>Pe(l),Wc:ti,Yc:null};function Rf(o){return Je(o>>>0,Of)}var Bf=(o,l)=>{switch(l){case 4:return function(m){return this.Qc((v(),F)[m>>>2>>>0])};case 8:return function(m){return this.Qc((v(),X)[m>>>3>>>0])};default:throw new TypeError(`invalid float width (${l}): ${o}`)}};function Nf(o,l,m){m>>>=0,Je(o>>>=0,{name:l=je(l>>>0),Qc:c=>c,Xc:(c,$)=>$,Wc:Bf(l,m),Yc:null})}function Mf(o,l,m,c,$){o>>>=0,m>>>=0,l=je(l>>>0);let T=B=>B;if(c===0){var z=32-8*m;T=B=>B<<z>>>z,$=T($)}Je(o,{name:l,Qc:T,Xc:(B,L)=>L,Wc:Cn(l,m,c!==0),Yc:null})}function Df(o,l,m){function c(T){var z=(v(),j)[T>>>2>>>0];return T=(v(),j)[T+4>>>2>>>0],new $((v(),D).buffer,T,z)}var $=[Int8Array,Uint8Array,Int16Array,Uint16Array,Int32Array,Uint32Array,Float32Array,Float64Array,BigInt64Array,BigUint64Array][l];Je(o>>>=0,{name:m=je(m>>>0),Qc:c,Wc:c},{Bd:!0})}var lt=(o,l,m)=>{var c=(v(),H);if(l>>>=0,0<m){var $=l;m=l+m-1;for(var T=0;T<o.length;++T){var z=o.codePointAt(T);if(127>=z){if(l>=m)break;c[l++>>>0]=z}else if(2047>=z){if(l+1>=m)break;c[l++>>>0]=192|z>>6,c[l++>>>0]=128|63&z}else if(65535>=z){if(l+2>=m)break;c[l++>>>0]=224|z>>12,c[l++>>>0]=128|z>>6&63,c[l++>>>0]=128|63&z}else{if(l+3>=m)break;c[l++>>>0]=240|z>>18,c[l++>>>0]=128|z>>12&63,c[l++>>>0]=128|z>>6&63,c[l++>>>0]=128|63&z,T++}}c[l>>>0]=0,o=l-$}else o=0;return o},gr=o=>{for(var l=0,m=0;m<o.length;++m){var c=o.charCodeAt(m);127>=c?l++:2047>=c?l+=2:55296<=c&&57343>=c?(l+=4,++m):l+=3}return l};function Uf(o,l){Je(o>>>=0,{name:l=je(l>>>0),Qc(m){var c=(v(),j)[m>>>2>>>0];return c=Se(m+4,c,!0),Qe(m),c},Xc(m,c){c instanceof ArrayBuffer&&(c=new Uint8Array(c));var $=typeof c=="string";if(!($||ArrayBuffer.isView(c)&&c.BYTES_PER_ELEMENT==1))throw new Nt("Cannot pass non-string to std::string");var T=$?gr(c):c.length,z=Ft(4+T+1),B=z+4;return(v(),j)[z>>>2>>>0]=T,$?lt(c,B,T+1):(v(),H).set(c,B>>>0),m!==null&&m.push(Qe,z),z},Wc:ti,Yc(m){Qe(m)}})}var On=globalThis.TextDecoder?new TextDecoder("utf-16le"):void 0,Pf=(o,l,m)=>{if(o>>>=1,16<(l=mn((v(),Q),o,l/2,m))-o&&On)return On.decode((v(),Q).slice(o,l));for(m="";o<l;++o){var c=(v(),Q)[o>>>0];m+=String.fromCharCode(c)}return m},qf=(o,l,m)=>{if(m??(m=2147483647),2>m)return 0;var c=l;m=(m-=2)<2*o.length?m/2:o.length;for(var $=0;$<m;++$){var T=o.charCodeAt($);(v(),G)[l>>>1>>>0]=T,l+=2}return(v(),G)[l>>>1>>>0]=0,l-c},Wf=o=>2*o.length,Lf=(o,l,m)=>{var c="";o>>>=2;for(var $=0;!($>=l/4);$++){var T=(v(),j)[o+$>>>0];if(!T&&!m)break;c+=String.fromCodePoint(T)}return c},Vf=(o,l,m)=>{if(l>>>=0,m??(m=2147483647),4>m)return 0;var c=l;m=c+m-4;for(var $=0;$<o.length;++$){var T=o.codePointAt($);if(65535<T&&$++,(v(),R)[l>>>2>>>0]=T,(l+=4)+4>m)break}return(v(),R)[l>>>2>>>0]=0,l-c},Gf=o=>{for(var l=0,m=0;m<o.length;++m)65535<o.codePointAt(m)&&m++,l+=4;return l};function Hf(o,l,m){if(o>>>=0,l>>>=0,m=je(m>>>=0),l===2)var c=Pf,$=qf,T=Wf;else c=Lf,$=Vf,T=Gf;Je(o,{name:m,Qc:z=>{var B=(v(),j)[z>>>2>>>0];return B=c(z+4,B*l,!0),Qe(z),B},Xc:(z,B)=>{if(typeof B!="string")throw new Nt(`Cannot pass non-string to C++ string type ${m}`);var L=T(B),V=Ft(4+L+l);return(v(),j)[V>>>2>>>0]=L/l,$(B,V+4,L+l),z!==null&&z.push(Qe,V),V},Wc:ti,Yc(z){Qe(z)}})}function Ff(o,l){Je(o>>>=0,{Cd:!0,name:l=je(l>>>0),Qc:()=>{},Xc:()=>{}})}function jf(o){di(o>>>0,!i,1,!r,131072,!1),on()}var yr=o=>{if(!C)try{if(o(),!(0<_e))try{a?Sr()&&pi(_):Vt(_)}catch(l){l instanceof nt||l=="unwind"||p(0,l)}}catch(l){l instanceof nt||l=="unwind"||p(0,l)}},Kf=!Atomics.waitAsync||((Xs=globalThis.navigator)==null?void 0:Xs.userAgent)&&91>Number((navigator.userAgent.match(/Chrom(e|ium)\/([0-9]+)\./)||[])[2]);function ri(o){o>>>=0,Kf||(Atomics.waitAsync((v(),R),o>>>2,o).value.then(_r),o+=128,Atomics.store((v(),R),o>>>2,1))}var _r=()=>yr(()=>{var o=Sr();o&&(ri(o),ns())});function Qf(o,l){(o>>>=0)==l>>>0?setTimeout(_r):a?postMessage({ad:o,Uc:"checkMailbox"}):(o=yt[o])&&o.postMessage({Uc:"checkMailbox"})}var ii=[];function Zf(o,l,m,c,$){for(l>>>=0,$>>>=0,ii.length=0,m=$>>>3,c=$+c>>>3;m<c;){var T;T=(v(),le)[m++>>>0]?(v(),le)[m++>>>0]:(v(),X)[m++>>>0],ii.push(T)}return(l?mi[l]:qm[o])(...ii)}var Yf=()=>{_e=0};function Xf(o){o>>>=0,a?postMessage({Uc:"cleanupThread",Qd:o}):sn(yt[o])}function Jf(o){}var wr=o=>{try{o()}catch(l){ee(l)}};function em(o){var l=(...m)=>{br.push(o);try{return o(...m)}finally{C||(br.pop(),Ke&&dt===1&&br.length===0&&(dt=0,_e+=1,wr(Ks),typeof Fibers<"u"&&Fibers.ce()))}};return Nn.set(o,l),l}var dt=0,Ke=null,Rn=0,br=[],ai=new Map,Bn=new Map,Nn=new Map,tm=0,ni=null,rm=[],Mn=o=>(function(l){if(!C){if(dt===0){var m=!1,c=!1;l(($=0)=>{if(!C&&(Rn=$,m=!0,c)){dt=2,wr(()=>Qs(Ke)),typeof MainLoop<"u"&&MainLoop.yd&&MainLoop.resume(),$=!1;try{var T=(function(){var L=(v(),R)[Ke+8>>>2>>>0];return L=Bn.get(L),L=Nn.get(L),--_e,L()})()}catch(L){T=L,$=!0}var z=!1;if(!Ke){var B=ni;B&&(ni=null,($?B.reject:B.resolve)(T),z=!0)}if($&&!z)throw T}}),c=!0,m||(dt=1,Ke=(function(){var $=Ft(65548),T=$+12;if((v(),j)[$>>>2>>>0]=T,(v(),j)[$+4>>>2>>>0]=T+65536,T=br[0],!ai.has(T)){var z=tm++;ai.set(T,z),Bn.set(z,T)}return T=ai.get(T),(v(),R)[$+8>>>2>>>0]=T,$})(),typeof MainLoop<"u"&&MainLoop.yd&&MainLoop.pause(),wr(()=>js(Ke)))}else dt===2?(dt=0,wr(Zs),Qe(Ke),Ke=null,rm.forEach(yr)):ee(`invalid state: ${dt}`);return Rn}})(l=>{o().then(l)});function im(o){return o>>>=0,Mn(async()=>{var l=await De(o);return Pe(l)})}var si=[],am=o=>{var l=si.length;return si.push(o),l},nm=(o,l)=>{for(var m=Array(o),c=0;c<o;++c){var $=c,T=(v(),j)[l+4*c>>>2>>>0],z=Jr[T];if(z===void 0)throw o=`parameter ${c}`,T=Jn(T),l=je(T),Qe(T),new Nt(`${o} has unknown type ${l}`);m[$]=z}return m},sm=(o,l,m)=>{var c=[];return o=o(c,m),c.length&&((v(),j)[l>>>2>>>0]=Pe(c)),o},om={},$r=o=>{var l=om[o];return l===void 0?je(o):l};function um(o,l,m){var[c,...$]=nm(o,l>>>0);l=c.Xc.bind(c);var T=$.map(L=>L.Wc.bind(L));o--;var z={toValue:De};switch(o=T.map((L,V)=>{var ne=`argFromPtr${V}`;return z[ne]=L,`${ne}(args${V?"+"+8*V:""})`}),m){case 0:var B="toValue(handle)";break;case 2:B="new (toValue(handle))";break;case 3:B="";break;case 1:z.getStringOrSymbol=$r,B="toValue(handle)[getStringOrSymbol(methodName)]"}return B+=`(${o})`,c.Cd||(z.toReturnWire=l,z.emval_returnValue=sm,B=`return emval_returnValue(toReturnWire, destructorsRef, ${B})`),B=`return function (handle, methodName, destructorsRef, args) {
  ${B}
  }`,m=new Function(Object.keys(z),B)(...Object.values(z)),B=`methodCaller<(${$.map(L=>L.name)}) => ${c.name}>`,am(Object.defineProperty(m,"name",{value:B}))}function lm(o,l){return l>>>=0,(o=De(o>>>0))==De(l)}function dm(o){return(o>>>=0)?(o=$r(o),Pe(globalThis[o])):Pe(globalThis)}function pm(o){return o=$r(o>>>0),Pe(t[o])}function cm(o,l){return l>>>=0,o=De(o>>>0),l=De(l),Pe(o[l])}function hm(o){9<(o>>>=0)&&(_t[o+1]+=1)}function Dn(o,l,m,c,$){return si[o>>>0](l>>>0,m>>>0,c>>>0,$>>>0)}function fm(o,l,m,c,$){return Dn(o>>>0,l>>>0,m>>>0,c>>>0,$>>>0)}function mm(){return Pe([])}function gm(o){o=De(o>>>0);for(var l=Array(o.length),m=0;m<o.length;m++)l[m]=o[m];return Pe(l)}function ym(o){return Pe($r(o>>>0))}function _m(){return Pe({})}function wm(o){for(var l=De(o>>>=0);l.length;){var m=l.pop();l.pop()(m)}ei(o)}function bm(o,l,m){l>>>=0,m>>>=0,o=De(o>>>0),l=De(l),m=De(m),o[l]=m}function $m(o,l){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),l>>>=0,o=new Date(1e3*o),(v(),R)[l>>>2>>>0]=o.getUTCSeconds(),(v(),R)[l+4>>>2>>>0]=o.getUTCMinutes(),(v(),R)[l+8>>>2>>>0]=o.getUTCHours(),(v(),R)[l+12>>>2>>>0]=o.getUTCDate(),(v(),R)[l+16>>>2>>>0]=o.getUTCMonth(),(v(),R)[l+20>>>2>>>0]=o.getUTCFullYear()-1900,(v(),R)[l+24>>>2>>>0]=o.getUTCDay(),o=(o.getTime()-Date.UTC(o.getUTCFullYear(),0,1,0,0,0,0))/864e5|0,(v(),R)[l+28>>>2>>>0]=o}var Un=o=>o%4==0&&(o%100!=0||o%400==0),Pn=[0,31,60,91,121,152,182,213,244,274,305,335],qn=[0,31,59,90,120,151,181,212,243,273,304,334];function vm(o,l){o=-9007199254740992>o||9007199254740992<o?NaN:Number(o),l>>>=0,o=new Date(1e3*o),(v(),R)[l>>>2>>>0]=o.getSeconds(),(v(),R)[l+4>>>2>>>0]=o.getMinutes(),(v(),R)[l+8>>>2>>>0]=o.getHours(),(v(),R)[l+12>>>2>>>0]=o.getDate(),(v(),R)[l+16>>>2>>>0]=o.getMonth(),(v(),R)[l+20>>>2>>>0]=o.getFullYear()-1900,(v(),R)[l+24>>>2>>>0]=o.getDay();var m=(Un(o.getFullYear())?Pn:qn)[o.getMonth()]+o.getDate()-1|0;(v(),R)[l+28>>>2>>>0]=m,(v(),R)[l+36>>>2>>>0]=-60*o.getTimezoneOffset(),m=new Date(o.getFullYear(),6,1).getTimezoneOffset();var c=new Date(o.getFullYear(),0,1).getTimezoneOffset();o=0|(m!=c&&o.getTimezoneOffset()==Math.min(c,m)),(v(),R)[l+32>>>2>>>0]=o}function xm(o){o>>>=0;var l=new Date((v(),R)[o+20>>>2>>>0]+1900,(v(),R)[o+16>>>2>>>0],(v(),R)[o+12>>>2>>>0],(v(),R)[o+8>>>2>>>0],(v(),R)[o+4>>>2>>>0],(v(),R)[o>>>2>>>0],0),m=(v(),R)[o+32>>>2>>>0],c=l.getTimezoneOffset(),$=new Date(l.getFullYear(),6,1).getTimezoneOffset(),T=new Date(l.getFullYear(),0,1).getTimezoneOffset(),z=Math.min(T,$);return 0>m?(v(),R)[o+32>>>2>>>0]=+($!=T&&z==c):0<m!=(z==c)&&($=Math.max(T,$),l.setTime(l.getTime()+6e4*((0<m?z:$)-c))),(v(),R)[o+24>>>2>>>0]=l.getDay(),m=(Un(l.getFullYear())?Pn:qn)[l.getMonth()]+l.getDate()-1|0,(v(),R)[o+28>>>2>>>0]=m,(v(),R)[o>>>2>>>0]=l.getSeconds(),(v(),R)[o+4>>>2>>>0]=l.getMinutes(),(v(),R)[o+8>>>2>>>0]=l.getHours(),(v(),R)[o+12>>>2>>>0]=l.getDate(),(v(),R)[o+16>>>2>>>0]=l.getMonth(),(v(),R)[o+20>>>2>>>0]=l.getYear(),o=l.getTime(),BigInt(isNaN(o)?-1:o/1e3)}function Wn(o,l,m,c,$,T,z){return a?re(16,1,o,l,m,c,$,T,z):-52}function Ln(o,l,m,c,$,T){if(a)return re(17,1,o,l,m,c,$,T)}var Ht={},Sm=()=>performance.timeOrigin+performance.now();function Vn(o,l){if(a)return re(18,1,o,l);if(Ht[o]&&(clearTimeout(Ht[o].id),delete Ht[o]),!l)return 0;var m=setTimeout(()=>{delete Ht[o],yr(()=>as(o,performance.timeOrigin+performance.now()))},l);return Ht[o]={id:m,be:l},0}function Tm(o,l,m,c){o>>>=0,l>>>=0,m>>>=0,c>>>=0;var $=new Date().getFullYear(),T=new Date($,0,1).getTimezoneOffset();$=new Date($,6,1).getTimezoneOffset();var z=Math.max(T,$);(v(),j)[o>>>2>>>0]=60*z,(v(),R)[l>>>2>>>0]=+(T!=$),o=(l=B=>{var L=Math.abs(B);return`UTC${0<=B?"-":"+"}${String(Math.floor(L/60)).padStart(2,"0")}${String(L%60).padStart(2,"0")}`})(T),l=l($),$<T?(lt(o,m,17),lt(l,c,17)):(lt(o,c,17),lt(l,m,17))}var km=()=>Date.now();function Im(o,l,m){return m>>>=0,0<=o&&3>=o?(o===0?o=Date.now():o=performance.timeOrigin+performance.now(),o=Math.round(1e6*o),(v(),le)[m>>>3>>>0]=BigInt(o),0):28}var oi=[],Gn=(o,l)=>{oi.length=0;for(var m;m=(v(),H)[o++>>>0];){var c=m!=105;l+=(c&=m!=112)&&l%8?4:0,oi.push(m==112?(v(),j)[l>>>2>>>0]:m==106?(v(),le)[l>>>3>>>0]:m==105?(v(),R)[l>>>2>>>0]:(v(),X)[l>>>3>>>0]),l+=c?8:4}return oi};function Em(o,l,m){return o>>>=0,l=Gn(l>>>0,m>>>0),mi[o](...l)}function zm(o,l,m){return o>>>=0,l=Gn(l>>>0,m>>>0),mi[o](...l)}var Cm=()=>{};function Am(o,l){return E(Se(o>>>0,l>>>0))}var Om=()=>{throw _e+=1,"unwind"};function Rm(){return 4294901760}var Bm=()=>navigator.hardwareConcurrency,wt={},vr=o=>{var l;return(l=/\bwasm-function\[\d+\]:(0x[0-9a-f]+)/.exec(o))?+l[1]:(l=/:(\d+):\d+(?:\)|$)/.exec(o))?2147483648|+l[1]:0},Hn=o=>{for(var l of o)(o=vr(l))&&(wt[o]=l)};function Nm(){var o=Error().stack.toString().split(`
`);return o[0]=="Error"&&o.shift(),Hn(o),wt.sd=vr(o[3]),wt.Md=o,wt.sd}function xr(o){if(!(o=wt[o>>>0]))return 0;var l;if(l=/^\s+at .*\.wasm\.(.*) \(.*\)$/.exec(o))o=l[1];else if(l=/^\s+at (.*) \(.*\)$/.exec(o))o=l[1];else{if(!(l=/^(.+?)@/.exec(o)))return 0;o=l[1]}Qe(xr.td??0),l=gr(o)+1;var m=Ft(l);return m&&lt(o,m,l),xr.td=m,xr.td}function Mm(o){o>>>=0;var l=(v(),H).length;if(o<=l||4294901760<o)return!1;for(var m=1;4>=m;m*=2){var c=l*(1+.2/m);c=Math.min(c,o+100663296);e:{c=(Math.min(4294901760,65536*Math.ceil(Math.max(o,c)/65536))-ut.buffer.byteLength+65535)/65536|0;try{ut.grow(c),P();var $=1;break e}catch{}$=void 0}if($)return!0}return!1}function Dm(o,l,m){if(o>>>=0,l>>>=0,wt.sd==o)var c=wt.Md;else(c=Error().stack.toString().split(`
`))[0]=="Error"&&c.shift(),Hn(c);for(var $=3;c[$]&&vr(c[$])!=o;)++$;for(o=0;o<m&&c[o+$];++o)(v(),R)[l+4*o>>>2>>>0]=vr(c[o+$]);return o}var ui,li={},Fn=()=>{var c;if(!ui){var o,l={USER:"web_user",LOGNAME:"web_user",PATH:"/",PWD:"/",HOME:"/home/web_user",LANG:(((c=globalThis.navigator)==null?void 0:c.language)??"C").replace("-","_")+".UTF-8",_:"./this.program"};for(o in li)li[o]===void 0?delete l[o]:l[o]=li[o];var m=[];for(o in l)m.push(`${o}=${l[o]}`);ui=m}return ui};function jn(o,l){if(a)return re(19,1,o,l);o>>>=0,l>>>=0;var m,c=0,$=0;for(m of Fn()){var T=l+c;(v(),j)[o+$>>>2>>>0]=T,c+=lt(m,T,1/0)+1,$+=4}return 0}function Kn(o,l){if(a)return re(20,1,o,l);o>>>=0,l>>>=0;var m=Fn();for(var c of((v(),j)[o>>>2>>>0]=m.length,o=0,m))o+=gr(c)+1;return(v(),j)[l>>>2>>>0]=o,0}function Qn(o){return a?re(21,1,o):52}function Zn(o,l,m,c){return a?re(22,1,o,l,m,c):52}function Yn(o,l,m,c){return a?re(23,1,o,l,m,c):70}var Um=[null,[],[]];function Xn(o,l,m,c){if(a)return re(24,1,o,l,m,c);l>>>=0,m>>>=0,c>>>=0;for(var $=0,T=0;T<m;T++){var z=(v(),j)[l>>>2>>>0],B=(v(),j)[l+4>>>2>>>0];l+=8;for(var L=0;L<B;L++){var V=o,ne=(v(),H)[z+L>>>0],pe=Um[V];ne===0||ne===10?((V===1?k:E)(gn(pe)),pe.length=0):pe.push(ne)}$+=B}return(v(),j)[c>>>2>>>0]=$,0}function Pm(o){return o>>>0}a||(function(){for(var o=t.numThreads-1;o--;)ln();cr.push(async()=>{var l=(async function(){if(!a)return Promise.all(ot.map(un))})();Oe++,await l,--Oe==0&&Ce&&(l=Ce,Ce=null,l())})})(),a||(ut=new WebAssembly.Memory({initial:256,maximum:65536,shared:!0}),P()),t.wasmBinary&&(g=t.wasmBinary),t.stackSave=()=>oe(),t.stackRestore=o=>se(o),t.stackAlloc=o=>ci(o),t.setValue=function(o,l,m="i8"){switch(m.endsWith("*")&&(m="*"),m){case"i1":case"i8":(v(),D)[o>>>0]=l;break;case"i16":(v(),G)[o>>>1>>>0]=l;break;case"i32":(v(),R)[o>>>2>>>0]=l;break;case"i64":(v(),le)[o>>>3>>>0]=BigInt(l);break;case"float":(v(),F)[o>>>2>>>0]=l;break;case"double":(v(),X)[o>>>3>>>0]=l;break;case"*":(v(),j)[o>>>2>>>0]=l;break;default:ee(`invalid type for setValue: ${m}`)}},t.getValue=function(o,l="i8"){switch(l.endsWith("*")&&(l="*"),l){case"i1":case"i8":return(v(),D)[o>>>0];case"i16":return(v(),G)[o>>>1>>>0];case"i32":return(v(),R)[o>>>2>>>0];case"i64":return(v(),le)[o>>>3>>>0];case"float":return(v(),F)[o>>>2>>>0];case"double":return(v(),X)[o>>>3>>>0];case"*":return(v(),j)[o>>>2>>>0];default:ee(`invalid type for getValue: ${l}`)}},t.UTF8ToString=Se,t.stringToUTF8=lt,t.lengthBytesUTF8=gr;var Jn,es,Sr,Qe,Ft,di,ts,rs,is,pi,as,ns,ue,jt,ss,se,ci,oe,os,hi,us,ls,ds,fi,ps,cs,hs,fs,ms,gs,ys,_s,ws,bs,$s,vs,xs,Ss,Ts,ks,Is,Es,zs,Cs,As,Os,Rs,Bs,Ns,Ms,Ds,Us,Ps,qs,Ws,Ls,Vs,Gs,Hs,Fs,js,Ks,Qs,Zs,et,qm=[Re,hr,cn,yn,_n,wn,bn,$n,vn,xn,Sn,Tn,kn,In,En,zn,Wn,Ln,Vn,jn,Kn,Qn,Zn,Yn,Xn],mi={929356:(o,l,m,c,$)=>{if(t===void 0||!t.Zc)return 1;if((o=Se(Number(o>>>0))).startsWith("./")&&(o=o.substring(2)),!(o=t.Zc.get(o)))return 2;if(l=Number(l>>>0),m=Number(m>>>0),c=Number(c>>>0),l+m>o.byteLength)return 3;try{let T=o.subarray(l,l+m);switch($){case 0:(v(),H).set(T,c>>>0);break;case 1:t.Xd?t.Xd(c,T):t.Ld(c,T);break;default:return 4}return 0}catch{return 4}},930180:(o,l,m)=>{t.xd(o,(v(),H).subarray(l>>>0,l+m>>>0))},930244:()=>t.Zd(),930286:o=>{t.vd(o)},930323:()=>{t.Ed()},930354:()=>{t.Fd()},930383:()=>{t.Jd()},930408:o=>t.Dd(o),930441:o=>t.Hd(o),930473:(o,l,m)=>{t.jd(Number(o),Number(l),Number(m),!0)},930536:(o,l,m)=>{t.jd(Number(o),Number(l),Number(m))},930593:()=>typeof wasmOffsetConverter<"u",930650:o=>{t.ac("Abs",o,void 0)},930701:o=>{t.ac("Neg",o,void 0)},930752:o=>{t.ac("Floor",o,void 0)},930805:o=>{t.ac("Ceil",o,void 0)},930857:o=>{t.ac("Reciprocal",o,void 0)},930915:o=>{t.ac("Sqrt",o,void 0)},930967:o=>{t.ac("Exp",o,void 0)},931018:o=>{t.ac("Erf",o,void 0)},931069:o=>{t.ac("Sigmoid",o,void 0)},931124:(o,l,m)=>{t.ac("HardSigmoid",o,{alpha:l,beta:m})},931203:o=>{t.ac("Log",o,void 0)},931254:o=>{t.ac("Sin",o,void 0)},931305:o=>{t.ac("Cos",o,void 0)},931356:o=>{t.ac("Tan",o,void 0)},931407:o=>{t.ac("Asin",o,void 0)},931459:o=>{t.ac("Acos",o,void 0)},931511:o=>{t.ac("Atan",o,void 0)},931563:o=>{t.ac("Sinh",o,void 0)},931615:o=>{t.ac("Cosh",o,void 0)},931667:o=>{t.ac("Asinh",o,void 0)},931720:o=>{t.ac("Acosh",o,void 0)},931773:o=>{t.ac("Atanh",o,void 0)},931826:o=>{t.ac("Tanh",o,void 0)},931878:o=>{t.ac("Not",o,void 0)},931929:(o,l,m)=>{t.ac("Clip",o,{min:l,max:m})},931998:o=>{t.ac("Clip",o,void 0)},932050:(o,l)=>{t.ac("Elu",o,{alpha:l})},932108:o=>{t.ac("Gelu",o,void 0)},932160:o=>{t.ac("Relu",o,void 0)},932212:(o,l)=>{t.ac("LeakyRelu",o,{alpha:l})},932276:(o,l)=>{t.ac("ThresholdedRelu",o,{alpha:l})},932346:(o,l)=>{t.ac("Cast",o,{to:l})},932404:o=>{t.ac("Add",o,void 0)},932455:o=>{t.ac("Sub",o,void 0)},932506:o=>{t.ac("Mul",o,void 0)},932557:o=>{t.ac("Div",o,void 0)},932608:o=>{t.ac("Pow",o,void 0)},932659:o=>{t.ac("Equal",o,void 0)},932712:o=>{t.ac("Greater",o,void 0)},932767:o=>{t.ac("GreaterOrEqual",o,void 0)},932829:o=>{t.ac("Less",o,void 0)},932881:o=>{t.ac("LessOrEqual",o,void 0)},932940:(o,l,m,c,$)=>{t.ac("ReduceMean",o,{keepDims:!!l,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},933115:(o,l,m,c,$)=>{t.ac("ReduceMax",o,{keepDims:!!l,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},933289:(o,l,m,c,$)=>{t.ac("ReduceMin",o,{keepDims:!!l,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},933463:(o,l,m,c,$)=>{t.ac("ReduceProd",o,{keepDims:!!l,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},933638:(o,l,m,c,$)=>{t.ac("ReduceSum",o,{keepDims:!!l,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},933812:(o,l,m,c,$)=>{t.ac("ReduceL1",o,{keepDims:!!l,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},933985:(o,l,m,c,$)=>{t.ac("ReduceL2",o,{keepDims:!!l,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},934158:(o,l,m,c,$)=>{t.ac("ReduceLogSum",o,{keepDims:!!l,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},934335:(o,l,m,c,$)=>{t.ac("ReduceSumSquare",o,{keepDims:!!l,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},934515:(o,l,m,c,$)=>{t.ac("ReduceLogSumExp",o,{keepDims:!!l,noopWithEmptyAxes:!!m,axes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},934695:o=>{t.ac("Where",o,void 0)},934748:(o,l,m)=>{t.ac("Transpose",o,{perm:l?Array.from((v(),R).subarray(Number(l)>>>0,Number(m)>>>0)):[]})},934872:(o,l,m,c)=>{t.ac("DepthToSpace",o,{blocksize:l,mode:Se(m),format:c?"NHWC":"NCHW"})},935005:(o,l,m,c)=>{t.ac("DepthToSpace",o,{blocksize:l,mode:Se(m),format:c?"NHWC":"NCHW"})},935138:(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we,pt)=>{t.ac("ConvTranspose",o,{format:L?"NHWC":"NCHW",autoPad:l,dilations:[m],group:c,kernelShape:[$],pads:[T,z],strides:[B],wIsConst:()=>!!(v(),D)[V>>>0],outputPadding:ne?Array.from((v(),R).subarray(Number(ne)>>>0,Number(pe)>>>0)):[],outputShape:ge?Array.from((v(),R).subarray(Number(ge)>>>0,Number(we)>>>0)):[],activation:Se(pt)})},935571:(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we)=>{t.ac("ConvTranspose",o,{format:B?"NHWC":"NCHW",autoPad:l,dilations:Array.from((v(),R).subarray(Number(m)>>>0,2+(Number(m)>>>0)>>>0)),group:c,kernelShape:Array.from((v(),R).subarray(Number($)>>>0,2+(Number($)>>>0)>>>0)),pads:Array.from((v(),R).subarray(Number(T)>>>0,4+(Number(T)>>>0)>>>0)),strides:Array.from((v(),R).subarray(Number(z)>>>0,2+(Number(z)>>>0)>>>0)),wIsConst:()=>!!(v(),D)[L>>>0],outputPadding:V?Array.from((v(),R).subarray(Number(V)>>>0,Number(ne)>>>0)):[],outputShape:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ge)>>>0)):[],activation:Se(we)})},936232:(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we,pt)=>{t.ac("ConvTranspose",o,{format:L?"NHWC":"NCHW",autoPad:l,dilations:[m],group:c,kernelShape:[$],pads:[T,z],strides:[B],wIsConst:()=>!!(v(),D)[V>>>0],outputPadding:ne?Array.from((v(),R).subarray(Number(ne)>>>0,Number(pe)>>>0)):[],outputShape:ge?Array.from((v(),R).subarray(Number(ge)>>>0,Number(we)>>>0)):[],activation:Se(pt)})},936665:(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we)=>{t.ac("ConvTranspose",o,{format:B?"NHWC":"NCHW",autoPad:l,dilations:Array.from((v(),R).subarray(Number(m)>>>0,2+(Number(m)>>>0)>>>0)),group:c,kernelShape:Array.from((v(),R).subarray(Number($)>>>0,2+(Number($)>>>0)>>>0)),pads:Array.from((v(),R).subarray(Number(T)>>>0,4+(Number(T)>>>0)>>>0)),strides:Array.from((v(),R).subarray(Number(z)>>>0,2+(Number(z)>>>0)>>>0)),wIsConst:()=>!!(v(),D)[L>>>0],outputPadding:V?Array.from((v(),R).subarray(Number(V)>>>0,Number(ne)>>>0)):[],outputShape:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ge)>>>0)):[],activation:Se(we)})},937326:(o,l)=>{t.ac("GlobalAveragePool",o,{format:l?"NHWC":"NCHW"})},937417:(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we)=>{t.ac("AveragePool",o,{format:we?"NHWC":"NCHW",auto_pad:l,ceil_mode:m,count_include_pad:c,storage_order:$,dilations:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:V?Array.from((v(),R).subarray(Number(V)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ge)>>>0)):[]})},937896:(o,l)=>{t.ac("GlobalAveragePool",o,{format:l?"NHWC":"NCHW"})},937987:(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we)=>{t.ac("AveragePool",o,{format:we?"NHWC":"NCHW",auto_pad:l,ceil_mode:m,count_include_pad:c,storage_order:$,dilations:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:V?Array.from((v(),R).subarray(Number(V)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ge)>>>0)):[]})},938466:(o,l)=>{t.ac("GlobalMaxPool",o,{format:l?"NHWC":"NCHW"})},938553:(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we)=>{t.ac("MaxPool",o,{format:we?"NHWC":"NCHW",auto_pad:l,ceil_mode:m,count_include_pad:c,storage_order:$,dilations:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:V?Array.from((v(),R).subarray(Number(V)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ge)>>>0)):[]})},939028:(o,l)=>{t.ac("GlobalMaxPool",o,{format:l?"NHWC":"NCHW"})},939115:(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we)=>{t.ac("MaxPool",o,{format:we?"NHWC":"NCHW",auto_pad:l,ceil_mode:m,count_include_pad:c,storage_order:$,dilations:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[],kernel_shape:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],pads:V?Array.from((v(),R).subarray(Number(V)>>>0,Number(ne)>>>0)):[],strides:pe?Array.from((v(),R).subarray(Number(pe)>>>0,Number(ge)>>>0)):[]})},939590:(o,l,m,c,$)=>{t.ac("Gemm",o,{alpha:l,beta:m,transA:c,transB:$})},939694:o=>{t.ac("MatMul",o,void 0)},939748:(o,l,m,c)=>{t.ac("ArgMax",o,{keepDims:!!l,selectLastIndex:!!m,axis:c})},939856:(o,l,m,c)=>{t.ac("ArgMin",o,{keepDims:!!l,selectLastIndex:!!m,axis:c})},939964:(o,l)=>{t.ac("Softmax",o,{axis:l})},940027:(o,l)=>{t.ac("Concat",o,{axis:l})},940087:(o,l,m,c,$)=>{t.ac("Split",o,{axis:l,numOutputs:m,splitSizes:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},940243:o=>{t.ac("Expand",o,void 0)},940297:(o,l)=>{t.ac("Gather",o,{axis:Number(l)})},940368:(o,l)=>{t.ac("GatherElements",o,{axis:Number(l)})},940447:(o,l)=>{t.ac("GatherND",o,{batch_dims:Number(l)})},940526:(o,l,m,c,$,T,z,B,L,V,ne)=>{t.ac("Resize",o,{antialias:l,axes:m?Array.from((v(),R).subarray(Number(m)>>>0,Number(c)>>>0)):[],coordinateTransformMode:Se($),cubicCoeffA:T,excludeOutside:z,extrapolationValue:B,keepAspectRatioPolicy:Se(L),mode:Se(V),nearestMode:Se(ne)})},940888:(o,l,m,c,$,T,z)=>{t.ac("Slice",o,{starts:l?Array.from((v(),R).subarray(Number(l)>>>0,Number(m)>>>0)):[],ends:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[],axes:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[]})},941152:o=>{t.ac("Tile",o,void 0)},941204:(o,l,m)=>{t.ac("InstanceNormalization",o,{epsilon:l,format:m?"NHWC":"NCHW"})},941318:(o,l,m)=>{t.ac("InstanceNormalization",o,{epsilon:l,format:m?"NHWC":"NCHW"})},941432:o=>{t.ac("Range",o,void 0)},941485:(o,l)=>{t.ac("Einsum",o,{equation:Se(l)})},941566:(o,l,m,c,$)=>{t.ac("Pad",o,{mode:l,value:m,pads:c?Array.from((v(),R).subarray(Number(c)>>>0,Number($)>>>0)):[]})},941709:(o,l,m,c,$,T)=>{t.ac("BatchNormalization",o,{epsilon:l,momentum:m,spatial:!!$,trainingMode:!!c,format:T?"NHWC":"NCHW"})},941878:(o,l,m,c,$,T)=>{t.ac("BatchNormalization",o,{epsilon:l,momentum:m,spatial:!!$,trainingMode:!!c,format:T?"NHWC":"NCHW"})},942047:(o,l,m)=>{t.ac("CumSum",o,{exclusive:Number(l),reverse:Number(m)})},942144:(o,l,m)=>{t.ac("DequantizeLinear",o,{axis:l,blockSize:m})},942234:(o,l,m,c,$)=>{t.ac("GridSample",o,{align_corners:l,mode:Se(m),padding_mode:Se(c),format:$?"NHWC":"NCHW"})},942404:(o,l,m,c,$)=>{t.ac("GridSample",o,{align_corners:l,mode:Se(m),padding_mode:Se(c),format:$?"NHWC":"NCHW"})},942574:(o,l)=>{t.ac("ScatterND",o,{reduction:Se(l)})},942659:(o,l,m,c,$,T,z,B,L)=>{t.ac("Attention",o,{numHeads:l,isUnidirectional:m,maskFilterValue:c,scale:$,doRotary:T,qkvHiddenSizes:z?Array.from((v(),R).subarray(Number(B)>>>0,Number(B)+z>>>0)):[],pastPresentShareBuffer:!!L})},942931:o=>{t.ac("BiasAdd",o,void 0)},942986:o=>{t.ac("BiasSplitGelu",o,void 0)},943047:o=>{t.ac("FastGelu",o,void 0)},943103:(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we,pt,gi)=>{t.ac("Conv",o,{format:pe?"NHWC":"NCHW",auto_pad:l,dilations:m?Array.from((v(),R).subarray(Number(m)>>>0,Number(c)>>>0)):[],group:$,kernel_shape:T?Array.from((v(),R).subarray(Number(T)>>>0,Number(z)>>>0)):[],pads:B?Array.from((v(),R).subarray(Number(B)>>>0,Number(L)>>>0)):[],strides:V?Array.from((v(),R).subarray(Number(V)>>>0,Number(ne)>>>0)):[],w_is_const:()=>!!(v(),D)[Number(ge)>>>0],activation:Se(we),activation_params:pt?Array.from((v(),F).subarray(Number(pt)>>>0,Number(gi)>>>0)):[]})},943687:o=>{t.ac("Gelu",o,void 0)},943739:(o,l,m,c,$,T,z,B,L)=>{t.ac("GroupQueryAttention",o,{numHeads:l,kvNumHeads:m,scale:c,softcap:$,doRotary:T,rotaryInterleaved:z,smoothSoftmax:B,localWindowSize:L})},943956:(o,l,m,c)=>{t.ac("LayerNormalization",o,{axis:l,epsilon:m,simplified:!!c})},944067:(o,l,m,c)=>{t.ac("LayerNormalization",o,{axis:l,epsilon:m,simplified:!!c})},944178:(o,l,m,c,$,T)=>{t.ac("MatMulNBits",o,{k:l,n:m,accuracyLevel:c,bits:$,blockSize:T})},944305:(o,l,m,c,$,T)=>{t.ac("MultiHeadAttention",o,{numHeads:l,isUnidirectional:m,maskFilterValue:c,scale:$,doRotary:T})},944464:(o,l)=>{t.ac("QuickGelu",o,{alpha:l})},944528:(o,l,m,c,$)=>{t.ac("RotaryEmbedding",o,{interleaved:!!l,numHeads:m,rotaryEmbeddingDim:c,scale:$})},944667:(o,l,m)=>{t.ac("SkipLayerNormalization",o,{epsilon:l,simplified:!!m})},944769:(o,l,m)=>{t.ac("SkipLayerNormalization",o,{epsilon:l,simplified:!!m})},944871:(o,l,m,c)=>{t.ac("GatherBlockQuantized",o,{gatherAxis:l,quantizeAxis:m,blockSize:c})},944992:o=>{t.Id(o)},945026:(o,l)=>t.Kd(Number(o),Number(l),t.$c.Nd,t.$c.errors)};function Wm(o,l,m){return Mn(async()=>{await t.Gd(Number(o),Number(l),Number(m))})}function Lm(){return typeof wasmOffsetConverter<"u"}function Vm(o,l,m,c){var $=oe();try{return _s(o,l,m,c)}catch(T){if(se($),T!==T+0)throw T;ue(1,0)}}function Gm(o,l,m){var c=oe();try{return fs(o,l,m)}catch($){if(se(c),$!==$+0)throw $;ue(1,0)}}function Hm(o,l,m){var c=oe();try{ds(o,l,m)}catch($){if(se(c),$!==$+0)throw $;ue(1,0)}}function Fm(o,l){var m=oe();try{return fi(o,l)}catch(c){if(se(m),c!==c+0)throw c;ue(1,0)}}function jm(o){var l=oe();try{ps(o)}catch(m){if(se(l),m!==m+0)throw m;ue(1,0)}}function Km(o,l,m,c,$,T,z){var B=oe();try{return gs(o,l,m,c,$,T,z)}catch(L){if(se(B),L!==L+0)throw L;ue(1,0)}}function Qm(o,l){var m=oe();try{ws(o,l)}catch(c){if(se(m),c!==c+0)throw c;ue(1,0)}}function Zm(o,l,m,c,$,T){var z=oe();try{cs(o,l,m,c,$,T)}catch(B){if(se(z),B!==B+0)throw B;ue(1,0)}}function Ym(o,l,m,c){var $=oe();try{ys(o,l,m,c)}catch(T){if(se($),T!==T+0)throw T;ue(1,0)}}function Xm(o,l,m,c,$){var T=oe();try{hs(o,l,m,c,$)}catch(z){if(se(T),z!==z+0)throw z;ue(1,0)}}function Jm(o,l,m,c,$,T,z){var B=oe();try{$s(o,l,m,c,$,T,z)}catch(L){if(se(B),L!==L+0)throw L;ue(1,0)}}function eg(o,l,m,c,$,T,z){var B=oe();try{vs(o,l,m,c,$,T,z)}catch(L){if(se(B),L!==L+0)throw L;ue(1,0)}}function tg(o,l,m,c,$,T,z,B){var L=oe();try{ks(o,l,m,c,$,T,z,B)}catch(V){if(se(L),V!==V+0)throw V;ue(1,0)}}function rg(o,l,m,c,$){var T=oe();try{return bs(o,l,m,c,$)}catch(z){if(se(T),z!==z+0)throw z;ue(1,0)}}function ig(o,l,m,c,$,T,z,B){var L=oe();try{Is(o,l,m,c,$,T,z,B)}catch(V){if(se(L),V!==V+0)throw V;ue(1,0)}}function ag(o,l,m,c,$,T,z,B,L,V,ne,pe){var ge=oe();try{xs(o,l,m,c,$,T,z,B,L,V,ne,pe)}catch(we){if(se(ge),we!==we+0)throw we;ue(1,0)}}function ng(o,l,m,c,$,T){var z=oe();try{return Ss(o,l,m,c,$,T)}catch(B){if(se(z),B!==B+0)throw B;ue(1,0)}}function sg(o,l,m){var c=oe();try{return Es(o,l,m)}catch($){if(se(c),$!==$+0)throw $;return ue(1,0),0n}}function og(o,l,m,c,$,T,z,B,L){var V=oe();try{ms(o,l,m,c,$,T,z,B,L)}catch(ne){if(se(V),ne!==ne+0)throw ne;ue(1,0)}}function ug(o){var l=oe();try{return zs(o)}catch(m){if(se(l),m!==m+0)throw m;ue(1,0)}}function lg(o,l,m){var c=oe();try{return Cs(o,l,m)}catch($){if(se(c),$!==$+0)throw $;ue(1,0)}}function dg(o,l){var m=oe();try{return Fs(o,l)}catch(c){if(se(m),c!==c+0)throw c;return ue(1,0),0n}}function pg(o,l,m,c,$){var T=oe();try{As(o,l,m,c,$)}catch(z){if(se(T),z!==z+0)throw z;ue(1,0)}}function cg(o){var l=oe();try{return Os(o)}catch(m){if(se(l),m!==m+0)throw m;return ue(1,0),0n}}function hg(o,l,m,c,$,T){var z=oe();try{return Us(o,l,m,c,$,T)}catch(B){if(se(z),B!==B+0)throw B;ue(1,0)}}function fg(o,l,m,c,$,T){var z=oe();try{return Ps(o,l,m,c,$,T)}catch(B){if(se(z),B!==B+0)throw B;ue(1,0)}}function mg(o,l,m,c,$,T,z,B){var L=oe();try{return Ts(o,l,m,c,$,T,z,B)}catch(V){if(se(L),V!==V+0)throw V;ue(1,0)}}function gg(o,l,m,c,$){var T=oe();try{return qs(o,l,m,c,$)}catch(z){if(se(T),z!==z+0)throw z;return ue(1,0),0n}}function yg(o,l,m,c){var $=oe();try{return Ws(o,l,m,c)}catch(T){if(se($),T!==T+0)throw T;ue(1,0)}}function _g(o,l,m,c){var $=oe();try{return Ls(o,l,m,c)}catch(T){if(se($),T!==T+0)throw T;ue(1,0)}}function wg(o,l,m,c,$,T,z,B,L,V,ne,pe){var ge=oe();try{return Vs(o,l,m,c,$,T,z,B,L,V,ne,pe)}catch(we){if(se(ge),we!==we+0)throw we;ue(1,0)}}function bg(o,l,m,c,$,T,z,B,L,V,ne){var pe=oe();try{Ms(o,l,m,c,$,T,z,B,L,V,ne)}catch(ge){if(se(pe),ge!==ge+0)throw ge;ue(1,0)}}function $g(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we,pt,gi){var Ig=oe();try{Ds(o,l,m,c,$,T,z,B,L,V,ne,pe,ge,we,pt,gi)}catch(yi){if(se(Ig),yi!==yi+0)throw yi;ue(1,0)}}function vg(o,l,m,c){var $=oe();try{return Gs(o,l,m,c)}catch(T){if(se($),T!==T+0)throw T;ue(1,0)}}function xg(o,l,m,c,$){var T=oe();try{return Hs(o,l,m,c,$)}catch(z){if(se(T),z!==z+0)throw z;ue(1,0)}}function Sg(o,l,m){var c=oe();try{return Rs(o,l,m)}catch($){if(se(c),$!==$+0)throw $;ue(1,0)}}function Tg(o,l,m){var c=oe();try{return Bs(o,l,m)}catch($){if(se(c),$!==$+0)throw $;ue(1,0)}}function kg(o,l,m,c){var $=oe();try{Ns(o,l,m,c)}catch(T){if(se($),T!==T+0)throw T;ue(1,0)}}function Tr(){if(0<Oe)Ce=Tr;else if(a)w==null||w(t),J();else{for(var o=cr;0<o.length;)o.shift()(t);0<Oe?Ce=Tr:(t.calledRun=!0,C||(J(),w==null||w(t)))}}return a||(et=await at(),Tr()),t.PTR_SIZE=4,U?t:new Promise((o,l)=>{w=o,S=l})}var ip,ro,Qg=q(()=>{var e,t;ip=to,ro=(t=(e=globalThis.self)==null?void 0:e.name)==null?void 0:t.startsWith("em-pthread"),ro&&to()}),xi,fa,io,Be,ap,Ir,ao,no,Si,so,Ti,np,ki,sp,Ra=q(()=>{Oa(),xi=typeof location>"u"?void 0:location.origin,fa=import.meta.url>"file:"&&import.meta.url<"file;",io=()=>{{if(fa){let e=URL;return new URL(new e("ort.bundle.min.mjs",import.meta.url).href,xi).href}return import.meta.url}},Be=io(),ap=()=>{if(Be&&!Be.startsWith("blob:"))return Be.substring(0,Be.lastIndexOf("/")+1)},Ir=(e,t)=>{try{let r=t??Be;return(r?new URL(e,r):new URL(e)).origin===xi}catch{return!1}},ao=(e,t)=>{let r=t??Be;try{return(r?new URL(e,r):new URL(e)).href}catch{return}},no=(e,t)=>`${t??"./"}${e}`,Si=async e=>{let t=await(await fetch(e,{credentials:"same-origin"})).blob();return URL.createObjectURL(t)},so=async e=>(await import(e)).default,Ti=(Kg(),dr(ep)).default,np=async()=>{if(!Be)throw new Error("Failed to load proxy worker: cannot determine the script source URL.");if(Ir(Be))return[void 0,Ti()];let e=await Si(Be);return[e,Ti(e)]},ki=(Qg(),dr(rp)).default,sp=async(e,t,r,i)=>{let a=ki&&!(e||t);if(a)if(Be)a=Ir(Be)||i&&!r;else if(i&&!r)a=!0;else throw new Error("cannot determine the script source URL.");if(a)return[void 0,ki];{let n="ort-wasm-simd-threaded.jsep.mjs",s=e??ao(n,t),u=r&&s&&!Ir(s,t),d=u?await Si(s):s??no(n,t);return[u?d:void 0,await so(d)]}}}),Ii,Er,Qt,Ei,oo,uo,lo,Ba,ye,Ot=q(()=>{Ra(),Er=!1,Qt=!1,Ei=!1,oo=()=>{if(typeof SharedArrayBuffer>"u")return!1;try{return typeof MessageChannel<"u"&&new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)),WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,5,4,1,3,1,1,10,11,1,9,0,65,0,254,16,2,0,26,11]))}catch{return!1}},uo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,2,1,0,10,30,1,28,0,65,0,253,15,253,12,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,253,186,1,26,11]))}catch{return!1}},lo=()=>{try{return WebAssembly.validate(new Uint8Array([0,97,115,109,1,0,0,0,1,5,1,96,0,1,123,3,2,1,0,10,19,1,17,0,65,1,253,15,65,2,253,15,65,3,253,15,253,147,2,11]))}catch{return!1}},Ba=async e=>{if(Er)return Promise.resolve();if(Qt)throw new Error("multiple calls to 'initializeWebAssembly()' detected.");if(Ei)throw new Error("previous call to 'initializeWebAssembly()' failed.");Qt=!0;let t=e.initTimeout,r=e.numThreads;if(e.simd!==!1){if(e.simd==="relaxed"){if(!lo())throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.")}else if(!uo())throw new Error("WebAssembly SIMD is not supported in the current environment.")}let i=oo();r>1&&!i&&(typeof self<"u"&&!self.crossOriginIsolated&&console.warn("env.wasm.numThreads is set to "+r+", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."),console.warn("WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."),e.numThreads=r=1);let a=e.wasmPaths,n=typeof a=="string"?a:void 0,s=a==null?void 0:a.mjs,u=(s==null?void 0:s.href)??s,d=a==null?void 0:a.wasm,p=(d==null?void 0:d.href)??d,h=e.wasmBinary,[f,g]=await sp(u,n,r>1,!!h||!!p),y=!1,_=[];if(t>0&&_.push(new Promise(w=>{setTimeout(()=>{y=!0,w()},t)})),_.push(new Promise((w,S)=>{let x={numThreads:r};if(h)x.wasmBinary=h,x.locateFile=b=>b;else if(p||n)x.locateFile=b=>p??n+b;else if(u&&u.indexOf("blob:")!==0)x.locateFile=b=>new URL(b,u).href;else if(f){let b=ap();b&&(x.locateFile=I=>b+I)}g(x).then(b=>{Qt=!1,Er=!0,Ii=b,w(),f&&URL.revokeObjectURL(f)},b=>{Qt=!1,Ei=!0,S(b)})})),await Promise.race(_),y)throw new Error(`WebAssembly backend initializing failed due to timeout: ${t}ms`)},ye=()=>{if(Er&&Ii)return Ii;throw new Error("WebAssembly is not initialized yet.")}}),He,Lr,fe,Na=q(()=>{Ot(),He=(e,t)=>{let r=ye(),i=r.lengthBytesUTF8(e)+1,a=r._malloc(i);return r.stringToUTF8(e,a,i),t.push(a),a},Lr=(e,t,r,i)=>{if(typeof e=="object"&&e!==null){if(r.has(e))throw new Error("Circular reference in options");r.add(e)}Object.entries(e).forEach(([a,n])=>{let s=t?t+a:a;if(typeof n=="object")Lr(n,s+".",r,i);else if(typeof n=="string"||typeof n=="number")i(s,n.toString());else if(typeof n=="boolean")i(s,n?"1":"0");else throw new Error(`Can't handle extra config type: ${typeof n}`)})},fe=e=>{let t=ye(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetLastError(a,a+i);let n=Number(t.getValue(a,i===4?"i32":"i64")),s=t.getValue(a+i,"*"),u=s?t.UTF8ToString(s):"";throw new Error(`${e} ERROR_CODE: ${n}, ERROR_MESSAGE: ${u}`)}finally{t.stackRestore(r)}}}),op,Zg=q(()=>{Ot(),Na(),op=e=>{let t=ye(),r=0,i=[],a=e||{};try{if((e==null?void 0:e.logSeverityLevel)===void 0)a.logSeverityLevel=2;else if(typeof e.logSeverityLevel!="number"||!Number.isInteger(e.logSeverityLevel)||e.logSeverityLevel<0||e.logSeverityLevel>4)throw new Error(`log severity level is not valid: ${e.logSeverityLevel}`);if((e==null?void 0:e.logVerbosityLevel)===void 0)a.logVerbosityLevel=0;else if(typeof e.logVerbosityLevel!="number"||!Number.isInteger(e.logVerbosityLevel))throw new Error(`log verbosity level is not valid: ${e.logVerbosityLevel}`);(e==null?void 0:e.terminate)===void 0&&(a.terminate=!1);let n=0;return(e==null?void 0:e.tag)!==void 0&&(n=He(e.tag,i)),r=t._OrtCreateRunOptions(a.logSeverityLevel,a.logVerbosityLevel,!!a.terminate,n),r===0&&fe("Can't create run options."),(e==null?void 0:e.extra)!==void 0&&Lr(e.extra,"",new WeakSet,(s,u)=>{let d=He(s,i),p=He(u,i);t._OrtAddRunConfigEntry(r,d,p)!==0&&fe(`Can't set a run config entry: ${s} - ${u}.`)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseRunOptions(r),i.forEach(s=>t._free(s)),n}}}),po,co,ho,Zt,fo,up,Yg=q(()=>{Ot(),Na(),po=e=>{switch(e){case"disabled":return 0;case"basic":return 1;case"extended":return 2;case"layout":return 3;case"all":return 99;default:throw new Error(`unsupported graph optimization level: ${e}`)}},co=e=>{switch(e){case"sequential":return 0;case"parallel":return 1;default:throw new Error(`unsupported execution mode: ${e}`)}},ho=e=>{e.extra||(e.extra={}),e.extra.session||(e.extra.session={});let t=e.extra.session;t.use_ort_model_bytes_directly||(t.use_ort_model_bytes_directly="1"),e.executionProviders&&e.executionProviders.some(r=>(typeof r=="string"?r:r.name)==="webgpu")&&(e.enableMemPattern=!1)},Zt=(e,t,r,i)=>{let a=He(t,i),n=He(r,i);ye()._OrtAddSessionConfigEntry(e,a,n)!==0&&fe(`Can't set a session config entry: ${t} - ${r}.`)},fo=async(e,t,r)=>{let i=t.executionProviders;for(let a of i){let n=typeof a=="string"?a:a.name,s=[];switch(n){case"webnn":if(n="WEBNN",typeof a!="string"){let f=a==null?void 0:a.deviceType;f&&Zt(e,"deviceType",f,r)}break;case"webgpu":if(n="JS",typeof a!="string"){let f=a;if(f!=null&&f.preferredLayout){if(f.preferredLayout!=="NCHW"&&f.preferredLayout!=="NHWC")throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${f.preferredLayout}`);Zt(e,"preferredLayout",f.preferredLayout,r)}}break;case"wasm":case"cpu":continue;default:throw new Error(`not supported execution provider: ${n}`)}let u=He(n,r),d=s.length,p=0,h=0;if(d>0){p=ye()._malloc(d*ye().PTR_SIZE),r.push(p),h=ye()._malloc(d*ye().PTR_SIZE),r.push(h);for(let f=0;f<d;f++)ye().setValue(p+f*ye().PTR_SIZE,s[f][0],"*"),ye().setValue(h+f*ye().PTR_SIZE,s[f][1],"*")}await ye()._OrtAppendExecutionProvider(e,u,p,h,d)!==0&&fe(`Can't append execution provider: ${n}.`)}},up=async e=>{let t=ye(),r=0,i=[],a=e||{};ho(a);try{let n=po(a.graphOptimizationLevel??"all"),s=co(a.executionMode??"sequential"),u=typeof a.logId=="string"?He(a.logId,i):0,d=a.logSeverityLevel??2;if(!Number.isInteger(d)||d<0||d>4)throw new Error(`log severity level is not valid: ${d}`);let p=a.logVerbosityLevel??0;if(!Number.isInteger(p)||p<0||p>4)throw new Error(`log verbosity level is not valid: ${p}`);let h=typeof a.optimizedModelFilePath=="string"?He(a.optimizedModelFilePath,i):0;if(r=t._OrtCreateSessionOptions(n,!!a.enableCpuMemArena,!!a.enableMemPattern,s,!!a.enableProfiling,0,u,d,p,h),r===0&&fe("Can't create session options."),a.executionProviders&&await fo(r,a,i),a.enableGraphCapture!==void 0){if(typeof a.enableGraphCapture!="boolean")throw new Error(`enableGraphCapture must be a boolean value: ${a.enableGraphCapture}`);Zt(r,"enableGraphCapture",a.enableGraphCapture.toString(),i)}if(a.freeDimensionOverrides)for(let[f,g]of Object.entries(a.freeDimensionOverrides)){if(typeof f!="string")throw new Error(`free dimension override name must be a string: ${f}`);if(typeof g!="number"||!Number.isInteger(g)||g<0)throw new Error(`free dimension override value must be a non-negative integer: ${g}`);let y=He(f,i);t._OrtAddFreeDimensionOverride(r,y,g)!==0&&fe(`Can't set a free dimension override: ${f} - ${g}.`)}return a.extra!==void 0&&Lr(a.extra,"",new WeakSet,(f,g)=>{Zt(r,f,g,i)}),[r,i]}catch(n){throw r!==0&&t._OrtReleaseSessionOptions(r)!==0&&fe("Can't release session options."),i.forEach(s=>t._free(s)),n}}}),Tt,rt,kt,Qr,Vr,Ma,Da,ma,te=q(()=>{Tt=e=>{switch(e){case"int8":return 3;case"uint8":return 2;case"bool":return 9;case"int16":return 5;case"uint16":return 4;case"int32":return 6;case"uint32":return 12;case"float16":return 10;case"float32":return 1;case"float64":return 11;case"string":return 8;case"int64":return 7;case"uint64":return 13;case"int4":return 22;case"uint4":return 21;default:throw new Error(`unsupported data type: ${e}`)}},rt=e=>{switch(e){case 3:return"int8";case 2:return"uint8";case 9:return"bool";case 5:return"int16";case 4:return"uint16";case 6:return"int32";case 12:return"uint32";case 10:return"float16";case 1:return"float32";case 11:return"float64";case 8:return"string";case 7:return"int64";case 13:return"uint64";case 22:return"int4";case 21:return"uint4";default:throw new Error(`unsupported data type: ${e}`)}},kt=(e,t)=>{let r=[-1,4,1,1,2,2,4,8,-1,1,2,8,4,8,-1,-1,-1,-1,-1,-1,-1,.5,.5][e],i=typeof t=="number"?t:t.reduce((a,n)=>a*n,1);return r>0?Math.ceil(i*r):void 0},Qr=e=>{switch(e){case"float16":return typeof Float16Array<"u"&&Float16Array.from?Float16Array:Uint16Array;case"float32":return Float32Array;case"uint8":return Uint8Array;case"int8":return Int8Array;case"uint16":return Uint16Array;case"int16":return Int16Array;case"int32":return Int32Array;case"bool":return Uint8Array;case"float64":return Float64Array;case"uint32":return Uint32Array;case"int64":return BigInt64Array;case"uint64":return BigUint64Array;default:throw new Error(`unsupported type: ${e}`)}},Vr=e=>{switch(e){case"verbose":return 0;case"info":return 1;case"warning":return 2;case"error":return 3;case"fatal":return 4;default:throw new Error(`unsupported logging level: ${e}`)}},Ma=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",Da=e=>e==="float32"||e==="float16"||e==="int32"||e==="int64"||e==="uint32"||e==="uint64"||e==="int8"||e==="uint8"||e==="bool"||e==="uint4"||e==="int4",ma=e=>{switch(e){case"none":return 0;case"cpu":return 1;case"cpu-pinned":return 2;case"texture":return 3;case"gpu-buffer":return 4;case"ml-tensor":return 5;default:throw new Error(`unsupported data location: ${e}`)}}}),Ua,lp=q(()=>{Oa(),Ua=async e=>{if(typeof e=="string"){let t=await fetch(e);if(!t.ok)throw new Error(`failed to load external data file: ${e}`);let r=t.headers.get("Content-Length"),i=r?parseInt(r,10):0;if(i<1073741824)return new Uint8Array(await t.arrayBuffer());{if(!t.body)throw new Error(`failed to load external data file: ${e}, no response body.`);let a=t.body.getReader(),n;try{n=new ArrayBuffer(i)}catch(u){if(u instanceof RangeError){let d=Math.ceil(i/65536);n=new WebAssembly.Memory({initial:d,maximum:d}).buffer}else throw u}let s=0;for(;;){let{done:u,value:d}=await a.read();if(u)break;let p=d.byteLength;new Uint8Array(n,s,p).set(d),s+=p}return new Uint8Array(n,0,i)}}else return e instanceof Blob?new Uint8Array(await e.arrayBuffer()):e instanceof Uint8Array?e:new Uint8Array(e)}}),mo,go,yo,_o,Pa,wo,de,it=q(()=>{te(),mo=["V","I","W","E","F"],go=(e,t)=>{console.log(`[${mo[e]},${new Date().toISOString()}]${t}`)},Pa=(e,t)=>{yo=e,_o=t},wo=(e,t)=>{let r=Vr(e),i=Vr(yo);r>=i&&go(r,typeof t=="function"?t():t)},de=(...e)=>{_o&&wo(...e)}}),bo,Pt,O,Gr,dp,pp,cp,ie=q(()=>{bo=class{static calcMatMulShape(e,t){return e[1]!==t[0]?void 0:[e[0],t[1]]}},Pt=class{static calcShape(e,t,r=!1){let i=e.length,a=t.length;if(i===0)return t;if(a===0)return e;let n=Math.max(e.length,t.length),s=new Array(n);if(r){if(i<2||a<2)return;let u=bo.calcMatMulShape([e[i-2],e[i-1]],[t[a-2],t[a-1]]);if(u===void 0)return;[s[n-2],s[n-1]]=u}for(let u=r?3:1;u<=n;u++){let d=i-u<0?1:e[i-u],p=a-u<0?1:t[a-u];if(d!==p&&d>1&&p>1)return;let h=Math.max(d,p);if(d&&p)s[n-u]=Math.max(d,p);else{if(h>1)return;s[n-u]=0}}return s}static isValidBroadcast(e,t){let r=e.length,i=t.length;if(r>i)return!1;for(let a=1;a<=r;a++)if(e[r-a]!==1&&e[r-a]!==t[i-a])return!1;return!0}},O=class Pr{static size(t){return Pr.getSizeFromDimensionRange(t,0,t.length)}static convertShape(t,r=4){let i=t.length;if(i===0)return[];let a=new Array(i),n=i-1;for(;n>=0;){if(t[n]%r===0){a[n]=t[n]/r;break}if(r%t[n]!==0)throw new Error("cannot convert shape");a[n]=1,r/=t[n],n--}for(n--;n>=0;n--)a[n]=t[n];return a}static sizeFromDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeFromDimension as Tensor has ${t.length} dimensions.`);return Pr.getSizeFromDimensionRange(t,r,t.length)}static sizeToDimension(t,r){if(r<0||r>t.length)throw new Error(`invalid dimension of ${r} for sizeToDimension as Tensor has ${t.length} dimensions.`);return Pr.getSizeFromDimensionRange(t,0,r)}static getSizeFromDimensionRange(t,r,i){let a=1;for(let n=r;n<i;n++){if(t[n]<0)throw new Error("cannot get valid size from specified dimension range. Most likely the range contains negative values in them.");a*=Number(t[n])}return a}static computeStrides(t){let r=t.length;if(r===0)return[];if(r===1)return[1];let i=new Array(r);i[r-1]=1,i[r-2]=t[r-1];for(let a=r-3;a>=0;--a)i[a]=i[a+1]*t[a+1];return i}static normalizeAxis(t,r){if(t<-r&&t>=r)throw new Error("unsupported axis for this operation.");return t<0?t+r:t}static normalizeAxes(t,r){return t.map(i=>this.normalizeAxis(i,r??t.length))}static sortBasedOnPerm(t,r){return r?r.map(i=>t[i]):t.slice().reverse()}static padShape(t,r){let i=t.length;return t.map((a,n)=>a+r[n]+r[n+i])}static areEqual(t,r){return t.length!==r.length?!1:t.every((i,a)=>i===r[a])}},Gr=class sr{static adjustPoolAttributes(t,r,i,a,n,s){if(!t&&i.length!==r.length-2)throw new Error("length of specified kernel shapes should be 2 less than length of input dimensions");if(t)for(let u=0;u<r.length-2;u++)u>=i.length?i.push(r[u+2]):i[u]=r[u+2];for(let u=0;u<i.length;u++)if(u<a.length){if(a[u]<0)throw new Error("strides should be greater than or equal to 1")}else a.push(1);for(let u=0;u<i.length;u++)if(u<n.length){if(n[u]<0)throw new Error("dilations should be greater than or equal to 1")}else n.push(1);for(let u=0;u<i.length*2;u++)if(u<s.length){if(s[u]<0)throw new Error("pad should be greater than or equal to 1")}else s.push(0);for(let u=0;u<i.length;u++){if(i[u]<=0)throw new Error("kernel shapes need to be greater than 0");if(s[u]>=i[u]||s[u+i.length]>=i[u])throw new Error("pads should be smaller than kernel")}}static adjustPadsBasedOnAutoPad(t,r,i,a,n,s,u){if(u){if(n.length!==2*(t.length-2))throw new Error("length of pads should be twice the length of data dimensions");if(r.length!==t.length-2)throw new Error("length of strides should be the length of data dimensions");if(a.length!==t.length-2)throw new Error("length of kernel shapes should be the length of data dimensions");for(let d=0;d<t.length-2;d++)sr.adjustPadAndReturnShape(t[d+(s?1:2)],r[d],i[d],a[d],n,d,d+t.length-2,u)}}static computePoolOutputShape(t,r,i,a,n,s,u){if(r.length<=0)throw new Error("input shape must be of size greater than 0");let d=[r[0],r[1]];return sr.computeShapeHelper(t,r,d,i,a,n,s,u),d}static computeConvOutputShape(t,r,i,a,n,s,u){if(t.length<=0||r.length<=0)throw new Error("invalid input tensor dims or invalid filter tensor dims");let d=[t[0],r[0]];return sr.computeShapeHelper(!1,t,d,i,a,n,s,u),d}static computeShapeHelper(t,r,i,a,n,s,u,d){if(t)for(let p=0;p<r.length-2;p++)i.push(1);else for(let p=0;p<r.length-2;p++)i.push(sr.adjustPadAndReturnShape(r[p+2],a[p],n[p],s[p],u,p,p+r.length-2,d))}static adjustPadAndReturnShape(t,r,i,a,n,s,u,d){let p=i*(a-1)+1;if(d&&d!=="NOTSET")switch(d){case"VALID":return n[s]=0,n[u]=0,Math.floor((t-p)/r+1);case"SAME_LOWER":case"SAME_UPPER":if(i!==1)throw new Error("Dilation not supported for SAME_UPPER or SAME_LOWER");{let h=((t+r-1)/r-1)*r+a-t;return n[s]=Math.floor(d==="SAME_LOWER"?(h+1)/2:h/2),n[u]=h-n[s],Math.floor((t+h-a)/r+1)}default:throw new Error("Unsupported AutoPad type")}else return Math.floor((t+n[s]+n[u]-p)/r+1)}},dp=class{static getShapeOfGemmResult(e,t,r,i,a){if(e.length!==2||r.length!==2)throw new Error("shape need to be of size 2");let n,s,u;t?(n=e[1],s=e[0]):(n=e[0],s=e[1]);let d=-1;if(i?(u=r[0],d=1):(u=r[1],d=0),r[d]!==s)throw new Error("dimension mismatch");if(n<=0||u<=0||s<=0)throw new Error("invalid shape specified");if(a&&!Pt.isValidBroadcast(a,[n,u]))throw new Error("gemm: invalid bias shape for broadcast");return[n,u,s]}},pp=-34028234663852886e22,cp=34028234663852886e22}),qa,hp=q(()=>{te(),qa=(e,t)=>new(Qr(t))(e)}),zi,ga,Ci,$o,Ai,vo,Oi,Ri,Bi,xo,fp,Xg=q(()=>{te(),it(),zi=new Map([["float32",32],["float16",16],["int32",32],["uint32",32],["int64",64],["uint64",64],["int8",8],["uint8",8],["int4",4],["uint4",4]]),ga=(e,t)=>{if(t==="int32")return e;let r=zi.get(t);if(!r)throw new Error(`WebNN backend does not support data type: ${t}`);let i=r/8;if(e.byteLength%i!==0)throw new Error(`Invalid Uint8Array length - must be a multiple of ${i}.`);let a=e.byteLength/i,n=new(Qr(t))(e.buffer,e.byteOffset,a);switch(t){case"int64":case"uint64":{let s=new Int32Array(a);for(let u=0;u<a;u++){let d=n[u];if(d>2147483647n||d<-2147483648n)throw new Error("Can not convert int64 data to int32 - value out of range.");s[u]=Number(d)}return new Uint8Array(s.buffer)}case"int8":case"uint8":case"uint32":{if(t==="uint32"&&n.some(u=>u>2147483647))throw new Error("Can not convert uint32 data to int32 - value out of range.");let s=Int32Array.from(n,Number);return new Uint8Array(s.buffer)}default:throw new Error(`Unsupported data conversion from ${t} to 'int32'`)}},Ci=(e,t)=>{if(t==="int32")return e;if(e.byteLength%4!==0)throw new Error("Invalid Uint8Array length - must be a multiple of 4 (int32).");let r=e.byteLength/4,i=new Int32Array(e.buffer,e.byteOffset,r);switch(t){case"int64":{let a=BigInt64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"uint64":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uin64 - negative value found.");let a=BigUint64Array.from(i,BigInt);return new Uint8Array(a.buffer)}case"int8":{if(i.some(n=>n<-128||n>127))throw new Error("Can not convert int32 data to int8 - value out of range.");let a=Int8Array.from(i,Number);return new Uint8Array(a.buffer)}case"uint8":{if(i.some(a=>a<0||a>255))throw new Error("Can not convert int32 data to uint8 - value out of range.");return Uint8Array.from(i,Number)}case"uint32":{if(i.some(n=>n<0))throw new Error("Can not convert int32 data to uint32 - negative value found.");let a=Uint32Array.from(i,Number);return new Uint8Array(a.buffer)}default:throw new Error(`Unsupported data conversion from 'int32' to ${t}`)}},$o=1,Ai=()=>$o++,vo=new Map([["int8","int32"],["uint8","int32"],["uint32","int32"],["int64","int32"]]),Oi=(e,t)=>{let r=zi.get(e);if(!r)throw new Error(`WebNN backend does not support data type: ${e}`);return t.length>0?Math.ceil(t.reduce((i,a)=>i*a)*r/8):0},Ri=class{constructor(e){this.isDataConverted=!1;let{sessionId:t,context:r,tensor:i,dataType:a,shape:n,fallbackDataType:s}=e;this.sessionId=t,this.mlContext=r,this.mlTensor=i,this.dataType=a,this.tensorShape=n,this.fallbackDataType=s}get tensor(){return this.mlTensor}get type(){return this.dataType}get fallbackType(){return this.fallbackDataType}get shape(){return this.tensorShape}get byteLength(){return Oi(this.dataType,this.tensorShape)}destroy(){de("verbose",()=>"[WebNN] TensorWrapper.destroy"),this.mlTensor.destroy()}write(e){this.mlContext.writeTensor(this.mlTensor,e)}async read(e){if(this.fallbackDataType){let t=await this.mlContext.readTensor(this.mlTensor),r=Ci(new Uint8Array(t),this.dataType);if(e){(e instanceof ArrayBuffer?new Uint8Array(e):new Uint8Array(e.buffer,e.byteOffset,e.byteLength)).set(r);return}else return r.buffer}else return e?this.mlContext.readTensor(this.mlTensor,e):this.mlContext.readTensor(this.mlTensor)}canReuseTensor(e,t,r){return this.mlContext===e&&this.dataType===t&&this.tensorShape.length===r.length&&this.tensorShape.every((i,a)=>i===r[a])}setIsDataConverted(e){this.isDataConverted=e}},Bi=class{constructor(e,t){this.tensorManager=e,this.wrapper=t}get tensorWrapper(){return this.wrapper}releaseTensor(){this.tensorWrapper&&(this.tensorManager.releaseTensor(this.tensorWrapper),this.wrapper=void 0)}async ensureTensor(e,t,r,i){let a=this.tensorManager.getMLContext(e),n=this.tensorManager.getMLOpSupportLimits(e),s;if(!(n!=null&&n.input.dataTypes.includes(t))){if(s=vo.get(t),!s||(n==null?void 0:n.input.dataTypes.includes(s)))throw new Error(`WebNN backend does not support data type: ${t}`);de("verbose",()=>`[WebNN] TensorIdTracker.ensureTensor: fallback dataType from ${t} to ${s}`)}if(this.wrapper){if(this.wrapper.canReuseTensor(a,t,r))return this.wrapper.tensor;if(i){if(this.wrapper.byteLength!==Oi(t,r))throw new Error("Unable to copy data to tensor with different size.");this.activeUpload=new Uint8Array(await this.wrapper.read())}this.tensorManager.releaseTensor(this.wrapper)}let u=typeof MLTensorUsage>"u"?void 0:MLTensorUsage.READ|MLTensorUsage.WRITE;return this.wrapper=await this.tensorManager.getCachedTensor(e,t,r,u,!0,!0,s),i&&this.activeUpload&&(this.wrapper.write(this.activeUpload),this.activeUpload=void 0),this.wrapper.tensor}upload(e){let t=e;if(this.wrapper){if(this.wrapper.fallbackType)if(this.wrapper.fallbackType==="int32")t=ga(e,this.wrapper.type),this.wrapper.setIsDataConverted(!0);else throw new Error(`Unsupported fallback data type: ${this.wrapper.fallbackType}`);if(e.byteLength===this.wrapper.byteLength){this.wrapper.write(t);return}else de("verbose",()=>"Data size does not match tensor size. Releasing tensor."),this.releaseTensor()}this.activeUpload?this.activeUpload.set(t):this.activeUpload=new Uint8Array(t)}async download(e){var t,r;if(this.activeUpload){let i=(t=this.wrapper)!=null&&t.isDataConverted?Ci(this.activeUpload,(r=this.wrapper)==null?void 0:r.type):this.activeUpload;if(e){e instanceof ArrayBuffer?new Uint8Array(e).set(i):new Uint8Array(e.buffer,e.byteOffset,e.byteLength).set(i);return}else return i.buffer}if(!this.wrapper)throw new Error("Tensor has not been created.");return e?this.wrapper.read(e):this.wrapper.read()}},xo=class{constructor(e){this.backend=e,this.tensorTrackersById=new Map,this.freeTensors=[],this.externalTensors=new Set}getMLContext(e){let t=this.backend.getMLContext(e);if(!t)throw new Error("MLContext not found for session.");return t}getMLOpSupportLimits(e){return this.backend.getMLOpSupportLimits(e)}reserveTensorId(){let e=Ai();return this.tensorTrackersById.set(e,new Bi(this)),e}releaseTensorId(e){let t=this.tensorTrackersById.get(e);t&&(this.tensorTrackersById.delete(e),t.tensorWrapper&&this.releaseTensor(t.tensorWrapper))}async ensureTensor(e,t,r,i,a){de("verbose",()=>`[WebNN] TensorManager.ensureTensor {tensorId: ${t}, dataType: ${r}, shape: ${i}, copyOld: ${a}}`);let n=this.tensorTrackersById.get(t);if(!n)throw new Error("Tensor not found.");return n.ensureTensor(e,r,i,a)}upload(e,t){let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");r.upload(t)}async download(e,t){de("verbose",()=>`[WebNN] TensorManager.download {tensorId: ${e}, dstBuffer: ${t==null?void 0:t.byteLength}}`);let r=this.tensorTrackersById.get(e);if(!r)throw new Error("Tensor not found.");return r.download(t)}releaseTensorsForSession(e){for(let t of this.freeTensors)t.sessionId===e&&t.destroy();this.freeTensors=this.freeTensors.filter(t=>t.sessionId!==e)}registerTensor(e,t,r,i){let a=this.getMLContext(e),n=Ai(),s=new Ri({sessionId:e,context:a,tensor:t,dataType:r,shape:i});return this.tensorTrackersById.set(n,new Bi(this,s)),this.externalTensors.add(s),n}async getCachedTensor(e,t,r,i,a,n,s){let u=this.getMLContext(e);for(let[p,h]of this.freeTensors.entries())if(h.canReuseTensor(u,t,r)){de("verbose",()=>`[WebNN] Reusing tensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}`);let f=this.freeTensors.splice(p,1)[0];return f.sessionId=e,f}de("verbose",()=>`[WebNN] MLContext.createTensor {dataType: ${t}, ${s?`fallbackDataType: ${s},`:""} shape: ${r}}`);let d=await u.createTensor({dataType:s??t,shape:r,dimensions:r,usage:i,writable:a,readable:n});return new Ri({sessionId:e,context:u,tensor:d,dataType:t,shape:r,fallbackDataType:s})}releaseTensor(e){this.externalTensors.has(e)&&this.externalTensors.delete(e),this.freeTensors.push(e)}},fp=(...e)=>new xo(...e)}),Yt,So,mp,Jg=q(()=>{te(),Ot(),hp(),Xg(),it(),Yt=new Map([[1,"float32"],[10,"float16"],[6,"int32"],[12,"uint32"],[7,"int64"],[13,"uint64"],[22,"int4"],[21,"uint4"],[3,"int8"],[2,"uint8"],[9,"uint8"]]),So=(e,t)=>{if(e===t)return!0;if(e===void 0||t===void 0)return!1;let r=Object.keys(e).sort(),i=Object.keys(t).sort();return r.length===i.length&&r.every((a,n)=>a===i[n]&&e[a]===t[a])},mp=class{constructor(e){this.tensorManager=fp(this),this.mlContextBySessionId=new Map,this.sessionIdsByMLContext=new Map,this.mlContextCache=[],this.sessionGraphInputs=new Map,this.sessionGraphOutputs=new Map,this.temporaryGraphInputs=[],this.temporaryGraphOutputs=[],this.temporarySessionTensorIds=new Map,this.mlOpSupportLimitsBySessionId=new Map,Pa(e.logLevel,!!e.debug)}get currentSessionId(){if(this.activeSessionId===void 0)throw new Error("No active session");return this.activeSessionId}onRunStart(e){de("verbose",()=>`[WebNN] onRunStart {sessionId: ${e}}`),this.activeSessionId=e}onRunEnd(e){de("verbose",()=>`[WebNN] onRunEnd {sessionId: ${e}}`);let t=this.temporarySessionTensorIds.get(e);if(t){for(let r of t)de("verbose",()=>`[WebNN] releasing temporary tensor {tensorId: ${r}}`),this.tensorManager.releaseTensorId(r);this.temporarySessionTensorIds.delete(e),this.activeSessionId=void 0}}async createMLContext(e){if(e instanceof GPUDevice){let r=this.mlContextCache.findIndex(i=>i.gpuDevice===e);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext(e);return this.mlContextCache.push({gpuDevice:e,mlContext:i}),i}}else if(e===void 0){let r=this.mlContextCache.findIndex(i=>i.options===void 0&&i.gpuDevice===void 0);if(r!==-1)return this.mlContextCache[r].mlContext;{let i=await navigator.ml.createContext();return this.mlContextCache.push({mlContext:i}),i}}let t=this.mlContextCache.findIndex(r=>So(r.options,e));if(t!==-1)return this.mlContextCache[t].mlContext;{let r=await navigator.ml.createContext(e);return this.mlContextCache.push({options:e,mlContext:r}),r}}registerMLContext(e,t){this.mlContextBySessionId.set(e,t);let r=this.sessionIdsByMLContext.get(t);r||(r=new Set,this.sessionIdsByMLContext.set(t,r)),r.add(e),this.mlOpSupportLimitsBySessionId.has(e)||this.mlOpSupportLimitsBySessionId.set(e,t.opSupportLimits()),this.temporaryGraphInputs.length>0&&(this.sessionGraphInputs.set(e,this.temporaryGraphInputs),this.temporaryGraphInputs=[]),this.temporaryGraphOutputs.length>0&&(this.sessionGraphOutputs.set(e,this.temporaryGraphOutputs),this.temporaryGraphOutputs=[])}onReleaseSession(e){this.sessionGraphInputs.delete(e),this.sessionGraphOutputs.delete(e);let t=this.mlContextBySessionId.get(e);if(!t)return;this.tensorManager.releaseTensorsForSession(e),this.mlContextBySessionId.delete(e),this.mlOpSupportLimitsBySessionId.delete(e);let r=this.sessionIdsByMLContext.get(t);if(r.delete(e),r.size===0){this.sessionIdsByMLContext.delete(t);let i=this.mlContextCache.findIndex(a=>a.mlContext===t);i!==-1&&this.mlContextCache.splice(i,1)}}getMLContext(e){return this.mlContextBySessionId.get(e)}getMLOpSupportLimits(e){return this.mlOpSupportLimitsBySessionId.get(e)}reserveTensorId(){return this.tensorManager.reserveTensorId()}releaseTensorId(e){de("verbose",()=>`[WebNN] releaseTensorId {tensorId: ${e}}`),this.tensorManager.releaseTensorId(e)}async ensureTensor(e,t,r,i,a){let n=Yt.get(r);if(!n)throw new Error(`Unsupported ONNX data type: ${r}`);return this.tensorManager.ensureTensor(e??this.currentSessionId,t,n,i,a)}async createTemporaryTensor(e,t,r){de("verbose",()=>`[WebNN] createTemporaryTensor {onnxDataType: ${t}, shape: ${r}}`);let i=Yt.get(t);if(!i)throw new Error(`Unsupported ONNX data type: ${t}`);let a=this.tensorManager.reserveTensorId();await this.tensorManager.ensureTensor(e,a,i,r,!1);let n=this.temporarySessionTensorIds.get(e);return n?n.push(a):this.temporarySessionTensorIds.set(e,[a]),a}uploadTensor(e,t){if(!ye().shouldTransferToMLTensor)throw new Error("Trying to upload to a MLTensor while shouldTransferToMLTensor is false");de("verbose",()=>`[WebNN] uploadTensor {tensorId: ${e}, data: ${t.byteLength}}`),this.tensorManager.upload(e,t)}async downloadTensor(e,t){return this.tensorManager.download(e,t)}createMLTensorDownloader(e,t){return async()=>{let r=await this.tensorManager.download(e);return qa(r,t)}}registerMLTensor(e,t,r,i){let a=Yt.get(r);if(!a)throw new Error(`Unsupported ONNX data type: ${r}`);let n=this.tensorManager.registerTensor(e,t,a,i);return de("verbose",()=>`[WebNN] registerMLTensor {tensor: ${t}, dataType: ${a}, dimensions: ${i}} -> {tensorId: ${n}}`),n}registerMLConstant(e,t,r,i,a,n,s=!1){if(!n)throw new Error("External mounted files are not available.");let u=e;e.startsWith("./")&&(u=e.substring(2));let d=n.get(u);if(!d)throw new Error(`File with name ${u} not found in preloaded files.`);if(t+r>d.byteLength)throw new Error("Out of bounds: data offset and length exceed the external file data size.");let p=d.slice(t,t+r).buffer,h;switch(a.dataType){case"float32":h=new Float32Array(p);break;case"float16":h=typeof Float16Array<"u"&&Float16Array.from?new Float16Array(p):new Uint16Array(p);break;case"int32":h=new Int32Array(p);break;case"uint32":h=new Uint32Array(p);break;case"int64":if(s){let f=ga(new Uint8Array(p),"int64");h=new Int32Array(f.buffer),a.dataType="int32"}else h=new BigInt64Array(p);break;case"uint64":h=new BigUint64Array(p);break;case"int8":h=new Int8Array(p);break;case"int4":case"uint4":case"uint8":h=new Uint8Array(p);break;default:throw new Error(`Unsupported data type: ${a.dataType} in creating WebNN Constant from external data.`)}return de("verbose",()=>`[WebNN] registerMLConstant {dataType: ${a.dataType}, shape: ${a.shape}}} ${s?"(Note: it was int64 data type and registered to int32 as workaround)":""}`),i.constant(a,h)}registerGraphInput(e){this.temporaryGraphInputs.push(e)}registerGraphOutput(e){this.temporaryGraphOutputs.push(e)}isGraphInput(e,t){let r=this.sessionGraphInputs.get(e);return r?r.includes(t):!1}isGraphOutput(e,t){let r=this.sessionGraphOutputs.get(e);return r?r.includes(t):!1}isGraphInputOutputTypeSupported(e,t,r=!0){let i=Yt.get(Tt(t)),a=this.mlOpSupportLimitsBySessionId.get(e);return typeof i>"u"?!1:r?!!(a!=null&&a.input.dataTypes.includes(i)):!!(a!=null&&a.output.dataTypes.includes(i))}flush(){}}}),Wa=q(()=>{}),Ni,zr,Cr,To,ko,Mi,ya,Io,gp,ey=q(()=>{it(),Wa(),Ni=new Map([[64,250],[128,200],[256,200],[512,200],[2048,230],[4096,200],[8192,50],[16384,50],[32768,50],[65536,50],[131072,50],[262144,50],[524288,50],[1048576,50],[2097152,30],[4194304,20],[8388608,10],[12582912,10],[16777216,10],[26214400,15],[33554432,22],[44236800,2],[58982400,6],[67108864,6],[134217728,6],[167772160,6]]),zr=[],Cr=e=>Math.ceil(Number(e)/16)*16,To=e=>{for(let t=0;t<zr.length;t++){let r=zr[t];if(e<=r)return r}return Math.ceil(e/16)*16},ko=1,Mi=()=>ko++,ya=async(e,t,r,i)=>{let a=Cr(r),n=e.device.createBuffer({size:a,usage:GPUBufferUsage.COPY_DST|GPUBufferUsage.MAP_READ});try{let s=e.getCommandEncoder();e.endComputePass(),s.copyBufferToBuffer(t,0,n,0,a),e.flush(),await n.mapAsync(GPUMapMode.READ);let u=n.getMappedRange();if(i){let d=i();return d.set(new Uint8Array(u,0,r)),d}else return new Uint8Array(u.slice(0,r))}finally{n.destroy()}},Io=class{constructor(e){this.backend=e,this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.buffersPending=[],this.capturedPendingBuffers=new Map;for(let[t]of Ni)zr.push(t),this.freeBuffers.set(t,[]),this.freeUniformBuffers.set(t,[]);this.sessionCount=0}upload(e,t){let r=t.buffer,i=t.byteOffset,a=t.byteLength,n=Cr(a),s=this.storageCache.get(e);if(!s)throw new Error("gpu data for uploading does not exist");if(Number(s.originalSize)!==a)throw new Error(`inconsistent data size. gpu data size=${s.originalSize}, data size=${a}`);let u=this.backend.device.createBuffer({mappedAtCreation:!0,size:n,usage:GPUBufferUsage.MAP_WRITE|GPUBufferUsage.COPY_SRC}),d=u.getMappedRange();new Uint8Array(d).set(new Uint8Array(r,i,a)),u.unmap();let p=this.backend.device.createCommandEncoder();p.copyBufferToBuffer(u,0,s.gpuData.buffer,0,n),this.backend.device.queue.submit([p.finish()]),u.destroy(),de("verbose",()=>`[WebGPU] GpuDataManager.upload(id=${e})`)}memcpy(e,t){let r=this.storageCache.get(e);if(!r)throw new Error("source gpu data for memcpy does not exist");let i=this.storageCache.get(t);if(!i)throw new Error("destination gpu data for memcpy does not exist");if(r.originalSize!==i.originalSize)throw new Error("inconsistent source and destination gpu data size");let a=Cr(r.originalSize),n=this.backend.getCommandEncoder();this.backend.endComputePass(),n.copyBufferToBuffer(r.gpuData.buffer,0,i.gpuData.buffer,0,a)}registerExternalBuffer(e,t,r){let i;if(r){if(i=r[0],e===r[1])return de("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, buffer is the same, skip.`),i;if(this.backend.capturedCommandList.has(this.backend.currentSessionId))throw new Error(`Registering a different external buffer under graph capture mode is not supported yet.
             Please use the previous external buffer!`)}else i=Mi();return this.storageCache.set(i,{gpuData:{id:i,type:0,buffer:e},originalSize:t}),de("verbose",()=>`[WebGPU] GpuDataManager.registerExternalBuffer(size=${t}) => id=${i}, registered.`),i}unregisterExternalBuffer(e){e!==void 0&&(this.storageCache.delete(e),de("verbose",()=>`[WebGPU] GpuDataManager.unregisterExternalBuffer() => id=${e}`))}create(e,t=GPUBufferUsage.STORAGE|GPUBufferUsage.COPY_SRC|GPUBufferUsage.COPY_DST){let r=To(e),i,a=(t&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE,n=(t&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM;if(a||n){let u=(a?this.freeBuffers:this.freeUniformBuffers).get(r);u?u.length>0?i=u.pop():i=this.backend.device.createBuffer({size:r,usage:t}):i=this.backend.device.createBuffer({size:r,usage:t})}else i=this.backend.device.createBuffer({size:r,usage:t});let s={id:Mi(),type:0,buffer:i};return this.storageCache.set(s.id,{gpuData:s,originalSize:Number(e)}),de("verbose",()=>`[WebGPU] GpuDataManager.create(size=${e}) => id=${s.id}`),s}get(e){var t;return(t=this.storageCache.get(e))==null?void 0:t.gpuData}release(e){let t=typeof e=="bigint"?Number(e):e,r=this.storageCache.get(t);if(!r){if(this.storageCache.size===0)return 0;throw new Error("releasing data does not exist")}return de("verbose",()=>`[WebGPU] GpuDataManager.release(id=${t}), gpuDataId=${r.gpuData.id}`),this.storageCache.delete(t),this.buffersPending.push(r.gpuData.buffer),r.originalSize}async download(e,t){let r=this.storageCache.get(Number(e));if(!r)throw new Error("data does not exist");await ya(this.backend,r.gpuData.buffer,r.originalSize,t)}refreshPendingBuffers(){if(this.buffersPending.length!==0)if(this.backend.sessionStatus==="default"){for(let e of this.buffersPending){let t=Ni.get(e.size);if((e.usage&GPUBufferUsage.STORAGE)===GPUBufferUsage.STORAGE){let r=this.freeBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else if((e.usage&GPUBufferUsage.UNIFORM)===GPUBufferUsage.UNIFORM){let r=this.freeUniformBuffers.get(e.size)||[];t===void 0||r.length>=t?e.destroy():r.push(e)}else e.destroy()}this.buffersPending=[]}else{let e=this.capturedPendingBuffers.get(this.backend.currentSessionId);e||(e=[],this.capturedPendingBuffers.set(this.backend.currentSessionId,e));for(let t of this.buffersPending)e.push(t);this.buffersPending=[]}}dispose(){this.freeBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.freeUniformBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache.forEach(e=>{e.gpuData.buffer.destroy()}),this.capturedPendingBuffers.forEach(e=>{e.forEach(t=>{t.destroy()})}),this.storageCache=new Map,this.freeBuffers=new Map,this.freeUniformBuffers=new Map,this.capturedPendingBuffers=new Map}onCreateSession(){this.sessionCount+=1}onReleaseSession(e){let t=this.capturedPendingBuffers.get(e);t&&(t.forEach(r=>{r.destroy()}),this.capturedPendingBuffers.delete(e)),this.sessionCount-=1,this.sessionCount===0&&(de("warning",()=>"[WebGPU] Clearing webgpu buffer cache"),this.storageCache.forEach(r=>{r.gpuData.buffer.destroy()}),this.storageCache=new Map)}},gp=(...e)=>new Io(...e)}),Eo,he,xe=q(()=>{Eo=class{constructor(e){Object.assign(this,e)}get cacheKey(){return this.key||(this.key=Object.getOwnPropertyNames(this).sort().map(e=>`${this[e]}`).join(";")),this.key}},he=e=>new Eo(e)}),qt,Ar,Te,Ee,Y,ve,_a,Ut,mt,Z,Xt,N,K,yp,La,zo,_p,ae=q(()=>{te(),ie(),qt=64,Ar=(e,t)=>{if(t===3)throw new Error("vec3 has same alignment as vec4, use vec4 instead");switch(Number(e)){case 10:return t>1?`vec${t}<f16>`:"f16";case 1:return t>1?`vec${t}<f32>`:"f32";case 6:return t>1?`vec${t}<i32>`:"i32";case 12:return t>1?`vec${t}<u32>`:"u32";case 7:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","i32"];case 13:if(t>1)throw new Error("currently not supported vecX of uint64 yet");return["vec2<u32>","u32"];case 9:if(t!==4)throw new Error("bool must be vec4");return["u32","vec4<bool>"];case 22:return"i32";case 21:return"u32";default:throw new Error(`Unknown data type: ${e}`)}},Te=(e,t=1)=>{let r=Ar(e,t);return typeof r=="string"?r:r[0]},Ee=(e,t=1)=>{let r=Ar(e,t);return typeof r=="string"?r:r[1]},Y=(...e)=>{let t=[];return e.forEach(r=>{r.length!==0&&t.push({type:12,data:r},{type:12,data:O.computeStrides(r)})}),t},ve=e=>e%4===0?4:e%2===0?2:1,_a=(e="f32",t,r="0")=>!t||t===1?`${e}(${r})`:`vec${t}<${e}>(${r})`,Ut=(e,t,r)=>e==="f32"?r:t===1?`f32(${r})`:`vec${t}<f32>(${r})`,mt=(e,t)=>t===4?`(${e}.x + ${e}.y + ${e}.z + ${e}.w)`:t===2?`(${e}.x + ${e}.y)`:t===3?`(${e}.x + ${e}.y + ${e}.z)`:e,Z=(e,t,r,i)=>e.startsWith("uniforms.")&&r>4?typeof t=="string"?i==="f16"?`${e}[(${t}) / 8][(${t}) % 8 / 4][(${t}) % 8 % 4]`:`${e}[(${t}) / 4][(${t}) % 4]`:i==="f16"?`${e}[${Math.floor(t/8)}][${Math.floor(t%8/4)}][${t%8%4}]`:`${e}[${Math.floor(t/4)}][${t%4}]`:r>1?`${e}[${t}]`:e,Xt=(e,t,r,i,a)=>{let n=typeof r=="number",s=n?r:r.length,u=[...new Array(s).keys()],d=s<2?"u32":s<=4?`vec${s}<u32>`:`array<u32, ${s}>`,p=Ar(t,a),h=typeof p=="string"?p:p[1],f=typeof p=="string"?p:p[0],g={indices:d,value:h,storage:f,tensor:t},y=U=>typeof U=="string"?U:`${U}u`,_={offsetToIndices:!1,indicesToOffset:!1,broadcastedIndicesToOffset:!1,set:!1,setByIndices:!1,get:!1,getByIndices:!1},w=n?"uniforms.":"",S=`${w}${e}_shape`,x=`${w}${e}_strides`,b="";for(let U=0;U<s-1;U++)b+=`
    let dim${U} = current / ${Z(x,U,s)};
    let rest${U} = current % ${Z(x,U,s)};
    indices[${U}] = dim${U};
    current = rest${U};
    `;b+=`indices[${s-1}] = current;`;let I=s<2?"":`
  fn o2i_${e}(offset: u32) -> ${g.indices} {
    var indices: ${g.indices};
    var current = offset;
    ${b}
    return indices;
  }`,k=U=>(_.offsetToIndices=!0,s<2?U:`o2i_${e}(${U})`),E=[];if(s>=2)for(let U=s-1;U>=0;U--)E.push(`${Z(x,U,s)} * (indices[${U}])`);let C=s<2?"":`
  fn i2o_${e}(indices: ${g.indices}) -> u32 {
    return ${E.join("+")};
  }`,A=U=>(_.indicesToOffset=!0,s<2?U:`i2o_${e}(${U})`),v=(...U)=>s===0?"0u":`${g.indices}(${U.map(y).join(",")})`,M=(U,P)=>s<2?`${U}`:`${Z(U,P,s)}`,D=(U,P,J)=>s<2?`${U}=${J};`:`${Z(U,P,s)}=${J};`,H={},G=(U,P)=>{_.broadcastedIndicesToOffset=!0;let J=`${P.name}broadcastedIndicesTo${e}Offset`;if(J in H)return`${J}(${U})`;let ee=[];for(let be=s-1;be>=0;be--){let at=P.indicesGet("outputIndices",be+P.rank-s);ee.push(`${M(x,be)} * (${at} % ${M(S,be)})`)}return H[J]=`fn ${J}(outputIndices: ${P.type.indices}) -> u32 {
             return ${ee.length>0?ee.join("+"):"0u"};
           }`,`${J}(${U})`},Q=(U,P)=>(()=>{if(g.storage===g.value)return`${e}[${U}]=${P};`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`${e}[${U}]=vec2<u32>(u32(${P}), select(0u, 0xFFFFFFFFu, ${P} < 0));`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`${e}[${U}]=vec2<u32>(u32(${P}), 0u);`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`${e}[${U}]=dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(${P}));`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),R=U=>(()=>{if(g.storage===g.value)return`${e}[${U}]`;if(g.storage==="vec2<u32>"&&g.value==="i32")return`i32(${e}[${U}].x)`;if(g.storage==="vec2<u32>"&&g.value==="u32")return`u32(${e}[${U}].x)`;if(g.storage==="u32"&&g.value==="vec4<bool>")return`vec4<bool>(bool(${e}[${U}] & 0xFFu), bool(${e}[${U}] & 0xFF00u), bool(${e}[${U}] & 0xFF0000u), bool(${e}[${U}] & 0xFF000000u))`;throw new Error(`not supported combination of storage type ${g.storage} and value type ${g.value} yet`)})(),j=s<2?"":`
  fn get_${e}ByIndices(indices: ${g.indices}) -> ${h} {
    return ${R(`i2o_${e}(indices)`)};
  }`,F=s<2?"":(()=>{let U=u.map(J=>`d${J}: u32`).join(", "),P=u.map(J=>`d${J}`).join(", ");return`
  fn get_${e}(${U}) -> ${h} {
    return get_${e}ByIndices(${v(P)});
  }`})(),X=(...U)=>{if(U.length!==s)throw new Error(`indices length must be ${s}`);let P=U.map(y).join(",");return s===0?R("0u"):s===1?R(P[0]):(_.get=!0,_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}(${P})`)},le=U=>s<2?R(U):(_.getByIndices=!0,_.indicesToOffset=!0,`get_${e}ByIndices(${U})`),W=s<2?"":`
  fn set_${e}ByIndices(indices: ${g.indices}, value: ${h}) {
    ${Q(`i2o_${e}(indices)`,"value")}
  }`,me=s<2?"":(()=>{let U=u.map(J=>`d${J}: u32`).join(", "),P=u.map(J=>`d${J}`).join(", ");return`
  fn set_${e}(${U}, value: ${h}) {
    set_${e}ByIndices(${v(P)}, value);
  }`})();return{impl:()=>{let U=[],P=!1;return _.offsetToIndices&&(U.push(I),P=!0),_.indicesToOffset&&(U.push(C),P=!0),_.broadcastedIndicesToOffset&&(Object.values(H).forEach(J=>U.push(J)),P=!0),_.set&&(U.push(me),P=!0),_.setByIndices&&(U.push(W),P=!0),_.get&&(U.push(F),P=!0),_.getByIndices&&(U.push(j),P=!0),!n&&P&&U.unshift(`const ${S} = ${g.indices}(${r.join(",")});`,`const ${x} = ${g.indices}(${O.computeStrides(r).join(",")});`),U.join(`
`)},type:g,offsetToIndices:k,indicesToOffset:A,broadcastedIndicesToOffset:G,indices:v,indicesGet:M,indicesSet:D,set:(...U)=>{if(U.length!==s+1)throw new Error(`indices length must be ${s}`);let P=U[s];if(typeof P!="string")throw new Error("value must be string");let J=U.slice(0,s).map(y).join(",");return s===0?Q("0u",P):s===1?Q(J[0],P):(_.set=!0,_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}(${J}, ${P})`)},setByOffset:Q,setByIndices:(U,P)=>s<2?Q(U,P):(_.setByIndices=!0,_.indicesToOffset=!0,`set_${e}ByIndices(${U}, ${P});`),get:X,getByOffset:R,getByIndices:le,usage:i,name:e,strides:x,shape:S,rank:s}},N=(e,t,r,i=1)=>Xt(e,t,r,"input",i),K=(e,t,r,i=1)=>Xt(e,t,r,"output",i),yp=(e,t,r)=>Xt(e,t,r,"atomicOutput",1),La=(e,t,r,i=1)=>Xt(e,t,r,"internal",i),zo=class{constructor(e,t){this.normalizedDispatchGroup=e,this.limits=t,this.internalVariables=[],this.variables=[],this.uniforms=[],this.variableIndex=0}guardAgainstOutOfBoundsWorkgroupSizes(e){return`if (global_idx >= ${typeof e=="number"?`${e}u`:e}) { return; }`}mainStart(e=qt){let t=typeof e=="number"?e:e[0],r=typeof e=="number"?1:e[1],i=typeof e=="number"?1:e[2];if(t>this.limits.maxComputeWorkgroupSizeX||r>this.limits.maxComputeWorkgroupSizeY||i>this.limits.maxComputeWorkgroupSizeZ)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup size [${this.limits.maxComputeWorkgroupSizeX}, ${this.limits.maxComputeWorkgroupSizeY}, ${this.limits.maxComputeWorkgroupSizeZ}].`);if(t*r*i>this.limits.maxComputeInvocationsPerWorkgroup)throw new Error(`workgroup size [${t}, ${r}, ${i}] exceeds the maximum workgroup invocations ${this.limits.maxComputeInvocationsPerWorkgroup}.`);let a=this.normalizedDispatchGroup[1]===1&&this.normalizedDispatchGroup[2]===1,n=a?`@builtin(global_invocation_id) global_id : vec3<u32>,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(local_invocation_id) local_id : vec3<u32>`:`@builtin(global_invocation_id) global_id : vec3<u32>,
                                             @builtin(local_invocation_id) local_id : vec3<u32>,
    @builtin(local_invocation_index) local_idx : u32,
    @builtin(workgroup_id) workgroup_id : vec3<u32>,
    @builtin(num_workgroups) num_workgroups : vec3<u32>`,s=a?`let global_idx = global_id.x;
         let workgroup_index = workgroup_id.x;`:`let workgroup_index = workgroup_id.z * num_workgroups[0] * num_workgroups[1] +
             workgroup_id.y * num_workgroups[0] + workgroup_id.x;
         let global_idx = workgroup_index * ${t*r*i}u + local_idx;`;return`@compute @workgroup_size(${t}, ${r}, ${i})
  fn main(${n}) {
    ${s}
  `}appendVariableUniforms(e){e.rank!==0&&(e.shape.startsWith("uniforms.")&&this.uniforms.push({name:e.shape.replace("uniforms.",""),type:"u32",length:e.rank}),e.strides.startsWith("uniforms.")&&this.uniforms.push({name:e.strides.replace("uniforms.",""),type:"u32",length:e.rank}))}declareVariable(e,t){if(e.usage==="internal")throw new Error("cannot use internal variable with declareVariable(). use registerInternalVariables() instead.");this.variables.push(e),this.appendVariableUniforms(e);let r=e.usage==="input"?"read":"read_write",i=e.usage==="atomicOutput"?"atomic<i32>":e.type.storage;return`@group(0) @binding(${t}) var<storage, ${r}> ${e.name}: array<${i}>;`}declareVariables(...e){return e.map(t=>this.declareVariable(t,this.variableIndex++)).join(`
`)}registerInternalVariable(e){if(e.usage!=="internal")throw new Error("cannot use input or output variable with registerInternalVariable(). use declareVariables() instead.");this.internalVariables.push(e),this.appendVariableUniforms(e)}registerInternalVariables(...e){return e.forEach(t=>this.registerInternalVariable(t)),this}registerUniform(e,t,r=1){return this.uniforms.push({name:e,type:t,length:r}),this}registerUniforms(e){return this.uniforms=this.uniforms.concat(e),this}uniformDeclaration(){if(this.uniforms.length===0)return"";let e=[];for(let{name:t,type:r,length:i}of this.uniforms)if(i&&i>4)r==="f16"?e.push(`@align(16) ${t}:array<mat2x4<${r}>, ${Math.ceil(i/8)}>`):e.push(`${t}:array<vec4<${r}>, ${Math.ceil(i/4)}>`);else{let a=i==null||i===1?r:`vec${i}<${r}>`;e.push(`${t}:${a}`)}return`
      struct Uniforms { ${e.join(", ")} };
      @group(0) @binding(${this.variableIndex}) var<uniform> uniforms: Uniforms;`}get additionalImplementations(){return this.uniformDeclaration()+this.variables.map(e=>e.impl()).join(`
`)+this.internalVariables.map(e=>e.impl()).join(`
`)}get variablesInfo(){if(this.uniforms.length===0)return;let e=t=>[12,10,1,6][["u32","f16","f32","i32"].indexOf(t)];return this.uniforms.map(t=>[e(t.type),t.length??1])}},_p=(e,t)=>new zo(e,t)}),Co,Di,Ao,Oo,Ro,Bo,Me,wp,bp,gt=q(()=>{te(),ie(),xe(),ae(),Co=(e,t)=>{if(!e||e.length!==1)throw new Error("Transpose requires 1 input.");if(t.length!==0&&t.length!==e[0].dims.length)throw new Error(`perm size ${t.length} does not match input rank ${e[0].dims.length}`)},Di=(e,t)=>t.length!==0?t:[...new Array(e).keys()].reverse(),Ao=(e,t)=>O.sortBasedOnPerm(e,Di(e.length,t)),Oo=(e,t,r,i)=>{let a=`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`;for(let n=0;n<t;++n)a+=`a[${e[n]}]=i[${n}];`;return a+="return a;}"},Ro=(e,t)=>{let r=[],i=[];for(let a=0;a<e.length;++a)e[a]!==1&&r.push(e[a]),e[t[a]]!==1&&i.push(t[a]);return{newShape:r,newPerm:i}},Bo=(e,t)=>{let r=0;for(let i=0;i<e.length;++i)if(t[e[i]]!==1){if(e[i]<r)return!1;r=e[i]}return!0},Me=(e,t)=>{let r=e.dataType,i=e.dims.length,a=Di(i,t),n=Ao(e.dims,a),s=e.dims,u=n,d=i<2||Bo(a,e.dims),p;if(d)return p=_=>{let w=N("input",r,s,4),S=K("output",r,u,4);return`
  ${_.registerUniform("output_size","u32").declareVariables(w,S)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    output[global_idx] = input[global_idx];
  }`},{name:"TransposeCopy",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let _=O.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64/4)},programUniforms:[{type:12,data:Math.ceil(_/4)}]}},getShaderSource:p};let{newShape:h,newPerm:f}=Ro(e.dims,a),g=O.areEqual(f,[2,3,1]),y=O.areEqual(f,[3,1,2]);if(h.length===2||g||y){s=g?[h[0],h[1]*h[2]]:y?[h[0]*h[1],h[2]]:h,u=[s[1],s[0]];let _=16;return p=w=>{let S=N("a",r,s.length),x=K("output",r,u.length);return`
  ${w.registerUniform("output_size","u32").declareVariables(S,x)}
  var<workgroup> tile : array<array<${x.type.value}, ${_+1}>, ${_}>;
  ${w.mainStart([_,_,1])}
    let stride = (uniforms.output_shape[1] - 1) / ${_} + 1;
    let workgroup_id_x = workgroup_index % stride;
    let workgroup_id_y = workgroup_index / stride;
    let input_col = workgroup_id_y * ${_}u + local_id.x;
    let input_row = workgroup_id_x * ${_}u + local_id.y;
    if (input_row < uniforms.a_shape[0] && input_col < uniforms.a_shape[1]) {
      tile[local_id.y][local_id.x] = ${S.getByIndices(`${S.type.indices}(input_row, input_col)`)};
    }
    workgroupBarrier();

    let output_col = workgroup_id_x * ${_}u + local_id.x;
    let output_row = workgroup_id_y * ${_}u + local_id.y;
    if (output_row < uniforms.output_shape[0] && output_col < uniforms.output_shape[1]) {
      ${x.setByIndices(`${x.type.indices}(output_row, output_col)`,"tile[local_id.x][local_id.y]")}
    }
  }`},{name:"TransposeShared",shaderCache:{inputDependencies:["type"]},getRunData:()=>{let w=O.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(u[1]/_),y:Math.ceil(u[0]/_)},programUniforms:[{type:12,data:w},...Y(s,u)]}},getShaderSource:p}}return p=_=>{let w=N("a",r,s.length),S=K("output",r,u.length);return`
  ${_.registerUniform("output_size","u32").declareVariables(w,S)}

  ${Oo(a,i,w,S)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${S.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${S.setByOffset("global_idx",w.getByIndices("aIndices"))}
  }`},{name:"Transpose",shaderCache:{hint:`${t}`,inputDependencies:["rank"]},getRunData:()=>{let _=O.size(n);return{outputs:[{dims:n,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...Y(s,u)]}},getShaderSource:p}},wp=(e,t)=>{Co(e.inputs,t.perm),e.compute(Me(e.inputs[0],t.perm))},bp=e=>he({perm:e.perm})}),No,Mo,Do,Uo,Po,qo,Wo,Lo,Vo,Go,qe,$p,vp,xp,Sp,Tp,kp,Ip,Ep,zp,Cp,ty=q(()=>{te(),ie(),ae(),Va(),gt(),No={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate * candidate",logSumExp:"bestValue + exp(candidate)",l1:"bestValue + abs(candidate)",l2:"bestValue + candidate * candidate",logSum:"bestValue + candidate"},Mo={max:"select(bestValue, candidate, candidate > bestValue)",min:"select(bestValue, candidate, candidate < bestValue)",mean:"bestValue + candidate",sum:"bestValue + candidate",prod:"bestValue * candidate",sumSquare:"bestValue + candidate",logSumExp:"bestValue + candidate",l1:"bestValue + candidate",l2:"bestValue + candidate",logSum:"bestValue + candidate"},Do={max:"_A[offset]",min:"_A[offset]",mean:"0",sum:"0",prod:"1",sumSquare:"0",logSumExp:"0",l1:"0",l2:"0",logSum:"0"},Uo={max:"bestValue",min:"bestValue",sum:"bestValue",prod:"bestValue",sumSquare:"bestValue",logSumExp:"log(bestValue)",l1:"bestValue",l2:"sqrt(bestValue)",logSum:"log(bestValue)"},Po=(e,t)=>{let r=[];for(let i=t-e;i<t;++i)r.push(i);return r},qo=(e,t)=>{let r=[],i=e.length;for(let n=0;n<i;n++)t.indexOf(n)===-1&&r.push(e[n]);let a=t.map(n=>e[n]);return[r,a]},Wo=(e,t)=>{let r=e.length+t.length,i=[],a=0;for(let n=0;n<r;n++)t.indexOf(n)===-1?i.push(e[a++]):i.push(1);return i},Lo=(e,t)=>{for(let r=0;r<e.length;++r)if(e[e.length-r-1]!==t-1-r)return!1;return!0},Vo=(e,t)=>{let r=[];if(!Lo(e,t)){for(let i=0;i<t;++i)e.indexOf(i)===-1&&r.push(i);e.forEach(i=>r.push(i))}return r},Go=(e,t,r,i,a,n,s)=>{let u=r[0].dims,d=O.size(n),p=O.size(s),h=N("_A",r[0].dataType,u),f=K("output",a,n),g=64;d===1&&(g=256);let y=`
          var<workgroup> aBestValues : array<f32, ${g}>;
       `,_=w=>`
        ${w.registerUniform("reduceSize","u32").declareVariables(h,f)}
        ${y}
        fn DIV_CEIL(a : u32, b : u32) -> u32 {
          return ((a - 1u) / b + 1u);
         }
         ${w.mainStart(g)}

          let outputIndex = global_idx / ${g};
          let offset = outputIndex * uniforms.reduceSize;

          var bestValue = f32(${Do[i]});
          let Length = uniforms.reduceSize;
          for (var k = local_idx; k < Length; k = k + ${g}) {
           let candidate = f32(${h.getByOffset("offset + k")});
           bestValue = ${No[i]};
          }
          aBestValues[local_idx] = bestValue;
          workgroupBarrier();

         var reduceSize = min(Length, ${g}u);
         for (var currentSize = reduceSize / 2u; reduceSize > 1u;
             currentSize = reduceSize / 2u) {
           let interval = DIV_CEIL(reduceSize, 2u);
           if (local_idx < currentSize) {
            let candidate = aBestValues[local_idx + interval];
            bestValue = ${Mo[i]};
            aBestValues[local_idx] = bestValue;
           }
           reduceSize = interval;
           workgroupBarrier();
         }

         if (local_idx == 0u) {
          ${f.setByOffset("outputIndex",`${i==="mean"?`${f.type.storage}(bestValue / f32(uniforms.reduceSize))`:`${f.type.storage}(${Uo[i]})`}`)};
         }
        }`;return{name:e,shaderCache:{hint:`${t};${g}`,inputDependencies:["type"]},getShaderSource:_,getRunData:()=>({outputs:[{dims:n,dataType:a}],dispatchGroup:{x:d},programUniforms:[{type:12,data:p}]})}},qe=(e,t,r,i)=>{let a=e.inputs.length===1?r:wa(e.inputs,r),n=a.axes;n.length===0&&!a.noopWithEmptyAxes&&(n=e.inputs[0].dims.map((y,_)=>_));let s=O.normalizeAxes(n,e.inputs[0].dims.length),u=s,d=e.inputs[0],p=Vo(u,e.inputs[0].dims.length);p.length>0&&(d=e.compute(Me(e.inputs[0],p),{inputs:[0],outputs:[-1]})[0],u=Po(u.length,d.dims.length));let[h,f]=qo(d.dims,u),g=h;a.keepDims&&(g=Wo(h,s)),e.compute(Go(t,a.cacheKey,[d],i,e.inputs[0].dataType,g,f),{inputs:[d]})},$p=(e,t)=>{qe(e,"ReduceMeanShared",t,"mean")},vp=(e,t)=>{qe(e,"ReduceL1Shared",t,"l1")},xp=(e,t)=>{qe(e,"ReduceL2Shared",t,"l2")},Sp=(e,t)=>{qe(e,"ReduceLogSumExpShared",t,"logSumExp")},Tp=(e,t)=>{qe(e,"ReduceMaxShared",t,"max")},kp=(e,t)=>{qe(e,"ReduceMinShared",t,"min")},Ip=(e,t)=>{qe(e,"ReduceProdShared",t,"prod")},Ep=(e,t)=>{qe(e,"ReduceSumShared",t,"sum")},zp=(e,t)=>{qe(e,"ReduceSumSquareShared",t,"sumSquare")},Cp=(e,t)=>{qe(e,"ReduceLogSumShared",t,"logSum")}}),We,Ho,Hr,wa,Le,Fo,jo,Ko,Qo,Zo,Yo,Xo,Jo,eu,tu,Ve,Ap,Op,Rp,Bp,Np,Mp,Dp,Up,Pp,qp,Va=q(()=>{te(),ie(),xe(),ae(),ty(),We=e=>{if(!e||e.length===0||e.length>2)throw new Error("Reduce op requires 1 or 2 inputs.");if(e.length===2&&e[1].dims.length!==1)throw new Error("Invalid axes input dims.")},Ho=e=>["","",`var value = ${e.getByIndices("input_indices")};`,""],Hr=(e,t,r,i,a,n,s=!1,u=!1)=>{let d=[],p=r[0].dims,h=p.length,f=O.normalizeAxes(a,h),g=!u&&f.length===0;p.forEach((w,S)=>{g||f.indexOf(S)>=0?s&&d.push(1):d.push(w)});let y=d.length,_=O.size(d);return{name:e,shaderCache:t,getShaderSource:w=>{let S=[],x=N("_A",r[0].dataType,h),b=K("output",n,y),I=i(x,b,f),k=I[2];for(let E=0,C=0;E<h;E++)g||f.indexOf(E)>=0?(s&&C++,k=`for(var j${E}: u32 = 0; j${E} < ${p[E]}; j${E}++) {
                  ${I[2].includes("last_index")?`let last_index = j${E};`:""}
                  ${x.indicesSet("input_indices",E,`j${E}`)}
                  ${k}
                }`):(S.push(`${x.indicesSet("input_indices",E,b.indicesGet("output_indices",C))};`),C++);return`

        ${w.registerUniform("output_size","u32").declareVariables(x,b)}

        ${w.mainStart()}
          ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          var input_indices: ${x.type.indices};
          let output_indices = ${b.offsetToIndices("global_idx")};

          ${S.join(`
`)}
          ${I[0]}       // init ops for reduce max/min
          ${I[1]}
          ${k}
          ${I[3]}
          ${I.length===4?b.setByOffset("global_idx","value"):I.slice(4).join(`
`)}
        }`},getRunData:()=>({outputs:[{dims:d,dataType:n}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:[{type:12,data:_},...Y(p,d)]})}},wa=(e,t)=>{let r=[];return e[1].dims[0]>0&&e[1].getBigInt64Array().forEach(i=>r.push(Number(i))),he({axes:r,keepDims:t.keepDims,noopWithEmptyAxes:t.noopWithEmptyAxes})},Le=(e,t,r,i)=>{let a=e.inputs,n=a.length===1?r:wa(a,r);e.compute(Hr(t,{hint:n.cacheKey,inputDependencies:["rank"]},[a[0]],n.noopWithEmptyAxes&&n.axes.length===0?Ho:i,n.axes,a[0].dataType,n.keepDims,n.noopWithEmptyAxes),{inputs:[0]})},Fo=(e,t)=>{We(e.inputs),Le(e,"ReduceLogSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,"value = log(value);"])},jo=(e,t)=>{We(e.inputs),Le(e,"ReduceL1",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += abs(${r.getByIndices("input_indices")});`,""])},Ko=(e,t)=>{We(e.inputs),Le(e,"ReduceL2",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += (t * t);`,"value = sqrt(value);"])},Qo=(e,t)=>{We(e.inputs),Le(e,"ReduceLogSumExp",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += exp(${r.getByIndices("input_indices")});`,"value = log(value);"])},Zo=(e,t)=>{We(e.inputs),Le(e,"ReduceMax",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(r.indicesSet("input_indices",s,0));return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = max(value, ${r.getByIndices("input_indices")});`,""]})},Yo=(e,t)=>{We(e.inputs),Le(e,"ReduceMean",t,(r,i,a)=>{let n=1;for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&(n*=e.inputs[0].dims[s]);return["var sum = f32(0);","",`sum += f32(${r.getByIndices("input_indices")});`,`let value = ${i.type.value}(sum / ${n});`]})},Xo=(e,t)=>{We(e.inputs),Le(e,"ReduceMin",t,(r,i,a)=>{let n=[];for(let s=0;s<r.rank;s++)(a.indexOf(s)>=0||a.length===0)&&n.push(`input_indices[${s}] = 0;`);return[`${n.join(`
`)}`,`var value = ${r.getByIndices("input_indices")};`,`value = min(value, ${r.getByIndices("input_indices")});`,""]})},Jo=(e,t)=>{We(e.inputs),Le(e,"ReduceProd",t,(r,i)=>[`var value = ${i.type.storage}(1);`,"",`value *= ${r.getByIndices("input_indices")};`,""])},eu=(e,t)=>{We(e.inputs),Le(e,"ReduceSum",t,(r,i)=>[`var value = ${i.type.storage}(0);`,"",`value += ${r.getByIndices("input_indices")};`,""])},tu=(e,t)=>{We(e.inputs),Le(e,"ReduceSumSquare",t,(r,i)=>[`var t = ${i.type.value}(0); var value = ${i.type.value}(0);`,"",`t = ${r.getByIndices("input_indices")}; value += t * t;`,""])},Ve=(e,t,r)=>{if(t.length===0)return r;let i=1,a=1;for(let n=0;n<t.length;n++)t.indexOf(n)===-1?i*=e[n]:a*=e[n];return a<32&&i>1024},Ap=(e,t)=>{Ve(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Yo(e,t):$p(e,t)},Op=(e,t)=>{Ve(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?jo(e,t):vp(e,t)},Rp=(e,t)=>{Ve(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Ko(e,t):xp(e,t)},Bp=(e,t)=>{Ve(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Qo(e,t):Sp(e,t)},Np=(e,t)=>{Ve(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Zo(e,t):Tp(e,t)},Mp=(e,t)=>{Ve(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Xo(e,t):kp(e,t)},Dp=(e,t)=>{Ve(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Jo(e,t):Ip(e,t)},Up=(e,t)=>{Ve(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?eu(e,t):Ep(e,t)},Pp=(e,t)=>{Ve(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?tu(e,t):zp(e,t)},qp=(e,t)=>{Ve(e.inputs[0].dims,t.axes,t.noopWithEmptyAxes)?Fo(e,t):Cp(e,t)}}),Ui,Wp,Lp,ba,ry=q(()=>{te(),xe(),Va(),Ui=e=>{if(!e||e.length===0||e.length>2)throw new Error("ArgMinMaxOp op requires 1 or 2 inputs.");if(e[0].dataType!==1)throw new Error("Invalid input type.")},Wp=(e,t)=>{Ui(e.inputs);let r=(i,a,n)=>{let s=[];for(let u=0;u<i.rank;u++)(n.indexOf(u)>=0||n.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?"<=":"<"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Hr("ArgMin",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},Lp=(e,t)=>{Ui(e.inputs);let r=(i,a,n)=>{let s=[];for(let u=0;u<i.rank;u++)(n.indexOf(u)>=0||n.length===0)&&s.push(`input_indices[${u}] = 0;`);return[`${s.join(`
`)}`,`var value = ${i.getByIndices("input_indices")};
var best_index : i32 = 0;`,`if (${i.getByIndices("input_indices")} ${t.selectLastIndex>0?">=":">"} value) {
         value = ${i.getByIndices("input_indices")};
         best_index = i32(last_index);
       }`,"",a.setByOffset("global_idx","best_index")]};e.compute(Hr("argMax",{hint:t.cacheKey,inputDependencies:["rank"]},[e.inputs[0]],r,[t.axis],7,t.keepDims),{inputs:[0]})},ba=e=>he(e)}),ru,Or,iu,au,nu,pr,su,Vp,Ga=q(()=>{te(),ie(),Wa(),ae(),ru=(e,t)=>{let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4],u=e[5];if(s&&u)throw new Error("Attention cannot have both past and attention_bias");if(r.dims.length!==3)throw new Error('Input "input" must have 3 dimensions');let d=r.dims[0],p=r.dims[1],h=r.dims[2];if(a.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimensions');if(i.dims.length!==2)throw new Error('Input "weights" is expected to have 2 dimensions');if(i.dims[0]!==h)throw new Error("Input 1 dimension 0 should have same length as dimension 2 of input 0");if(a.dims[0]!==i.dims[1])throw new Error('Input "bias" dimension 0 should have same length as dimension 1 of input "weights"');let f=a.dims[0]/3,g=f,y=g;if(t.qkvHiddenSizes.length>0){if(t.qkvHiddenSizes.length!==3)throw new Error("qkv_hidden_sizes attribute should have 3 elements");for(let I of t.qkvHiddenSizes)if(I%t.numHeads!==0)throw new Error("qkv_hidden_sizes should be divisible by num_heads");f=t.qkvHiddenSizes[0],g=t.qkvHiddenSizes[1],y=t.qkvHiddenSizes[2]}let _=p;if(f!==g)throw new Error("qkv_hidden_sizes first element should be same as the second");if(a.dims[0]!==f+g+y)throw new Error('Input "bias" dimension 0 should have same length as sum of Q/K/V hidden sizes');let w=0;if(s){if(g!==y)throw new Error('Input "past" expect k_hidden_size == v_hidden_size');if(s.dims.length!==5)throw new Error('Input "past" must have 5 dimensions');if(s.dims[0]!==2)throw new Error('Input "past" first dimension must be 2');if(s.dims[1]!==d)throw new Error('Input "past" second dimension must be batch_size');if(s.dims[2]!==t.numHeads)throw new Error('Input "past" third dimension must be num_heads');if(s.dims[4]!==g/t.numHeads)throw new Error('Input "past" fifth dimension must be k_hidden_size / num_heads');t.pastPresentShareBuffer||(w=s.dims[3])}let S=_+w,x=-1,b=0;if(n)throw new Error("Mask not supported");if(s)throw new Error("past is not supported");if(u){if(u.dims.length!==4)throw new Error('Input "attention_bias" must have 4 dimensions');if(u.dims[0]!==d||u.dims[1]!==t.numHeads||u.dims[2]!==p||u.dims[3]!==S)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:d,sequenceLength:p,pastSequenceLength:w,kvSequenceLength:_,totalSequenceLength:S,maxSequenceLength:x,inputHiddenSize:h,hiddenSize:f,vHiddenSize:y,headSize:Math.floor(f/t.numHeads),vHeadSize:Math.floor(y/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:b,scale:t.scale,broadcastResPosBias:!1,passPastInKv:!1,qkvFormat:1}},Or=(e,t,r)=>t&&e?`
      let total_sequence_length_input = u32(${t.getByOffset("0")});
      let present_sequence_length = max(total_sequence_length_input, uniforms.past_sequence_length);
      let is_subsequent_prompt: bool = sequence_length > 1 && sequence_length != total_sequence_length_input;
      let is_first_prompt: bool = is_subsequent_prompt == false && sequence_length == total_sequence_length_input;
      total_sequence_length = u32(${e==null?void 0:e.getByOffset("batchIdx")}) + 1;
      var past_sequence_length: u32 = 0;
      if (is_first_prompt == false) {
        past_sequence_length = total_sequence_length - sequence_length;
      }
       `:`
    ${r?"let past_sequence_length = uniforms.past_sequence_length":""};
    let present_sequence_length = total_sequence_length;
    `,iu=(e,t,r,i,a,n,s,u)=>{let d=ve(s?1:n),p=64,h=n/d;h<p&&(p=32);let f=Math.ceil(n/d/p),g=[{type:12,data:t},{type:12,data:r},{type:12,data:i},{type:12,data:a},{type:12,data:h},{type:12,data:f}],y=Te(e.dataType,d),_=Ee(1,d),w=["type"];s&&w.push("type"),u&&w.push("type");let S=x=>{let b=K("x",e.dataType,e.dims,d),I=[b],k=s?N("seq_lens",s.dataType,s.dims):void 0;k&&I.push(k);let E=u?N("total_sequence_length_input",u.dataType,u.dims):void 0;E&&I.push(E);let C=Ee(e.dataType),A=[{name:"batch_size",type:"u32"},{name:"num_heads",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"sequence_length",type:"u32"},{name:"total_sequence_length",type:"u32"},{name:"elements_per_thread",type:"u32"}];return`
  var<workgroup> thread_max: array<f32, ${p}>;
  var<workgroup> thread_sum: array<f32, ${p}>;
  ${x.registerUniforms(A).declareVariables(...I)}
  ${x.mainStart([p,1,1])}
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let sequence_length = uniforms.sequence_length;
    var total_sequence_length = uniforms.total_sequence_length;
    ${Or(k,E,!1)}
    let local_offset = local_idx * uniforms.elements_per_thread;
    let offset = (global_idx / ${p}) * uniforms.total_sequence_length + local_offset;
    let seq_causal_length = ${s?"u32(past_sequence_length + workgroup_id.y + 1)":"total_sequence_length"};
    var thread_max_vector = ${_}(-3.4028234663852886e+38f);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      thread_max_vector = max(${_}(x[offset + i]), thread_max_vector);
    }
    thread_max[local_idx] = ${(()=>{switch(d){case 1:return"thread_max_vector";case 2:return"max(thread_max_vector.x, thread_max_vector.y)";case 4:return"max(max(thread_max_vector.x, thread_max_vector.y), max(thread_max_vector.z, thread_max_vector.w))";default:throw new Error(`Unsupported components: ${d}`)}})()};
    workgroupBarrier();

    var max_value =  f32(-3.4028234663852886e+38f);
    for (var i = 0u; i < ${p}; i++) {
      max_value = max(thread_max[i], max_value);
    }

    var sum_vector = ${_}(0);
    for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
      sum_vector += exp(${_}(x[offset + i]) - max_value);
    }
    thread_sum[local_idx] = ${(()=>{switch(d){case 1:return"sum_vector";case 2:return"sum_vector.x + sum_vector.y";case 4:return"sum_vector.x + sum_vector.y + sum_vector.z + sum_vector.w";default:throw new Error(`Unsupported components: ${d}`)}})()};
    workgroupBarrier();

    var sum: f32 = 0;
    for (var i = 0u; i < ${p}; i++) {
      sum += thread_sum[i];
    }

    if (sum == 0) {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        x[offset + i] = ${b.type.value}(${C}(1.0) / ${C}(seq_causal_length));
      }
    } else {
      for (var i: u32 = 0; i < uniforms.elements_per_thread && i + local_offset < seq_causal_length; i++) {
        var f32input = ${_}(x[offset + i]);
        x[offset + i] = ${b.type.value}(exp(f32input - max_value) / sum);
      }
    }
      ${s?`
        for (var total_seq_id: u32 = seq_causal_length; total_seq_id + local_offset < uniforms.total_sequence_length; total_seq_id++) {
          x[offset + total_seq_id] = ${b.type.value}(${C}(0));
        }`:""};
  }`};return{name:"AttentionProbsSoftmax",shaderCache:{hint:`${p};${y};${d}`,inputDependencies:w},getShaderSource:S,getRunData:()=>({outputs:[],dispatchGroup:{x:1,y:a,z:t*r},programUniforms:g})}},au=(e,t,r,i,a,n,s,u,d)=>{let p=s+n.kvSequenceLength,h=[n.batchSize,n.numHeads,n.sequenceLength,p],f=e>1&&i,g=n.kvNumHeads?n.kvNumHeads:n.numHeads,y=f?[n.batchSize,g,p,n.headSize]:void 0,_=n.nReps?n.nReps:1,w=n.scale===0?1/Math.sqrt(n.headSize):n.scale,S=ve(n.headSize),x=n.headSize/S,b=12,I={x:Math.ceil(p/b),y:Math.ceil(n.sequenceLength/b),z:n.batchSize*n.numHeads},k=[{type:12,data:n.sequenceLength},{type:12,data:x},{type:12,data:p},{type:12,data:n.numHeads},{type:12,data:n.headSize},{type:1,data:w},{type:12,data:s},{type:12,data:n.kvSequenceLength},{type:12,data:_}],E=f&&i&&O.size(i.dims)>0,C=["type","type"];E&&C.push("type"),a&&C.push("type"),u&&C.push("type"),d&&C.push("type");let A=[{dims:h,dataType:t.dataType,gpuDataType:0}];f&&A.push({dims:y,dataType:t.dataType,gpuDataType:0});let v=M=>{let D=N("q",t.dataType,t.dims,S),H=N("key",r.dataType,r.dims,S),G=[D,H];if(E){let W=N("past_key",i.dataType,i.dims,S);G.push(W)}a&&G.push(N("attention_bias",a.dataType,a.dims));let Q=u?N("seq_lens",u.dataType,u.dims):void 0;Q&&G.push(Q);let R=d?N("total_sequence_length_input",d.dataType,d.dims):void 0;R&&G.push(R);let j=K("output",t.dataType,h),F=[j];f&&F.push(K("present_key",t.dataType,y,S));let X=Ee(1,S),le=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"alpha",type:"f32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${b}u;

  var<workgroup> tileQ: array<${D.type.storage}, ${b*b}>;
  var<workgroup> tileK: array<${D.type.storage}, ${b*b}>;
  ${M.registerUniforms(le).declareVariables(...G,...F)}
  ${M.mainStart([b,b,1])}
    // x holds the N and y holds the M
    let headIdx = workgroup_id.z % uniforms.num_heads;
    let kvHeadIdx = ${_===1?"headIdx":"headIdx / uniforms.n_reps"};
    let kv_num_heads = ${_===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
    let batchIdx = workgroup_id.z / uniforms.num_heads;
    let m = workgroup_id.y * TILE_SIZE;
    let n = workgroup_id.x * TILE_SIZE;
    let sequence_length = uniforms.M;
    var total_sequence_length = uniforms.N;
    ${Or(Q,R,!0)}
    let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx;
    let qOffset = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
    ${E&&f?"let pastKeyOffset = absKvHeadIdx * uniforms.past_sequence_length * uniforms.K;":""};
    let kOffset = absKvHeadIdx * uniforms.kv_sequence_length * uniforms.K;
    ${f?"let presentKeyOffset = absKvHeadIdx * uniforms.N * uniforms.K;":""}
    var value = ${X}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (global_id.y < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = q[qOffset + local_id.y * uniforms.K + w + local_id.x];
      }
      if (n + local_id.y < uniforms.N && w + local_id.x < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
      ${E&&f?`
              if (n + local_id.y < past_sequence_length) {
                tileK[idx] = past_key[pastKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
              } else if (n + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
                tileK[idx] = key[kOffset + (n + local_id.y - past_sequence_length) * uniforms.K + w + local_id.x];
              }`:`
          if (n + local_id.y < uniforms.kv_sequence_length) {
            tileK[idx] = key[kOffset + (n + local_id.y) * uniforms.K + w + local_id.x];
          }`}
      ${f?`if (n + local_id.y < present_sequence_length) {
        present_key[presentKeyOffset + (n + local_id.y) * uniforms.K + w + local_id.x] = tileK[idx];
      }`:""}
      }
      workgroupBarrier();

      for (var k: u32 = 0u; k < TILE_SIZE && w+k < uniforms.K; k++) {
          value += ${X}(tileQ[TILE_SIZE * local_id.y + k] * tileK[TILE_SIZE * local_id.x + k]);
      }

      workgroupBarrier();
    }

    if (global_id.y < uniforms.M && global_id.x < total_sequence_length) {
      let headOffset = workgroup_id.z * uniforms.M * uniforms.N;
      let outputIdx = headOffset + global_id.y * uniforms.N + global_id.x;
      var sum: f32 = ${(()=>{switch(S){case 1:return"value";case 2:return"value.x + value.y";case 4:return"value.x + value.y + value.z + value.w";default:throw new Error(`Unsupported components: ${S}`)}})()};
        output[outputIdx] = ${j.type.value} (sum * uniforms.alpha) + ${a?"attention_bias[outputIdx]":"0.0"};
    }
  }`};return{name:"AttentionProbs",shaderCache:{hint:`${S};${a!==void 0};${i!==void 0};${e}`,inputDependencies:C},getRunData:()=>({outputs:A,dispatchGroup:I,programUniforms:k}),getShaderSource:v}},nu=(e,t,r,i,a,n,s=void 0,u=void 0)=>{let d=n+a.kvSequenceLength,p=a.nReps?a.nReps:1,h=a.vHiddenSize*p,f=e>1&&i,g=a.kvNumHeads?a.kvNumHeads:a.numHeads,y=f?[a.batchSize,g,d,a.headSize]:void 0,_=[a.batchSize,a.sequenceLength,h],w=12,S={x:Math.ceil(a.vHeadSize/w),y:Math.ceil(a.sequenceLength/w),z:a.batchSize*a.numHeads},x=[{type:12,data:a.sequenceLength},{type:12,data:d},{type:12,data:a.vHeadSize},{type:12,data:a.numHeads},{type:12,data:a.headSize},{type:12,data:h},{type:12,data:n},{type:12,data:a.kvSequenceLength},{type:12,data:p}],b=f&&i&&O.size(i.dims)>0,I=["type","type"];b&&I.push("type"),s&&I.push("type"),u&&I.push("type");let k=[{dims:_,dataType:t.dataType,gpuDataType:0}];f&&k.push({dims:y,dataType:t.dataType,gpuDataType:0});let E=C=>{let A=N("probs",t.dataType,t.dims),v=N("v",r.dataType,r.dims),M=[A,v];b&&M.push(N("past_value",i.dataType,i.dims));let D=s?N("seq_lens",s.dataType,s.dims):void 0;s&&M.push(D);let H=u?N("total_sequence_length_input",u.dataType,u.dims):void 0;u&&M.push(H);let G=[K("output",t.dataType,_)];f&&G.push(K("present_value",t.dataType,y));let Q=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"v_hidden_size",type:"u32"},{name:"past_sequence_length",type:"u32"},{name:"kv_sequence_length",type:"u32"},{name:"n_reps",type:"u32"}];return`
  const TILE_SIZE = ${w}u;
  var<workgroup> tileQ: array<${A.type.value}, ${w*w}>;
  var<workgroup> tileV: array<${A.type.value}, ${w*w}>;
  ${C.registerUniforms(Q).declareVariables(...M,...G)}
  ${C.mainStart([w,w,1])}
   let headIdx = workgroup_id.z % uniforms.num_heads;
   let batchIdx = workgroup_id.z / uniforms.num_heads;
   let kvHeadIdx = ${p===1?"headIdx":"headIdx / uniforms.n_reps"};
   let kv_num_heads = ${p===1?"uniforms.num_heads":"uniforms.num_heads / uniforms.n_reps"};
   let m = global_id.y;
   let n = global_id.x;
   let sequence_length = uniforms.M;
   var total_sequence_length = uniforms.K;
   ${Or(D,H,!0)}
   let offsetA = workgroup_id.z * uniforms.M * uniforms.K + m * uniforms.K;
   let absKvHeadIdx = batchIdx * kv_num_heads + kvHeadIdx; // kvHeadIdx is relative to the batch
   ${b&&f?"let pastValueOffset = absKvHeadIdx * uniforms.N * uniforms.past_sequence_length + n;":""};
   let vOffset = absKvHeadIdx * uniforms.N * uniforms.kv_sequence_length + n;
   ${f?"let presentValueOffset = absKvHeadIdx * uniforms.N * uniforms.K + n;":""}
   var value = ${A.type.storage}(0);
   for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileQ[TILE_SIZE * local_id.y + local_id.x] = probs[offsetA + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        var idx = TILE_SIZE * local_id.y + local_id.x;
        ${b&&f?`
        if (w + local_id.y < past_sequence_length) {
          tileV[idx] = past_value[pastValueOffset + (w + local_id.y) * uniforms.N];
        } else if (w + local_id.y - past_sequence_length < uniforms.kv_sequence_length) {
          tileV[idx] = v[vOffset + (w + local_id.y - past_sequence_length) * uniforms.N];
        }
      `:`
            if (w + local_id.y < uniforms.kv_sequence_length) {
              tileV[idx] = v[vOffset + (w + local_id.y) * uniforms.N];
            }`}
        ${f?`
            if (w + local_id.y < present_sequence_length) {
          present_value[presentValueOffset + (w + local_id.y) * uniforms.N] = tileV[idx];
        }`:""}
      }
     workgroupBarrier();
     for (var k: u32 = 0u; k < TILE_SIZE && w+k < total_sequence_length; k++) {
       value += tileQ[TILE_SIZE * local_id.y + k] * tileV[TILE_SIZE * k + local_id.x];
     }
     workgroupBarrier();
   }

   // we need to transpose output from BNSH_v to BSND_v
   if (m < uniforms.M && n < uniforms.N) {
     let outputIdx = batchIdx * uniforms.M * uniforms.v_hidden_size + m * uniforms.v_hidden_size
       + headIdx * uniforms.N + n;
     output[outputIdx] = value;
   }
  }`};return{name:"AttentionScore",shaderCache:{hint:`${i!==void 0};${e}`,inputDependencies:I},getRunData:()=>({outputs:k,dispatchGroup:S,programUniforms:x}),getShaderSource:E}},pr=(e,t,r,i,a,n,s,u,d,p,h=void 0,f=void 0)=>{let g=Math.min(e.outputCount,1+(s?1:0)+(u?1:0)),y=g>1?p.pastSequenceLength:0,_=y+p.kvSequenceLength,w=d&&O.size(d.dims)>0?d:void 0,S=[t,r];g>1&&s&&O.size(s.dims)>0&&S.push(s),w&&S.push(w),h&&S.push(h),f&&S.push(f);let x=e.compute(au(g,t,r,s,w,p,y,h,f),{inputs:S,outputs:g>1?[-1,1]:[-1]})[0];e.compute(iu(x,p.batchSize,p.numHeads,y,p.sequenceLength,_,h,f),{inputs:h&&f?[x,h,f]:[x],outputs:[]});let b=[x,i];g>1&&u&&O.size(u.dims)>0&&b.push(u),h&&b.push(h),f&&b.push(f),e.compute(nu(g,x,i,u,p,y,h,f),{inputs:b,outputs:g>1?[0,2]:[0]})},su=(e,t)=>{let r=[t.batchSize,t.numHeads,t.sequenceLength,t.headSize],i=t.sequenceLength,a=t.inputHiddenSize,n=t.headSize,s=12,u={x:Math.ceil(t.headSize/s),y:Math.ceil(t.sequenceLength/s),z:t.batchSize*t.numHeads},d=[e.inputs[0],e.inputs[1],e.inputs[2]],p=[{type:12,data:i},{type:12,data:a},{type:12,data:n},{type:12,data:t.numHeads},{type:12,data:t.headSize},{type:12,data:t.hiddenSize},{type:12,data:t.hiddenSize+t.hiddenSize+t.vHiddenSize}],h=f=>{let g=K("output_q",d[0].dataType,r),y=K("output_k",d[0].dataType,r),_=K("output_v",d[0].dataType,r),w=N("input",d[0].dataType,d[0].dims),S=N("weight",d[1].dataType,d[1].dims),x=N("bias",d[2].dataType,d[2].dims),b=w.type.storage,I=[{name:"M",type:"u32"},{name:"K",type:"u32"},{name:"N",type:"u32"},{name:"num_heads",type:"u32"},{name:"head_size",type:"u32"},{name:"hidden_size",type:"u32"},{name:"ldb",type:"u32"}];return`
  const TILE_SIZE = ${s}u;
  var<workgroup> tileInput: array<${b}, ${s*s}>;
  var<workgroup> tileWeightQ: array<${b}, ${s*s}>;
  var<workgroup> tileWeightK: array<${b}, ${s*s}>;
  var<workgroup> tileWeightV: array<${b}, ${s*s}>;
  ${f.registerUniforms(I).declareVariables(w,S,x,g,y,_)}
  ${f.mainStart([s,s,1])}
    let batchIndex = workgroup_id.z / uniforms.num_heads;
    let headNumber = workgroup_id.z % uniforms.num_heads;
    let m = global_id.y;
    let n = global_id.x;

    let inputOffset = batchIndex * (uniforms.M * uniforms.K) + m * uniforms.K;
    let biasOffsetQ = headNumber * uniforms.head_size;
    let biasOffsetK = uniforms.hidden_size + biasOffsetQ;
    let biasOffsetV = uniforms.hidden_size + biasOffsetK;

    var valueQ = ${b}(0);
    var valueK = ${b}(0);
    var valueV = ${b}(0);
    for (var w: u32 = 0u; w < uniforms.K; w += TILE_SIZE) {
      if (m < uniforms.M && w + local_id.x < uniforms.K) {
        tileInput[TILE_SIZE * local_id.y + local_id.x] = input[inputOffset + w + local_id.x];
      }
      if (n < uniforms.N && w + local_id.y < uniforms.K) {
        let offset = n + (w + local_id.y) * uniforms.ldb;
        tileWeightQ[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetQ + offset];
        tileWeightK[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetK + offset];
        tileWeightV[TILE_SIZE * local_id.y + local_id.x] = weight[biasOffsetV + offset];
      }
      workgroupBarrier();
      for (var k: u32 = 0u; k<TILE_SIZE && w+k < uniforms.K; k++) {
        let inputTileOffset = TILE_SIZE * local_id.y + k;
        let weightTileOffset = TILE_SIZE * k + local_id.x;
        valueQ += tileInput[inputTileOffset] * tileWeightQ[weightTileOffset];
        valueK += tileInput[inputTileOffset] * tileWeightK[weightTileOffset];
        valueV += tileInput[inputTileOffset] * tileWeightV[weightTileOffset];
      }

      workgroupBarrier();
    }

    let headOffset = (m * uniforms.N + n) % uniforms.head_size;
    valueQ += bias[headOffset + biasOffsetQ];
    valueK += bias[headOffset + biasOffsetK];
    valueV += bias[headOffset + biasOffsetV];

    let offset = workgroup_id.z * uniforms.M * uniforms.N;
    if (m < uniforms.M && n < uniforms.N) {
      let outputIdx = offset + m * uniforms.N + n;
      output_q[outputIdx] = valueQ;
      output_k[outputIdx] = valueK;
      output_v[outputIdx] = valueV;
    }
  }`};return e.compute({name:"AttentionPrepare",shaderCache:{inputDependencies:["type","type","type"]},getRunData:()=>({outputs:[{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0},{dims:r,dataType:e.inputs[0].dataType,gpuDataType:0}],dispatchGroup:u,programUniforms:p}),getShaderSource:h},{inputs:d,outputs:[-1,-1,-1]})},Vp=(e,t)=>{let r=ru(e.inputs,t),[i,a,n]=su(e,r);return pr(e,i,a,n,e.inputs[4],void 0,void 0,void 0,e.inputs[5],r)}}),ou,uu,lu,Gp,iy=q(()=>{Ue(),te(),ie(),xe(),ae(),ou=(e,t)=>{if(!e||e.length!==5)throw new Error("BatchNormalization requires 5 inputs");let r=(i,a,n)=>{let s=a.length;if(s!==i.length)throw new Error(`${n}: num dimensions != ${s}`);a.forEach((u,d)=>{if(u!==i[d])throw new Error(`${n}: dim[${d}] do not match`)})};if(e[0].dims.length>1){let i=t.format==="NHWC"?t.spatial?e[0].dims.slice(-1):e[0].dims.slice(-1).concat(e[0].dims.slice(1,e[0].dims.length-1)):e[0].dims.slice(1,t.spatial?2:void 0);r(e[1].dims,i,"Invalid input scale"),r(e[2].dims,i,"Invalid input B"),r(e[3].dims,i,"Invalid input mean"),r(e[4].dims,i,"Invalid input var")}else r(e[1].dims,[1],"Invalid input scale"),r(e[2].dims,[1],"Invalid input B"),r(e[3].dims,[1],"Invalid input mean"),r(e[4].dims,[1],"Invalid input var")},uu=(e,t)=>{let{epsilon:r,spatial:i,format:a}=t,n=e[0].dims,s=i?ve(n[n.length-1]):1,u=a==="NHWC"&&n.length>1?s:1,d=O.size(n)/s,p=i,h=p?n.length:n,f=N("x",e[0].dataType,e[0].dims,s),g=N("scale",e[1].dataType,e[1].dims,u),y=N("bias",e[2].dataType,e[2].dims,u),_=N("inputMean",e[3].dataType,e[3].dims,u),w=N("inputVar",e[4].dataType,e[4].dims,u),S=K("y",e[0].dataType,h,s),x=()=>{let I="";if(i)I=`let cOffset = ${n.length===1?"0u":a==="NHWC"?`outputIndices[${n.length-1}] / ${s}`:"outputIndices[1]"};`;else if(a==="NCHW")I=`
            ${S.indicesSet("outputIndices","0","0")}
            let cOffset = ${S.indicesToOffset("outputIndices")};`;else{I=`var cIndices = ${g.type.indices}(0);
                       cIndices[0] = outputIndices[${n.length-1}];`;for(let k=1;k<g.rank;k++)I+=`cIndices[${k}] = outputIndices[${k}];`;I+=`let cOffset = ${g.indicesToOffset("cIndices")};`}return I},b=I=>`
  const epsilon = ${r};
  ${I.registerUniform("outputSize","u32").declareVariables(f,g,y,_,w,S)}
  ${I.mainStart()}
  ${I.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
    var outputIndices = ${S.offsetToIndices(`global_idx * ${s}`)};
    ${x()}
    let scale = ${g.getByOffset("cOffset")};
    let bias = ${y.getByOffset("cOffset")};
    let inputMean = ${_.getByOffset("cOffset")};
    let inputVar = ${w.getByOffset("cOffset")};
    let x = ${f.getByOffset("global_idx")};
    let value = (x - inputMean) * inverseSqrt(inputVar + epsilon) * scale + bias;
    ${S.setByOffset("global_idx","value")}
  }`;return{name:"BatchNormalization",shaderCache:{hint:`${t.epsilon}_${t.format}_${i}_${s}`,inputDependencies:p?["rank","type","type","type","type"]:void 0},getShaderSource:b,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:p?[{type:12,data:d},...Y(n)]:[{type:12,data:d}]})}},lu=e=>he(e),Gp=(e,t)=>{let{inputs:r,outputCount:i}=e,a=lu({...t,outputCount:i});if($e.webgpu.validateInputContent&&ou(r,a),t.trainingMode)throw new Error("BatchNormalization trainingMode is not supported yet.");e.compute(uu(r,a))}}),du,pu,Hp,ay=q(()=>{ie(),ae(),du=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![320,640,1280].includes(e[0].dims[2]))throw new Error("number of channels should be 320, 640 or 1280");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},pu=e=>{let t=e[0].dims,r=e[0].dims[2],i=O.size(t)/4,a=e[0].dataType,n=N("input",a,t,4),s=N("bias",a,[r],4),u=N("residual",a,t,4),d=K("output",a,t,4);return{name:"BiasAdd",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(i/64)}}),getShaderSource:p=>`
  const channels = ${r}u / 4;
  ${p.declareVariables(n,s,u,d)}

  ${p.mainStart()}
    ${p.guardAgainstOutOfBoundsWorkgroupSizes(i)}
    let value = ${n.getByOffset("global_idx")}
      + ${s.getByOffset("global_idx % channels")} + ${u.getByOffset("global_idx")};
    ${d.setByOffset("global_idx","value")}
  }`}},Hp=e=>{du(e.inputs),e.compute(pu(e.inputs))}}),cu,ce,Fp,jp,Kp,Qp,Zp,Yp,Xp,Jp,ec,hu,tc,rc,ic,ac,or,nc,qr,sc,oc,uc,lc,dc,pc,cc,hc,fc,mc,gc,yc,_c,wc,bc,$c,Pi,vc,$a,va,xc,Sc,Tc,fu,mu,kc,Ha=q(()=>{te(),ie(),xe(),ae(),cu=(e,t,r,i,a,n,s)=>{let u=Math.ceil(t/4),d="";typeof a=="string"?d=`${a}(a)`:d=a("a");let p=N("inputData",r,[u],4),h=K("outputData",i,[u],4),f=[{name:"vec_size",type:"u32"}];return s&&f.push(...s),`
      ${e.registerUniforms(f).declareVariables(p,h)}

  ${n??""}

  ${e.mainStart()}
    ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}

    let a = ${p.getByOffset("global_idx")};
    ${h.setByOffset("global_idx",d)}
  }`},ce=(e,t,r,i,a,n=e.dataType,s,u)=>{let d=[{type:12,data:Math.ceil(O.size(e.dims)/4)}];return s&&d.push(...s),{name:t,shaderCache:{hint:a,inputDependencies:["type"]},getShaderSource:p=>cu(p,O.size(e.dims),e.dataType,n,r,i,u),getRunData:p=>({outputs:[{dims:e.dims,dataType:n}],dispatchGroup:{x:Math.ceil(O.size(p[0].dims)/64/4)},programUniforms:d})}},Fp=e=>{e.compute(ce(e.inputs[0],"Abs","abs"))},jp=e=>{e.compute(ce(e.inputs[0],"Acos","acos"))},Kp=e=>{e.compute(ce(e.inputs[0],"Acosh","acosh"))},Qp=e=>{e.compute(ce(e.inputs[0],"Asin","asin"))},Zp=e=>{e.compute(ce(e.inputs[0],"Asinh","asinh"))},Yp=e=>{e.compute(ce(e.inputs[0],"Atan","atan"))},Xp=e=>{e.compute(ce(e.inputs[0],"Atanh","atanh"))},Jp=e=>he(e),ec=(e,t)=>{let r;switch(t.to){case 10:r="vec4<f16>";break;case 1:r="vec4<f32>";break;case 12:r="vec4<u32>";break;case 6:r="vec4<i32>";break;case 9:r="vec4<bool>";break;default:throw new RangeError(`not supported type (specified in attribute 'to' from 'Cast' operator): ${t.to}`)}e.compute(ce(e.inputs[0],"Cast",r,void 0,t.cacheKey,t.to))},hu=e=>{let t,r,i=e.length>=2&&e[1].data!==0,a=e.length>=3&&e[2].data!==0;switch(e[0].dataType){case 1:t=i?e[1].getFloat32Array()[0]:-34028234663852886e22,r=a?e[2].getFloat32Array()[0]:34028234663852886e22;break;case 10:t=i?e[1].getUint16Array()[0]:64511,r=a?e[2].getUint16Array()[0]:31743;break;default:throw new Error("Unsupport data type")}return he({min:t,max:r})},tc=(e,t)=>{let r=t||hu(e.inputs),i=Ee(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Clip",a=>`clamp(${a}, vec4<${i}>(uniforms.min), vec4<${i}>(uniforms.max))`,void 0,r.cacheKey,void 0,[{type:e.inputs[0].dataType,data:r.min},{type:e.inputs[0].dataType,data:r.max}],[{name:"min",type:i},{name:"max",type:i}]),{inputs:[0]})},rc=e=>{e.compute(ce(e.inputs[0],"Ceil","ceil"))},ic=e=>{e.compute(ce(e.inputs[0],"Cos","cos"))},ac=e=>{e.compute(ce(e.inputs[0],"Cosh","cosh"))},or=e=>he(e),nc=(e,t)=>{let r=Ee(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Elu",i=>`elu_vf32(${i})`,`
  const elu_alpha_ = ${r}(${t.alpha});

  fn elu_f32(a: ${r}) -> ${r} {
  return select((exp(a) - 1.0) * elu_alpha_, a, a >= 0.0);
  }

  fn elu_vf32(v: vec4<${r}>) -> vec4<${r}> {
  return vec4(elu_f32(v.x), elu_f32(v.y), elu_f32(v.z), elu_f32(v.w));
  }`,t.cacheKey))},qr=(e="f32")=>`
const r0: ${e} = 0.3275911;
const r1: ${e} = 0.254829592;
const r2: ${e} = -0.284496736;
const r3: ${e} = 1.421413741;
const r4: ${e} = -1.453152027;
const r5: ${e} = 1.061405429;

fn erf_vf32(v: vec4<${e}>) -> vec4<${e}> {
  let absv = abs(v);
  let x = 1.0 / (1.0 + r0 * absv);
  return sign(v) * (1.0 - ((((r5 * x + r4) * x + r3) * x + r2) * x + r1) * x * exp(-absv * absv));
}`,sc=e=>{let t=Ee(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Erf",r=>`erf_vf32(${r})`,qr(t)))},oc=e=>{e.compute(ce(e.inputs[0],"Exp","exp"))},uc=e=>{e.compute(ce(e.inputs[0],"Floor","floor"))},lc=e=>{let t=Ee(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Gelu",r=>`0.5 * ${r} * (1.0 + erf_vf32(${r} * 0.7071067811865475))`,qr(t)))},dc=(e,t)=>{let r=Ee(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"LeakyRelu",i=>`select(leaky_relu_alpha_ * ${i}, ${i}, ${i} >= vec4<${r}>(0.0))`,`const leaky_relu_alpha_ = ${r}(${t.alpha});`,t.cacheKey))},pc=e=>{e.compute(ce(e.inputs[0],"Not",t=>`!${t}`))},cc=e=>{e.compute(ce(e.inputs[0],"Neg",t=>`-${t}`))},hc=e=>{e.compute(ce(e.inputs[0],"Reciprocal",t=>`1.0/${t}`))},fc=e=>{let t=Ee(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"Relu",r=>`select(vec4<${t}>(0.0), ${r}, ${r} > vec4<${t}>(0.0))`))},mc=e=>{e.compute(ce(e.inputs[0],"Sigmoid",t=>`(1.0 / (1.0 + exp(-${t})))`))},gc=e=>he(e),yc=(e,t)=>{let r=Ee(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"HardSigmoid",i=>`max(vec4<${r}>(0.0), min(vec4<${r}>(1.0), ${t.alpha} * ${i} + vec4<${r}>(${t.beta})))`,void 0,t.cacheKey))},_c=e=>{e.compute(ce(e.inputs[0],"Sin","sin"))},wc=e=>{e.compute(ce(e.inputs[0],"Sinh","sinh"))},bc=e=>{e.compute(ce(e.inputs[0],"Sqrt","sqrt"))},$c=e=>{e.compute(ce(e.inputs[0],"Tan","tan"))},Pi=e=>`sign(${e}) * (1 - exp(-2 * abs(${e}))) / (1 + exp(-2 * abs(${e})))`,vc=e=>{e.compute(ce(e.inputs[0],"Tanh",Pi))},$a=(e="f32")=>`
const fast_gelu_a: ${e} = 0.5;
const fast_gelu_b: ${e} = 0.7978845608028654;
const fast_gelu_c: ${e} = 0.035677408136300125;

fn tanh_v(v: vec4<${e}>) -> vec4<${e}> {
  return ${Pi("v")};
}
`,va=e=>`(fast_gelu_a + fast_gelu_a * tanh_v(${e} * (fast_gelu_c * ${e} * ${e} + fast_gelu_b))) * ${e}`,xc=e=>{let t=Ee(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"FastGelu",va,$a(t),void 0,e.inputs[0].dataType))},Sc=(e,t)=>{let r=Ee(e.inputs[0].dataType);return e.compute(ce(e.inputs[0],"ThresholdedRelu",i=>`select(vec4<${r}>(0.0), ${i}, ${i} > thresholded_relu_alpha_)`,`const thresholded_relu_alpha_ = vec4<${r}>(${t.alpha});`,t.cacheKey)),0},Tc=e=>{e.compute(ce(e.inputs[0],"Log","log"))},fu=(e,t)=>`
const alpha = vec4<${e}>(${t});
const one = ${e}(1.0);
const zero = ${e}(0.0);

fn quick_gelu_impl(x: vec4<${e}>) -> vec4<${e}> {
  let v = x *alpha;
  var x1 : vec4<${e}>;
  for (var i = 0; i < 4; i = i + 1) {
    if (v[i] >= zero) {
      x1[i] = one / (one + exp(-v[i]));
    } else {
      x1[i] = one - one / (one + exp(v[i]));
    }
  }
  return x * x1;
}
`,mu=e=>`quick_gelu_impl(${e})`,kc=(e,t)=>{let r=Ee(e.inputs[0].dataType);e.compute(ce(e.inputs[0],"QuickGelu",mu,fu(r,t.alpha),t.cacheKey,e.inputs[0].dataType))}}),gu,yu,Ic,ny=q(()=>{ie(),ae(),Ha(),gu=e=>{if(e[0].dims.length!==3)throw new Error("input should have 3 dimensions");if(![2560,5120,10240].includes(e[0].dims[2]))throw new Error("hidden state should be 2560, 5120 or 10240");if(e[1].dims.length!==1)throw new Error("bias is expected to have 1 dimensions");if(e[0].dims[2]!==e[1].dims[0])throw new Error("last dimension of input and bias are not the same")},yu=e=>{let t=e[0].dims.slice();t[2]=t[2]/2;let r=N("input",e[0].dataType,e[0].dims,4),i=N("bias",e[0].dataType,[e[0].dims[2]],4),a=K("output",e[0].dataType,t,4),n=O.size(t)/4,s=Te(e[0].dataType);return{name:"BiasSplitGelu",getRunData:()=>({outputs:[{dims:t,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)}}),getShaderSource:u=>`
  const M_SQRT2 = sqrt(2.0);
  const halfChannels = ${e[0].dims[2]/4/2}u;

  ${u.declareVariables(r,i,a)}

  ${qr(s)}

  ${u.mainStart()}
    ${u.guardAgainstOutOfBoundsWorkgroupSizes(n)}
    let biasIdx = global_idx % halfChannels;
    let batchIndex = global_idx / halfChannels;
    let inputOffset = biasIdx + batchIndex * halfChannels * 2;
    let valueLeft = input[inputOffset] + bias[biasIdx];
    let valueRight = input[inputOffset + halfChannels] + bias[biasIdx + halfChannels];
    let geluRight = valueRight * 0.5 * (erf_vf32(valueRight / M_SQRT2) + 1);

    ${a.setByOffset("global_idx","valueLeft * geluRight")}
  }`}},Ic=e=>{gu(e.inputs),e.compute(yu(e.inputs))}}),_u,wu,Ge,Ec,zc,Cc,Ac,Oc,Rc,Bc,Nc,Mc,Dc,sy=q(()=>{te(),ie(),ae(),_u=(e,t,r,i,a,n,s,u,d,p,h,f)=>{let g,y;typeof u=="string"?g=y=(b,I)=>`${u}((${b}),(${I}))`:typeof u=="function"?g=y=u:(g=u.scalar,y=u.vector);let _=K("outputData",h,i.length,4),w=N("aData",d,t.length,4),S=N("bData",p,r.length,4),x;if(a)if(n){let b=O.size(t)===1,I=O.size(r)===1,k=t.length>0&&t[t.length-1]%4===0,E=r.length>0&&r[r.length-1]%4===0;b||I?x=_.setByOffset("global_idx",y(b?`${w.type.value}(${w.getByOffset("0")}.x)`:w.getByOffset("global_idx"),I?`${S.type.value}(${S.getByOffset("0")}.x)`:S.getByOffset("global_idx"))):x=`
            let outputIndices = ${_.offsetToIndices("global_idx * 4u")};
            let offsetA = ${w.broadcastedIndicesToOffset("outputIndices",_)};
            let offsetB = ${S.broadcastedIndicesToOffset("outputIndices",_)};
            ${_.setByOffset("global_idx",y(s||k?w.getByOffset("offsetA / 4u"):`${w.type.value}(${w.getByOffset("offsetA / 4u")}[offsetA % 4u])`,s||E?S.getByOffset("offsetB / 4u"):`${S.type.value}(${S.getByOffset("offsetB / 4u")}[offsetB % 4u])`))}
          `}else x=_.setByOffset("global_idx",y(w.getByOffset("global_idx"),S.getByOffset("global_idx")));else{if(!n)throw new Error("no necessary to use scalar implementation for element-wise binary op implementation.");let b=(I,k,E="")=>{let C=`aData[indexA${k}][componentA${k}]`,A=`bData[indexB${k}][componentB${k}]`;return`
            let outputIndices${k} = ${_.offsetToIndices(`global_idx * 4u + ${k}u`)};
            let offsetA${k} = ${w.broadcastedIndicesToOffset(`outputIndices${k}`,_)};
            let offsetB${k} = ${S.broadcastedIndicesToOffset(`outputIndices${k}`,_)};
            let indexA${k} = offsetA${k} / 4u;
            let indexB${k} = offsetB${k} / 4u;
            let componentA${k} = offsetA${k} % 4u;
            let componentB${k} = offsetB${k} % 4u;
            ${I}[${k}] = ${E}(${g(C,A)});
          `};h===9?x=`
            var data = vec4<u32>(0);
            ${b("data",0,"u32")}
            ${b("data",1,"u32")}
            ${b("data",2,"u32")}
            ${b("data",3,"u32")}
            outputData[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:x=`
            ${b("outputData[global_idx]",0)}
            ${b("outputData[global_idx]",1)}
            ${b("outputData[global_idx]",2)}
            ${b("outputData[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(w,S,_)}

        ${f??""}

        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${x}
      }`},wu=(e,t,r,i,a,n,s=r.dataType)=>{let u=r.dims.map(Number),d=i.dims.map(Number),p=!O.areEqual(u,d),h=u,f=O.size(u),g=!1,y=!1,_=[p];if(p){let w=Pt.calcShape(u,d,!1);if(!w)throw new Error("Can't perform binary op on the given tensors");h=w.slice(),f=O.size(h);let S=O.size(u)===1,x=O.size(d)===1,b=u.length>0&&u[u.length-1]%4===0,I=d.length>0&&d[d.length-1]%4===0;_.push(S),_.push(x),_.push(b),_.push(I);let k=1;for(let E=1;E<h.length;E++){let C=u[u.length-E],A=d[d.length-E];if(C===A)k*=C;else break}k%4===0?(y=!0,g=!0):(S||x||b||I)&&(g=!0)}else g=!0;return _.push(g),{name:e,shaderCache:{hint:t+_.map(w=>w.toString()).join("_"),inputDependencies:["rank","rank"]},getShaderSource:w=>_u(w,u,d,h,g,p,y,a,r.dataType,i.dataType,s,n),getRunData:()=>({outputs:[{dims:h,dataType:s}],dispatchGroup:{x:Math.ceil(f/64/4)},programUniforms:[{type:12,data:Math.ceil(O.size(h)/4)},...Y(u,d,h)]})}},Ge=(e,t,r,i,a,n)=>{e.compute(wu(t,a??"",e.inputs[0],e.inputs[1],r,i,n))},Ec=e=>{Ge(e,"Add",(t,r)=>`${t}+${r}`)},zc=e=>{Ge(e,"Div",(t,r)=>`${t}/${r}`)},Cc=e=>{Ge(e,"Equal",{scalar:(t,r)=>`u32(${t}==${r})`,vector:(t,r)=>`vec4<u32>(${t}==${r})`},void 0,void 0,9)},Ac=e=>{Ge(e,"Mul",(t,r)=>`${t}*${r}`)},Oc=e=>{let t=N("input",e.inputs[0].dataType,e.inputs[0].dims).type.value;Ge(e,"Pow",{scalar:(r,i)=>`pow_custom(${r},${i})`,vector:(r,i)=>`pow_vector_custom(${r},${i})`},`
    fn pow_custom(a : ${t}, b : ${t}) -> ${t} {
      if (b == ${t}(0.0)) {
        return ${t}(1.0);
      } else if (a < ${t}(0.0) && f32(b) != floor(f32(b))) {
        return ${t}(pow(f32(a), f32(b))); // NaN
      }
      return select(sign(a), ${t}(1.0), round(f32(abs(b) % ${t}(2.0))) != 1.0) * ${t}(${t==="i32"?"round":""}(pow(f32(abs(a)), f32(b))));
    }
    fn pow_vector_custom(a : vec4<${t}>, b : vec4<${t}>) -> vec4<${t}> {
      // TODO: implement vectorized pow
      return vec4<${t}>(pow_custom(a.x, b.x), pow_custom(a.y, b.y), pow_custom(a.z, b.z), pow_custom(a.w, b.w));
    }
      `)},Rc=e=>{Ge(e,"Sub",(t,r)=>`${t}-${r}`)},Bc=e=>{Ge(e,"Greater",{scalar:(t,r)=>`u32(${t}>${r})`,vector:(t,r)=>`vec4<u32>(${t}>${r})`},void 0,void 0,9)},Nc=e=>{Ge(e,"Less",{scalar:(t,r)=>`u32(${t}<${r})`,vector:(t,r)=>`vec4<u32>(${t}<${r})`},void 0,void 0,9)},Mc=e=>{Ge(e,"GreaterOrEqual",{scalar:(t,r)=>`u32(${t}>=${r})`,vector:(t,r)=>`vec4<u32>(${t}>=${r})`},void 0,void 0,9)},Dc=e=>{Ge(e,"LessOrEqual",{scalar:(t,r)=>`u32(${t}<=${r})`,vector:(t,r)=>`vec4<u32>(${t}<=${r})`},void 0,void 0,9)}}),bu,$u,vu,xu,Uc,Pc,oy=q(()=>{te(),ie(),xe(),ae(),bu=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");let r=0,i=e[r],a=i.dataType,n=i.dims.length;e.forEach((s,u)=>{if(u!==r){if(s.dataType!==a)throw new Error("input tensors should be one type");if(s.dims.length!==n)throw new Error("input tensors should have the same shape");s.dims.forEach((d,p)=>{if(p!==t&&d!==i.dims[p])throw new Error("non concat dimensions must match")})}})},$u=(e,t)=>`
  fn calculateInputIndex(index: u32) -> u32 {
    let sizeInConcatAxis = array<u32, ${e}u>(${t});
    for (var i: u32 = 0u; i < ${e}; i += 1u ) {
      if (index < sizeInConcatAxis[i]) {
        return i;
      }
    }
    return ${e}u;
  }`,vu=(e,t)=>{let r=e.length,i=[];for(let a=0;a<r;++a){let n=t.setByOffset("global_idx",e[a].getByIndices("indices"));r===1?i.push(n):a===0?i.push(`if (inputIndex == ${a}u) { ${n} }`):a===r-1?i.push(`else { ${n} }`):i.push(`else if (inputIndex == ${a}) { ${n} }`)}return i.join(`
`)},xu=(e,t,r,i)=>{let a=O.size(r),n=new Array(e.length),s=new Array(e.length),u=0,d=[],p=[],h=[{type:12,data:a}];for(let w=0;w<e.length;++w)u+=e[w].dims[t],n[w]=u,p.push(e[w].dims.length),s[w]=N(`input${w}`,i,p[w]),d.push("rank"),h.push({type:12,data:n[w]});for(let w=0;w<e.length;++w)h.push(...Y(e[w].dims));h.push(...Y(r));let f=K("output",i,r.length),g=f.indicesGet("indices",t),y=Array.from(Array(n.length).keys()).map(w=>`uniforms.sizeInConcatAxis${w}`).join(","),_=w=>`

  ${(()=>{w.registerUniform("outputSize","u32");for(let S=0;S<e.length;S++)w.registerUniform(`sizeInConcatAxis${S}`,"u32");return w.declareVariables(...s,f)})()}

  ${$u(n.length,y)}

  ${w.mainStart()}
    ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

    var indices = ${f.offsetToIndices("global_idx")};

    let inputIndex = calculateInputIndex(${g});
    if (inputIndex != 0u) {
      let sizeInConcatAxis = array<u32, ${n.length}u>(${y});
      ${g} -= sizeInConcatAxis[inputIndex - 1u];
    }

    ${vu(s,f)}
  }`;return{name:"Concat",shaderCache:{hint:`${t}`,inputDependencies:d},getRunData:()=>({outputs:[{dims:r,dataType:i}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:h}),getShaderSource:_}},Uc=(e,t)=>{let r=e.inputs,i=r[0].dims,a=O.normalizeAxis(t.axis,i.length);bu(r,a);let n=i.slice();n[a]=r.reduce((u,d)=>u+(d.dims.length>a?d.dims[a]:0),0);let s=r.filter(u=>O.size(u.dims)>0);e.compute(xu(s,a,n,r[0].dataType),{inputs:s})},Pc=e=>he({axis:e.axis})}),zt,Ct,At,Fa,Rt=q(()=>{te(),ie(),zt=(e,t,r="f32")=>{switch(e.activation){case"Relu":return`value = max(value, ${t}(0.0));`;case"Sigmoid":return`value = (${t}(1.0) / (${t}(1.0) + exp(-value)));`;case"Clip":return`value = clamp(value, ${t}(${r}(uniforms.clip_min)), ${t}(${r}(uniforms.clip_max)));`;case"HardSigmoid":return`value = max(${t}(0.0), min(${t}(1.0), ${r}(uniforms.alpha) * value + ${r}(uniforms.beta)));`;case"LeakyRelu":return`value = select(${r}(uniforms.alpha) * value, value, value >= ${t}(0.0));`;case"Tanh":return`let e2x = exp(-2.0 * abs(value));
              value = sign(value) * (1.0 - e2x) / (1.0 + e2x);
        `;case"":return"";default:throw new Error(`Unsupported activation ${e.activation}`)}},Ct=(e,t)=>{e.activation==="Clip"?t.push({type:1,data:e.clipMax},{type:1,data:e.clipMin}):e.activation==="HardSigmoid"?t.push({type:1,data:e.alpha},{type:1,data:e.beta}):e.activation==="LeakyRelu"&&t.push({type:1,data:e.alpha})},At=(e,t)=>{e.activation==="Clip"?t.push({name:"clip_max",type:"f32"},{name:"clip_min",type:"f32"}):e.activation==="HardSigmoid"?t.push({name:"alpha",type:"f32"},{name:"beta",type:"f32"}):e.activation==="LeakyRelu"&&t.push({name:"alpha",type:"f32"})},Fa=e=>{let t=(e==null?void 0:e.activation)||"";if(t==="HardSigmoid"){let[r,i]=(e==null?void 0:e.activation_params)||[.2,.5];return{activation:t,alpha:r,beta:i}}else if(t==="Clip"){let[r,i]=(e==null?void 0:e.activation_params)||[pp,cp];return{activation:t,clipMax:i,clipMin:r}}else if(t==="LeakyRelu"){let[r]=(e==null?void 0:e.activation_params)||[.01];return{activation:t,alpha:r}}return{activation:t}}}),Ie,qc,ja=q(()=>{Ie=(e,t)=>{switch(e){case 1:return t;case 2:return`vec2<${t}>`;case 3:return`vec3<${t}>`;case 4:return`vec4<${t}>`;default:throw new Error(`${e}-component is not supported.`)}},qc=e=>`
      ${e?"value = value + getBiasByOutputCoords(coords);":""}
      `}),Wc,uy=q(()=>{Wc=e=>`
fn getIndexFromCoords4D(coords : vec4<i32>, shape : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
      shape.y * shape.z * shape.w, shape.z * shape.w, shape.w, 1));
}
fn getOutputIndexFromCoords(coords : vec4<i32>) -> i32 {
  return dot(coords, vec4<i32>(
    i32(${e}.x), i32(${e}.y), i32(${e}.z), 1));
}
`}),lr,Ka,Qa=q(()=>{te(),ie(),ae(),Rt(),lr=(e,t,r,i,a)=>{let n=i-r;return`
      ${Array.from({length:r}).map((s,u)=>`
      if (${Z(t.shape,u,t.rank)} != 1) {
        ${t.indicesSet(e,u,Z(a,u+n,i))}
      } else {
        ${t.indicesSet(e,u,0)}
      }`).join("")}
`},Ka=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,u=e[1].dims,d=s[s.length-2],p=u[u.length-1],h=s[s.length-1],f=ve(p),g=ve(h),y=ve(d),_=O.size(r)/f/y,w=e.length>2,S=i?i.slice(0,-2):r.slice(0,-2),x=[O.size(S),d,p],b=[{type:12,data:_},{type:12,data:d},{type:12,data:p},{type:12,data:h}];Ct(t,b),b.push(...Y(S,s,u)),w&&b.push(...Y(e[2].dims)),b.push(...Y(x));let I=k=>{let E=La("batch_dims",e[0].dataType,S.length),C=N("a",e[0].dataType,s.length,g),A=N("b",e[1].dataType,u.length,f),v=K("output",e[0].dataType,x.length,f),M=Te(v.type.tensor),D=zt(t,v.type.value,M),H=[C,A],G="";if(w){let j=a?f:1;H.push(N("bias",e[2].dataType,e[2].dims.length,j)),G=`${a?`value += bias[col / ${j}];`:`value += ${v.type.value}(bias[row + i]);`}`}let Q=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"}];At(t,Q);let R=()=>{let j=`var a_data: ${C.type.value};`;for(let F=0;F<g;F++)j+=`
              let b_data${F} = b[(b_offset + (k + ${F}) * uniforms.N + col) / ${f}];`;for(let F=0;F<y;F++){j+=`a_data = a[(a_offset + (row + ${F}) * uniforms.K + k) / ${g}];`;for(let X=0;X<g;X++)j+=`
            values[${F}] = fma(${A.type.value}(a_data${g===1?"":`[${X}]`}), b_data${X}, values[${F}]);
`}return j};return`
  ${k.registerUniforms(Q).registerInternalVariables(E).declareVariables(...H,v)}
  ${k.mainStart()}
    ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let col = (global_idx % (uniforms.N / ${f})) * ${f};
    var index1 = global_idx / (uniforms.N / ${f});
    let stride1 = uniforms.M / ${y};
    let row = (index1 % stride1) * ${y};
    let batch = index1 / stride1;

    ${r.length===2?"":`let batch_indices = ${E.offsetToIndices("batch")};`}

    var a_indices: ${C.type.indices};
    ${lr("a_indices",C,C.rank-2,E.rank,"batch_indices")}
    ${C.indicesSet("a_indices",C.rank-2,0)}
    ${C.indicesSet("a_indices",C.rank-1,0)}
    let a_offset = ${C.indicesToOffset("a_indices")};

    var b_indices: ${A.type.indices};
    ${lr("b_indices",A,A.rank-2,E.rank,"batch_indices")}
    ${A.indicesSet("b_indices",A.rank-2,0)}
    ${A.indicesSet("b_indices",A.rank-1,0)}
    let b_offset = ${A.indicesToOffset("b_indices")};
    var values: array<${v.type.value}, ${y}>;
    for (var k: u32 = 0u; k < uniforms.K; k = k + ${g}) {
      ${R()}
    }
    for (var i = 0u; i < ${y}u; i++) {
      var value = values[i];
      ${G}
      ${D}
      let cur_indices = ${v.type.indices}(batch, row + i, col);
      let offset = ${v.indicesToOffset("cur_indices")};
      ${v.setByOffset(`offset / ${f}`,"value")};
    }
  }
  `};return{name:"MatMulNaive",shaderCache:{hint:`${t.activation};${f};${g};${y};${a}`,inputDependencies:w?["rank","rank","rank"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(_/64)},programUniforms:b}),getShaderSource:I}}}),Su,Tu,xa,qi,ku,Sa,Iu,Fr,Za=q(()=>{te(),ie(),ae(),Rt(),Qa(),ja(),Su=(e,t)=>e?`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          kStart + inputRow,
          globalRowStart / innerElementSize + inputCol${t?", batchIndices":""});
        `:`
        mm_Asub[inputRow][inputCol] = mm_readA(batch,
          globalRow + innerRow,
          kStart / innerElementSize + inputCol${t?", batchIndices":""});
        `,Tu=(e,t)=>e?`
        let ACached0 = mm_Asub[k * innerElementSize][localRow];
        let ACached1 = mm_Asub[k * innerElementSize + 1][localRow];
        let ACached2 = mm_Asub[k * innerElementSize + 2][localRow];
        ${t===3?"":"let ACached3 = mm_Asub[k * innerElementSize + 3][localRow];"}
        for (var i = 0; i < rowPerThread; i = i + 1) {
          acc[i] = BCached0 * ACached0[i] + acc[i];
          acc[i] = BCached1 * ACached1[i] + acc[i];
          acc[i] = BCached2 * ACached2[i] + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached3[i] + acc[i];"}
        }`:`
        for (var i = 0; i < rowPerThread; i = i + 1) {
          let ACached = mm_Asub[tileRow + i][k];
          acc[i] = BCached0 * ACached.x + acc[i];
          acc[i] = BCached1 * ACached.y + acc[i];
          acc[i] = BCached2 * ACached.z + acc[i];
          ${t===3?"":"acc[i] = BCached3 * ACached.w + acc[i];"}
        }`,xa=(e,t,r="f32",i,a=!1,n=32,s=!1,u=32)=>{let d=t[1]*e[1],p=t[0]*e[0],h=a?d:n,f=a?n:d,g=h/t[0],y=n/t[1];if(!((a&&g===4&&e[1]===4||!a&&(g===3||g===4))&&h%t[0]===0&&n%t[1]===0&&e[0]===4))throw new Error(`If transposeA ${a} is true, innerElementSize ${g} and workPerThread[1] ${e[1]} must be 4.
      Otherwise, innerElementSize ${g} must be 3 or 4.
  tileAWidth ${h} must be divisible by workgroupSize[0]${t[0]}. tileInner ${n} must be divisible by workgroupSize[1] ${t[1]}. colPerThread ${e[0]} must be 4.`);return`
var<workgroup> mm_Asub: array<array<vec${g}<${r}>, ${h/g}>, ${f}>;
var<workgroup> mm_Bsub: array<array<vec4<${r}>, ${p/e[0]}>, ${n}>;

const rowPerThread = ${e[1]};
const colPerThread = ${e[0]};
const innerElementSize = ${g};
const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
  let localRow = i32(localId.y);
  let tileRow = localRow * rowPerThread;
  let tileCol = i32(localId.x);

  let globalRow =i32(globalId.y) * rowPerThread;
  let globalCol = i32(globalId.x);
  let batch = ${s?"0":"i32(globalId.z)"};
  ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
  let globalRowStart = i32(workgroupId.y) * ${d};

  let num_tiles = ${s?`${Math.ceil(u/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
  var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

  var acc: array<vec4<${r}>, rowPerThread>;

  // Loop over shared dimension.
  let tileRowB = localRow * ${y};
  for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let inputRow = tileRow + innerRow;
          let inputCol = tileCol;
          ${Su(a,i)}
      }

      // Load one tile of B into local memory.
      for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
          let inputRow = tileRowB + innerRow;
          let inputCol = tileCol;
          mm_Bsub[inputRow][inputCol] = mm_readB(batch, kStart + inputRow, globalCol${i?", batchIndices":""});
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      for (var k = 0; k < tileInner / innerElementSize; k = k + 1) {
          let BCached0 = mm_Bsub[k * innerElementSize][tileCol];
          let BCached1 = mm_Bsub[k * innerElementSize + 1][tileCol];
          let BCached2 = mm_Bsub[k * innerElementSize + 2][tileCol];
          ${g===3?"":"let BCached3 = mm_Bsub[k * innerElementSize + 3][tileCol];"}

          ${Tu(a,g)}
      }

      workgroupBarrier();
  }

  for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      mm_write(batch, globalRow + innerRow, globalCol, acc[innerRow]);
  }
}`},qi=(e,t)=>e?`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              kStart + inputRow,
              globalRowStart + inputCol${t?", batchIndices":""});
            `:`
            mm_Asub[inputRow][inputCol] = mm_readA(batch,
              globalRowStart + inputRow,
              kStart + inputCol${t?", batchIndices":""});
            `,ku=e=>e?"let ACached = mm_Asub[k][tileRow + innerRow];":"let ACached = mm_Asub[tileRow + innerRow][k];",Sa=(e,t,r="f32",i,a=!1,n=32,s=!1,u=32,d=!1)=>{let p=e[1]*t[1],h=e[0]*t[0],f=a?p:n,g=a?n:p;if(!(g%t[1]===0&&f%t[0]===0&&n%t[1]===0))throw new Error(`tileAHight ${g} must be divisible by workgroupSize[1]${t[1]}, tileAWidth ${f} must be divisible by workgroupSize[0]${t[0]}, tileInner ${n} must be divisible by workgroupSize[1]${t[1]}`);let y=g/t[1],_=f/t[0],w=n/t[1],S=d?`
    let localRow = i32(localId.y);
    let localCol = i32(localId.x);
    let globalRowStart = i32(workgroupId.y) * ${p};
    let globalColStart = i32(workgroupId.x) * ${h};

    // Loop over shared dimension.
    for (var t = 0; t < num_tiles; t = t + 1) {
      // Load one tile of A into local memory.
      for (var inputRow = localRow; inputRow < ${g}; inputRow = inputRow + ${t[1]}) {
        for (var inputCol = localCol; inputCol < ${f}; inputCol = inputCol + ${t[0]}) {
          ${qi(a,i)}
        }
      }
      // Load one tile of B into local memory.
      for (var inputRow = localRow; inputRow < ${n}; inputRow = inputRow + ${t[1]}) {
            for (var inputCol = localCol; inputCol < ${h}; inputCol = inputCol + ${t[0]}) {
          mm_Bsub[inputRow][inputCol] = mm_readB(batch,
            kStart + inputRow,
            globalColStart + inputCol${i?", batchIndices":""});
        }
      }
      kStart = kStart + tileInner;
      workgroupBarrier();

      // Compute acc values for a single thread.
      var BCached : array<${r}, colPerThread>;
      for (var k = 0; k < tileInner; k = k + 1) {
        for (var inner = 0; inner < colPerThread; inner = inner + 1) {
          BCached[inner] = mm_Bsub[k][localCol + inner * ${t[0]}];
        }
        for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
          let ACached = ${a?`mm_Asub[k][localRow + innerRow * ${t[1]}];`:`mm_Asub[localRow + innerRow * ${t[1]}][k];`}
          for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
            acc[innerRow][innerCol] = acc[innerRow][innerCol] +
                ACached * BCached[innerCol];
          }
        }
      }
      workgroupBarrier();
    }
    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      let gRow = globalRowStart + localRow + innerRow * ${t[1]};
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        let gCol = globalColStart + localCol + innerCol * ${t[0]};
        mm_write(batch, gRow, gCol, acc[innerRow][innerCol]);
      }
    }
    `:`
let tileRow = i32(localId.y) * rowPerThread;
let tileCol = i32(localId.x) * colPerThread;

let globalRow = i32(globalId.y) * rowPerThread;
let globalCol = i32(globalId.x) * colPerThread;
let globalRowStart = i32(workgroupId.y) * ${p};

let tileRowA = i32(localId.y) * ${y};
let tileColA = i32(localId.x) * ${_};
let tileRowB = i32(localId.y) * ${w};
// Loop over shared dimension.
for (var t = 0; t < num_tiles; t = t + 1) {
  // Load one tile of A into local memory.
  for (var innerRow = 0; innerRow < ${y}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < ${_}; innerCol = innerCol + 1) {
      let inputRow = tileRowA + innerRow;
      let inputCol = tileColA + innerCol;
      ${qi(a,i)}
    }
  }

  // Load one tile of B into local memory.
  for (var innerRow = 0; innerRow < ${w}; innerRow = innerRow + 1) {
    for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
      let inputRow = tileRowB + innerRow;
      let inputCol = tileCol + innerCol;
      mm_Bsub[inputRow][inputCol] = mm_readB(batch,
        kStart + inputRow,
        globalCol + innerCol${i?", batchIndices":""});
    }
  }
  kStart = kStart + tileInner;
  workgroupBarrier();

  // Compute acc values for a single thread.
  var BCached : array<${r}, colPerThread>;
  for (var k = 0; k < tileInner; k = k + 1) {
    for (var inner = 0; inner < colPerThread; inner = inner + 1) {
      BCached[inner] = mm_Bsub[k][tileCol + inner];
    }

    for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
      ${ku(a)}
      for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
        acc[innerRow][innerCol] = acc[innerRow][innerCol] + ACached * BCached[innerCol];
      }
    }
  }

  workgroupBarrier();
}

for (var innerRow = 0; innerRow < rowPerThread; innerRow = innerRow + 1) {
  for (var innerCol = 0; innerCol < colPerThread; innerCol = innerCol + 1) {
    mm_write(batch, globalRow + innerRow, globalCol + innerCol,
        acc[innerRow][innerCol]);
  }
}
`;return`
  var<workgroup> mm_Asub : array<array<${r}, ${f}>, ${g}>;
  var<workgroup> mm_Bsub : array<array<${r}, ${h}>, ${n}>;
  const rowPerThread = ${e[1]};
  const colPerThread = ${e[0]};
  const tileInner = ${n};

@compute @workgroup_size(${t[0]}, ${t[1]}, ${t[2]})
fn main(@builtin(local_invocation_id) localId : vec3<u32>,
        @builtin(global_invocation_id) globalId : vec3<u32>,
        @builtin(workgroup_id) workgroupId : vec3<u32>) {
    let batch = ${s?"0":"i32(globalId.z)"};
    ${i?`let batchIndices = ${i.offsetToIndices("u32(batch)")};`:""}
    let num_tiles = ${s?`${Math.ceil(u/n)}`:"(uniforms.dim_inner - 1) / tileInner + 1"};
    var kStart = ${s?`i32(globalId.z) * ${u}`:"0"};

    var acc : array<array<${r}, colPerThread>, rowPerThread>;
    ${S}
  }
`},Iu=(e,t,r,i,a=!1)=>{let[n,s,u,d]=i,p=Te(i[0].type.tensor);return`
    fn mm_readA(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ie(e,p)} {
      var value = ${Ie(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_a_outer && col < uniforms.dim_inner)
      {
        var aIndices: ${s.type.indices};
        ${lr("aIndices",s,s.rank-2,n.rank,"batchIndices")}
        ${s.indicesSet("aIndices",s.rank-2,"u32(row)")}
        ${s.indicesSet("aIndices",s.rank-1,"u32(colIn)")}
        value = ${s.getByIndices("aIndices")};
      }
      return value;
    }

    fn mm_readB(batch: i32, row: i32, colIn: i32, batchIndices: ${n.type.indices}) -> ${Ie(e,p)} {
      var value = ${Ie(e,p)}(0.0);
      let col = colIn * ${e};
      if(row < uniforms.dim_inner && col < uniforms.dim_b_outer)
      {
        var bIndices: ${u.type.indices};
        ${lr("bIndices",u,u.rank-2,n.rank,"batchIndices")}
        ${u.indicesSet("bIndices",u.rank-2,"u32(row)")}
        ${u.indicesSet("bIndices",u.rank-1,"u32(colIn)")}
        value = ${u.getByIndices("bIndices")};
      }
      return value;
    }

    fn mm_write(batch: i32, row: i32, colIn: i32, valueIn: ${Ie(e,p)}) {
      let col = colIn * ${e};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer) {
        var value = valueIn;
        let coords = vec3<i32>(batch, row, colIn);
        ${t?`value = value + ${a?"bias[colIn]":`${Ie(e,p)}(bias[row])`};`:""}
        ${r}
        ${d.setByIndices("vec3<u32>(coords)","value")}
      }
    }
    `},Fr=(e,t,r,i,a=!1,n)=>{let s=e[0].dims,u=e[1].dims,d=s.slice(0,-2),p=u.slice(0,-2),h=i?i.slice(0,-2):r.slice(0,-2),f=O.size(h),g=s[s.length-2],y=s[s.length-1],_=u[u.length-1],w=y%4===0&&_%4===0,S=g<=8?[4,1,1]:[4,4,1],x=[8,8,1],b=[Math.ceil(_/x[0]/S[0]),Math.ceil(g/x[1]/S[1]),Math.ceil(f/x[2]/S[2])],I=w?4:1,k=[...d,g,y/I],E=k.length,C=[...p,y,_/I],A=C.length,v=[f,g,_/I],M=[{type:6,data:g},{type:6,data:_},{type:6,data:y}];Ct(t,M),M.push(...Y(h,k,C));let D=["rank","rank"],H=e.length>2;H&&(M.push(...Y(e[2].dims)),D.push("rank")),M.push(...Y(v));let G=Q=>{let R=h.length,j=La("batchDims",e[0].dataType,R,1),F=Te(e[0].dataType),X=N("a",e[0].dataType,E,I),le=N("b",e[1].dataType,A,I),W=K("result",e[0].dataType,v.length,I),me=[X,le];if(H){let be=a?I:1;me.push(N("bias",e[2].dataType,e[2].dims.length,be))}let U=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"}];At(t,U);let P=Te(W.type.tensor),J=zt(t,W.type.value,P),ee=Iu(I,H,J,[j,X,le,W],a);return`
  ${Q.registerUniforms(U).registerInternalVariables(j).declareVariables(...me,W)}
  ${ee}
  ${w?xa(S,x,F,j):Sa(S,x,F,j)}
                   `};return{name:"MatMul",shaderCache:{hint:`${S};${t.activation};${w};${a}`,inputDependencies:D},getRunData:()=>({outputs:[{dims:n?n(r):r,dataType:e[0].dataType}],dispatchGroup:{x:b[0],y:b[1],z:b[2]},programUniforms:M}),getShaderSource:G}}}),Eu,Lc,ly=q(()=>{te(),it(),ae(),Rt(),ja(),uy(),Za(),Eu=(e,t,r,i,a=!1,n,s=4,u=4,d=4,p="f32")=>{let h=M=>{switch(M){case 1:return"resData = x[xIndex];";case 3:return`resData = vec3<${p}>(x[xIndex], x[xIndex + 1], x[xIndex + 2]);`;case 4:return"resData = x[xIndex / 4];";default:throw new Error(`innerElementSize ${M} is not supported.`)}},f=M=>{switch(M){case 1:return"return w[row * i32(uniforms.w_shape[3]) + colIn];";case 4:return"return w[row * i32(uniforms.w_shape[3]) / 4 + colIn];";default:throw new Error(`innerElementSize ${M} is not supported.`)}},g=e?`
    let coord = vec4<i32>(batch, xRow, xCol, xCh);
    `:`
    let coord = vec4<i32>(batch, xCh, xRow, xCol);
    `,y=e?`
    let coords = vec4<i32>(
      batch,
      row / outWidth,
      row % outWidth,
      col);
    `:`
    let coords = vec4<i32>(
      batch,
      row,
      col / outWidth,
      col % outWidth);
    `,_=e?"i32(uniforms.x_shape[1])":"i32(uniforms.x_shape[2])",w=e?"i32(uniforms.x_shape[2])":"i32(uniforms.x_shape[3])",S=e?"row":"col",x=e?"col":"row",b=`
    let inChannels = i32(uniforms.w_shape[2]);
    let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
    let outRow = ${S} / outWidth;
    let outCol = ${S} % outWidth;

    let WRow = ${x} / (i32(uniforms.w_shape[1]) * inChannels);
    let WCol = ${x} / inChannels % i32(uniforms.w_shape[1]);
    let xRow = outRow * uniforms.stride[0] + uniforms.dilation[0] * WRow - uniforms.pad[0];
    let xCol = outCol * uniforms.stride[1] + uniforms.dilation[1] * WCol - uniforms.pad[1];
    let xCh = ${x} % inChannels;
    var resData = ${Ie(s,p)}(0.0);
    // The bounds checking is always needed since we use it to pad zero for
    // the 'same' padding type.
    if (xRow >= 0 && xRow < ${_} && xCol >= 0 && xCol < ${w}) {
      ${g}
      let xIndex = getIndexFromCoords4D(coord, vec4<i32>(uniforms.x_shape));
      ${h(s)}
    }
    return resData;`,I=e?t&&i?`
    let col = colIn * ${s};
    ${b}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_a_outer && col < uniforms.dim_inner) {
      ${b}
    }
    return ${Ie(s,p)}(0.0);`:i&&r?`
    let col = colIn * ${s};
    ${b}`:`
    let col = colIn * ${s};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${b}
    }
    return ${Ie(s,p)}(0.0);`,k=e?i&&r?f(u):`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_b_outer) {
      ${f(u)}
    }
    return ${Ie(u,p)}(0.0);`:`
    let col = colIn * ${u};
    if (row < uniforms.dim_inner && col < uniforms.dim_a_outer) {
      ${f(u)}
    }
    return ${Ie(u,p)}(0.0);`,E=Ie(d,p),C=Ie(e?s:u,p),A=Ie(e?u:s,p),v=zt(n,E,p);return`
    fn mm_readA(batch: i32, row : i32, colIn : i32) -> ${C} {
      ${e?I:k}
    }

    fn mm_readB(batch: i32, row : i32, colIn : i32) -> ${A} {
      ${e?k:I}
    }

    fn mm_write(batch: i32, row : i32, colIn : i32, valueIn : ${E}) {
      let col = colIn * ${d};
      if (row < uniforms.dim_a_outer && col < uniforms.dim_b_outer)
      {
      var value = valueIn;
      let outWidth = ${e?"i32(uniforms.result_shape[2])":"i32(uniforms.result_shape[3])"};
      ${y}
      ${qc(a)}
      ${v}
      setOutputAtCoords(coords[0], coords[1], coords[2], coords[3], value);
      }
    }`},Lc=(e,t,r,i,a,n,s,u,d)=>{let p=t.format==="NHWC",h=p?e[0].dims[3]:e[0].dims[1],f=r[0],g=p?r[2]:r[3],y=p?r[1]:r[2],_=p?r[3]:r[1],w=p&&(h%4===0||h%3===0)&&_%4===0,S=p?_:g*y,x=p?g*y:_,b=[8,8,1],I=i<=8?[4,1,1]:[4,4,1],k=[Math.ceil(S/b[0]/I[0]),Math.ceil(x/b[1]/I[1]),Math.ceil(f/b[2]/I[2])];de("verbose",()=>`[conv2d_mm_webgpu] dispatch = ${k}`);let E=w?p&&h%4!==0?3:4:1,C=b[1]*I[1],A=b[0]*I[0],v=Math.max(b[0]*E,b[1]),M=i%C===0,D=a%A===0,H=n%v===0,G=w?[E,4,4]:[1,1,1],Q=[{type:6,data:i},{type:6,data:a},{type:6,data:n},{type:6,data:[t.pads[0],t.pads[1]]},{type:6,data:t.strides},{type:6,data:t.dilations}];Ct(t,Q),Q.push(...Y(e[0].dims,e[1].dims));let R=["rank","rank"];s&&(Q.push(...Y(e[2].dims)),R.push("rank")),Q.push(...Y(r));let j=F=>{let X=[{name:"dim_a_outer",type:"i32"},{name:"dim_b_outer",type:"i32"},{name:"dim_inner",type:"i32"},{name:"pad",type:"i32",length:2},{name:"stride",type:"i32",length:2},{name:"dilation",type:"i32",length:2}];At(t,X);let le=w?4:1,W=Te(e[0].dataType),me=`
      fn setOutputAtIndex(flatIndex : i32, value : ${w?`vec4<${W}>`:W}) {
        result[flatIndex] = ${w?`vec4<${W}>`:W}(value);
      }
      fn setOutputAtCoords(d0 : i32, d1 : i32, d2 : i32, d3 : i32, value : ${w?`vec4<${W}>`:W}) {
        let flatIndex = getOutputIndexFromCoords(vec4<i32>(d0, d1, d2, d3));
        setOutputAtIndex(flatIndex ${w?"/ 4":""}, value);
      }`,U=N("x",e[0].dataType,e[0].dims.length,E===3?1:E),P=N("w",e[1].dataType,e[1].dims.length,le),J=[U,P],ee=K("result",e[0].dataType,r.length,le);if(s){let be=N("bias",e[2].dataType,e[2].dims.length,le);J.push(be),me+=`
        fn getBiasByOutputCoords(coords : vec4<i32>) -> ${w?`vec4<${W}>`:W} {
          return bias[coords.${p?"w":"y"}${w?"/ 4":""}];
        }`}return`
        ${Wc("uniforms.result_strides")}
        //struct Uniforms { xShape : vec4<i32>, wShape : vec4<i32>, outShape : vec4<i32>,
        //  outShapeStrides: vec3<i32>, filterDims : vec2<i32>, pad : vec2<i32>, stride : vec2<i32>,
        //  dilation : vec2<i32>, dimAOuter : i32, dimBOuter : i32, dimInner : i32 };
        ${F.registerUniforms(X).declareVariables(...J,ee)}
        ${me}
        ${Eu(p,M,D,H,s,t,G[0],G[1],G[2],W)}
        ${w?xa(I,b,W,void 0,!p,v):Sa(I,b,W,void 0,!p,v,!1,void 0,u)}`};return{name:"Conv2DMatMul",shaderCache:{hint:`${t.cacheKey};${E};${w};${M};${D};${H};${C};${A};${v}`,inputDependencies:R},getRunData:()=>({outputs:[{dims:d?d(r):r,dataType:e[0].dataType}],dispatchGroup:{x:k[0],y:k[1],z:k[2]},programUniforms:Q}),getShaderSource:j}}}),zu,Wi,Jt,Cu,Li,Au,Vc,Gc,dy=q(()=>{te(),it(),ie(),ae(),Rt(),ja(),zu=e=>{let t=1;for(let r=0;r<e.length;r++)t*=e[r];return t},Wi=e=>typeof e=="number"?[e,e,e]:e,Jt=(e,t)=>t<=1?e:e+(e-1)*(t-1),Cu=(e,t,r,i=1)=>{let a=Jt(t,i);return Math.floor((e[0]*(r-1)-r+a)/2)},Li=(e,t,r,i,a)=>{a==null&&(a=Cu(e,t[0],i[0]));let n=[0,0,0,r];for(let s=0;s<3;s++)e[s]+2*a>=t[s]&&(n[s]=Math.trunc((e[s]-t[s]+2*a)/i[s]+1));return n},Au=(e,t,r,i,a,n,s,u,d,p)=>{let h,f,g,y;if(e==="VALID"&&(e=0),typeof e=="number"){h={top:e,bottom:e,left:e,right:e,front:e,back:e};let _=Li([t,r,i,1],[u,d,p],1,[a,n,s],e);f=_[0],g=_[1],y=_[2]}else if(Array.isArray(e)){if(!e.every((w,S,x)=>w===x[0]))throw Error(`Unsupported padding parameter: ${e}`);h={top:e[0],bottom:e[1],left:e[2],right:e[3],front:e[4],back:e[5]};let _=Li([t,r,i,1],[u,d,p],1,[a,n,s],e[0]);f=_[0],g=_[1],y=_[2]}else if(e==="SAME_UPPER"){f=Math.ceil(t/a),g=Math.ceil(r/n),y=Math.ceil(i/s);let _=(f-1)*a+u-t,w=(g-1)*n+d-r,S=(y-1)*s+p-i,x=Math.floor(_/2),b=_-x,I=Math.floor(w/2),k=w-I,E=Math.floor(S/2),C=S-E;h={top:I,bottom:k,left:E,right:C,front:x,back:b}}else throw Error(`Unknown padding parameter: ${e}`);return{padInfo:h,outDepth:f,outHeight:g,outWidth:y}},Vc=(e,t,r,i,a,n=!1,s="channelsLast")=>{let u,d,p,h,f;if(s==="channelsLast")[u,d,p,h,f]=e;else if(s==="channelsFirst")[u,f,d,p,h]=e;else throw new Error(`Unknown dataFormat ${s}`);let[g,,y,_,w]=t,[S,x,b]=Wi(r),[I,k,E]=Wi(i),C=Jt(y,I),A=Jt(_,k),v=Jt(w,E),{padInfo:M,outDepth:D,outHeight:H,outWidth:G}=Au(a,d,p,h,S,x,b,C,A,v),Q=n?g*f:g,R=[0,0,0,0,0];return s==="channelsFirst"?R=[u,Q,D,H,G]:s==="channelsLast"&&(R=[u,D,H,G,Q]),{batchSize:u,dataFormat:s,inDepth:d,inHeight:p,inWidth:h,inChannels:f,outDepth:D,outHeight:H,outWidth:G,outChannels:Q,padInfo:M,strideDepth:S,strideHeight:x,strideWidth:b,filterDepth:y,filterHeight:_,filterWidth:w,effectiveFilterDepth:C,effectiveFilterHeight:A,effectiveFilterWidth:v,dilationDepth:I,dilationHeight:k,dilationWidth:E,inShape:e,outShape:R,filterShape:t}},Gc=(e,t,r,i,a,n)=>{let s=n==="channelsLast";s?e[0].dims[3]:e[0].dims[1];let u=[64,1,1],d={x:r.map((S,x)=>x)},p=[Math.ceil(zu(d.x.map(S=>r[S]))/u[0]),1,1];de("verbose",()=>`[conv3d_naive_webgpu] dispatch = ${p}`);let h=1,f=O.size(r),g=[{type:12,data:f},{type:12,data:i},{type:12,data:a},{type:12,data:t.strides},{type:12,data:t.dilations}];Ct(t,g),g.push(...Y(e[0].dims,e[1].dims));let y=["rank","rank"],_=e.length===3;_&&(g.push(...Y(e[2].dims)),y.push("rank")),g.push(...Y(r));let w=S=>{let x=[{name:"output_size",type:"u32"},{name:"filter_dims",type:"u32",length:i.length},{name:"pads",type:"u32",length:a.length},{name:"strides",type:"u32",length:t.strides.length},{name:"dilations",type:"u32",length:t.dilations.length}];At(t,x);let b=1,I=Te(e[0].dataType),k=N("x",e[0].dataType,e[0].dims.length,h),E=N("W",e[1].dataType,e[1].dims.length,b),C=[k,E],A=K("result",e[0].dataType,r.length,b),v="";if(_){let H=N("bias",e[2].dataType,e[2].dims.length,b);C.push(H),v+=`
        fn getBiasByOutputCoords(coords : array<u32, 5>) -> ${I} {
          return bias[${s?Z("coords",4,5):Z("coords",1,5)}];
        }`}let M=Ie(h,I),D=zt(t,M,I);return`
            ${v}
            fn getX(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${k.getByIndices("aIndices")};
            }
            fn getW(d0 : u32, d1 : u32, d2 : u32, d3 : u32, d4 : u32) -> f32 {
              let aIndices = array<u32, 5>(d0, d1, d2, d3, d4);
              return ${E.getByIndices("aIndices")};
            }
          ${S.registerUniforms(x).declareVariables(...C,A)}
          ${S.mainStart()}
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
              let coords = ${A.offsetToIndices("global_idx")};
              let batch = ${Z("coords",0,k.rank)};
              let d2 = ${s?Z("coords",k.rank-1,k.rank):Z("coords",1,k.rank)};
              let xFRCCorner = vec3<u32>(${s?Z("coords",1,k.rank):Z("coords",2,k.rank)},
              ${s?Z("coords",2,k.rank):Z("coords",3,k.rank)},
              ${s?Z("coords",3,k.rank):Z("coords",4,k.rank)}) * uniforms.strides - uniforms.pads;
              let xFCorner = xFRCCorner.x;
              let xRCorner = xFRCCorner.y;
              let xCCorner = xFRCCorner.z;
              let xShapeY = ${s?Z("uniforms.x_shape",1,k.rank):Z("uniforms.x_shape",2,k.rank)};
              let xShapeZ = ${s?Z("uniforms.x_shape",2,k.rank):Z("uniforms.x_shape",3,k.rank)};
              let xShapeW = ${s?Z("uniforms.x_shape",3,k.rank):Z("uniforms.x_shape",4,k.rank)};
              let xShapeU = ${s?Z("uniforms.x_shape",4,k.rank):Z("uniforms.x_shape",1,k.rank)};
              let inputDepthNearestVec4 = (xShapeU / 4) * 4;
              let inputDepthVec4Remainder = xShapeU % 4;

              var value = 0.0;
              for (var wF = 0u; wF < uniforms.filter_dims[0]; wF++) {
                let xF = xFCorner + wF * uniforms.dilations[0];
                if (xF < 0 || xF >= xShapeY) {
                  continue;
                }

                for (var wR = 0u; wR < uniforms.filter_dims[1]; wR++) {
                  let xR = xRCorner + wR * uniforms.dilations[1];
                  if (xR < 0 || xR >= xShapeZ) {
                    continue;
                  }

                  for (var wC = 0u; wC < uniforms.filter_dims[2]; wC++) {
                    let xC = xCCorner + wC * uniforms.dilations[2];
                    if (xC < 0 || xC >= xShapeW) {
                      continue;
                    }

                    for (var d1 = 0u; d1 < inputDepthNearestVec4; d1 += 4) {
                      ${s?`let xValues = vec4<f32>(
                               getX(batch, xF, xR, xC, d1),
                               getX(batch, xF, xR, xC, d1 + 1),
                               getX(batch, xF, xR, xC, d1 + 2),
                               getX(batch, xF, xR, xC, d1 + 3));
                            `:`let xValues = vec4<f32>(
                               getX(batch, d1, xF, xR, xC),
                               getX(batch, d1 + 1, xF, xR, xC),
                               getX(batch, d1 + 2, xF, xR, xC),
                               getX(batch, d1 + 3, xF, xR, xC));
                            `}
                            let wValues = vec4<f32>(
                              getW(d2, d1, wF, wR, wC),
                              getW(d2, d1 + 1, wF, wR, wC),
                              getW(d2, d1 + 2, wF, wR, wC),
                              getW(d2, d1 + 3, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                    if (inputDepthVec4Remainder == 1) {
                        ${s?`value += getX(batch, xF, xR, xC, inputDepthNearestVec4)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`:`value += getX(batch, inputDepthNearestVec4, xF, xR, xC)
                          * getW(d2, inputDepthNearestVec4, wF, wR, wC);`}
                    } else if (inputDepthVec4Remainder == 2) {
                      ${s?`let xValues = vec2<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1));
                      `:`let xValues = vec2<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC));
                    `}
                    let wValues = vec2<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC));
                      value += dot(xValues, wValues);
                    } else if (inputDepthVec4Remainder == 3) {
                      ${s?`let xValues = vec3<f32>(
                        getX(batch, xF, xR, xC, inputDepthNearestVec4),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 1),
                        getX(batch, xF, xR, xC, inputDepthNearestVec4 + 2));
                      `:`let xValues = vec3<f32>(
                        getX(batch, inputDepthNearestVec4, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 1, xF, xR, xC),
                        getX(batch, inputDepthNearestVec4 + 2, xF, xR, xC));
                    `}
                    let wValues = vec3<f32>(
                      getW(d2, inputDepthNearestVec4, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 1, wF, wR, wC),
                      getW(d2, inputDepthNearestVec4 + 2, wF, wR, wC));
                      value += dot(xValues, wValues);
                    }
                  }
                }
              }
              ${_?"value = value + getBiasByOutputCoords(coords)":""};
              ${D}
              result[global_idx] = f32(value);
          }`};return{name:"Conv3DNaive",shaderCache:{hint:`${t.cacheKey};${s};${h};${_}`,inputDependencies:y},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:p[0],y:p[1],z:p[2]},programUniforms:g}),getShaderSource:w}}}),Hc,Fc,py=q(()=>{te(),ie(),ae(),Rt(),Hc=(e,t,r,i)=>{let a=e.length>2,n=a?"value += b[output_channel];":"",s=e[0].dims,u=e[1].dims,d=t.format==="NHWC",p=d?r[3]:r[1],h=p/t.group,f=d&&h>=4?ve(p):1,g=O.size(r)/f,y=[{type:12,data:g},{type:12,data:t.dilations},{type:12,data:[t.strides[0],t.strides[1]]},{type:12,data:[t.pads[0],t.pads[1]]},{type:12,data:h}];Ct(t,y),y.push(...Y(s,[u[0],u[1],u[2],u[3]/f]));let _=a?["rank","rank","rank"]:["rank","rank"];y.push(...Y([r[0],r[1],r[2],r[3]/f]));let w=S=>{let x=K("output",e[0].dataType,r.length,f),b=Te(x.type.tensor),I=zt(t,x.type.value,b),k=N("x",e[0].dataType,s.length),E=N("w",e[1].dataType,u.length,f),C=[k,E];a&&C.push(N("b",e[2].dataType,e[2].dims,f));let A=[{name:"output_size",type:"u32"},{name:"dilations",type:"u32",length:t.dilations.length},{name:"strides",type:"u32",length:2},{name:"pads",type:"u32",length:2},{name:"output_channels_per_group",type:"u32"}];At(t,A);let v=d?`
      for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[0]; wHeight++) {
        let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

        if (xHeight < 0u || xHeight >= uniforms.x_shape[1]) {
          continue;
        }

        for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[1]; wWidth++) {
          let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
          if (xWidth < 0u || xWidth >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[2]; wInChannel++) {
            let input_channel = in_channel_offset + wInChannel;
            let xVal = ${k.get("batch","xHeight","xWidth","input_channel")};
            let wVal = ${E.get("wHeight","wWidth","wInChannel","output_channel")};
            value += xVal * wVal;
          }
        }
      }
      `:`
      for (var wInChannel: u32 = 0u; wInChannel < uniforms.w_shape[1]; wInChannel++) {
        let input_channel = in_channel_offset + wInChannel;
        for (var wHeight: u32 = 0u; wHeight < uniforms.w_shape[2]; wHeight++) {
          let xHeight = xRCCorner.x + wHeight * uniforms.dilations[0];

          if (xHeight < 0u || xHeight >= uniforms.x_shape[2]) {
            continue;
          }

          for (var wWidth: u32 = 0u; wWidth < uniforms.w_shape[3]; wWidth++) {
            let xWidth = xRCCorner.y + wWidth * uniforms.dilations[1];
            if (xWidth < 0u || xWidth >= uniforms.x_shape[3]) {
              continue;
            }

            let xVal = ${k.get("batch","input_channel","xHeight","xWidth")};
            let wVal = ${E.get("output_channel","wInChannel","wHeight","wWidth")};
            value += xVal * wVal;
          }
        }
      }
      `;return`
  ${S.registerUniforms(A).declareVariables(...C,x)}

  ${S.mainStart()}
    ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let outputIndices = ${x.offsetToIndices("global_idx")};
    let batch: u32 = outputIndices[0];
    let output_channel: u32 = outputIndices[${d?3:1}];
    let xRCCorner: vec2<u32> = vec2<u32>(outputIndices[${d?1:2}], outputIndices[${d?2:3}]) * uniforms.strides - uniforms.pads;
    let group_id: u32 = output_channel * ${f} / uniforms.output_channels_per_group;
    var in_channel_offset = group_id * uniforms.w_shape[${d?2:1}];

    var value: ${x.type.value} = ${x.type.value}(0);
    ${v}
    ${n}
    ${I}
    ${x.setByOffset("global_idx","value")}
  }`};return{name:"GroupedConv",shaderCache:{hint:`${t.cacheKey}_${f}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:w}},Fc=(e,t,r,i)=>{let a=e.length>2,n=ve(r[3]),s=ve(r[2]),u=O.size(r)/n/s,d=[e[0].dims[0],e[0].dims[1],e[0].dims[2],e[0].dims[3]/n],p=[e[1].dims[0],e[1].dims[1],e[1].dims[2],e[1].dims[3]/n],h=[r[0],r[1],r[2],r[3]/n],f=[{type:12,data:u},{type:6,data:[t.strides[0],t.strides[1]]},{type:6,data:[t.pads[0],t.pads[1]]}];Ct(t,f),f.push(...Y(d,p,h));let g=(s-1)*t.strides[1]+p[1],y=_=>{let w=K("output",e[0].dataType,h.length,n),S=Te(w.type.tensor),x=zt(t,w.type.value,S),b=N("x",e[0].dataType,d.length,n),I=N("w",e[1].dataType,p.length,n),k=[b,I];a&&k.push(N("b",e[2].dataType,e[2].dims,n));let E=a?"value += b[output_channel];":"",C=[{name:"output_size",type:"u32"},{name:"strides",type:"i32",length:2},{name:"pads",type:"i32",length:2}];return At(t,C),`
  ${_.registerUniforms(C).declareVariables(...k,w)}
  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let width0 = uniforms.output_shape[3];
    let output_channel = global_idx % width0;
    var index1 = global_idx / width0;
    let width1 = uniforms.output_shape[2] / ${s}u;
    let col = (index1 % width1) * ${s}u;
    index1 = index1 / width1;
    let row = index1 % uniforms.output_shape[1];
    let batch = index1 / uniforms.output_shape[1];

    let x_corner = vec2<i32>(i32(row), i32(col)) * uniforms.strides - uniforms.pads;

    var x_vals: array<${b.type.value}, ${g}>;
    var values: array<${w.type.value}, ${s}>;
    let input_channel = output_channel;
    // Use constant instead of uniform can give better performance for w's height/width.
    for (var w_height: u32 = 0u; w_height < ${p[0]}; w_height++) {
      let x_height = x_corner.x + i32(w_height);
      if (x_height >= 0 && u32(x_height) < uniforms.x_shape[1]) {
        for (var i = 0; i < ${g}; i++) {
          let x_width = x_corner.y + i;
          if (x_width >= 0 && u32(x_width) < uniforms.x_shape[2]) {
            x_vals[i] = ${b.get("batch","u32(x_height)","u32(x_width)","input_channel")};
          } else {
            x_vals[i] = ${b.type.value}(0);
          }
        }
        for (var w_width: u32 = 0u; w_width < ${p[1]}; w_width++) {
          let w_val = ${I.get("w_height","w_width","0","output_channel")};
          for (var i = 0u; i < ${s}u; i++) {
            values[i] = fma(x_vals[i * u32(uniforms.strides[1]) + w_width], w_val, values[i]);
          }
        }
      }
    }

    for (var i = 0u; i < ${s}u; i++) {
      var value = values[i];
      ${E}
      ${x}
      ${w.set("batch","row","col + i","output_channel","value")};
    }
  }`};return{name:"GroupedConv-Vectorize",shaderCache:{hint:`${t.cacheKey};${n};${s};${g};${p[0]};${p[1]}`,inputDependencies:a?["rank","rank","type"]:["rank","rank"]},getRunData:()=>({outputs:[{dims:i?i(r):r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:f}),getShaderSource:y}}}),Ou,Rr,Ru,Br,Ta,Vi,Bu,Nu,ka,cy=q(()=>{ie(),ly(),dy(),Za(),py(),Rt(),Qa(),gt(),Ou=(e,t,r,i,a,n)=>{let s=e[0],u=e.slice(n?1:2,n?3:4),d=u.length,p=t[0],h=t.slice(2).map((g,y)=>g+(g-1)*(r[y]-1)),f=u.map((g,y)=>g+i[y]+i[y+d]).map((g,y)=>Math.floor((g-h[y]+a[y])/a[y]));return f.splice(0,0,s),f.splice(n?3:1,0,p),f},Rr=[2,3,1,0],Ru=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length>5)throw new Error("greater than 5D is not supported");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[1]*t.group;if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");if(e.length===3&&(e[2].dims.length!==1||e[1].dims[0]!==e[2].dims[0]))throw new Error("invalid bias");let a=e[0].dims.length-2;if(t.dilations.length!==a)throw new Error(`dilations should be ${a}D`);if(t.strides.length!==a)throw new Error(`strides should be ${a}D`);if(t.pads.length!==a*2)throw new Error(`pads should be ${a*2}D`);if(t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape")},Br=(e,t)=>{let r=e.kernelShape.slice();r.length<t[1].dims.length-2&&r.push(...Array(t[1].dims.length-2-r.length).fill(0));for(let n=2;n<t[1].dims.length;++n)r[n-2]===0&&(r[n-2]=t[1].dims[n]);let i=e.pads.slice();Gr.adjustPadsBasedOnAutoPad(t[0].dims,e.strides,e.dilations,r,i,e.format==="NHWC",e.autoPad);let a=Object.assign({},e);return Object.assign(a,{kernelShape:r,pads:i}),a},Ta=e=>{let t=Fa(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],a=e.dilations,n=e.group,s=e.kernel_shape,u=e.pads,d=e.strides,p=e.w_is_const();return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,pads:u,strides:d,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Vi=(e,t,r,i)=>{let a=r.format==="NHWC",n=Ou(t[0].dims,t[1].dims,r.dilations,r.pads,r.strides,a);if(r.group!==1){let C=[t[0]];if(a){let A=e.kernelCustomData.wT??e.compute(Me(t[1],Rr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=A),C.push(A)}else C.push(t[1]);t.length===3&&C.push(t[2]),!e.adapterInfo.isArchitecture("ampere")&&a&&t[1].dims[0]===r.group&&t[1].dims[1]===1&&r.dilations[0]===1&&r.dilations[1]===1?e.compute(Fc(C,r,n,i),{inputs:C}):e.compute(Hc(C,r,n,i),{inputs:C});return}let s=t.length===3,u=t[0].dims[a?1:2],d=t[0].dims[a?2:3],p=t[0].dims[a?3:1],h=t[1].dims[2],f=t[1].dims[3],g=n[a?1:2],y=n[a?2:3],_=n[a?3:1],w=a&&h===u&&f===d&&r.pads[0]===0&&r.pads[1]===0;if(w||h===1&&f===1&&r.dilations[0]===1&&r.dilations[1]===1&&r.strides[0]===1&&r.strides[1]===1&&r.pads[0]===0&&r.pads[1]===0){let C=n[0],A,v,M,D=[];if(a){let Q=e.kernelCustomData.wT??e.compute(Me(t[1],Rr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];if(r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=Q),w){let R=u*d*p;A=t[0].reshape([1,C,R]),v=Q.reshape([1,R,_]),M=[1,C,_]}else A=t[0].reshape([C,u*d,p]),v=Q.reshape([1,p,_]),M=[C,g*y,_];D.push(A),D.push(v)}else A=t[0].reshape([C,p,u*d]),v=t[1].reshape([1,_,p]),M=[C,_,g*y],D.push(v),D.push(A);s&&D.push(t[2]);let H=M[2],G=D[0].dims[D[0].dims.length-1];H<8&&G<8?e.compute(Ka(D,r,n,M,a,i),{inputs:D}):e.compute(Fr(D,r,n,M,a,i),{inputs:D});return}let S=!0,x=e.kernelCustomData.wT??e.compute(Me(t[1],Rr),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=x);let b=[t[0],x];s&&b.push(t[2]);let I=a?g*y:_,k=a?_:g*y,E=h*f*p;e.compute(Lc(b,r,n,I,k,E,s,S,i),{inputs:b})},Bu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=[0,t.pads[0],0,t.pads[1]],n=[1].concat(t.strides),s=[1].concat(t.dilations),u=[1].concat(t.kernelShape),d=Br({...t,pads:a,strides:n,dilations:s,kernelShape:u},i);Vi(e,i,d,p=>r?[p[0],p[2],p[3]]:[p[0],p[1],p[3]])},Nu=(e,t,r)=>{let i=r.format==="NHWC"?"channelsLast":"channelsFirst",a=Br(r,t),n=r.autoPad==="NOTSET"?r.pads:r.autoPad,s=Vc(t[0].dims,t[1].dims,r.strides,r.dilations,n,!1,i);e.compute(Gc(t,a,s.outShape,[s.filterDepth,s.filterHeight,s.filterWidth],[s.padInfo.front,s.padInfo.top,s.padInfo.left],i))},ka=(e,t)=>{if(Ru(e.inputs,t),e.inputs[0].dims.length===3)Bu(e,t);else if(e.inputs[0].dims.length===5)Nu(e,e.inputs,t);else{let r=Br(t,e.inputs);Vi(e,e.inputs,r)}}}),jc,hy=q(()=>{te(),it(),ie(),ae(),jc=(e,t,r)=>{let i=e.length>2,a=t.outputShape,n=t.format==="NHWC",s=t.group,u=e[1].dims,d=u[2]/s,p=u[3],h=n?ve(d):1,f=n&&p===1&&d>=4,g=f?Math.floor(d/4)*4:Math.floor(d/h)*h,y=d-g,_=n?ve(p):1,w=n?p===1?h:_:1,S=O.size(a)/_,x=[Math.ceil(S/64),1,1];de("verbose",()=>`[conv2d_backprop_webgpu] dispatch = ${x}`);let b=["rank","rank"],I=[t.strides[0],t.strides[1]],k=[t.kernelShape[n?1:2],t.kernelShape[n?2:3]],E=[t.dilations[0],t.dilations[1]],C=[k[0]+(t.dilations[0]<=1?0:(t.kernelShape[n?1:2]-1)*(t.dilations[0]-1)),k[1]+(t.dilations[1]<=1?0:(t.kernelShape[n?2:3]-1)*(t.dilations[1]-1))],A=[C[0]-1-Math.floor((t.pads[0]+t.pads[2])/2),C[1]-1-Math.floor((t.pads[1]+t.pads[3])/2)],v=[{type:12,data:S},{type:12,data:I},{type:12,data:k},{type:12,data:E},{type:12,data:C},{type:6,data:A},{type:12,data:g},{type:12,data:d},{type:12,data:p},...Y(e[0].dims,e[1].dims)];i&&(v.push(...Y(e[2].dims)),b.push("rank")),v.push(...Y(a));let M=D=>{let H=[{name:"output_size",type:"u32"},{name:"strides",type:"u32",length:I.length},{name:"filter_dims",type:"u32",length:k.length},{name:"dilations",type:"u32",length:k.length},{name:"effective_filter_dims",type:"u32",length:C.length},{name:"pads",type:"i32",length:A.length},{name:"input_channels_per_group_int",type:"u32"},{name:"input_channels_per_group",type:"u32"},{name:"output_channels_per_group",type:"u32"}],G=Te(e[0].dataType),Q=n?1:2,R=n?2:3,j=n?3:1,F=N("W",e[1].dataType,e[1].dims.length,w),X=N("Dy",e[0].dataType,e[0].dims.length,h),le=[X,F];i&&le.push(N("bias",e[2].dataType,[a[j]].length,_));let W=K("result",e[0].dataType,a.length,_),me=()=>{let J="";if(f)h===4?J+=`
        let xValue = ${X.getByOffset("x_offset")};
        let wValue = ${F.getByOffset("w_offset")};
        dotProd = dotProd + dot(xValue, wValue);
        x_offset += 1u;
        w_offset += 1u;`:h===2?J+=`
          dotProd = dotProd + dot(vec4<${G}>(${X.getByOffset("x_offset")}, ${X.getByOffset("x_offset + 1u")}), vec4<${G}>(${F.getByOffset("w_offset")}, ${F.getByOffset("w_offset + 1u")}));
          x_offset += 2u;
          w_offset += 2u;`:h===1&&(J+=`
          dotProd = dotProd + dot(vec4<${G}>(${X.getByOffset("x_offset")}, ${X.getByOffset("x_offset + 1u")}, ${X.getByOffset("x_offset + 2u")}, ${X.getByOffset("x_offset + 3u")}), vec4<${G}>(${F.getByOffset("w_offset")}, ${F.getByOffset("w_offset + 1u")}, ${F.getByOffset("w_offset + 2u")}, ${F.getByOffset("w_offset + 3u")}));
          x_offset += 4u;
          w_offset += 4u;`);else if(J+=`
                  let xValue = ${n?X.getByOffset(`${X.indicesToOffset(`${X.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h}`):X.get("batch","inputChannel","idyR","idyC")};
        `,h===1)J+=`
          let w_offset = ${F.indicesToOffset(`${F.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel, wOutChannel)`)};
          let wValue = ${F.getByOffset(`w_offset / ${w}`)};
          dotProd = dotProd + xValue * wValue;`;else for(let ee=0;ee<h;ee++)J+=`
            let wValue${ee} = ${F.getByOffset(`${F.indicesToOffset(`${F.type.indices}(u32(wRPerm), u32(wCPerm), inputChannel + ${ee}, wOutChannel)`)} / ${w}`)};
            dotProd = dotProd + xValue[${ee}] * wValue${ee};`;return J},U=()=>{if(y===0)return"";if(!f)throw new Error(`packInputAs4 ${f} is not true.`);let J="";if(h===1){J+="dotProd = dotProd";for(let ee=0;ee<y;ee++)J+=`
            + ${X.getByOffset(`x_offset + ${ee}`)} * ${F.getByOffset(`w_offset + ${ee}`)}`;J+=";"}else if(h===2){if(y!==2)throw new Error(`Invalid inputChannelsRemainder ${y}.`);J+=`
          let xValue = ${X.getByOffset("x_offset")};
          let wValue = ${F.getByOffset("w_offset")};
          dotProd = dotProd + dot(xValue, wValue);`}return J},P=`
            let outputIndices = ${W.offsetToIndices(`global_idx * ${_}`)};
            let batch = ${W.indicesGet("outputIndices",0)};
            let d1 = ${W.indicesGet("outputIndices",j)};
            let r = ${W.indicesGet("outputIndices",Q)};
            let c = ${W.indicesGet("outputIndices",R)};
            let dyCorner = vec2<i32>(i32(r), i32(c)) - uniforms.pads;
            let dyRCorner = dyCorner.x;
            let dyCCorner = dyCorner.y;
            let groupId = d1 / uniforms.output_channels_per_group;
            let wOutChannel = d1 - groupId * uniforms.output_channels_per_group;
            // Convolve dy(?, ?, d2) with w(:, :, d1, d2) to compute dx(xR, xC, d1).
            // ? = to be determined. : = across all values in that axis.
            var dotProd = ${W.type.value}(0.0);
            var wR: u32 = 0;
            if (uniforms.dilations.x == 1) {
              // Minimum wR >= 0 that satisfies (dyRCorner + wR) % (uniforms.strides.x) == 0
              wR = u32(((dyRCorner + i32(uniforms.strides.x) - 1) / i32(uniforms.strides.x)) * i32(uniforms.strides.x) - dyRCorner);
            }
            for (; wR < uniforms.effective_filter_dims.x; wR = wR + 1) {
              if (wR % uniforms.dilations.x != 0) {
                continue;
              }
              let dyR = (${G}(dyRCorner) + ${G}(wR)) / ${G}(uniforms.strides[0]);
              let wRPerm = uniforms.filter_dims.x - 1 - wR / uniforms.dilations.x;
              if (dyR < 0.0 || dyR >= ${G}(uniforms.Dy_shape[${Q}]) || fract(dyR) > 0.0 ||
                  wRPerm < 0) {
                continue;
              }
              let idyR: u32 = u32(dyR);
              var wC: u32 = 0;
              if (uniforms.dilations.y == 1) {
                // Minimum wC >= 0 that satisfies (dyCCorner + wC) % (uniforms.strides.y) == 0
                wC = u32(((dyCCorner + i32(uniforms.strides.y) - 1) / i32(uniforms.strides.y)) * i32(uniforms.strides.y) - dyCCorner);
              }
              for (; wC < uniforms.effective_filter_dims.y; wC = wC + 1) {
                if (wC % uniforms.dilations.y != 0) {
                  continue;
                }
                let dyC = (${G}(dyCCorner) + ${G}(wC)) / ${G}(uniforms.strides.y);
                let wCPerm = uniforms.filter_dims.y - 1 - wC / uniforms.dilations.y;
                if (dyC < 0.0 || dyC >= ${G}(uniforms.Dy_shape[${R}]) ||
                    fract(dyC) > 0.0 || wCPerm < 0) {
                  continue;
                }
                let idyC: u32 = u32(dyC);
                var inputChannel = groupId * uniforms.input_channels_per_group;
                ${f?`
                var x_offset = ${X.indicesToOffset(`${X.type.indices}(batch, idyR, idyC, inputChannel)`)} / ${h};
                var w_offset = ${F.indicesToOffset(`${F.type.indices}(wRPerm, wCPerm, inputChannel, wOutChannel)`)} / ${w};
                  `:""}
                for (var d2: u32 = 0; d2 < uniforms.input_channels_per_group_int; d2 = d2 + ${f?4:h}) {
                  ${me()}
                  inputChannel = inputChannel + ${f?4:h};
                }
                ${U()}
                wC = wC + uniforms.strides.y - 1;
              }
              wR = wR + uniforms.strides[0] - 1;
            }
            let value = dotProd${i?` + bias[d1 / ${_}]`:""};
            ${W.setByOffset("global_idx","value")};
          `;return`
    ${D.registerUniforms(H).declareVariables(...le,W)}
      ${D.mainStart()}
      ${D.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")};
    ${P}}`};return{name:"ConvTranspose2D",shaderCache:{hint:`${t.cacheKey};${h}${w}${_}${f}${y}`,inputDependencies:b},getRunData:()=>({dispatchGroup:{x:x[0],y:x[1],z:x[2]},outputs:[{dims:r?r(a):a,dataType:e[0].dataType}],programUniforms:v}),getShaderSource:M}}}),Mu,Du,Uu,Gi,Kc,Pu,Hi,qu,Qc,fy=q(()=>{hy(),Rt(),gt(),Mu=(e,t,r,i,a,n)=>(e-1)*t+r+(i-1)*a+1-n,Du=(e,t,r,i,a)=>{let n=Math.floor(e/2);t==="SAME_UPPER"?(r[i]=n,r[a]=e-n):t==="SAME_LOWER"&&(r[i]=e-n,r[a]=n)},Uu=(e,t,r,i,a,n,s,u,d,p)=>{let h=e.length-2,f=p.length===0;d.length<h&&d.push(...Array(h-d.length).fill(0));let g=e[0],y=t[u?3:1]*a;for(let _=0,w=e.length-h-(u?1:0);_<h;++_,++w){let S=e[w],x=f?S*s[_]:p[_],b=Mu(S,s[_],n[_],t[w],r[_],x);Du(b,i,n,_,_+h),f&&p.push(s[_]*(S-1)+d[_]+(t[w]-1)*r[_]+1-n[_]-n[_+h])}p.splice(0,0,g),p.splice(u?3:1,0,y)},Gi=(e,t)=>{let r=e.kernelShape.slice();if(e.kernelShape.length===0||e.kernelShape.reduce((f,g)=>f*g,1)===0){r.length=0;for(let f=2;f<t[1].dims.length;++f)r.push(t[1].dims[f])}let i=e.format==="NHWC";r.splice(0,0,t[1].dims[0]),r.splice(i?3:1,0,t[1].dims[1]);let a=e.pads.slice(),n=e.outputShape.slice(),s=e.outputPadding.slice(),u=t[0].dims,d=e.dilations.slice();if(d.reduce((f,g)=>f+g,0)===0){let f=t[0].dims.length-2;d=new Array(f).fill(1)}let p=e.strides.slice();if(p.reduce((f,g)=>f+g,0)===0){let f=t[0].dims.length-2;p=new Array(f).fill(1)}Uu(u,r,d,e.autoPad,e.group,a,p,i,s,n);let h=Object.assign({},e);return Object.assign(h,{kernelShape:r,pads:a,outputPadding:s,outputShape:n,dilations:d,strides:p}),h},Kc=e=>{let t=Fa(e),r=e.format,i=["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][typeof e.autoPad>"u"?0:e.autoPad],a=e.dilations,n=e.group??1,s=e.kernelShape,u=e.pads,d=e.strides,p=e.wIsConst(),h=e.outputPadding,f=e.outputShape;return{autoPad:i,format:r,dilations:a,group:n,kernelShape:s,outputPadding:h,outputShape:f,pads:u,strides:d,wIsConst:p,...t,cacheKey:`${e.format};${t.activation};`}},Pu=(e,t)=>{if(!e||e.length!==2&&e.length!==3)throw new Error("Conv requires 2 or 3 inputs");if(e[0].dims.length!==4&&e[0].dims.length!==3)throw new Error("currently only support 2-dimensional conv");if(e[0].dims.length!==e[1].dims.length)throw new Error("filter does not have same dimension as input");let r=e[0].dims[t.format==="NHWC"?e[0].dims.length-1:1],i=e[1].dims[0];if(r!==i)throw new Error("FILTER_IN_CHANNEL should be equal to DATA_CHANNEL");let a=e[1].dims[1]*t.group;if(e.length===3&&(e[2].dims.length!==1||e[2].dims[0]!==a))throw new Error("invalid bias");let n=e[0].dims.length-2;if(t.dilations.reduce((s,u)=>s+u,0)>0&&t.dilations.length!==n)throw new Error(`dilations should be ${n}D`);if(t.strides.reduce((s,u)=>s+u,0)>0&&t.strides.length!==n)throw new Error(`strides should be ${n}D`);if(t.pads.reduce((s,u)=>s+u,0)>0&&t.pads.length!==n*2)throw new Error(`pads should be ${n*2}D`);if(t.outputPadding.length!==n&&t.outputPadding.length!==0)throw new Error(`output_padding should be ${n}D`);if(t.kernelShape.reduce((s,u)=>s+u,0)>0&&t.kernelShape.length!==0&&t.kernelShape.length!==e[1].dims.length-2)throw new Error("invalid kernel shape");if(t.outputShape.length!==0&&t.outputShape.length!==e[0].dims.length-2)throw new Error("invalid output shape")},Hi=(e,t,r,i)=>{let a=e.kernelCustomData.wT??e.compute(Me(t[1],[2,3,0,1]),{inputs:[1],outputs:[r.wIsConst?-2:-1]})[0];r.wIsConst&&!e.kernelCustomData.wT&&(e.kernelCustomData.wT=a);let n=[t[0],a];t.length===3&&n.push(t[2]),e.compute(jc(n,r,i),{inputs:n})},qu=(e,t)=>{let r=t.format==="NHWC",i=[e.inputs[0].reshape(r?[e.inputs[0].dims[0],1,e.inputs[0].dims[1],e.inputs[0].dims[2]]:[e.inputs[0].dims[0],e.inputs[0].dims[1],1,e.inputs[0].dims[2]]),e.inputs[1].reshape([e.inputs[1].dims[0],e.inputs[1].dims[1],1,e.inputs[1].dims[2]])];e.inputs.length===3&&i.push(e.inputs[2]);let a=t.kernelShape;(a.length===0||a[0]===0)&&(a=[e.inputs[1].dims[2]]);let n=t.dilations;(n.length===0||n[0]===0)&&(n=[1]);let s=t.strides;(s.length===0||s[0]===0)&&(s=[1]);let u=t.pads;u.length===0&&(u=[0,0]),u=[0,u[0],0,u[1]],s=[1].concat(s),n=[1].concat(n),a=[1].concat(a);let d=t.outputPadding;d=[0].concat(d);let p=Gi({...t,pads:u,strides:s,dilations:n,kernelShape:a,outputPadding:d},i);Hi(e,i,p,h=>r?[h[0],h[2],h[3]]:[h[0],h[1],h[3]])},Qc=(e,t)=>{if(Pu(e.inputs,t),e.inputs[0].dims.length===3)qu(e,t);else{let r=Gi(t,e.inputs);Hi(e,e.inputs,r)}}}),Wu,Zc,Yc,my=q(()=>{te(),ie(),xe(),ae(),Wu=(e,t,r,i)=>{let a=O.size(t),n=t.length,s=N("input",e,n),u=K("output",e,n),d=r.dataType===6?r.getInt32Array()[0]:Number(r.getBigInt64Array()[0]),p=O.normalizeAxis(d,n),h=f=>{let g=` i32(${s.indicesGet("inputIndices","uniforms.axis")}) `,y=Z("uniforms.input_shape","uniforms.axis",n),_=i.reverse?g+(i.exclusive?" + 1":""):"0",w=i.reverse?y:g+(i.exclusive?"":" + 1");return`
                ${f.registerUniform("outputSize","u32").registerUniform("axis","u32").declareVariables(s,u)}
                ${f.mainStart()}
                  ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
                  var inputIndices = ${u.offsetToIndices("global_idx")};
                  var sum = ${u.type.value}(0);
                  let first : i32 = ${_};
                  let last : i32 = ${w};
                  for (var i : i32 = first; i < last; i++) {
                    ${s.indicesSet("inputIndices","uniforms.axis","u32(i)")};
                    sum = sum + ${s.getByIndices("inputIndices")};
                  }
                  ${u.setByOffset("global_idx","sum")};
                }`};return{name:"CumSum",shaderCache:{hint:i.cacheKey,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:t,dataType:e}],dispatchGroup:{x:Math.ceil(a/64)},programUniforms:[{type:12,data:a},{type:12,data:p},...Y(t,t)]}),getShaderSource:h}},Zc=(e,t)=>{let r=e.inputs[0].dims,i=e.inputs[0].dataType,a=e.inputs[1];e.compute(Wu(i,r,a,t),{inputs:[0]})},Yc=e=>{let t=e.exclusive===1,r=e.reverse===1;return he({exclusive:t,reverse:r})}}),Lu,Vu,Gu,Xc,Jc,gy=q(()=>{te(),ie(),xe(),ae(),Lu=e=>{if(!e||e.length!==1)throw new Error("DepthToSpace requires 1 input.");if(e[0].dims.length!==4)throw new Error("DepthToSpace requires 4D input.")},Vu=(e,t,r,i)=>{let a=[];a.push(`fn perm(i: ${i.type.indices}) -> ${r.type.indices} {
    var a: ${r.type.indices};`);for(let n=0;n<t;++n)a.push(r.indicesSet("a",e[n],`i[${n}]`));return a.push("return a;}"),a.join(`
`)},Gu=(e,t)=>{let r,i,a,n,s,u,d=t.format==="NHWC",p=t.blocksize,h=t.mode==="DCR";d?([r,i,a,n]=e.dims,s=h?[r,i,a,p,p,n/p**2]:[r,i,a,n/p**2,p,p],u=h?[0,1,3,2,4,5]:[0,1,4,2,5,3]):([r,i,a,n]=[e.dims[0],e.dims[2],e.dims[3],e.dims[1]],s=h?[r,p,p,n/p**2,i,a]:[r,n/p**2,p,p,i,a],u=h?[0,3,4,1,5,2]:[0,1,4,2,5,3]);let f=e.reshape(s),g=f.dims.length,y=e.dataType,_=N("a",y,g),w=K("output",y,g),S=x=>`
  ${x.registerUniform("output_size","u32").declareVariables(_,w)}

  ${Vu(u,g,_,w)}

  ${x.mainStart()}
    ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let indices = ${w.offsetToIndices("global_idx")};
    let aIndices = perm(indices);

    ${w.setByOffset("global_idx",_.getByIndices("aIndices"))}
  }`;return{name:"DepthToSpace",shaderCache:{hint:`${e.dims};${t.blocksize};${t.mode}`,inputDependencies:["rank"]},getRunData:x=>{let b=d?[r,i*p,a*p,n/p**2]:[r,n/p**2,i*p,a*p],I=O.size(b),k=f.dims,E=O.sortBasedOnPerm(k,u);return{outputs:[{dims:b,dataType:x[0].dataType}],dispatchGroup:{x:Math.ceil(I/64)},programUniforms:[{type:12,data:I},...Y(k,E)]}},getShaderSource:S}},Xc=(e,t)=>{Lu(e.inputs),e.compute(Gu(e.inputs[0],t))},Jc=e=>he({blocksize:e.blocksize,mode:e.mode,format:e.format})}),Nr,er,Fi,Hu,Fu,ju,Ku,ji,Qu,eh,th,yy=q(()=>{te(),ie(),xe(),ae(),Nr="[a-zA-Z]|\\.\\.\\.",er="("+Nr+")+",Fi="^"+er+"$",Hu="("+er+",)*"+er,Fu="^"+Hu+"$",ju=class{constructor(e=-1){this.symbolToIndices=new Map,this.inputIndex=e}addSymbol(e,t){let r=this.symbolToIndices.get(e);r===void 0?r=[t]:r.push(t),this.symbolToIndices.set(e,r)}},Ku=class{constructor(e,t){var a;this.equation=t,this.hasEllipsis=!1,this.symbolToInfo=new Map,this.lhs=new Array,this.outputDims=[];let[r,i]=t.includes("->")?t.split("->",2):[t,""];if(!r.match(RegExp(Fu)))throw new Error("Invalid LHS term");if(r.split(",").forEach((n,s)=>{let u=e[s].dims.slice();if(!n.match(RegExp(Fi)))throw new Error("Invalid LHS term");let d=this.processTerm(n,!0,u,s);this.lhs.push(d)}),i==="")i+=[...this.symbolToInfo.entries()].filter(([n,s])=>s.count===1||n==="...").map(([n])=>n).join("");else if(!i.match(RegExp(er)))throw new Error("Invalid RHS");(a=i.match(RegExp(Nr,"g")))==null||a.forEach(n=>{if(n==="...")this.outputDims=this.outputDims.concat(this.ellipsisDims);else{let s=this.symbolToInfo.get(n);if(s===void 0)throw new Error("Invalid RHS symbol");this.outputDims.push(s.dimValue)}}),this.rhs=this.processTerm(i,!1,this.outputDims)}addSymbol(e,t,r){let i=this.symbolToInfo.get(e);if(i!==void 0){if(i.dimValue!==t&&i.count!==1)throw new Error("Dimension mismatch");i.count++,i.inputIndices.push(r)}else i={count:1,dimValue:t,inputIndices:[r]};this.symbolToInfo.set(e,i)}processTerm(e,t,r,i=-1){let a=r.length,n=!1,s=[],u=0;if(!e.match(RegExp(Fi))&&!t&&e!=="")throw new Error("Invalid LHS term");let d=e.match(RegExp(Nr,"g")),p=new ju(i);return d==null||d.forEach((h,f)=>{if(h==="..."){if(n)throw new Error("Only one ellipsis is allowed per input term");n=!0;let g=a-d.length+1;if(g<0)throw new Error("Ellipsis out of bounds");if(s=r.slice(u,u+g),this.hasEllipsis){if(this.ellipsisDims.length!==s.length||this.ellipsisDims.toString()!==s.toString())throw new Error("Ellipsis dimensions mismatch")}else if(t)this.hasEllipsis=!0,this.ellipsisDims=s;else throw new Error("Ellipsis must be specified in the LHS");for(let y=0;y<s.length;y++){let _=String.fromCharCode(48+y);p.addSymbol(_,f+y),this.addSymbol(_,r[u++],i)}}else p.addSymbol(h,f+(this.hasEllipsis?this.ellipsisDims.length-1:0)),this.addSymbol(h,r[u++],i)}),p}},ji=e=>e+"_max",Qu=(e,t,r,i)=>{let a=e.map(p=>p.length).map((p,h)=>N(`input${h}`,t,p)),n=O.size(i),s=K("output",t,i.length),u=[...r.symbolToInfo.keys()].filter(p=>!r.rhs.symbolToIndices.has(p)),d=p=>{let h=[],f="var prod = 1.0;",g="var sum = 0.0;",y="sum += prod;",_=[],w=[],S=[],x=[],b=r.symbolToInfo.size===r.rhs.symbolToIndices.size;r.symbolToInfo.forEach((k,E)=>{var C;if(r.rhs.symbolToIndices.has(E)){let A=(C=r.rhs.symbolToIndices.get(E))==null?void 0:C[0];A!==void 0&&r.lhs.forEach((v,M)=>{if(k.inputIndices.includes(M)){let D=v.symbolToIndices.get(E);if(D===void 0)throw new Error("Invalid symbol error");D.forEach(H=>{h.push(`${a[M].indicesSet(`input${M}Indices`,H,s.indicesGet("outputIndices",A))}`)})}})}else r.lhs.forEach((A,v)=>{if(k.inputIndices.includes(v)){let M=A.symbolToIndices.get(E);if(M===void 0)throw new Error("Invalid symbol error");M.forEach(D=>{_.push(`${a[v].indicesSet(`input${v}Indices`,D,`${E}`)}`)}),x.push(`prod *= ${a[v].getByIndices(`input${v}Indices`)};`)}}),w.push(`for(var ${E}: u32 = 0; ${E} < uniforms.${ji(E)}; ${E}++) {`),S.push("}")});let I=b?[...h,`let sum = ${a.map((k,E)=>k.getByIndices(`input${E}Indices`)).join(" * ")};`]:[...h,g,...w,..._,f,...x,y,...S];return`
            ${p.registerUniforms(u.map(k=>({name:`${ji(k)}`,type:"u32"}))).registerUniform("outputSize","u32").declareVariables(...a,s)}

            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
            var outputIndices = ${s.offsetToIndices("global_idx")};
            ${a.map((k,E)=>`var input${E}Indices: ${a[E].type.indices};`).join(`
`)}
            ${I.join(`
`)};
            ${s.setByOffset("global_idx","sum")};
          }`};return{name:"Einsum",shaderCache:{hint:r.equation,inputDependencies:e.map(()=>"rank")},getRunData:()=>{let p=u.filter(f=>r.symbolToInfo.has(f)).map(f=>{var g;return{type:12,data:((g=r.symbolToInfo.get(f))==null?void 0:g.dimValue)||0}});p.push({type:12,data:n});let h=e.map((f,g)=>[...Y(f)]).reduce((f,g)=>f.concat(g),p);return h.push(...Y(i)),{outputs:[{dims:i,dataType:t}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:h}},getShaderSource:d}},eh=(e,t)=>{let r=new Ku(e.inputs,t.equation),i=r.outputDims,a=e.inputs.map((n,s)=>n.dims);e.compute(Qu(a,e.inputs[0].dataType,r,i))},th=e=>{let t=e.equation.replace(/\s+/g,"");return he({equation:t})}}),Zu,Ki,Yu,Xu,rh,_y=q(()=>{te(),ie(),ae(),Zu=e=>{if(!e||e.length!==2)throw new Error("Expand requires 2 input.");let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=r.length<t.length?0:r.length-t.length,a=t.length<r.length?0:t.length-r.length;for(;i<r.length&&a<t.length;++i,++a)if(r[i]!==t[a]&&r[i]!==1&&t[a]!==1)throw new Error("Expand requires shape to be broadcastable to input")},Ki=(e,t)=>{let r=e.length-t.length,i=[];for(let a=0;a<r;++a)i.push(e[a]);for(let a=0;a<t.length;++a)i.push(t[a]===1?e[a+r]:t[a]);return i},Yu=(e,t)=>e.length>t.length?Ki(e,t):Ki(t,e),Xu=e=>{let t=e[0].dims,r=Array.from(e[1].getBigInt64Array(),Number),i=Yu(t,r),a=e[0].dataType,n=a===9||O.size(t)===1,s=a===9||t.length>0&&t[t.length-1]%4===0?4:1,u=n||i.length>0&&i[i.length-1]%4===0?4:1,d=Math.ceil(O.size(i)/u),p=f=>{let g=N("input",a,t.length,s),y=K("output",a,i.length,u),_;if(a===9){let w=(S,x,b="")=>`
          let outputIndices${x} = ${y.offsetToIndices(`outputOffset + ${x}u`)};
          let offset${x} = ${g.broadcastedIndicesToOffset(`outputIndices${x}`,y)};
          let index${x} = offset${x} / 4u;
          let component${x} = offset${x} % 4u;
          ${S}[${x}] = ${b}(${g.getByOffset(`index${x}`)}[component${x}]);
        `;_=`
        let outputOffset = global_idx * ${u};
        var data = vec4<u32>(0);
        ${w("data",0,"u32")}
        ${w("data",1,"u32")}
        ${w("data",2,"u32")}
        ${w("data",3,"u32")}
        ${y.setByOffset("global_idx","data")}
      }`}else _=`
        let outputIndices = ${y.offsetToIndices(`global_idx * ${u}`)};
        let inputOffset = ${g.broadcastedIndicesToOffset("outputIndices",y)};
        let data = ${y.type.value}(${g.getByOffset(`inputOffset / ${s}`)});
        ${y.setByOffset("global_idx","data")}
      }`;return`
    ${f.registerUniform("vec_size","u32").declareVariables(g,y)}
    ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
    ${_}`},h=[{type:12,data:d},...Y(t,i)];return{name:"Expand",shaderCache:{hint:`${i.length};${s}${u}`,inputDependencies:["rank"]},getShaderSource:p,getRunData:()=>({outputs:[{dims:i,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:h})}},rh=e=>{Zu(e.inputs),e.compute(Xu(e.inputs),{inputs:[0]})}}),Ju,ih,wy=q(()=>{te(),ie(),ae(),Ha(),Ju=e=>{let t=e[0].dataType,r=O.size(e[0].dims),i=O.size(e[1].dims),a=i%4===0,n=s=>{let u=N("x",t,[1],4),d=N("bias",t,[1],4),p=K("y",t,[1],4),h=[{name:"output_vec_size",type:"u32"},{name:"bias_size",type:"u32"}],f=y=>`
      let bias${y}_offset: u32 = (global_idx * 4 + ${y}) % uniforms.bias_size;
      let bias${y} = ${d.getByOffset(`bias${y}_offset / 4`)}[bias${y}_offset % 4];`,g=a?`
      let bias = ${d.getByOffset("global_idx % (uniforms.bias_size / 4)")};`:`${f(0)}${f(1)}${f(2)}${f(3)}
      let bias = ${u.type.value}(bias0, bias1, bias2, bias3);`;return`${s.registerUniforms(h).declareVariables(u,d,p)}

    ${$a(Ee(t))}

    ${s.mainStart(qt)}
      ${s.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_vec_size")}

      let x = ${u.getByOffset("global_idx")};
      ${g}
      let x_in = x + bias;
      ${p.setByOffset("global_idx",va("x_in"))}
    }`};return{name:"FastGeluWithBias",shaderCache:{hint:`${a}`,inputDependencies:["type","type"]},getShaderSource:n,getRunData:s=>({outputs:[{dims:s[0].dims,dataType:s[0].dataType}],programUniforms:[{type:12,data:Math.ceil(r/4)},{type:12,data:i}],dispatchGroup:{x:Math.ceil(r/qt/4)}})}},ih=e=>{e.inputs.length<2||O.size(e.inputs[1].dims)===0?xc(e):e.compute(Ju(e.inputs))}}),el,tl,ah,nh,by=q(()=>{te(),ie(),xe(),ae(),el=e=>{if(!e||e.length!==2)throw new Error("Gather requires 2 inputs.")},tl=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=O.normalizeAxis(t.axis,a),s=r.slice(0);s.splice(n,1,...i);let u=r[n],d=e[0].dataType===9?4:1,p=Math.ceil(O.size(s)/d),h=[{type:12,data:p},{type:6,data:u},{type:12,data:n},...Y(e[0].dims,e[1].dims,s)],f=g=>{let y=N("data",e[0].dataType,e[0].dims.length,d),_=N("inputIndices",e[1].dataType,e[1].dims.length),w=K("output",e[0].dataType,s.length,d),S=b=>{let I=i.length,k=`var indicesIndices${b}  = ${_.type.indices}(0);`;for(let E=0;E<I;E++)k+=`${I>1?`indicesIndices${b}[${E}]`:`indicesIndices${b}`} = ${s.length>1?`outputIndices${b}[uniforms.axis + ${E}]`:`outputIndices${b}`};`;k+=`
          var idx${b} = ${_.getByIndices(`indicesIndices${b}`)};
          if (idx${b} < 0) {
            idx${b} = idx${b} + uniforms.axisDimLimit;
          }
          var dataIndices${b} : ${y.type.indices};
        `;for(let E=0,C=0;E<a;E++)E===n?(k+=`${a>1?`dataIndices${b}[${E}]`:`dataIndices${b}`} = u32(idx${b});`,C+=I):(k+=`${a>1?`dataIndices${b}[${E}]`:`dataIndices${b}`} = ${s.length>1?`outputIndices${b}[${C}]`:`outputIndices${b}`};`,C++);return k},x;if(e[0].dataType===9){let b=(I,k,E="")=>`
          let outputIndices${k} = ${w.offsetToIndices(`outputOffset + ${k}u`)};
          ${S(k)};
          let offset${k} = ${y.indicesToOffset(`dataIndices${k}`)};
          let index${k} = offset${k} / 4u;
          let component${k} = offset${k} % 4u;
          ${I}[${k}] = ${E}(${y.getByOffset(`index${k}`)}[component${k}]);
        `;x=`
        let outputOffset = global_idx * ${d};
        var value = vec4<u32>(0);
        ${b("value",0,"u32")}
        ${b("value",1,"u32")}
        ${b("value",2,"u32")}
        ${b("value",3,"u32")}
        ${w.setByOffset("global_idx","value")}
      `}else x=`
      let outputIndices = ${w.offsetToIndices("global_idx")};
      ${S("")};
      let value = ${y.getByIndices("dataIndices")};
      ${w.setByOffset("global_idx","value")};
      `;return`
      ${g.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(y,_,w)}
      ${g.mainStart()}
        ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        ${x}
      }`};return{name:"Gather",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:s,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:h}),getShaderSource:f}},ah=e=>he({axis:e.axis}),nh=(e,t)=>{let r=e.inputs;el(r),e.compute(tl(e.inputs,t))}}),rl,sh,oh,$y=q(()=>{te(),ie(),ae(),rl=(e,t,r,i,a,n,s,u,d)=>{let p=[{type:12,data:n},{type:12,data:i},{type:12,data:a},{type:12,data:r},{type:12,data:s},{type:12,data:u},{type:12,data:d}],h=[n];p.push(...Y(t.dims,h));let f=g=>{let y=N("indices_data",t.dataType,t.dims.length),_=K("input_slice_offsets_data",12,1,1),w=[y,_],S=[{name:"output_size",type:"u32"},{name:"batch_dims",type:"u32"},{name:"input_dims",type:"u32",length:a.length},{name:"sizes_from_slice_dims_data",type:"u32",length:r.length},{name:"num_slices_per_batch",type:"u32"},{name:"input_batch_stride",type:"u32"},{name:"num_slice_dims",type:"u32"}];return`
  ${g.registerUniforms(S).declareVariables(...w)}
  ${g.mainStart()}
    ${g.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let batch_idx = global_idx / uniforms.num_slices_per_batch;
    let base_offset = batch_idx * uniforms.input_batch_stride;

    let slice_indices_base_offset = global_idx * uniforms.num_slice_dims;
    var relative_slice_offset = 0;
    for (var dim_idx = 0u; dim_idx < uniforms.num_slice_dims; dim_idx ++) {
      var index = i32(indices_data[dim_idx + slice_indices_base_offset].x);
      let input_dim_idx = uniforms.batch_dims + dim_idx;
      if (index < 0) {
        ${a.length===1?"index += i32(uniforms.input_dims);":"index += i32(uniforms.input_dims[input_dim_idx]);"}
      }
      ${r.length===1?"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data);":"relative_slice_offset += index * i32(uniforms.sizes_from_slice_dims_data[dim_idx]);"}
    }

    input_slice_offsets_data[global_idx] =  base_offset + u32(relative_slice_offset);
  }`};return e.compute({name:"computeSliceOffsets",shaderCache:{hint:`${a.length}_${r.length}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:h,dataType:e.inputs[1].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:p}),getShaderSource:f},{inputs:[t],outputs:[-1]})[0]},sh=(e,t)=>{let r=e.inputs,i=r[0].dims,a=r[0].dataType,n=r[1].dims,s=n[n.length-1],u=O.sizeToDimension(n,n.length-1),d=O.sizeFromDimension(i,t.batchDims+s),p=O.sizeToDimension(i,t.batchDims),h=O.sizeFromDimension(i,t.batchDims),f=u/p,g=new Array(s),y=d;for(let k=0;k<s;++k)g[s-1-k]=y,y*=i[t.batchDims+s-1-k];let _=rl(e,r[1],g,t.batchDims,i,u,f,h,s),w=t.batchDims+s;if(w>i.length)throw new Error("last dimension of indices must not be larger than rank of input tensor");let S=n.slice(0,-1).concat(i.slice(w)),x=O.size(S),b=[{type:12,data:x},{type:12,data:d},...Y(r[0].dims,_.dims,S)],I=k=>{let E=N("data",r[0].dataType,r[0].dims.length),C=N("slice_offsets",12,_.dims.length),A=K("output",r[0].dataType,S.length);return`
          ${k.registerUniform("output_size","u32").registerUniform("slice_size","u32").declareVariables(E,C,A)}
            ${k.mainStart()}
            ${k.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let slice_offset = slice_offsets[global_idx / uniforms.slice_size];
          output[global_idx] = data[u32(slice_offset) + global_idx % uniforms.slice_size];
        }`};e.compute({name:"GatherND",shaderCache:{hint:t.cacheKey,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:S,dataType:a}],dispatchGroup:{x:Math.ceil(x/64)},programUniforms:b}),getShaderSource:I},{inputs:[r[0],_]})},oh=e=>({batchDims:e.batch_dims,cacheKey:""})}),il,al,uh,lh,vy=q(()=>{te(),ie(),xe(),ae(),il=(e,t)=>{if(e.length<3||e.length>4)throw new Error("GatherBlockQuantized requires 3 or 4 inputs.");let r=O.normalizeAxis(t.quantizeAxis,e[0].dims.length),i=t.blockSize,a=e[0],n=e[2],s=e.length===4?e[3]:void 0;if(n.dims.length!==a.dims.length||!a.dims.map((u,d)=>d===r?Math.ceil(u/i)===n.dims[d]:u===n.dims[d]).reduce((u,d)=>u&&d,!0))throw new Error("Scales must have the same rank as the input tensor and the dims should match except on gatherAxis.");if(s){if(s.dataType!==a.dataType)throw new Error("Zero point must have the same data type as the input tensor.");if(s.dims.length!==n.dims.length||!s.dims.map((u,d)=>u===n.dims[d]).reduce((u,d)=>u&&d,!0))throw new Error("Zero point must have the same rank as the input tensor and the dims should match except on quantizeAxis.")}},al=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r.length,n=O.normalizeAxis(t.gatherAxis,a),s=O.normalizeAxis(t.quantizeAxis,a),u=r.slice(0);u.splice(n,1,...i);let d=O.size(u),p=e[2].dataType,h=e[0].dataType===22,f=[{type:12,data:d},{type:12,data:s},{type:12,data:n},{type:12,data:t.blockSize},...Y(...e.map((y,_)=>y.dims),u)],g=y=>{let _=N("data",e[0].dataType,e[0].dims.length),w=N("inputIndices",e[1].dataType,e[1].dims.length),S=N("scales",e[2].dataType,e[2].dims.length),x=e.length>3?N("zeroPoint",e[3].dataType,e[3].dims.length):void 0,b=K("output",p,u.length),I=[_,w,S];x&&I.push(x);let k=[{name:"output_size",type:"u32"},{name:"quantize_axis",type:"u32"},{name:"gather_axis",type:"u32"},{name:"block_size",type:"u32"}];return`
        ${y.registerUniforms(k).declareVariables(...I,b)}
        ${y.mainStart()}
        let output_indices = ${b.offsetToIndices("global_idx")};
        var indices_indices = ${w.type.indices}(0);
        ${i.length>1?`
          for (var i: u32 = 0; i < ${i.length}; i++) {
            let index = ${b.indicesGet("output_indices","uniforms.gather_axis + i")};
            ${w.indicesSet("indices_indices","i","index")};
          }`:`indices_indices = ${b.indicesGet("output_indices","uniforms.gather_axis")};`};
        var data_indices = ${_.type.indices}(0);
        for (var i: u32 = 0; i < uniforms.gather_axis; i++) {
          let index = ${b.indicesGet("output_indices","i")};
          ${_.indicesSet("data_indices","i","index")};
        }
        var index_from_indices = ${w.getByIndices("indices_indices")};
        if (index_from_indices < 0) {
          index_from_indices += ${r[n]};
        }
        ${_.indicesSet("data_indices","uniforms.gather_axis","u32(index_from_indices)")};
        for (var i = uniforms.gather_axis + 1; i < ${u.length}; i++) {
          let index = ${b.indicesGet("output_indices",`i + ${i.length} - 1`)};
          ${_.indicesSet("data_indices","i","index")};
        }
        let data_offset = ${_.indicesToOffset("data_indices")};
        let data_index = data_offset % 8;
        // Convert 4-bit packed data to 8-bit packed data.
        let packed_4bit_quantized_data = ${_.getByOffset("data_offset / 8")};
        let packed_8bit_quantized_data = (packed_4bit_quantized_data >> (4 * (data_index % 2))) & 0x0f0f0f0f;
        let quantized_data_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_quantized_data));
        let quantized_data = quantized_data_vec[data_index / 2];
        var scale_indices = data_indices;
        let quantize_axis_index = ${S.indicesGet("data_indices","uniforms.quantize_axis")} / uniforms.block_size;
        ${S.indicesSet("scale_indices","uniforms.quantize_axis","quantize_axis_index")};
        var scale = ${S.getByIndices("scale_indices")};
        ${x?`
              let zero_point_indices = scale_indices;
              let zero_point_offset = ${x.indicesToOffset("zero_point_indices")};
              let zero_point_index = zero_point_offset % 8;
              let packed_4bit_zero_points = ${x.getByOffset("zero_point_offset / 8")};
              let packed_8bit_zero_points = (packed_4bit_zero_points >> (4 * (zero_point_index % 2))) & 0x0f0f0f0f;
              let zero_point_vec = ${h?"unpack4xI8":"unpack4xU8"}(u32(packed_8bit_zero_points));
              let zero_point = zero_point_vec[zero_point_index / 2];`:"var zero_point = 0"};
        let dequantized_data = ${Ee(p)}(quantized_data - zero_point) * scale;
        ${b.setByOffset("global_idx","dequantized_data")};
    }`};return{name:"GatherBlockQuantized",shaderCache:{hint:`${t.cacheKey};${e.filter((y,_)=>_!==1).map(y=>y.dims.join("_")).join(";")}`,inputDependencies:Array.from({length:e.length},(y,_)=>"rank")},getRunData:()=>({outputs:[{dims:u,dataType:p}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:f}),getShaderSource:g}},uh=(e,t)=>{let r=e.inputs;il(r,t),e.compute(al(e.inputs,t))},lh=e=>he({blockSize:e.blockSize,gatherAxis:e.gatherAxis,quantizeAxis:e.quantizeAxis})}),nl,sl,dh,ph,xy=q(()=>{te(),ie(),xe(),ae(),nl=e=>{if(!e||e.length!==2)throw new Error("GatherElements requires 2 inputs.");if(e[0].dims.length<1)throw new Error("GatherElements requires that the data input be rank >= 1.");if(e[0].dims.length!==e[1].dims.length)throw new Error(`GatherElements requires that the data input and
                     indices input tensors be of same rank.`)},sl=(e,t)=>{let r=e[0].dims,i=e[0].dataType,a=r.length,n=e[1].dims,s=e[1].dataType,u=O.normalizeAxis(t.axis,a),d=r[u],p=n.slice(0),h=O.size(p),f=N("input",i,a),g=N("indicesInput",s,n.length),y=K("output",i,p.length),_=[{type:12,data:h},{type:6,data:d},{type:12,data:u}];return _.push(...Y(r,n,p)),{name:"GatherElements",shaderCache:{inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:p,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:_}),getShaderSource:w=>`
      ${w.registerUniform("outputSize","u32").registerUniform("axisDimLimit","i32").registerUniform("axis","u32").declareVariables(f,g,y)}
      ${w.mainStart()}
      ${w.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

      let outputIndices = ${y.offsetToIndices("global_idx")};

      var idx = ${g.getByOffset("global_idx")};
      if (idx < 0) {
        idx = idx + uniforms.axisDimLimit;
      }
      var inputIndices = ${f.type.indices}(outputIndices);
      ${f.indicesSet("inputIndices","uniforms.axis","u32(idx)")};
      let value = ${f.getByIndices("inputIndices")};

      ${y.setByOffset("global_idx","value")};
  }`}},dh=e=>he({axis:e.axis}),ph=(e,t)=>{let r=e.inputs;nl(r),e.compute(sl(e.inputs,t))}}),ol,ul,ch,hh,Sy=q(()=>{te(),ie(),ae(),ol=e=>{if(!e)throw new Error("Input is missing");if(e.length<2||e.length>3)throw new Error("Invaid input number.");if(e.length===3&&e[2].dims.length>2)throw new Error("Invalid input shape of C");if(e[0].dataType!==e[1].dataType||e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("Input types are mismatched")},ul=(e,t)=>{let r=e[0].dims.slice(),i=e[1].dims.slice(),[a,n,s]=dp.getShapeOfGemmResult(r,t.transA,i,t.transB,e.length===3?e[2].dims:void 0),u=[a,n];if(!u)throw new Error("Can't use gemm on the given tensors");let d=16,p=Math.ceil(n/d),h=Math.ceil(a/d),f=!0,g=O.size(u),y=[{type:12,data:f?p:g},{type:12,data:a},{type:12,data:n},{type:12,data:s},{type:1,data:t.alpha},{type:1,data:t.beta}],_=["type","type"];e.length===3&&(y.push(...Y(e[2].dims)),_.push("rank")),y.push(...Y(u));let w=x=>{let b="";t.transA&&t.transB?b="value += a[k * uniforms.M + m] * b[n * uniforms.K + k];":t.transA&&!t.transB?b="value += a[k * uniforms.M + m] * b[k * uniforms.N + n];":!t.transA&&t.transB?b="value += a[m * uniforms.K + k] * b[n * uniforms.K + k];":!t.transA&&!t.transB&&(b="value += a[m * uniforms.K + k] * b[k * uniforms.N + n];");let I=t.alpha===1?"":"value *= uniforms.alpha;",k=N("a",e[0].dataType,e[0].dims),E=N("b",e[1].dataType,e[1].dims),C=k.type.value,A=null,v=[k,E];e.length===3&&(A=N("c",e[2].dataType,e[2].dims.length),v.push(A));let M=K("output",e[0].dataType,u.length);v.push(M);let D=[{name:"output_size",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}];return`
  ${x.registerUniforms(D).declareVariables(...v)}

  ${x.mainStart()}
    ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

    let m = global_idx / uniforms.N;
    let n = global_idx % uniforms.N;

    var value = ${C}(0);
    for (var k: u32 = 0u; k < uniforms.K; k++) {
      ${b}
    }

    ${I}
    ${A!=null?`let cOffset = ${A.broadcastedIndicesToOffset("vec2(m, n)",M)}; value += ${C}(uniforms.beta) * ${A.getByOffset("cOffset")};`:""}
    output[global_idx] = value;
  }`},S=x=>{let b=N("a",e[0].dataType,e[0].dims),I=N("b",e[1].dataType,e[1].dims),k=null,E=[b,I];e.length===3&&(k=N("c",e[2].dataType,e[2].dims.length),E.push(k));let C=K("output",e[0].dataType,u.length);E.push(C);let A=[{name:"num_tile_n",type:"u32"},{name:"M",type:"u32"},{name:"N",type:"u32"},{name:"K",type:"u32"},{name:"alpha",type:"f32"},{name:"beta",type:"f32"}],v="",M="";t.transA&&t.transB?(M=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[local_id.x][k];"):t.transA&&!t.transB?(M=`
      var col = tile_row_start + local_id.x;
      var row = k_start + local_id.y;
      if (col < uniforms.M && row < uniforms.K) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.M + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[k][local_id.y] * tile_b[k][local_id.x];"):!t.transA&&t.transB?(M=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = k_start + local_id.x;
      row = tile_col_start + local_id.y;
      if (col < uniforms.K && row < uniforms.N) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.K + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[local_id.x][k];"):!t.transA&&!t.transB&&(M=`
      var col = k_start + local_id.x;
      var row = tile_row_start + local_id.y;
      if (col < uniforms.K && row < uniforms.M) {
        tile_a[local_id.y][local_id.x] = a[row * uniforms.K + col];
      } else {
        tile_a[local_id.y][local_id.x] = ${b.type.value}(0);
      }

      col = tile_col_start + local_id.x;
      row = k_start + local_id.y;
      if (col < uniforms.N && row < uniforms.K) {
        tile_b[local_id.y][local_id.x] = b[row * uniforms.N + col];
      } else {
        tile_b[local_id.y][local_id.x] = ${I.type.value}(0);
      }
      `,v="value += tile_a[local_id.y][k] * tile_b[k][local_id.x];");let D=t.alpha===1?"":"value *= uniforms.alpha;";return`
  ${x.registerUniforms(A).declareVariables(...E)}
  var<workgroup> tile_a: array<array<${b.type.storage}, ${d}>, ${d}>;
  var<workgroup> tile_b: array<array<${I.type.storage}, ${d}>, ${d}>;
  ${x.mainStart([d,d,1])}
    let tile_col_start = (workgroup_index % uniforms.num_tile_n) * ${d};
    let tile_row_start = (workgroup_index / uniforms.num_tile_n) * ${d};
    let num_tiles = (uniforms.K - 1) / ${d} + 1;
    var k_start = 0u;
    var value = ${C.type.value}(0);
    for (var t: u32 = 0u; t < num_tiles; t++) {
      ${M}
      k_start = k_start + ${d};
      workgroupBarrier();

      for (var k: u32 = 0u; k < ${d}; k++) {
        ${v}
      }
      workgroupBarrier();
    }

    ${D}
    let m = tile_row_start + local_id.y;
    let n = tile_col_start + local_id.x;
    ${k!=null?`let cOffset = ${k.broadcastedIndicesToOffset("vec2(m, n)",C)}; value += ${C.type.value}(uniforms.beta) * ${k.getByOffset("cOffset")};`:""}
    if (m < uniforms.M && n < uniforms.N) {
      output[m * uniforms.N + n] = value;
    }
  }`};return f?{name:"GemmShared",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:p*h},programUniforms:y}),getShaderSource:S}:{name:"Gemm",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:u,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:y}),getShaderSource:w}},ch=e=>{let t=e.transA,r=e.transB,i=e.alpha,a=e.beta;return{transA:t,transB:r,alpha:i,beta:a,cacheKey:`${e.transA};${e.transB};${e.alpha===1}`}},hh=(e,t)=>{ol(e.inputs),e.compute(ul(e.inputs,t))}}),Ze,tt,bt,$t,ll,dl,pl,cl,hl,fl,ml,gl,fh,mh,Ty=q(()=>{te(),ie(),xe(),ae(),[Ze,tt,bt,$t]=[0,1,2,3],ll=e=>{if(e[0].dims.length!==4)throw new Error("only 4-D tensor is supported.");if(e[0].dims.length!==e[1].dims.length)throw new Error("input dimensions must be equal to grid dimensions");if(e[0].dims.length-2!==e[1].dims[e[1].dims.length-1])throw new Error(`last dimension of grid must be equal to ${e[0].dims.length-2}`);if(e[0].dims[0]!==e[1].dims[0])throw new Error("grid batch size must match input batch size")},dl=`
  fn gs_get_cubic_coeffs(x: f32) -> vec4<f32> {
    let cubic_alpha = -0.75f;
    let x_abs = abs(x);
    var coeffs: vec4<f32>;
    coeffs[0] = (((cubic_alpha * (x_abs + 1) - 5 * cubic_alpha) * (x_abs + 1) + 8 * cubic_alpha) * (x_abs + 1) - 4 * cubic_alpha);
    coeffs[1] = (((cubic_alpha + 2) * x_abs - (cubic_alpha + 3)) * x_abs * x_abs + 1);
    coeffs[2] = (((cubic_alpha + 2) * (1 - x_abs) - (cubic_alpha + 3)) * (1 - x_abs) * (1 - x_abs) + 1);
    coeffs[3] = (((cubic_alpha * (2 - x_abs) - 5 * cubic_alpha) * (2 - x_abs) + 8 * cubic_alpha) * (2 - x_abs) - 4 * cubic_alpha);
    return coeffs;
  }
`,pl=e=>`
  fn gs_bicubic_interpolate(p: mat4x4<${e}>, x: f32, y: f32) -> ${e} {
    var v: vec4<f32>;
    var coeffs = gs_get_cubic_coeffs(x);
    for (var i = 0; i < 4; i++) {
      v[i] = coeffs[0] * p[i][0] + coeffs[1] * p[i][1] + coeffs[2] * p[i][2] + coeffs[3] * p[i][3];
    }
    coeffs = gs_get_cubic_coeffs(y);
    let pixel = ${e}(coeffs[0] * v[0] + coeffs[1] * v[1] + coeffs[2] * v[2] + coeffs[3] * v[3]);
    return pixel;
  }
`,cl=e=>`
  fn gs_denormalize(n: f32, length: i32) -> f32 {
    ${e.alignCorners===0?`
    // alignCorners: false => [-1, 1] to [-0.5, length - 0.5]
    return ((n + 1.0) * f32(length) - 1.0) / 2.0;
    `:`
    // alignCorners: true => [-1, 1] to [0, length - 1]
    return (n + 1.0) / 2.0 * (f32(length - 1));
    `}
  }
`,hl=e=>`
  ${e.paddingMode==="reflection"?`
      fn gs_reflect(x: i32, x_min: f32, x_max: f32) -> u32 {
        var dx = 0.0;
        var fx = f32(x);
        let range = x_max - x_min;
        if (fx < x_min) {
          dx = x_min - fx;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_min + r;
          } else {
            fx = x_max - r;
          }
        } else if (fx > x_max) {
          dx = fx - x_max;
          let n = u32(dx / range);
          let r = dx - f32(n) * range;
          if (n % 2 == 0) {
            fx = x_max - r;
          } else {
            fx = x_min + r;
          }
        }
        return u32(fx);
      }`:""}
`,fl=(e,t,r)=>`
  fn pixel_at_grid(r: i32, c: i32, H: i32, W: i32, batch: u32, channel: u32, border: vec4<f32>) -> ${t} {
     var pixel = ${t}(0);
     var indices = vec4<u32>(0);
     indices[${Ze}] = batch;
     indices[${tt}] = channel;`+(()=>{switch(r.paddingMode){case"zeros":return`
          if (r >= 0 && r < H && c >=0 && c < W) {
            indices[${bt}] = u32(r);
            indices[${$t}] = u32(c);
          } else {
            return ${t}(0);
          }
        `;case"border":return`
          indices[${bt}] = u32(clamp(r, 0, H - 1));
          indices[${$t}] = u32(clamp(c, 0, W - 1));
        `;case"reflection":return`
          indices[${bt}] = gs_reflect(r, border[1], border[3]);
          indices[${$t}] = gs_reflect(c, border[0], border[2]);
        `;default:throw new Error(`padding mode ${r.paddingMode} is not supported`)}})()+`
    return ${e.getByIndices("indices")};
  }
`,ml=(e,t,r)=>(()=>{switch(r.mode){case"nearest":return`
          let result = pixel_at_grid(i32(round(y)), i32(round(x)), H_in, W_in, indices[${Ze}], indices[${tt}], border);
        `;case"bilinear":return`
          let x1 = i32(floor(x));
          let y1 = i32(floor(y));
          let x2 = x1 + 1;
          let y2 = y1 + 1;

          let p11 = pixel_at_grid(y1, x1, H_in, W_in, indices[${Ze}], indices[${tt}], border);
          let p12 = pixel_at_grid(y1, x2, H_in, W_in, indices[${Ze}], indices[${tt}], border);
          let p21 = pixel_at_grid(y2, x1, H_in, W_in, indices[${Ze}], indices[${tt}], border);
          let p22 = pixel_at_grid(y2, x2, H_in, W_in, indices[${Ze}], indices[${tt}], border);

          let dx2 = ${t}(f32(x2) - x);
          let dx1 = ${t}(x - f32(x1));
          let dy2 = ${t}(f32(y2) - y);
          let dy1 = ${t}(y - f32(y1));
          let result = dy2 * (dx2 * p11 + dx1 * p12) + dy1 * (dx2 * p21 + dx1 * p22);
        `;case"bicubic":return`
          let x0 = i32(floor(x)) - 1;
          let y0 = i32(floor(y)) - 1;
          var p: mat4x4<${t}>;
          for (var h = 0; h < 4; h++) {
            for (var w = 0; w < 4; w++) {
              p[h][w] = pixel_at_grid(h + y0, w + x0, H_in, W_in, indices[${Ze}], indices[${tt}], border);
            }
          }

          let dx = x - f32(x0 + 1);
          let dy = y - f32(y0 + 1);
          let result = gs_bicubic_interpolate(p, dx, dy);
        `;default:throw new Error(`mode ${r.mode} is not supported`)}})()+`${e.setByOffset("global_idx","result")}`,gl=(e,t)=>{let r=N("x",e[0].dataType,e[0].dims.length),i=[e[1].dims[0],e[1].dims[1],e[1].dims[2]],a=N("grid",e[1].dataType,i.length,2),n=[e[0].dims[0],e[0].dims[1],e[1].dims[1],e[1].dims[2]];t.format==="NHWC"&&(n=[e[0].dims[0],e[1].dims[1],e[1].dims[2],e[0].dims[3]],[Ze,tt,bt,$t]=[0,3,1,2]);let s=K("output",e[0].dataType,n.length),u=r.type.value,d=O.size(n),p=[{type:12,data:d},...Y(e[0].dims,i,n)],h=f=>`
  ${f.registerUniform("output_size","u32").declareVariables(r,a,s)}
  ${dl}
  ${pl(u)}
  ${cl(t)}
  ${hl(t)}
  ${fl(r,u,t)}

  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let H_in = i32(uniforms.x_shape[${bt}]);
      let W_in = i32(uniforms.x_shape[${$t}]);

      ${t.alignCorners===0?`
      let x_min = -0.5;
      let x_max = f32(W_in) - 0.5;
      let y_min = -0.5;
      let y_max = f32(H_in) - 0.5;
      `:`
      let x_min = 0.0;
      let x_max = f32(W_in) - 1.0;
      let y_min = 0.0;
      let y_max = f32(H_in) - 1.0;
      `};
      let border = vec4<f32>(x_min, y_min, x_max, y_max);

      let indices = ${s.offsetToIndices("global_idx")};
      var grid_indices = vec3<u32>(indices[${Ze}], indices[${bt}], indices[${$t}]);
      let nxy = ${a.getByIndices("grid_indices")};
      var x = gs_denormalize(f32(nxy[0]), W_in);
      var y = gs_denormalize(f32(nxy[1]), H_in);

      ${ml(s,u,t)}
  }`;return{name:"GridSample",shaderCache:{hint:`${t.cacheKey}`,inputDependencies:["type","type"]},getRunData:f=>{let g=O.size(n);return{outputs:[{dims:n,dataType:f[0].dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:p}},getShaderSource:h}},fh=(e,t)=>{ll(e.inputs),e.compute(gl(e.inputs,t))},mh=e=>he({alignCorners:e.align_corners,mode:e.mode,paddingMode:e.padding_mode,format:e.format})}),ze,yl,gh,Qi,_l,ur,yh,_h=q(()=>{te(),ie(),xe(),Wa(),Ga(),ae(),gt(),ze=(e,t)=>e.length>t&&e[t].dims.length>0?e[t]:void 0,yl=(e,t)=>{let r=e[0],i=ze(e,1),a=ze(e,2),n=ze(e,3),s=ze(e,4),u=ze(e,5),d=ze(e,6),p=ze(e,7);if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let h=r.dims[0],f=r.dims[1],g=r.dims.length===3?r.dims[2]:t.numHeads*r.dims[4],y=f,_=0,w=0,S=Math.floor(g/t.numHeads);if(d&&p&&O.size(d.dims)&&O.size(p.dims)){if(d.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(d.dims[0]!==h||d.dims[1]!==t.numHeads||d.dims[3]!==S)throw new Error('Input "past_key" shape (batch_size, num_heads, past_sequence_length, head_size)');if(p.dims[0]!==h||p.dims[1]!==t.numHeads||p.dims[3]!==S)throw new Error('Input "past_value" shape (batch_size, num_heads, past_sequence_length, head_size)');if(d.dims[2]!==p.dims[2])throw new Error('Input "past_key" and "past_value" shall have same dim 2 (past_sequence_length)');if(p.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');_=d.dims[2],w=d.dims[2]}else if(d&&O.size(d.dims)||p&&O.size(p.dims))throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let x;if(i&&O.size(i.dims)>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(i.dims[2]!==r.dims[2])throw new Error('Input "query" and "key" shall have same dim 2 (hidden_size)');x=2,y=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==S)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');x=5,y=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==S)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');x=0,y=i.dims[2]}}else{if(r.dims.length!==5)throw new Error('Input "query" is expected to have 5 dimensions when key is empty');if(r.dims[2]!==t.numHeads||r.dims[3]!==3)throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');x=3}if(n&&O.size(n.dims)>0){if(n.dims.length!==1)throw new Error('Input "bias" is expected to have 1 dimension');if(i&&i.dims.length===5&&i.dims[3]===2)throw new Error("bias is not allowed for packed kv.")}let b=_+y,I=0;if(s&&O.size(s.dims)>0){I=8;let A=s.dims;throw A.length===1?A[0]===h?I=1:A[0]===3*h+2&&(I=3):A.length===2&&A[0]===h&&A[1]===b&&(I=5),I===8?new Error('Input "key_padding_mask" shape shall be (batch_size) or (batch_size, total_sequence_length)'):new Error("Mask not supported")}let k=!1,E=g;if(a&&O.size(a.dims)>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(y!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');E=a.dims[2]}else{if(y!==a.dims[2])throw new Error('Input "key" and "value" shall have the same dim 2 (kv_sequence_length)');E=a.dims[1]*a.dims[3],k=!0}}let C=!1;if(s&&O.size(s.dims)>0)throw new Error("Key padding mask is not supported");if(u&&O.size(u.dims)>0){if(u.dims.length!==4)throw new Error('Input "attention_bias" is expected to have 4 dimensions');if(u.dims[0]!==h||u.dims[1]!==t.numHeads||u.dims[2]!==f||u.dims[3]!==b)throw new Error('Expect "attention_bias" shape (batch_size, num_heads, sequence_length, total_sequence_length)')}return{batchSize:h,sequenceLength:f,pastSequenceLength:_,kvSequenceLength:y,totalSequenceLength:b,maxSequenceLength:w,inputHiddenSize:0,hiddenSize:g,vHiddenSize:E,headSize:S,vHeadSize:Math.floor(E/t.numHeads),numHeads:t.numHeads,isUnidirectional:!1,pastPresentShareBuffer:!1,maskFilterValue:t.maskFilterValue,maskType:I,scale:t.scale,broadcastResPosBias:C,passPastInKv:k,qkvFormat:x}},gh=e=>he({...e}),Qi=he({perm:[0,2,1,3]}),_l=(e,t,r,i,a,n,s)=>{let u=[i,a,n],d=O.size(u),p=[{type:12,data:d},{type:12,data:s},{type:12,data:n}],h=f=>{let g=K("qkv_with_bias",t.dataType,u),y=N("qkv",t.dataType,u),_=N("bias",r.dataType,u),w=[{name:"output_size",type:"u32"},{name:"bias_offset",type:"u32"},{name:"hidden_size",type:"u32"}];return`
  ${f.registerUniforms(w).declareVariables(y,_,g)}
  ${f.mainStart()}
    ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let bias_offset_idx = (global_idx % uniforms.hidden_size) + uniforms.bias_offset;

    qkv_with_bias[global_idx] = qkv[global_idx] + bias[bias_offset_idx];
  }`};return e.compute({name:"MultiHeadAttentionAddBias",shaderCache:{inputDependencies:["type","type"]},getRunData:()=>({outputs:[{dims:u,dataType:t.dataType,gpuDataType:0}],dispatchGroup:{x:Math.ceil(d/64)},programUniforms:p}),getShaderSource:h},{inputs:[t,r],outputs:[-1]})[0]},ur=(e,t,r,i,a,n,s,u)=>{let d=n;if(s&&O.size(s.dims)>0){if(i===1)throw new Error("AddBiasReshape is not implemented. Please export your model with packed QKV or KV");return d=_l(e,n,s,t,i,r*a,u),d=d.reshape([t,i,r,a]),r===1||i===1?d:e.compute(Me(d,Qi.perm),{inputs:[d],outputs:[-1]})[0]}else return n.dims.length===3&&(d=n.reshape([t,i,r,a])),r===1||i===1?d:e.compute(Me(d,Qi.perm),{inputs:[d],outputs:[-1]})[0]},yh=(e,t)=>{let r=yl(e.inputs,t),i=e.inputs[0],a=ze(e.inputs,1),n=ze(e.inputs,2),s=ze(e.inputs,3),u=ze(e.inputs,4),d=ze(e.inputs,5),p=ze(e.inputs,6),h=ze(e.inputs,7);if(i.dims.length===5)throw new Error("Packed QKV is not implemented");if((a==null?void 0:a.dims.length)===5)throw new Error("Packed KV is not implemented");let f=a&&n&&a.dims.length===4&&n.dims.length===4,g=ur(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,i,s,0);if(f)return pr(e,g,a,n,u,void 0,p,h,d,r);if(!a||!n)throw new Error("key and value must be provided");let y=ur(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.headSize,a,s,r.hiddenSize),_=ur(e,r.batchSize,r.numHeads,r.kvSequenceLength,r.vHeadSize,n,s,2*r.hiddenSize);pr(e,g,y,_,u,void 0,p,h,d,r)}}),wl,bl,$l,vl,Ia,wh,bh,$h=q(()=>{te(),ie(),xe(),ae(),wl=e=>{if(!e||e.length<1)throw new Error("too few inputs")},bl=(e,t)=>{let r=[],i=t.numOutputs;return e[1].dims[0]>0&&(e[1].getBigInt64Array().forEach(a=>r.push(Number(a))),i=r.length),he({numOutputs:i,axis:t.axis,splitSizes:r})},$l=e=>`
fn calculateOutputIndex(index: u32) -> u32 {
    for (var i: u32 = 0u; i < ${e}u; i += 1u ) {
    if (index < ${Z("uniforms.size_in_split_axis","i",e)}) {
        return i;
    }
    }
    return ${e}u;
}`,vl=e=>{let t=e.length,r=[];for(let i=0;i<t;++i){let a=e[i].setByIndices("indices","input[global_idx]");t===1?r.push(a):i===0?r.push(`if (output_number == ${i}u) { ${a} }`):i===t-1?r.push(`else { ${a} }`):r.push(`else if (output_number == ${i}) { ${a} }`)}return`
      fn writeBufferData(output_number: u32, indices: ${e[0].type.indices}, global_idx: u32) {
        ${r.join(`
`)}
      }`},Ia=(e,t)=>{let r=e[0].dims,i=O.size(r),a=e[0].dataType,n=O.normalizeAxis(t.axis,r.length),s=new Array(t.numOutputs),u=N("input",a,r.length),d=new Array(t.numOutputs),p=[],h=[],f=0,g=[{type:12,data:i}];for(let _=0;_<t.numOutputs;_++){f+=t.splitSizes[_],d[_]=f;let w=r.slice();w[n]=t.splitSizes[_],h.push(w),s[_]=K(`output${_}`,a,w.length),p.push({dims:h[_],dataType:e[0].dataType})}g.push({type:12,data:d},...Y(r,...h));let y=_=>`
  ${_.registerUniform("input_size","u32").registerUniform("size_in_split_axis","u32",d.length).declareVariables(u,...s)}
  ${$l(d.length)}
  ${vl(s)}

  ${_.mainStart()}
    ${_.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.input_size")}

    var indices = ${u.offsetToIndices("global_idx")};
    var index = ${u.indicesGet("indices",n)};
    let output_number = calculateOutputIndex(index);
    if (output_number != 0) {
      index -= ${Z("uniforms.size_in_split_axis","output_number - 1u",d.length)};
      ${u.indicesSet("indices",n,"index")};
    }
    writeBufferData(output_number, indices, global_idx);
  }`;return{name:"Split",shaderCache:{hint:t.cacheKey,inputDependencies:["rank"]},getShaderSource:y,getRunData:()=>({outputs:p,dispatchGroup:{x:Math.ceil(i/64)},programUniforms:g})}},wh=(e,t)=>{wl(e.inputs);let r=e.inputs.length===1?t:bl(e.inputs,t);e.compute(Ia(e.inputs,r),{inputs:[0]})},bh=e=>{let t=e.axis,r=e.splitSizes,i=e.numOutputs<0?r.length:e.numOutputs;if(i!==r.length)throw new Error("numOutputs and splitSizes length must be equal");return he({axis:t,numOutputs:i,splitSizes:r})}}),xl,jr,vh,xh=q(()=>{te(),ie(),xe(),ae(),xl=(e,t)=>{let[r,i,a,n]=e,{numHeads:s,rotaryEmbeddingDim:u}=t;if(r.dims.length!==3&&r.dims.length!==4)throw new Error(`Input 'x' is expected to have 3 or 4 dimensions, got ${r.dims.length}`);if(!O.areEqual(i.dims,[])&&!O.areEqual(i.dims,[1])&&i.dims.length!==2)throw new Error(`Input 'position_ids' is expected to have 0, 1, or 2 dimensions, got ${i.dims.length}`);if(a.dims.length!==2)throw new Error(`Input 'cos_cache' is expected to have 2 dimensions, got ${a.dims.length}`);if(n.dims.length!==2)throw new Error(`Input 'sin_cache' is expected to have 2 dimensions, got ${n.dims.length}`);if(!O.areEqual(a.dims,n.dims))throw new Error("Inputs 'cos_cache' and 'sin_cache' are expected to have the same shape");if(u>0&&s===0)throw new Error("num_heads must be provided if rotary_embedding_dim is specified");let d=r.dims[0],p=r.dims[r.dims.length-2],h=a.dims[0],f=O.sizeFromDimension(r.dims,1)/p,g=u===0?a.dims[1]*2:f/s;if(u>g)throw new Error("rotary_embedding_dim must be less than or equal to head_size");if(i.dims.length===2){if(d!==i.dims[0])throw new Error(`Input 'position_ids' dimension 0 should be of size batch_size, got ${i.dims[0]}`);if(p!==i.dims[1])throw new Error(`Input 'position_ids' dimension 1 should be of size sequence_length, got ${i.dims[1]}`)}if(g/2!==a.dims[1]&&u/2!==a.dims[1])throw new Error(`Input 'cos_cache' dimension 1 should be same as head_size / 2 or rotary_embedding_dim / 2, got ${a.dims[1]}`);if(p>h)throw new Error("Updating cos_cache and sin_cache in RotaryEmbedding is not currently supported")},jr=(e,t)=>{let{interleaved:r,numHeads:i,rotaryEmbeddingDim:a,scale:n}=t,s=e[0].dims[0],u=O.sizeFromDimension(e[0].dims,1),d=e[0].dims[e[0].dims.length-2],p=u/d,h=e[2].dims[1],f=a===0?h*2:p/i,g=new Array(s,d,p/f,f-h),y=O.computeStrides(g),_=[{type:1,data:n},{type:12,data:g},{type:12,data:y},...e[0].dims.length===3?new Array({type:12,data:[u,p,f,1]}):[],...e[0].dims.length===4?new Array({type:12,data:[u,f,d*f,1]}):[],...Y(e[0].dims,e[1].dims,e[2].dims,e[3].dims,e[0].dims)],w=S=>{let x=N("input",e[0].dataType,e[0].dims.length),b=N("position_ids",e[1].dataType,e[1].dims.length),I=N("cos_cache",e[2].dataType,e[2].dims.length),k=N("sin_cache",e[3].dataType,e[3].dims.length),E=K("output",e[0].dataType,e[0].dims.length);return S.registerUniforms([{name:"scale",type:"f32"},{name:"global_shape",type:"u32",length:g.length},{name:"global_strides",type:"u32",length:y.length},{name:"input_output_strides",type:"u32",length:y.length}]),`
        ${S.declareVariables(x,b,I,k,E)}

        ${S.mainStart(qt)}
          let half_rotary_emb_dim = uniforms.${I.name}_shape[1];
          let bsnh = global_idx / uniforms.global_strides % uniforms.global_shape;
          let size = uniforms.global_shape[0] * uniforms.global_strides[0];
          ${S.guardAgainstOutOfBoundsWorkgroupSizes("size")}

          if (bsnh[3] < half_rotary_emb_dim) {
            let position_ids_idx =
                ${b.broadcastedIndicesToOffset("bsnh.xy",K("",b.type.tensor,2))};
            let position_id =
                u32(${b.getByOffset("position_ids_idx")}) + select(0, bsnh[1], position_ids_idx == 0);
            let i = dot(bsnh, uniforms.input_output_strides) + select(0, bsnh[3], ${r});
            let j = i + select(half_rotary_emb_dim, 1, ${r});
            let re = ${x.getByOffset("i")} * ${I.get("position_id","bsnh[3]")} -
                ${x.getByOffset("j")} * ${k.get("position_id","bsnh[3]")};
            ${E.setByOffset("i","re")}
            let im = ${x.getByOffset("i")} * ${k.get("position_id","bsnh[3]")} +
                ${x.getByOffset("j")} * ${I.get("position_id","bsnh[3]")};
            ${E.setByOffset("j","im")}
          } else {
            let k = dot(bsnh, uniforms.input_output_strides) + half_rotary_emb_dim;
            ${E.setByOffset("k",x.getByOffset("k"))}
          }
        }`};return{name:"RotaryEmbedding",shaderCache:{hint:he({interleaved:r}).cacheKey,inputDependencies:["rank","rank","rank","rank"]},getShaderSource:w,getRunData:()=>({outputs:[{dims:e[0].dims,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(O.size(g)/qt)},programUniforms:_})}},vh=(e,t)=>{xl(e.inputs,t),e.compute(jr(e.inputs,t))}}),Sl,Tl,Zi,kl,Sh,ky=q(()=>{xe(),te(),Ga(),_h(),$h(),gt(),xh(),ae(),Sl=(e,t)=>{if(t.doRotary&&e.length<=7)throw new Error("cos_cache and sin_cache inputs are required if do_rotary is specified");let r=e[0],i=e[1],a=e[2],n=e[3],s=e[4];if(t.doRotary!==0&&e.length<=7)throw new Error("cos_cast and sin_cache are expected if do_rotary attribute is non-zero");if(t.localWindowSize!==-1)throw new Error("Local attention is not supported");if(t.softcap!==0)throw new Error("Softcap is not supported");if(t.rotaryInterleaved!==0)throw new Error("Rotary interleaved is not supported");if(t.smoothSoftmax)throw new Error("Smooth softmax is not supported");if(r.dims.length!==3&&r.dims.length!==5)throw new Error("Input query is expected to have 3 or 5 dimensions");let u=!1,d=r.dims[0],p=r.dims[1],h=r.dims.length===3?u?r.dims[2]/3:r.dims[2]:t.numHeads*r.dims[4],f=p,g=0,y=!i||i.dims.length===0,_=Math.floor(y?h/(t.numHeads+2*t.kvNumHeads):h/t.numHeads);y&&(h=_*t.numHeads);let w=n&&n.dims.length!==0,S=s&&s.dims.length!==0;if(w&&n.dims.length===4&&n.dims[0]===d&&n.dims[1]!==t.kvNumHeads&&n.dims[2]===t.kvNumHeads&&n.dims[3]===_)throw new Error("BSNH pastKey/pastValue is not supported");if(w&&S){if(n.dims.length!==4)throw new Error('Input "past_key" is expected to have 4 dimensions');if(s.dims.length!==4)throw new Error('Input "past_value" is expected to have 4 dimensions');g=n.dims[2]}else if(w||S)throw new Error('Input "past_key" and "past_value" shall be both present or both absent');let x=1;if(i&&i.dims.length>0){if(r.dims.length!==3)throw new Error('Input "query" is expected to have 3 dimensions when key is given');if(i.dims.length<3||i.dims.length>5)throw new Error('Input "key" is expected to have 3, 4, or 5 dimensions');if(r.dims[0]!==i.dims[0])throw new Error('Input "query" and "key" shall have same dim 0 (batch size)');if(i.dims.length===3){if(r.dims[2]%i.dims[2]!==0)throw new Error('Dimension 2 of "query" should be a multiple of "key"');f=i.dims[1]}else if(i.dims.length===5){if(i.dims[2]!==t.numHeads||i.dims[3]!==2||i.dims[4]!==_)throw new Error('Expect "key" shape (batch_size, kv_sequence_length, num_heads, 2, head_size) for packed kv');if(a)throw new Error('Expect "value" be none when "key" has packed kv format.');f=i.dims[1]}else{if(i.dims[1]!==t.numHeads||i.dims[3]!==_)throw new Error('Expect "key" shape (batch_size, num_heads, kv_sequence_length, head_size) for past_key');f=i.dims[2]}}else{if(r.dims.length!==3&&r.dims.length!==5)throw new Error('Input "query" is expected to have 3 or 5 dimensions when key is empty');if(r.dims.length===5&&(r.dims[2]!==t.numHeads||r.dims[3]!==3))throw new Error('Expect "query" shape (batch_size, kv_sequence_length, num_heads, 3, head_size) for packed kv');x=3}let b=0,I=!1,k=t.kvNumHeads?_*t.kvNumHeads:h;if(a&&a.dims.length>0){if(a.dims.length!==3&&a.dims.length!==4)throw new Error('Input "value" is expected to have 3 or 4 dimensions');if(r.dims[0]!==a.dims[0])throw new Error('Input "query" and "value" shall have same dim 0 (batch_size)');if(a.dims.length===3){if(f!==a.dims[1])throw new Error('Input "key" and "value" shall have the same dim 1 (kv_sequence_length)');k=a.dims[2]}else{if(f!==a.dims[2])throw new Error('Input "past_key" and "past_value" shall have the same dim 2 (kv_sequence_length)');k=a.dims[1]*a.dims[3],I=!0}}let E=e.length>4?e[5]:void 0;if(E&&E.dims.length!==1&&E.dims[0]!==d)throw new Error('Input "seqlens" is expected to have 1 dimension and the same dim 0 as batch_size');return{batchSize:d,sequenceLength:p,pastSequenceLength:g,kvSequenceLength:f,totalSequenceLength:-1,maxSequenceLength:-1,inputHiddenSize:0,hiddenSize:h,vHiddenSize:k,headSize:_,vHeadSize:Math.floor(k/t.kvNumHeads),numHeads:t.numHeads,kvNumHeads:t.kvNumHeads,nReps:t.numHeads/t.kvNumHeads,pastPresentShareBuffer:!1,maskType:b,scale:t.scale,broadcastResPosBias:!1,passPastInKv:I,qkvFormat:x}},Tl=he({perm:[0,2,1,3]}),Zi=(e,t,r)=>{let i=t,a=r.kvNumHeads;return t.dims.length===3&&r.kvSequenceLength!==0&&(i=t.reshape([r.batchSize,r.kvSequenceLength,a,r.headSize]),i=e.compute(Me(i,Tl.perm),{inputs:[i],outputs:[-1]})[0]),i},kl=(e,t,r,i)=>{let a=7,n=["type","type"],s=[e*t],u=e*t,d=[{type:12,data:u},{type:12,data:t},{type:12,data:e}],p=h=>{let f=N("seq_lens",r.dataType,r.dims),g=N("total_seq_lens",i.dataType,i.dims),y=K("pos_ids",a,s),_=[{name:"output_size",type:"u32"},{name:"sequence_length",type:"u32"},{name:"batch_size",type:"u32"}];return`
  ${h.registerUniforms(_).declareVariables(f,g,y)}
  ${h.mainStart()}
    ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
    let total_sequence_length = u32(${g.getByOffset("0")});
    let is_subsequent_prompt = uniforms.sequence_length > 1 && uniforms.sequence_length != total_sequence_length;
    let is_first_prompt = !is_subsequent_prompt && uniforms.sequence_length == total_sequence_length;
    let batch_idx = global_idx / uniforms.sequence_length;
    let sequence_idx = i32(global_idx % uniforms.sequence_length);
    var pos_id: i32 = 0;
    let seqlen = ${f.getByOffset("batch_idx")};
    let total_seqlen = seqlen + 1;
    if (is_first_prompt) {
      if (sequence_idx < total_seqlen) {
        pos_id = sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx","pos_id")}
    } else if (is_subsequent_prompt) {
      let past_seqlen = total_seqlen - i32(uniforms.sequence_length);
      if (past_seqlen + sequence_idx < total_seqlen) {
        pos_id = past_seqlen + sequence_idx;
      } else {
        pos_id = 1;
      }
      ${y.setByOffset("global_idx","pos_id")}
    } else if (global_idx < uniforms.batch_size) {
      ${y.setByOffset("global_idx","seqlen")}
    };
  }
  `};return{name:"GeneratePositionIds",shaderCache:{hint:`${e};${t}`,inputDependencies:n},getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/64)},programUniforms:d}),getShaderSource:p}},Sh=(e,t)=>{var k;let r=Sl(e.inputs,t);if(e.inputs[0].dims.length===5)throw new Error("Packed QKV is not implemented");if(((k=e.inputs[1])==null?void 0:k.dims.length)===5)throw new Error("Packed KV is not implemented");let i=e.inputs[0],a=e.inputs[1]&&e.inputs[1].dims.length>0?e.inputs[1]:void 0,n=e.inputs[2]&&e.inputs[2].dims.length>0?e.inputs[2]:void 0,s=e.inputs[3]&&e.inputs[3].dims.length!==0?e.inputs[3]:void 0,u=e.inputs[4]&&e.inputs[4].dims.length!==0?e.inputs[4]:void 0,d=e.inputs.length>4?e.inputs[5]:void 0,p=e.inputs.length>5?e.inputs[6]:void 0,h=r.kvNumHeads?r.kvNumHeads:r.numHeads,f=he({axis:2,numOutputs:3,splitSizes:[r.numHeads*r.headSize,h*r.headSize,h*r.headSize]}),[g,y,_]=!a&&!n?e.compute(Ia([i],f),{inputs:[i],outputs:[-1,-1,-1]}):[i,a,n],w,S;if(t.doRotary){let E=e.compute(kl(r.batchSize,r.sequenceLength,d,p),{inputs:[d,p],outputs:[-1]})[0],C=e.inputs[7],A=e.inputs[8],v=he({interleaved:t.rotaryInterleaved!==0,numHeads:r.numHeads,rotaryEmbeddingDim:0,scale:t.scale}),M=[g,E,C,A],D=[-1];w=e.compute(jr(M,v),{inputs:M,outputs:D})[0],M.splice(0,1,y);let H=he({interleaved:t.rotaryInterleaved!==0,numHeads:r.kvNumHeads,rotaryEmbeddingDim:0,scale:t.scale});S=e.compute(jr(M,H),{inputs:M,outputs:D})[0]}let x=ur(e,r.batchSize,r.numHeads,r.sequenceLength,r.headSize,t.doRotary?w:g,void 0,0),b=Zi(e,t.doRotary?S:y,r),I=Zi(e,_,r);pr(e,x,b,I,void 0,void 0,s,u,void 0,r,d,p)}}),Yi,Il,El,Th,Iy=q(()=>{te(),ie(),gt(),ae(),Yi=(e,t,r,i,a,n,s,u)=>{let d=ve(n),p=d===1?"f32":`vec${d}f`,h=d===1?"vec2f":`mat2x${d}f`,f=a*s,g=64;f===1&&(g=256);let y=[a,s,n/d],_=[a,s,2],w=["rank","type","type"],S=[];S.push(...Y(y,_));let x=b=>{let I=N("x",t.dataType,3,d),k=N("scale",r.dataType,r.dims),E=N("bias",i.dataType,i.dims),C=K("output",1,3,2),A=[I,k,E,C];return`
  var<workgroup> workgroup_shared : array<${h}, ${g}>;
  const workgroup_size = ${g}u;
  ${b.declareVariables(...A)}
  ${b.mainStart(g)}
    let batch = workgroup_index / uniforms.x_shape[1];
    let channel = workgroup_index % uniforms.x_shape[1];
    let hight = uniforms.x_shape[2];
    // initialize workgroup memory
    var sum = ${p}(0);
    var squared_sum = ${p}(0);
    for (var h = local_idx; h < hight; h += workgroup_size) {
      let value = ${p}(${I.get("batch","channel","h")});
      sum += value;
      squared_sum += value * value;
    }
    workgroup_shared[local_idx] = ${h}(sum, squared_sum);
    workgroupBarrier();

    for (var currSize = workgroup_size >> 1;  currSize > 0; currSize = currSize >> 1) {
      if (local_idx < currSize) {
        workgroup_shared[local_idx] = workgroup_shared[local_idx] + workgroup_shared[local_idx + currSize];
      }
      workgroupBarrier();
    }
    if (local_idx == 0) {
      let sum_final = ${mt("workgroup_shared[0][0]",d)} / f32(hight * ${d});
      let squared_sum_final = ${mt("workgroup_shared[0][1]",d)} / f32(hight * ${d});

      let inv_std_dev = inverseSqrt(squared_sum_final - sum_final * sum_final + f32(${u}));
      let channel_scale = inv_std_dev * f32(scale[channel]);
      let channel_shift = f32(bias[channel]) - sum_final * channel_scale;
      output[workgroup_index] = vec2f(channel_scale, channel_shift);
    }
  }`};return e.compute({name:"InstanceNormComputeChannelScaleShift",shaderCache:{hint:`${d};${u};${g}`,inputDependencies:w},getRunData:()=>({outputs:[{dims:_,dataType:1}],dispatchGroup:{x:f},programUniforms:S}),getShaderSource:x},{inputs:[t,r,i],outputs:[-1]})[0]},Il=(e,t,r)=>{let i=t[0].dims,a=i,n=2,s=i[0],u=i[1],d=O.sizeFromDimension(i,n),p=ve(d),h=O.size(a)/p,f=Yi(e,t[0],t[1],t[2],s,d,u,r.epsilon),g=[s,u,d/p],y=[s,u],_=["type","none"],w=S=>{let x=N("x",t[0].dataType,g.length,p),b=N("scale_shift",1,y.length,2),I=K("output",t[0].dataType,g.length,p),k=[x,b,I];return`
  ${S.registerUniform("output_size","u32").declareVariables(...k)}
  ${S.mainStart()}
  ${S.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let outputIndices = ${I.offsetToIndices("global_idx")};
      let batch = outputIndices[0];
      let channel = outputIndices[1];
      let scale_shift = ${b.getByIndices("vec2<u32>(batch, channel)")};
      let value = ${x.getByOffset("global_idx")} * ${I.type.value}(scale_shift.x) + ${I.type.value}(scale_shift.y);
      ${I.setByOffset("global_idx","value")};
  }`};e.compute({name:"InstanceNormalization",shaderCache:{hint:`${p}`,inputDependencies:_},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(h/64)},programUniforms:[{type:12,data:h},...Y(g,y,g)]}),getShaderSource:w},{inputs:[t[0],f]})},El=(e,t,r)=>{let i=t[0].dims,a=i,n=i[0],s=i[i.length-1],u=O.sizeFromDimension(i,1)/s,d=ve(s),p=O.size(a)/d,h=[{type:12,data:u},{type:12,data:Math.floor(s/d)}],f=["type","type"],g=!1,y=[0,i.length-1];for(let x=0;x<i.length-2;x++)g=g||i[x+1]!==1,y.push(x+1);g=g&&i[i.length-1]!==1;let _=g?e.compute(Me(e.inputs[0],y),{inputs:[e.inputs[0]],outputs:[-1]})[0]:e.inputs[0].reshape(Array.from({length:i.length},(x,b)=>i[y[b]])),w=Yi(e,_,t[1],t[2],n,u,s,r.epsilon),S=x=>{let b=Te(t[0].dataType),I=d===1?"vec2f":`mat${d}x2f`,k=A=>{let v=A===0?"x":"y",M=d===1?"f32":`vec${d}f`;switch(d){case 1:return`${b}(${M}(scale.${v}))`;case 2:return`vec2<${b}>(${M}(scale[0].${v}, scale[1].${v}))`;case 4:return`vec4<${b}>(${M}(scale[0].${v}, scale[1].${v}, scale[2].${v}, scale[3].${v}))`;default:throw new Error(`Not supported compoents ${d}`)}},E=N("input",t[0].dataType,t[0].dims,d),C=K("output",t[0].dataType,a,d);return`
  @group(0) @binding(0) var<storage, read> input : array<${E.type.storage}>;
  @group(0) @binding(1) var<storage, read> scale_input : array<${I}>;
  @group(0) @binding(2) var<storage, read_write> output : array<${C.type.storage}>;
  struct Uniforms {H: u32, C : u32};
  @group(0) @binding(3) var<uniform> uniforms: Uniforms;

  ${x.mainStart()}
    let current_image_number = global_idx / (uniforms.C * uniforms.H);
    let current_channel_number = global_idx % uniforms.C;

    let scale_offset = current_image_number * uniforms.C + current_channel_number;
    let scale = scale_input[scale_offset];
    output[global_idx] = fma(input[global_idx], ${k(0)}, ${k(1)});
  }`};e.compute({name:"InstanceNormalizationNHWC",shaderCache:{hint:`${d}`,inputDependencies:f},getRunData:()=>({outputs:[{dims:a,dataType:t[0].dataType}],dispatchGroup:{x:Math.ceil(p/64)},programUniforms:h}),getShaderSource:S},{inputs:[t[0],w]})},Th=(e,t)=>{t.format==="NHWC"?El(e,e.inputs,t):Il(e,e.inputs,t)}}),zl,Cl,kh,Ey=q(()=>{te(),ie(),ae(),zl=e=>{if(!e||e.length<2)throw new Error("layerNorm requires at least 2 inputs.")},Cl=(e,t,r)=>{let i=t.simplified,a=e[0].dims,n=e[1],s=!i&&e[2],u=a,d=O.normalizeAxis(t.axis,a.length),p=O.sizeToDimension(a,d),h=O.sizeFromDimension(a,d),f=O.size(n.dims),g=s?O.size(s.dims):0;if(f!==h||s&&g!==h)throw new Error(`Size of X.shape()[axis:] == ${h}.
       Size of scale and bias (if provided) must match this.
       Got scale size of ${f} and bias size of ${g}`);let y=[];for(let E=0;E<a.length;++E)E<d?y.push(a[E]):y.push(1);let _=ve(h),w=["type","type"],S=[{type:12,data:p},{type:1,data:h},{type:12,data:Math.floor(h/_)},{type:1,data:t.epsilon}];s&&w.push("type");let x=r>1,b=r>2,I=E=>{let C=Te(e[0].dataType),A=[N("x",e[0].dataType,e[0].dims,_),N("scale",n.dataType,n.dims,_)];s&&A.push(N("bias",s.dataType,s.dims,_)),A.push(K("output",e[0].dataType,u,_)),x&&A.push(K("mean_data_output",1,y)),b&&A.push(K("inv_std_output",1,y));let v=[{name:"norm_count",type:"u32"},{name:"norm_size",type:"f32"},{name:"norm_size_vectorized",type:"u32"},{name:"epsilon",type:"f32"}];return`
  ${E.registerUniforms(v).declareVariables(...A)}
  ${E.mainStart()}
    ${E.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.norm_count")}
    let offset = global_idx * uniforms.norm_size_vectorized;
    var mean_vector = ${_a("f32",_)};
    var mean_square_vector = ${_a("f32",_)};

    for (var h: u32 = 0u; h < uniforms.norm_size_vectorized; h++) {
      let value = ${Ut(C,_,"x[h + offset]")};
      mean_vector += value;
      mean_square_vector += value * value;
    }
    let mean = ${mt("mean_vector",_)} / uniforms.norm_size;
    let inv_std_dev = inverseSqrt(${mt("mean_square_vector",_)} / uniforms.norm_size ${i?"":"- mean * mean"} + uniforms.epsilon);

    for (var j: u32 = 0; j < uniforms.norm_size_vectorized; j++) {
      let f32input = ${Ut(C,_,"x[j + offset]")};
      let f32scale = ${Ut(C,_,"scale[j]")};
      output[j + offset] = ${A[0].type.value}((f32input ${i?"":"- mean"}) * inv_std_dev * f32scale
        ${s?`+ ${Ut(C,_,"bias[j]")}`:""}
      );
    }

    ${x?"mean_data_output[global_idx] = mean":""};
    ${b?"inv_std_output[global_idx] = inv_std_dev":""};
  }`},k=[{dims:u,dataType:e[0].dataType}];return x&&k.push({dims:y,dataType:1}),b&&k.push({dims:y,dataType:1}),{name:"LayerNormalization",shaderCache:{hint:`${_};${r};${i}`,inputDependencies:w},getRunData:()=>({outputs:k,dispatchGroup:{x:Math.ceil(p/64)},programUniforms:S}),getShaderSource:I}},kh=(e,t)=>{zl(e.inputs),e.compute(Cl(e.inputs,t,e.outputCount))}}),Al,Ih,zy=q(()=>{ie(),Qa(),Za(),Al=e=>{if(!e||e.length!==2)throw new Error("MatMul requires 2 inputs.");if(e[0].dims[e[0].dims.length-1]!==e[1].dims[e[1].dims.length-2])throw new Error("shared dimension does not match.")},Ih=e=>{Al(e.inputs);let t=Pt.calcShape(e.inputs[0].dims,e.inputs[1].dims,!0);if(!t)throw new Error("Can't use matmul on the given tensors");let r=t[t.length-1],i=e.inputs[0].dims[e.inputs[0].dims.length-1];if(r<8&&i<8)e.compute(Ka(e.inputs,{activation:""},t));else{let a=t[t.length-2],n=O.size(e.inputs[0].dims.slice(0,-2)),s=O.size(e.inputs[1].dims.slice(0,-2));if(n!==1&&a===1&&s===1){let u=e.inputs[0].reshape([1,n,i]),d=e.inputs[1].reshape([1,i,r]),p=[1,n,r],h=[u,d];e.compute(Fr(h,{activation:""},t,p),{inputs:h})}else e.compute(Fr(e.inputs,{activation:""},t))}}}),Ol,Rl,Bl,Eh,zh,Cy=q(()=>{te(),ie(),xe(),ae(),Ol=(e,t)=>{if(e.length<3||e.length>4)throw new Error("MatMulNBits requires 3 or 4 inputs");let r=e[0],i=r.dims.length;if(r.dims[i-1]!==t.k)throw new Error("The last dim of input shape does not match the k value");let a=Math.floor((t.k+t.blockSize-1)/t.blockSize),n=t.blockSize/8*t.bits,s=e[1];if(!O.areEqual(s.dims,[t.n,a,n]))throw new Error("The second inputs must be 3D tensor with shape N X nBlocksPerCol X blobSize");let u=e[2].dims;if(O.size(u)!==t.n*a)throw new Error("scales input size error.");if(e.length===4){let d=e[3].dims,p=t.n*(t.bits===8?a:Math.floor((a*t.bits+7)/8));if(O.size(d)!==p)throw new Error("zeroPoints input size error.")}},Rl=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,u=r.slice(0,i-2),d=O.size(u),p=e[1].dims[2]/4,h=e[0].dataType,f=ve(t.k),g=ve(p),y=ve(s),_=u.concat([a,s]),w=a>1&&s/y%2===0?2:1,S=O.size(_)/y/w,x=64,b=[],I=[d,a,n/f],k=O.convertShape(e[1].dims).slice();k.splice(-1,1,p/g),b.push(...Y(I)),b.push(...Y(k)),b.push(...Y(e[2].dims)),e.length===4&&b.push(...Y(O.convertShape(e[3].dims)));let E=[d,a,s/y];b.push(...Y(E));let C=A=>{let v=I.length,M=N("a",e[0].dataType,v,f),D=N("b",12,k.length,g),H=N("scales",e[2].dataType,e[2].dims.length),G=[M,D,H],Q=e.length===4?N("zero_points",12,e[3].dims.length):void 0;Q&&G.push(Q);let R=E.length,j=K("output",e[0].dataType,R,y),F=Te(e[0].dataType),X=(()=>{switch(f){case 1:return`array<${F}, 8>`;case 2:return`mat4x2<${F}>`;case 4:return`mat2x4<${F}>`;default:throw new Error(`${f}-component is not supported.`)}})(),le=()=>{let U=`
          // reuse a data
            var input_offset = ${M.indicesToOffset(`${M.type.indices}(batch, row, word_offset)`)};
            var a_data: ${X};
            for (var j: u32 = 0; j < ${8/f}; j++) {
              a_data[j] = ${M.getByOffset("input_offset")};
              input_offset++;
            }
          `;for(let P=0;P<y*w;P++)U+=`
            b_value = ${g===1?`b${P}_data`:`b${P}_data[i]`};
            b_value_lower = unpack4xU8(b_value & b_mask);
            b_value_upper = unpack4xU8((b_value >> 4) & b_mask);
            b_quantized_values = ${X}(${Array.from({length:4},(J,ee)=>`${F}(b_value_lower[${ee}]), ${F}(b_value_upper[${ee}])`).join(", ")});
            b_dequantized_values = ${f===1?`${X}(${Array.from({length:8},(J,ee)=>`(b_quantized_values[${ee}] - ${Q?`zero_point${P}`:"zero_point"}) * scale${P}`).join(", ")});`:`(b_quantized_values - ${X}(${Array(8).fill(`${Q?`zero_point${P}`:"zero_point"}`).join(",")})) * scale${P};`};
            workgroup_shared[local_id.x * ${w} + ${Math.floor(P/y)}]${y>1?`[${P%y}]`:""} += ${Array.from({length:8/f},(J,ee)=>`${f===1?`a_data[${ee}] * b_dequantized_values[${ee}]`:`dot(a_data[${ee}], b_dequantized_values[${ee}])`}`).join(" + ")};
          `;return U},W=()=>{let U=`
            var col_index = col * ${y};
            ${Q?`
            let zero_point_bytes_per_col = (nBlocksPerCol + 1) / 2;
            var zero_point_byte_count: u32;
            var zero_point_word_index: u32;
            var zero_point_byte_offset: u32;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            var zero_point_bits_offset: u32;
            var zero_point_word: u32;`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${F}(8);`}
            `;for(let P=0;P<y*w;P++)U+=`
            let scale${P} = ${H.getByOffset("col_index * nBlocksPerCol + block")};
            ${Q?`
            zero_point_byte_count = col_index * zero_point_bytes_per_col + (block >> 0x1u);
            zero_point_word_index = zero_point_byte_count >> 0x2u;
            zero_point_byte_offset = zero_point_byte_count & 0x3u;
            zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            zero_point_word = ${Q.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point${P} = ${F}((zero_point_word) & 0xFu);`:""}
            col_index += 1;`;return U},me=()=>{let U=`col_index = col * ${y};`;for(let P=0;P<y*w;P++)U+=`
            let b${P}_data = ${D.getByIndices(`${D.type.indices}(col_index, block, word)`)};
            col_index += 1;`;return U+=`
            var b_value: u32;
            let b_mask: u32 = 0x0F0F0F0Fu;
            var b_value_lower: vec4<u32>;
            var b_value_upper: vec4<u32>;
            var b_quantized_values: ${X};
            var b_dequantized_values: ${X};`,U};return`
        var<workgroup> workgroup_shared: array<${j.type.value}, ${w*x}>;
        ${A.declareVariables(...G,j)}
        ${A.mainStart([x,1,1])}
          let output_indices = ${j.offsetToIndices(`(global_idx / ${x}) * ${w}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let nBlocksPerCol = uniforms.b_shape[1];

          for (var block = local_id.x; block < nBlocksPerCol; block += ${x}) {
            //process one block
            var word_offset: u32 = block * ${t.blockSize/f};
            ${W()}
            for (var word: u32 = 0; word < ${p}; word += ${g}) {
              ${me()}
              for (var i: u32 = 0; i < ${g}; i++) {
                ${le()}
                word_offset += ${8/f};
              }
            }
          }
          workgroupBarrier();

          if (local_id.x < ${w}) {
            var output_value: ${j.type.value} = ${j.type.value}(0);
            var workgroup_shared_offset: u32 = local_id.x;
            for (var b: u32 = 0u; b < ${x}u; b++) {
              output_value += workgroup_shared[workgroup_shared_offset];
              workgroup_shared_offset += ${w};
            }
            ${j.setByIndices(`${j.type.indices}(batch, row, col + local_id.x)`,"output_value")};
          }
        }`};return{name:"MatMulNBits",shaderCache:{hint:`${t.blockSize};${t.bits};${f};${g};${y};${w};${x}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:_,dataType:h}],dispatchGroup:{x:S},programUniforms:b}),getShaderSource:C}},Bl=(e,t)=>{let r=e[0].dims,i=r.length,a=r[i-2],n=t.k,s=t.n,u=r.slice(0,i-2),d=O.size(u),p=e[1].dims[2]/4,h=e[0].dataType,f=ve(t.k),g=ve(p),y=u.concat([a,s]),_=128,w=s%8===0?8:s%4===0?4:1,S=_/w,x=S*g*8,b=x/f,I=x/t.blockSize,k=O.size(y)/w,E=[],C=[d,a,n/f],A=O.convertShape(e[1].dims).slice();A.splice(-1,1,p/g),E.push(...Y(C)),E.push(...Y(A)),E.push(...Y(e[2].dims)),e.length===4&&E.push(...Y(O.convertShape(e[3].dims)));let v=[d,a,s];E.push(...Y(v));let M=D=>{let H=C.length,G=N("a",e[0].dataType,H,f),Q=N("b",12,A.length,g),R=N("scales",e[2].dataType,e[2].dims.length),j=[G,Q,R],F=e.length===4?N("zero_points",12,e[3].dims.length):void 0;F&&j.push(F);let X=v.length,le=K("output",e[0].dataType,X),W=Te(e[0].dataType),me=()=>{switch(f){case 1:return`
          let a_data0 = vec4<${W}>(sub_a[word_offset], sub_a[word_offset + 1], sub_a[word_offset + 2], sub_a[word_offset + 3]);
          let a_data1 = vec4<${W}>(sub_a[word_offset + 4], sub_a[word_offset + 5], sub_a[word_offset + 6], sub_a[word_offset + 7]);`;case 2:return`
          let a_data0 = vec4<${W}>(sub_a[word_offset], sub_a[word_offset + 1]);
          let a_data1 = vec4<${W}>(sub_a[word_offset + 2], sub_a[word_offset + 3]);`;case 4:return`
          let a_data0 = sub_a[word_offset];
          let a_data1 = sub_a[word_offset + 1];`;default:throw new Error(`${f}-component is not supported.`)}};return`
        var<workgroup> sub_a: array<${G.type.value}, ${b}>;
        var<workgroup> inter_results: array<array<${le.type.value}, ${S}>, ${w}>;
        ${D.declareVariables(...j,le)}
        ${D.mainStart([S,w,1])}
          let output_indices = ${le.offsetToIndices(`workgroup_index * ${w}`)};
          let col = output_indices[2];
          let row = output_indices[1];
          let batch = output_indices[0];
          let n_blocks_per_col = uniforms.b_shape[1];
          let num_tiles =  (n_blocks_per_col - 1) / ${I} + 1;

          // Loop over shared dimension.
          for (var tile: u32 = 0; tile < num_tiles; tile += 1) {
            let a_col_start = tile * ${b};
            // load one tile A data into shared memory.
            for (var a_offset = local_idx; a_offset < ${b}; a_offset += ${_})
            {
              let a_col = a_col_start + a_offset;
              if (a_col < uniforms.a_shape[2])
              {
                sub_a[a_offset] = ${G.getByIndices(`${G.type.indices}(batch, row, a_col)`)};
              } else {
                sub_a[a_offset] = ${G.type.value}(0);
              }
            }
            workgroupBarrier();

            // each thread process one block
            let b_row = col + local_id.y;
            let block = tile * ${I} + local_id.x;
            ${F?`
            let zero_point_bytes_per_col = (n_blocks_per_col + 1) / 2;
            let zero_point_byte_count = b_row * zero_point_bytes_per_col + (block >> 0x1u);
            let zero_point_word_index = zero_point_byte_count >> 0x2u;
            let zero_point_byte_offset = zero_point_byte_count & 0x3u;
            let zero_point_nibble_offset: u32 = block & 0x1u;
            let zero_point_bits_offset = (zero_point_byte_offset << 3) + (zero_point_nibble_offset << 2);
            let zero_point_word = ${F.getByOffset("zero_point_word_index")} >> zero_point_bits_offset;
            let zero_point = ${W}((zero_point_word) & 0xFu);`:`
            // The default zero point is 8 for unsigned 4-bit quantization.
            let zero_point = ${W}(8);`}
            let scale = ${R.getByOffset("b_row * n_blocks_per_col + block")};
            let b_data = ${Q.getByIndices(`${Q.type.indices}(b_row, block, 0)`)};
            var word_offset = local_id.x * ${t.blockSize/f};
            for (var i: u32 = 0; i < ${g}; i++) {
              ${me()}
              let b_value = ${g===1?"b_data":"b_data[i]"};
              let b_value_lower = unpack4xU8(b_value & 0x0F0F0F0Fu);
              let b_value_upper = unpack4xU8((b_value >> 4) & 0x0F0F0F0Fu);
              let b_quantized_values = mat2x4<${W}>(${Array.from({length:4},(U,P)=>`${W}(b_value_lower[${P}]), ${W}(b_value_upper[${P}])`).join(", ")});
              let b_dequantized_values = (b_quantized_values - mat2x4<${W}>(${Array(8).fill("zero_point").join(",")})) * scale;
              inter_results[local_id.y][local_id.x] += ${Array.from({length:2},(U,P)=>`${`dot(a_data${P}, b_dequantized_values[${P}])`}`).join(" + ")};
              word_offset += ${8/f};
            }
            workgroupBarrier();
          }

          if (local_idx < ${w}) {
            var output_value: ${le.type.value} = ${le.type.value}(0);
            for (var b = 0u; b < ${S}; b++) {
              output_value += inter_results[local_idx][b];
            }
            if (col + local_idx < uniforms.output_shape[2])
            {
              ${le.setByIndices(`${le.type.indices}(batch, row, col + local_idx)`,"output_value")}
            }
          }
        }`};return{name:"BlockwiseMatMulNBits32",shaderCache:{hint:`${t.blockSize};${f};${g};${S};${w}`,inputDependencies:Array(e.length).fill("rank")},getRunData:()=>({outputs:[{dims:y,dataType:h}],dispatchGroup:{x:k},programUniforms:E}),getShaderSource:M}},Eh=(e,t)=>{Ol(e.inputs,t),t.blockSize===32&&e.adapterInfo.isVendor("intel")&&e.adapterInfo.isArchitecture("gen-12lp")?e.compute(Bl(e.inputs,t)):e.compute(Rl(e.inputs,t))},zh=e=>he(e)}),Nl,Ml,Dl,Ul,Pl,ql,Wl,Ll,Ch,Ay=q(()=>{te(),ie(),ae(),Nl=e=>{if(!e||e.length<1)throw new Error("Too few inputs");if(e[0].dataType!==1&&e[0].dataType!==10)throw new Error("Input type must be float or float16.");if(e.length>=2){let t=e[0].dims.length*2===e[1].dims[0];if(e.length===4&&(t=e[3].dims[0]*2===e[1].dims[0]),!t)throw new Error("The pads should be a 1D tensor of shape [2 * input_rank] or [2 * num_axes].")}},Ml=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
            k = i32(${e.indicesGet("indices",a)}) - ${Z("uniforms.pads",a,r)};
            if (k < 0) {
              break;
            }
            if (k >= i32(${Z("uniforms.x_shape",a,t)})) {
              break;
            }
            offset += k * i32(${Z("uniforms.x_strides",a,t)});
        `;return`
          value = ${e.type.value}(uniforms.constant_value);
          for (var i = 0; i < 1; i++) {
            var offset = 0;
            var k = 0;
            ${i}
            value = x[offset];
          }
      `},Dl=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Z("uniforms.pads",a,r)};
                if (k < 0) {
                  k = -k;
                }
                {
                  let _2n_1 = 2 * (i32(${Z("uniforms.x_shape",a,t)}) - 1);
                  k = k % _2n_1;
                  if(k >= i32(${Z("uniforms.x_shape",a,t)})) {
                    k = _2n_1 - k;
                  }
                }
                offset += k * i32(${Z("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Ul=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Z("uniforms.pads",a,r)};
                if (k < 0) {
                  k = 0;
                }
                if (k >= i32(${Z("uniforms.x_shape",a,t)})) {
                  k = i32(${Z("uniforms.x_shape",a,t)}) - 1;
                }
                offset += k * i32(${Z("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},Pl=(e,t,r)=>{let i="";for(let a=t-1;a>=0;--a)i+=`
                k = i32(${e.indicesGet("indices",a)}) - ${Z("uniforms.pads",a,r)};
                if (k < 0)  {
                  k += i32(${Z("uniforms.x_shape",a,t)}]);
                }
                if (k >= i32(${Z("uniforms.x_shape",a,t)})) {
                  k -= i32(${Z("uniforms.x_shape",a,t)});
                }
                offset += k * i32(${Z("uniforms.x_strides",a,t)});
            `;return`
              var offset = 0;
              var k = 0;
              ${i}
              value = x[offset];
          `},ql=(e,t,r)=>{switch(r.mode){case 0:return Ml(e,t,r.pads.length);case 1:return Dl(e,t,r.pads.length);case 2:return Ul(e,t,r.pads.length);case 3:return Pl(e,t,r.pads.length);default:throw new Error("Invalid mode")}},Wl=(e,t)=>{let r=O.padShape(e[0].dims.slice(),t.pads),i=e[0].dims,a=O.size(r),n=[{type:12,data:a},{type:6,data:t.pads}],s=e.length>=3&&e[2].data;t.mode===0&&n.push({type:s?e[2].dataType:1,data:t.value}),n.push(...Y(e[0].dims,r));let u=["rank"],d=p=>{let h=K("output",e[0].dataType,r.length),f=N("x",e[0].dataType,i.length),g=f.type.value,y=ql(h,i.length,t),_=[{name:"output_size",type:"u32"},{name:"pads",type:"i32",length:t.pads.length}];return t.mode===0&&_.push({name:"constant_value",type:s?g:"f32"}),`
            ${p.registerUniforms(_).declareVariables(f,h)}
            ${p.mainStart()}
            ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}

            let indices = ${h.offsetToIndices("global_idx")};

            var value = ${g}(0);
            ${y}
            output[global_idx] = value;
        }`};return{name:"Pad",shaderCache:{hint:`${t.mode}${s}`,inputDependencies:u},getRunData:()=>({outputs:[{dims:r,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(O.size(r)/64)},programUniforms:n}),getShaderSource:d}},Ll=(e,t)=>{if(e.length>1){let r=e[1].getBigInt64Array(),i=e.length>=3&&e[2].data?e[2].dataType===10?e[2].getUint16Array()[0]:e[2].getFloat32Array()[0]:0,a=e[0].dims.length,n=new Int32Array(2*a).fill(0);if(e.length>=4){let u=e[3].getBigInt64Array();for(let d=0;d<u.length;d++)n[Number(u[d])]=Number(r[d]),n[Number(u[d])+a]=Number(r[d+u.length])}else r.forEach((u,d)=>n[Number(d)]=Number(u));let s=[];return n.forEach(u=>s.push(u)),{mode:t.mode,value:i,pads:s}}else return t},Ch=(e,t)=>{Nl(e.inputs);let r=Ll(e.inputs,t);e.compute(Wl(e.inputs,r),{inputs:[0]})}}),tr,Xi,Ji,ea,ta,Vl,Gl,ra,ia,Ah,Oh,aa,Rh,Bh,na,Nh,Mh,Dh,Uh,Oy=q(()=>{Ue(),te(),ie(),ae(),tr=e=>{if($e.webgpu.validateInputContent&&(!e||e.length!==1))throw new Error("Pool ops requires 1 input.")},Xi=(e,t,r)=>{let i=t.format==="NHWC",a=e.dims.slice();i&&a.splice(1,0,a.pop());let n=Object.hasOwnProperty.call(t,"dilations"),s=t.kernelShape.slice(),u=t.strides.slice(),d=n?t.dilations.slice():[],p=t.pads.slice();Gr.adjustPoolAttributes(r,a,s,u,d,p);let h=Gr.computePoolOutputShape(r,a,u,d,s,p,t.autoPad),f=Object.assign({},t);n?Object.assign(f,{kernelShape:s,strides:u,pads:p,dilations:d,cacheKey:t.cacheKey}):Object.assign(f,{kernelShape:s,strides:u,pads:p,cacheKey:t.cacheKey});let g=h.slice();return g.push(g.splice(1,1)[0]),[f,i?g:h]},Ji=(e,t)=>{let r=t.format==="NHWC",i=O.size(e),a=O.size(t.kernelShape),n=[{type:12,data:i},{type:12,data:a}],s=[{name:"outputSize",type:"u32"},{name:"kernelSize",type:"u32"}];if(t.kernelShape.length<=2){let u=t.kernelShape[t.kernelShape.length-1],d=t.strides[t.strides.length-1],p=t.pads[t.pads.length/2-1],h=t.pads[t.pads.length-1],f=!!(p+h);n.push({type:12,data:u},{type:12,data:d},{type:12,data:p},{type:12,data:h}),s.push({name:"kw",type:"u32"},{name:"sw",type:"u32"},{name:"pwStart",type:"u32"},{name:"pwEnd",type:"u32"});let g=!1;if(t.kernelShape.length===2){let y=t.kernelShape[t.kernelShape.length-2],_=t.strides[t.strides.length-2],w=t.pads[t.pads.length/2-2],S=t.pads[t.pads.length-2];g=!!(w+S),n.push({type:12,data:y},{type:12,data:_},{type:12,data:w},{type:12,data:S}),s.push({name:"kh",type:"u32"},{name:"sh",type:"u32"},{name:"phStart",type:"u32"},{name:"phEnd",type:"u32"})}return[n,s,!0,f,g]}else{if(r)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let u=O.computeStrides(t.kernelShape);n.push({type:12,data:u},{type:12,data:t.pads},{type:12,data:t.strides}),s.push({name:"kernelStrides",type:"u32",length:u.length},{name:"pads",type:"u32",length:t.pads.length},{name:"strides",type:"u32",length:t.strides.length});let d=t.pads.reduce((p,h)=>p+h);return[n,s,!!d,!1,!1]}},ea=(e,t,r,i,a,n,s,u,d,p,h,f)=>{let g=a.format==="NHWC",y=t.type.value,_=K("output",t.type.tensor,i);if(a.kernelShape.length<=2){let w="",S="",x="",b=r-(g?2:1);if(h?w=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${b}] = indices[${b}] * uniforms.sw - uniforms.pwStart + i;
                  if (xIndices[${b}] < 0 || xIndices[${b}]
                      >= uniforms.x_shape[${b}]) {
                    pad++;
                    continue;
                  }
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`:w=`
                for (var i: u32 = 0u; i < uniforms.kw; i++) {
                  xIndices[${b}] = indices[${b}] * uniforms.sw - uniforms.pwStart + i;
                  let x_val = x[${t.indicesToOffset("xIndices")}];
                  ${n}
                }`,a.kernelShape.length===2){let I=r-(g?3:2);f?S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                  if (xIndices[${I}] < 0 || xIndices[${I}] >= uniforms.x_shape[${I}]) {
                    pad += i32(uniforms.kw);
                    continue;
                  }
              `:S=`
                for (var j: u32 = 0u; j < uniforms.kh; j++) {
                  xIndices[${I}] = indices[${I}] * uniforms.sh - uniforms.phStart + j;
                `,x=`
              }
            `}return`
            ${e.registerUniforms(d).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}

              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var value = ${y}(${u});
              var pad = 0;
              ${S}
              ${w}
              ${x}
              ${s}

              output[global_idx] = value;
            }`}else{if(g)throw new Error("Pooling with kernelShape.length > 2 is not supported for NHWC format.");let w=a.kernelShape.length,S=a.pads.length,x="";return p?x=`
                if (xIndices[j] >= uniforms.x_shape[j]) {
                  pad++;
                  isPad = true;
                  break;
                }
              }
              if (!isPad) {
                let x_val = x[${t.indicesToOffset("xIndices")}];
                ${n}
              }`:x=`
              }
              let x_val = x[${t.indicesToOffset("xIndices")}];
              ${n}
            `,`
            ${e.registerUniforms(d).declareVariables(t,_)}

            ${e.mainStart()}
              ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
              let indices = ${_.offsetToIndices("global_idx")};
              var xIndices = ${_.offsetToIndices("global_idx")};

              var offsets: array<u32, ${w}>;

              var value = ${y}(${u});
              var pad = 0;
              var isPad = false;

              for (var i: u32 = 0u; i < uniforms.kernelSize; i++) {
                var offset = i;
                for (var j = 0u; j < ${w-1}u; j++) {
                  offsets[j] = offset / ${Z("uniforms.kernelStrides","j",w)};
                  offset -= offsets[j] * ${Z("uniforms.kernelStrides","j",w)};
                }
                offsets[${w-1}] = offset;

                isPad = false;
                for (var j = ${r-w}u; j < ${r}u; j++) {
                  xIndices[j] = indices[j] * ${Z("uniforms.strides",`j - ${r-w}u`,w)}
                    + offsets[j - ${r-w}u] - ${Z("uniforms.pads","j - 2u",S)};
                  ${x}
              }
              ${s}

              output[global_idx] = value;
            }`}},ta=e=>`${e.format};${e.ceilMode};${e.autoPad};${e.kernelShape.length}`,Vl=e=>`${ta(e)};${e.countIncludePad}`,Gl=e=>`${ta(e)};${e.storageOrder};${e.dilations}`,ra=e=>({format:e.format,autoPad:["NOTSET","VALID","SAME_UPPER","SAME_LOWER"][e.auto_pad],ceilMode:e.ceil_mode,kernelShape:e.kernel_shape,strides:e.strides,pads:e.pads}),ia=(e,t,r,i)=>{let[a,n]=Xi(t,i,r),s=N("x",t.dataType,t.dims.length),u=s.type.value,d="value += x_val;",p="";a.countIncludePad?p+=`value /= ${u}(uniforms.kernelSize);`:p+=`value /= ${u}(i32(uniforms.kernelSize) - pad);`;let[h,f,g,y,_]=Ji(n,a);h.push(...Y(t.dims,n));let w=["rank"];return{name:e,shaderCache:{hint:`${i.cacheKey};${g};${y};${_}`,inputDependencies:w},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(O.size(n)/64)},programUniforms:h}),getShaderSource:S=>ea(S,s,t.dims.length,n.length,a,d,p,0,f,g,y,_)}},Ah=e=>{let t=e.count_include_pad!==0,r=ra(e);if(r.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for AveragePool");let i={countIncludePad:t,...r,cacheKey:""};return{...i,cacheKey:Vl(i)}},Oh=(e,t)=>{tr(e.inputs),e.compute(ia("AveragePool",e.inputs[0],!1,t))},aa={autoPad:"",ceilMode:0,countIncludePad:!1,kernelShape:[],strides:[],pads:[],storageOrder:0,dilations:[]},Rh=e=>{let t=e.format;return{format:t,...aa,cacheKey:t}},Bh=(e,t)=>{tr(e.inputs),e.compute(ia("GlobalAveragePool",e.inputs[0],!0,t))},na=(e,t,r,i)=>{let[a,n]=Xi(t,i,r),s=`
      value = max(x_val, value);
    `,u="",d=N("x",t.dataType,t.dims.length),p=["rank"],[h,f,g,y,_]=Ji(n,a);return h.push(...Y(t.dims,n)),{name:e,shaderCache:{hint:`${i.cacheKey};${g};${y};${_}`,inputDependencies:p},getRunData:()=>({outputs:[{dims:n,dataType:t.dataType}],dispatchGroup:{x:Math.ceil(O.size(n)/64)},programUniforms:h}),getShaderSource:w=>ea(w,d,t.dims.length,n.length,a,s,u,t.dataType===10?-65504:-1e5,f,g,y,_)}},Nh=(e,t)=>{tr(e.inputs),e.compute(na("MaxPool",e.inputs[0],!1,t))},Mh=e=>{let t=e.storage_order,r=e.dilations,i=ra(e);if(t!==0)throw new Error("column major storage order is not yet supported for MaxPool");if(i.ceilMode!==0)throw new Error("using ceil() in shape computation is not yet supported for MaxPool");let a={storageOrder:t,dilations:r,...i,cacheKey:""};return{...a,cacheKey:Gl(a)}},Dh=e=>{let t=e.format;return{format:t,...aa,cacheKey:t}},Uh=(e,t)=>{tr(e.inputs),e.compute(na("GlobalMaxPool",e.inputs[0],!0,t))}}),Hl,Fl,Ph,qh,Ry=q(()=>{te(),ie(),xe(),ae(),Hl=(e,t)=>{if(e.length<2||e.length>3)throw new Error("DequantizeLinear requires 2 or 3 inputs.");if(e.length===3&&e[1].dims===e[2].dims)throw new Error("x-scale and x-zero-point must have the same shape.");if(e.length===3&&e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[0].dataType===6&&e.length>2)throw new Error("In the case of dequantizing int32 there is no zero point.");if(e[1].dims.length!==0&&e[1].dims.length!==1&&e[1].dims.length!==e[0].dims.length)throw new Error("scale input must be a scalar, a 1D tensor, or have the same rank as the input tensor.");if(e.length>2){if(e[0].dataType!==e[2].dataType)throw new Error("x and x-zero-point must have the same data type.");if(e[1].dims.length!==e[2].dims.length)throw new Error("scale and zero-point inputs must have the same rank.");if(!e[1].dims.map((r,i)=>r===e[2].dims[i]).reduce((r,i)=>r&&i,!0))throw new Error("scale and zero-point inputs must have the same shape.")}if(t.blockSize>0){if(e[1].dims.length===0||e[1].dims.length===1&&e[1].dims[0]===1)throw new Error("blockSize must be set only for block quantization.");if(!e[1].dims.map((a,n)=>n===t.axis||a===e[0].dims[n]).reduce((a,n)=>a&&n,!0))throw new Error("For block qunatization, scale input shape to match the input shape except for the axis");if(e[1].dims.length!==e[0].dims.length)throw new Error("For block qunatization the scale input rank must be the same as the x rank.");let r=e[0].dims[t.axis],i=e[1].dims[t.axis];if(t.blockSize<Math.ceil(r/i)||t.blockSize>Math.ceil(r/(i-1)-1))throw new Error("blockSize must be with in the range [ceil(dI / Si), ceil(dI / (Si - 1) - 1)].")}},Fl=(e,t)=>{let r=O.normalizeAxis(t.axis,e[0].dims.length),i=e[0].dataType,a=i===3,n=e[0].dims,s=e[1].dataType,u=O.size(n),d=i===3||i===2,p=d?[Math.ceil(O.size(e[0].dims)/4)]:e[0].dims,h=e[1].dims,f=e.length>2?e[2]:void 0,g=f?d?[Math.ceil(O.size(f.dims)/4)]:f.dims:void 0,y=h.length===0||h.length===1&&h[0]===1,_=y===!1&&h.length===1,w=ve(u),S=y&&(!d||w===4),x=S?w:1,b=S&&!d?w:1,I=N("input",d?12:i,p.length,b),k=N("scale",s,h.length),E=f?N("zero_point",d?12:i,g.length):void 0,C=K("output",s,n.length,x),A=[I,k];E&&A.push(E);let v=[p,h];f&&v.push(g);let M=[{type:12,data:u/x},{type:12,data:r},{type:12,data:t.blockSize},...Y(...v,n)],D=H=>{let G=[{name:"output_size",type:"u32"},{name:"axis",type:"u32"},{name:"block_size",type:"u32"}];return`
      ${H.registerUniforms(G).declareVariables(...A,C)}
      ${H.mainStart()}
          ${H.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
          let output_indices = ${C.offsetToIndices("global_idx")};

          // Set input x
          ${d?`
            let input = ${I.getByOffset("global_idx / 4")};
            let x_vec = ${a?"unpack4xI8(input)":"unpack4xU8(input)"};
            let x_value = ${x===1?"x_vec[global_idx % 4]":"x_vec"};`:`let x_value = ${I.getByOffset("global_idx")};`};

          // Set scale input
          ${y?`let scale_value= ${k.getByOffset("0")}`:_?`
            let scale_index = ${C.indicesGet("output_indices","uniforms.axis")};
            let scale_value= ${k.getByOffset("scale_index")};`:`
            var scale_indices: ${k.type.indices} = output_indices;
            let index = ${k.indicesGet("scale_indices","uniforms.axis")} / uniforms.block_size;
            ${k.indicesSet("scale_indices","uniforms.axis","index")};
            let scale_value= ${k.getByIndices("scale_indices")};`};

          // Set zero-point input
          ${E?y?d?`
                let zero_point_input = ${E.getByOffset("0")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value= zero_point_vec[0]`:`let zero_point_value = ${E.getByOffset("0")}`:_?d?`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_input = ${E.getByOffset("zero_point_index / 4")};
                let zero_point_vec =  ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_index % 4]`:`
                let zero_point_index = ${C.indicesGet("output_indices","uniforms.axis")};
                let zero_point_value = ${E.getByOffset("zero_point_index")};`:d?`
                let zero_point_offset = ${k.indicesToOffset("scale_indices")};
                let zero_point_input = ${E.getByOffset("zero_point_offset / 4")};
                let zero_point_vec = ${a?"unpack4xI8(zero_point_input)":"unpack4xU8(zero_point_input)"};
                let zero_point_value = zero_point_vec[zero_point_offset % 4];`:`let zero_point_value = ${E.getByIndices("scale_indices")};`:`let zero_point_value = ${d?a?"i32":"u32":I.type.value}(0);`};
      // Compute and write output
      ${C.setByOffset("global_idx",`${C.type.value}(x_value - zero_point_value) * scale_value`)};
      }`};return{name:"DequantizeLinear",shaderCache:{hint:t.cacheKey,inputDependencies:E?["rank","rank","rank"]:["rank","rank"]},getShaderSource:D,getRunData:()=>({outputs:[{dims:n,dataType:s}],dispatchGroup:{x:Math.ceil(u/x/64),y:1,z:1},programUniforms:M})}},Ph=(e,t)=>{Hl(e.inputs,t),e.compute(Fl(e.inputs,t))},qh=e=>he({axis:e.axis,blockSize:e.blockSize})}),jl,Kl,Wh,By=q(()=>{Ue(),te(),ae(),jl=(e,t,r)=>{let i=e===t,a=e<t&&r<0,n=e>t&&r>0;if(i||a||n)throw new Error("Range these inputs' contents are invalid.")},Kl=(e,t,r,i)=>{let a=Math.abs(Math.ceil((t-e)/r)),n=[a],s=a,u=[{type:12,data:s},{type:i,data:e},{type:i,data:r},...Y(n)],d=p=>{let h=K("output",i,n.length),f=h.type.value,g=[{name:"outputSize",type:"u32"},{name:"start",type:f},{name:"delta",type:f}];return`
        ${p.registerUniforms(g).declareVariables(h)}
        ${p.mainStart()}
        ${p.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
        output[global_idx] = uniforms.start + ${f}(global_idx) * uniforms.delta;
      }`};return{name:"Range",shaderCache:{hint:`${i}`},getShaderSource:d,getRunData:()=>({outputs:[{dims:n,dataType:i}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:u})}},Wh=e=>{let t=0,r=0,i=0;e.inputs[0].dataType===6?(t=e.inputs[0].getInt32Array()[0],r=e.inputs[1].getInt32Array()[0],i=e.inputs[2].getInt32Array()[0]):e.inputs[0].dataType===1&&(t=e.inputs[0].getFloat32Array()[0],r=e.inputs[1].getFloat32Array()[0],i=e.inputs[2].getFloat32Array()[0]),$e.webgpu.validateInputContent&&jl(t,r,i),e.compute(Kl(t,r,i,e.inputs[0].dataType),{inputs:[]})}}),Ql,Zl,Lh,Vh,Ny=q(()=>{te(),ie(),xe(),ae(),Ql=(e,t,r,i)=>{if(e!=="none"&&i!=="i32"&&i!=="u32"&&i!=="f32")throw new Error(`Input ${i} is not supported with reduction ${e}.`);let a=`{
                var oldValue = 0;
                loop {
                  let newValueF32 =`,n=`;
                  let newValue = bitcast<i32>(newValueF32);
                  let res = atomicCompareExchangeWeak(&${t}, oldValue, newValue);
                  if res.exchanged {
                    break;
                  }
                  oldValue = res.old_value;
                }
              }`;switch(e){case"none":return`${t}=${r};`;case"add":return i==="i32"||i==="u32"?`atomicAdd(&${t}, bitcast<${i}>(${r}));`:`
              ${a}bitcast<${i}>(oldValue) + (${r})${n}`;case"max":return i==="i32"||i==="u32"?`atomicMax(&${t}, bitcast<${i}>(${r}));`:`
                ${a}max(bitcast<f32>(oldValue), (${r}))${n}`;case"min":return i==="i32"||i==="u32"?`atomicMin(&${t}, bitcast<${i}>(${r}));`:`${a}min(bitcast<${i}>(oldValue), (${r}))${n}`;case"mul":return`${a}(bitcast<${i}>(oldValue) * (${r}))${n}`;default:throw new Error(`Reduction ${e} is not supported.`)}},Zl=(e,t)=>{let r=e[0].dims,i=e[1].dims,a=r,n=1,s=Math.ceil(O.sizeToDimension(i,i.length-1)/n),u=i[i.length-1],d=O.sizeFromDimension(r,u),p=[{type:12,data:s},{type:12,data:u},{type:12,data:d},...Y(e[1].dims,e[2].dims,a)],h=f=>{let g=N("indices",e[1].dataType,e[1].dims.length),y=N("updates",e[2].dataType,e[2].dims.length,n),_=t.reduction!=="none"&&t.reduction!==""?yp("output",e[0].dataType,a.length):K("output",e[0].dataType,a.length,n);return`
      ${f.registerUniform("output_size","u32").registerUniform("last_index_dimension","u32").registerUniform("num_updates_elements","u32").declareVariables(g,y,_)}
      ${f.mainStart()}
        ${f.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
  var data_offset = 0u;
  let indices_start = uniforms.last_index_dimension * global_idx;
  let indices_end = indices_start + uniforms.last_index_dimension;
  for (var i = indices_start; i < indices_end; i++) {
    var index = i32(indices[i].x);
    ${e[0].dims.length===1?`
    let element_count_dim = uniforms.output_strides;
    let dim_value = uniforms.output_shape;`:`
    let element_count_dim = uniforms.output_strides[i - indices_start];
    let dim_value = uniforms.output_shape[i - indices_start];`}
    if (index >= 0) {
      if (index >= i32(dim_value)) {
        index = i32(dim_value - 1);
      }
    } else {
      if (index < -i32(dim_value)) {
        index = 0;
      } else {
        index += i32(dim_value);
      }
    }
    data_offset += u32((u32(index) * element_count_dim));
  }

  for (var i = 0u; i < uniforms.num_updates_elements; i++) {
    let value = updates[uniforms.num_updates_elements * global_idx + i];
    ${Ql(t.reduction,"output[data_offset + i]","value",_.type.value)}
  }

      }`};return{name:"ScatterND",shaderCache:{hint:`${t.cacheKey}_${t.reduction}`,inputDependencies:["rank","rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(s/64)},programUniforms:p}),getShaderSource:h}},Lh=e=>he({reduction:e.reduction}),Vh=(e,t)=>{e.compute(Zl(e.inputs,t),{inputs:[e.inputs[1],e.inputs[2]],outputs:[]})}}),Yl,Xl,Jl,sa,ed,td,rd,id,ad,nd,sd,od,oa,ud,ld,dd,pd,cd,Gh,Hh,My=q(()=>{te(),ie(),xe(),ae(),Yl=(e,t)=>{if(e.every(r=>r>0||(()=>{throw new Error("Resize requires scales input values to be positive")})),e.length>0){if(t.mode==="linear"){if(!(e.length===2||e.length===3||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1||e.length===5&&e[0]===1&&e[1]===1))throw new Error(`For linear mode, Resize requires scales to be 2D, 3D, 4D with either two outermost or one innermost and
            one outermost scale values equal to 1, or 5D with two outermost scale values equal to 1`)}else if(t.mode==="cubic"&&!(e.length===2||e.length===4&&e[0]===1&&e[1]===1||e.length===4&&e[0]===1&&e[3]===1))throw new Error("Resize requires scales input size to be 2 or 4 for cubic mode")}},Xl=(e,t,r)=>{t.every(a=>a>=0&&a<r||(()=>{throw new Error("Resize requires axes input values to be positive and less than rank")}));let i=new Array(r).fill(1);return t.forEach((a,n)=>i[a]=e[n]),i},Jl=(e,t,r,i,a,n)=>{let[s,u,d]=r>10?[1,2,3]:[-1,e.length>1?1:-1,-1],p=e[0].dims.length;if(s>0&&e.length>s&&e[s].dims.length>0)e[s].getFloat32Array().forEach(h=>n.push(h));else if(t.coordinateTransformMode==="tf_crop_and_resize")throw new Error("Resize requires RoI input to be specified when coordinateTransformMode is tfCropAndResize");if(u>0&&e.length>u&&e[u].dims.length===1&&e[u].dims[0]>0){if(e[u].getFloat32Array().forEach(h=>i.push(h)),i.length!==0&&i.length!==p&&r>=18&&i.length!==t.axes.length)throw new Error("Resize requires scales input size to be same as input rank or axes size for opset 18 and up");Yl(i,t),t.axes.length>0&&Xl(i,t.axes,p).forEach((h,f)=>i[f]=h)}if(d>0&&e.length>d&&e[d].dims.length===1&&e[d].dims[0]>0&&(e[d].getBigInt64Array().forEach(h=>a.push(Number(h))),a.length!==0&&a.length!==p&&r>=18&&a.length!==t.axes.length))throw new Error("Resize requires sizes input size to be same as input rank or axes size for opset 18 and up");if(t.axes.length>0){if(i.length!==0&&i.length!==t.axes.length)throw new Error('Resize requires "scales" input size to be of axes rank when axes attributes is specified');if(a.length!==0&&a.length!==t.axes.length)throw new Error('Resize requires "sizes" input size to be of rank axes rank when axes attributes is specified')}if(typeof i<"u"&&typeof a<"u"&&i.length>0&&a.length>p)throw new Error("Resize requires only of scales or sizes to be specified")},sa=(e,t,r,i)=>`
  // The whole part and the fractional part are calculated separately due to inaccuracy of floating
  // point division. As an example, f32(21) / f32(7) may evaluate to 2.99... instead of 3, causing an
  // offset-by-one error later in floor().
  let big = (${e}) * (${t});
  let whole = ${i}(big / (${r}));
  let fract = ${i}(big % (${r})) / ${i}(${r});
  return whole + fract;
`,ed=(e,t)=>`fn getOriginalCoordinateFromResizedCoordinate(xResized: u32, xScale: f32, lengthResized: u32,
     lengthOriginal: u32, roiStart: f32, roiEnd: f32) -> ${t} { `+(()=>{switch(e){case"asymmetric":return`
          if (xScale < 1.0 || floor(xScale) != xScale) {
            return ${t}(xResized) / ${t}(xScale);
          } else {
            ${sa("xResized","lengthOriginal","lengthResized",t)}
          }
        `;case"pytorch_half_pixel":return`if (lengthResized > 1) {
                    return (${t}(xResized) + 0.5) / ${t}(xScale) - 0.5;
                  } else {
                    return 0.0;
                  }`;case"tf_half_pixel_for_nn":return`return (${t}(xResized) + 0.5) / ${t}(xScale);`;case"align_corners":return`if (lengthResized == 1) {
                    return 0.0;
                  } else {
                    ${sa("xResized","lengthOriginal - 1","lengthResized - 1",t)}
                  }`;case"tf_crop_and_resize":return`if (lengthResized > 1) {
                    return ${t}(roiStart) * ${t}(lengthOriginal - 1) +
                        (${t}(xResized) * ${t}(roiEnd - roiStart) * ${t}(lengthOriginal - 1)) /
                        ${t}(lengthResized - 1);
                  } else {
                    return 0.5 * ${t}(roiStart + roiEnd) * ${t}(lengthOriginal - 1);
                  }`;case"half_pixel_symmetric":return`const outputWidth = ${t}xScale * ${t}(lengthResized);
                  const adjustment = ${t}(lengthResized) / outputWidth;
                  const center = ${t}(lengthOriginal) / 2;
                  const offset = center * (1 - adjustment);
                  return offset + ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;case"half_pixel":return`return ((${t}(xResized) + 0.5) / ${t}(xScale)) - 0.5;`;default:throw new Error(`Coordinate transform mode ${e} is not supported`)}})()+"}",td=(e,t,r)=>`fn getNearestPixelFromOriginal(xOriginal: ${r}, isDownSample: bool) -> ${r} {`+(()=>{switch(e){case"round_prefer_ceil":return"if (fract(xOriginal) == 0.5) {             return ceil(xOriginal);           } else {             return round(xOriginal);           }";case"floor":return"return floor(xOriginal);";case"ceil":return"return ceil(xOriginal);";case"round_prefer_floor":return"if (fract(xOriginal) == 0.5) {                     return floor(xOriginal);                   } else {                     return round(xOriginal);                   }";case"simple":default:if(t<11)return"if (isDownSample)                     {                       return ceil(xOriginal);                     } else {                       return xOriginal;                     }";throw new Error(`Nearest mode ${e} is not supported`)}})()+"}",rd=(e,t,r)=>{let i=new Array(r).fill(0).concat(new Array(r).fill(1)),a=e.length===0?i:e.slice();return t.length>0?(t.forEach((n,s)=>{i[n]=a[s],i[s+r]=a[t.length+s]}),i):a},id=(e,t,r,i)=>{let a=[];if(r.length>0)if(i.length>0){if(e.forEach(n=>a.push(n)),Math.max(...i)>e.length)throw new Error("axes is out of bound");i.forEach((n,s)=>a[n]=r[s])}else r.forEach(n=>a.push(n));else{if(t.length===0)throw new Error("Resize requires either scales or sizes.");a=e.map((n,s)=>Math.round(n*t[s]))}return a},ad=(e,t,r)=>{let i=(()=>{switch(r.keepAspectRatioPolicy){case"not_larger":return r.axes.length>0?Math.min(...r.axes.map(n=>t[n]),Number.MAX_VALUE):Math.min(...t,Number.MAX_VALUE);case"not_smaller":return r.axes.length>0?Math.max(...r.axes.map(n=>t[n]),Number.MIN_VALUE):Math.max(...t,Number.MIN_VALUE);default:throw new Error(`Keep aspect ratio policy ${r.keepAspectRatioPolicy} is not supported`)}})();t.fill(1,0,t.length);let a=e.slice();return r.axes.length>0?(r.axes.forEach(n=>t[n]=i),r.axes.forEach(n=>a[n]=Math.round(e[n]*t[n]))):(t.fill(i,0,t.length),a.forEach((n,s)=>a[s]=Math.round(n*t[s]))),a},nd=(e,t,r,i,a)=>`
    fn calculateOriginalIndicesFromOutputIndices(output_indices: ${e.type.indices}) -> array<${e.type.value}, ${r.length}> {
      var original_indices: array<${e.type.value}, ${r.length}>;
      for (var i:u32 = 0; i < ${r.length}; i++) {
        var output_index = ${e.indicesGet("output_indices","i")};
        var scale = ${Z("uniforms.scales","i",i)};
        var roi_low = ${Z("uniforms.roi","i",a)};
        var roi_hi = ${Z("uniforms.roi",`i + ${t.length}`,a)};
        if (scale == 1.0) {
          original_indices[i] = ${e.type.value}(output_index);
        } else {
          var input_shape_i = ${Z("uniforms.input_shape","i",t.length)};
          var output_shape_i = ${Z("uniforms.output_shape","i",r.length)};
          original_indices[i] = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                           input_shape_i, roi_low, roi_hi);
        }
      }
      return original_indices;
    }`,sd=(e,t,r,i,a,n,s)=>`
    fn calculateInputIndicesFromOutputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
      var input_indices: ${e.type.indices};
      for (var i:u32 = 0; i < ${i.length}; i++) {
        var output_index = ${t.indicesGet("output_indices","i")};
        var input_index: u32;
        var scale = ${Z("uniforms.scales","i",a)};
        if (scale == 1.0) {
          input_index = output_index;
        } else {
          var roi_low = ${Z("uniforms.roi","i",n)};
          var roi_hi = ${Z("uniforms.roi",`i + ${r.length}`,n)};
          var input_shape_i = ${Z("uniforms.input_shape","i",r.length)};
          var output_shape_i = ${Z("uniforms.output_shape","i",i.length)};
          var original_idx = getOriginalCoordinateFromResizedCoordinate(output_index, scale, output_shape_i,
                                                                        input_shape_i, roi_low, roi_hi);
          if (!${s} || (original_idx >= 0 && original_idx < ${t.type.value}(input_shape_i))) {
            if (original_idx < 0) {
              input_index = 0;
            } else if (original_idx > ${t.type.value}(input_shape_i - 1)) {
              input_index = input_shape_i - 1;
            } else {
              input_index = u32(getNearestPixelFromOriginal(original_idx, scale < 1));
            }
          } else {
            input_index = u32(original_idx);
          }
        }
        ${e.indicesSet("input_indices","i","input_index")}
      }
      return input_indices;
    }`,od=(e,t)=>`
    fn checkInputIndices(input_indices: ${e.type.indices}) -> bool {
      for (var i:u32 = 0; i < ${t.length}; i++) {
        var input_index = ${e.indicesGet("input_indices","i")};
        if (input_index < 0 || input_index >= ${Z("uniforms.input_shape","i",t.length)}) {
          return false;
        }
      }
      return true;
    }`,oa=(e,t,r,i)=>e.rank>i?`
    ${e.indicesSet("input_indices",t,"channel")};
    ${e.indicesSet("input_indices",r,"batch")};
`:"",ud=(e,t,r,i,a)=>{let[n,s,u,d]=r.length===2?[-1,0,1,-1]:[0,2,3,1],p=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, row: u32, col: u32) -> ${p} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(row, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(col, ${r[u]} - 1))`)};
      ${oa(e,d,n,2)}
      return ${e.getByIndices("input_indices")};
    }

    fn bilinearInterpolation(output_indices: ${t.type.indices}) -> ${p} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var row:${p} = originalIndices[${s}];
      var col:${p} = originalIndices[${u}];
      ${i?`if (row < 0 || row > (${r[s]} - 1) || col < 0 || col > (${r[u]} - 1)) {
        return ${a};
      }`:""};
      row = max(0, min(row, ${r[s]} - 1));
      col = max(0, min(col, ${r[u]} - 1));
      var row1: u32 = u32(row);
      var col1: u32 = u32(col);
      var row2: u32 = u32(row + 1);
      var col2: u32 = u32(col + 1);
      var channel: u32 = ${r.length>2?`u32(originalIndices[${d}])`:"0"};
      var batch: u32 =  ${r.length>2?`u32(originalIndices[${n}])`:"0"};
      var x11: ${p} = getInputValue(batch, channel, row1, col1);
      var x12: ${p} = getInputValue(batch, channel, row1, col2);
      var x21: ${p} = getInputValue(batch, channel, row2, col1);
      var x22: ${p} = getInputValue(batch, channel, row2, col2);
      var dx1: ${p} = abs(row - ${p}(row1));
      var dx2: ${p} = abs(${p}(row2) - row);
      var dy1: ${p} = abs(col - ${p}(col1));
      var dy2: ${p} = abs(${p}(col2) - col);
      if (row1 == row2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (col1 == col2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      return (x11 * dx2 * dy2 + x12 * dx2 * dy1 + x21 * dx1 * dy2 + x22 * dx1 * dy1);
    }`},ld=(e,t,r,i,a,n,s,u,d,p)=>{let h=r.length===2,[f,g]=h?[0,1]:[2,3],y=e.type.value,_=w=>{let S=w===f?"row":"col";return`
      fn ${S}CubicInterpolation(input_indices: ${e.type.indices}, output_indices: ${t.type.indices}) -> ${y} {
        var output_index = ${t.indicesGet("output_indices",w)};
        var originalIdx: ${y} = getOriginalCoordinateFromResizedCoordinate(output_index, ${a[w]},
        ${i[w]}, ${r[w]}, ${n[w]}, ${n[w]} + ${r.length});
        var fractOriginalIdx: ${y} = originalIdx - floor(originalIdx);
        var coefs = getCubicInterpolationCoefs(fractOriginalIdx);

        if (${u} && (originalIdx < 0 || originalIdx > (${r[w]} - 1))) {
          return ${d};
        }
        var data: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
        for (var i: i32 = -1; i < 3; i++) {
          var ${S}: ${y} = originalIdx + ${y}(i);
          if (${S} < 0 || ${S} >= ${r[w]}) {
            ${p?`coefs[i + 1] = 0.0;
                        continue;`:u?`return ${d};`:`${S} = max(0, min(${S}, ${r[w]} - 1));`};
          }
        var input_indices_copy: ${e.type.indices} = input_indices;
          ${e.indicesSet("input_indices_copy",w,`u32(${S})`)};
          data[i + 1] = ${w===f?e.getByIndices("input_indices_copy"):"rowCubicInterpolation(input_indices_copy, output_indices)"};
        }
        return cubicInterpolation1D(data, coefs);
      }`};return`
    ${_(f)};
    ${_(g)};
  fn getCubicInterpolationCoefs(s: ${y}) -> array<${y}, 4> {
    var absS = abs(s);
    var coeffs: array<${y}, 4> = array<${y}, 4>(0.0, 0.0, 0.0, 0.0);
    var oneMinusAbsS: ${y} = 1.0 - absS;
    var twoMinusAbsS: ${y} = 2.0 - absS;
    var onePlusAbsS: ${y} = 1.0 + absS;
    coeffs[0] = ((${s} * onePlusAbsS - 5 * ${s}) * onePlusAbsS + 8 * ${s}) * onePlusAbsS - 4 * ${s};
    coeffs[1] = ((${s} + 2) * absS - (${s} + 3)) * absS * absS + 1;
    coeffs[2] = ((${s} + 2) * oneMinusAbsS - (${s} + 3)) * oneMinusAbsS * oneMinusAbsS + 1;
    coeffs[3] = ((${s} * twoMinusAbsS - 5 * ${s}) * twoMinusAbsS + 8 * ${s}) * twoMinusAbsS - 4 * ${s};
    return coeffs;
  }

  fn cubicInterpolation1D(x: array<${y}, 4>, coefs: array<${y}, 4>) -> ${y} {
    var coefsSum: ${y} = coefs[0] + coefs[1] + coefs[2] + coefs[3];
    return (x[0] * coefs[0] + x[1] * coefs[1]+ x[2] * coefs[2]+ x[3] * coefs[3]) / coefsSum;
  }

  fn bicubicInterpolation(output_indices: ${t.type.indices}) -> ${y} {
    var input_indices: ${e.type.indices} = output_indices;
    return colCubicInterpolation(input_indices, output_indices);
  }
    `},dd=(e,t,r,i,a)=>{let[n,s,u,d,p]=r.length===3?[-1,0,1,2,-1]:[0,2,3,4,1],h=e.type.value;return`
    fn getInputValue(batch: u32, channel: u32, depth:u32, height: u32, width: u32) -> ${h} {
      var input_indices: ${e.type.indices};
      ${e.indicesSet("input_indices",s,`max(0, min(depth, ${r[s]} - 1))`)};
      ${e.indicesSet("input_indices",u,`max(0, min(height, ${r[u]} - 1))`)};
      ${e.indicesSet("input_indices",d,`max(0, min(width, ${r[d]} - 1))`)};
      ${oa(e,p,n,3)}
      return ${e.getByIndices("input_indices")};
    }

    fn trilinearInterpolation(output_indices: ${t.type.indices}) -> ${h} {
      var originalIndices = calculateOriginalIndicesFromOutputIndices(output_indices);
      var depth:${h} = originalIndices[${s}];
      var height:${h} = originalIndices[${u}];
      var width:${h} = originalIndices[${d}];
      ${i?`if (depth < 0 || depth > (${r[s]} - 1) || height < 0 || height > (${r[u]} - 1) || width < 0 || (width > ${r[d]} - 1)) {
      return ${a};
        }`:""};

    depth = max(0, min(depth, ${r[s]} - 1));
      height = max(0, min(height, ${r[u]} - 1));
      width = max(0, min(width, ${r[d]} - 1));
      var depth1: u32 = u32(depth);
      var height1: u32 = u32(height);
      var width1: u32 = u32(width);
      var depth2: u32 = u32(depth + 1);
      var height2: u32 = u32(height + 1);
      var width2: u32 = u32(width + 1);
      var channel: u32 = ${r.length>3?`u32(originalIndices[${p}])`:"0"};
      var batch: u32 =  ${r.length>3?`u32(originalIndices[${n}])`:"0"};

      var x111: ${h} = getInputValue(batch, channel, depth1, height1, width1);
      var x112: ${h} = getInputValue(batch, channel, depth1, height1, width2);
      var x121: ${h} = getInputValue(batch, channel, depth1, height2, width1);
      var x122: ${h} = getInputValue(batch, channel, depth1, height2, width2);
      var x211: ${h} = getInputValue(batch, channel, depth2, height1, width1);
      var x212: ${h} = getInputValue(batch, channel, depth2, height1, width2);
      var x221: ${h} = getInputValue(batch, channel, depth2, height2, width1);
      var x222: ${h} = getInputValue(batch, channel, depth2, height2, width2);
      var dx1: ${h} = abs(depth - ${h}(depth1));
      var dx2: ${h} = abs(${h}(depth2) - depth);
      var dy1: ${h} = abs(height - ${h}(height1));
      var dy2: ${h} = abs(${h}(height2) - height);
      var dz1: ${h} = abs(width - ${h}(width1));
      var dz2: ${h} = abs(${h}(width2) - width);
      if (depth1 == depth2) {
        dx1 = 0.5;
        dx2 = 0.5;
      }
      if (height1 == height2) {
        dy1 = 0.5;
        dy2 = 0.5;
      }
      if (width1 == width2) {
        dz1 = 0.5;
        dz2 = 0.5;
      }
      return (x111 * dx2 * dy2 * dz2 + x112 * dx2 * dy2 * dz1 + x121 * dx2 * dy1 *dz2 + x122 * dx2 * dy1 * dz1 +
              x211 * dx1 * dy2 * dz2 + x212 * dx1 * dy2 * dz1 + x221 * dx1 * dy1 *dz2 + x222 * dx1 * dy1 * dz1);
    }`},pd=(e,t,r,i,a,n)=>{let s=e.dims,u=rd(n,t.axes,s.length),d=id(s,i,a,t.axes),p=i.slice();i.length===0&&(p=s.map((b,I)=>b===0?1:d[I]/b),t.keepAspectRatioPolicy!=="stretch"&&(d=ad(s,p,t)));let h=K("output",e.dataType,d.length),f=N("input",e.dataType,s.length),g=O.size(d),y=s.length===d.length&&s.every((b,I)=>b===d[I]),_=t.coordinateTransformMode==="tf_crop_and_resize",w=t.extrapolationValue,S=f.type.value,x=b=>`
      ${y?"":`
      ${ed(t.coordinateTransformMode,S)};
      ${(()=>{switch(t.mode){case"nearest":return`
              ${od(f,s)};
              ${td(t.nearestMode,r,S)};
              ${sd(f,h,s,d,p.length,u.length,_)};
              `;case"linear":return`
              ${nd(h,s,d,p.length,u.length)};
              ${(()=>{if(s.length===2||s.length===4)return`${ud(f,h,s,_,w)}`;if(s.length===3||s.length===5)return`${dd(f,h,s,_,w)}`;throw Error("Linear mode only supports input dims 2, 3, 4 and 5 are supported in linear mode.")})()};
            `;case"cubic":return`
            ${(()=>{if(s.length===2||s.length===4)return`${ld(f,h,s,d,p,u,t.cubicCoeffA,_,t.extrapolationValue,t.excludeOutside)}`;throw Error("Cubic mode only supports input dims 2 and 4 are supported in linear mode.")})()};
            `;default:throw Error("Invalid resize mode")}})()};
      `}
      ${b.registerUniform("output_size","u32").registerUniform("scales","f32",p.length).registerUniform("roi","f32",u.length).declareVariables(f,h)}
      ${b.mainStart()}
        ${b.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
        ${y?"output[global_idx] = input[global_idx];":`
        let output_indices = ${h.offsetToIndices("global_idx")};
        var input_indices: ${f.type.indices};
        ${(()=>{switch(t.mode){case"nearest":return`input_indices = calculateInputIndicesFromOutputIndices(output_indices);
                if (checkInputIndices(input_indices)) {
                  output[global_idx] = ${f.getByIndices("input_indices")};
                } else {
                  output[global_idx] = ${t.extrapolationValue};
                }`;case"linear":return`output[global_idx] = ${s.length===2||s.length===4?"bilinearInterpolation":"trilinearInterpolation"}(output_indices);`;case"cubic":return"output[global_idx] = bicubicInterpolation(output_indices);";default:throw Error(`Unsupported resize mode: ${t.mode}`)}})()};
`}
      }`;return{name:"Resize",shaderCache:{hint:`${t.cacheKey}|${r}|${p.length>0?t.mode==="cubic"?p:p.length:""}|${a.length>0?a:""}|${u.length>0?u:""}|${y}|${t.mode==="nearest"?s.length:s}`,inputDependencies:["rank"]},getShaderSource:x,getRunData:()=>({outputs:[{dims:d,dataType:e.dataType}],dispatchGroup:{x:Math.ceil(g/64)},programUniforms:[{type:12,data:g},{type:1,data:p},{type:1,data:u},...Y(s,d)]})}},cd=e=>{let t=e.customDataBuffer;return new Uint32Array(t,t.byteOffset,1)[0]},Gh=(e,t)=>{let r=[],i=[],a=[],n=cd(e);if(t.antialias!==0)throw Error("Only default value (0) for Antialias attribute is supported");Jl(e.inputs,t,n,r,i,a),e.compute(pd(e.inputs[0],t,n,r,i,a),{inputs:[0]})},Hh=e=>{let t=e.antialias,r=e.axes,i=e.coordinateTransformMode,a=e.cubicCoeffA,n=e.excludeOutside!==0,s=e.extrapolationValue,u=e.keepAspectRatioPolicy,d=e.mode,p=e.nearestMode===""?"simple":e.nearestMode;return he({antialias:t,axes:r,coordinateTransformMode:i,cubicCoeffA:a,excludeOutside:n,extrapolationValue:s,keepAspectRatioPolicy:u,mode:d,nearestMode:p})}}),hd,fd,Fh,Dy=q(()=>{te(),ie(),ae(),hd=e=>{if(!e||e.length<3)throw new Error("layerNorm requires at least 3 inputs.");let t=e[0],r=e[1],i=e[2];if(t.dataType!==r.dataType||t.dataType!==i.dataType)throw new Error("All inputs must have the same data type");if(t.dims.length!==3&&t.dims.length!==2)throw new Error("Input must be 2D or 3D");if(r.dims.length!==3&&r.dims.length!==2)throw new Error("Skip must be 2D or 3D");let a=t.dims[t.dims.length-1],n=t.dims[t.dims.length-2];if(r.dims[r.dims.length-1]!==a)throw new Error("Skip must have the same hidden size as input");if(r.dims[r.dims.length-2]!==n)throw new Error("Skip must have the same sequence length as input");if(i.dims.length!==1)throw new Error("Gamma must be 1D");if(i.dims[i.dims.length-1]!==a)throw new Error("Gamma must have the same hidden size as input");if(e.length>3){let s=e[3];if(s.dims.length!==1)throw new Error("Beta must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Beta must have the same hidden size as input")}if(e.length>4){let s=e[4];if(s.dims.length!==1)throw new Error("Bias must be 1D");if(s.dims[s.dims.length-1]!==a)throw new Error("Bias must have the same hidden size as input")}},fd=(e,t,r,i)=>{let a=t.simplified,n=e[0].dims,s=O.size(n),u=n,d=s,p=n.slice(-1)[0],h=i?n.slice(0,-1).concat(1):[],f=!a&&e.length>3,g=e.length>4,y=i&&r>1,_=i&&r>2,w=r>3,S=64,x=ve(p),b=[{type:12,data:d},{type:12,data:x},{type:12,data:p},{type:1,data:t.epsilon}],I=E=>{let C=[{name:"output_size",type:"u32"},{name:"components",type:"u32"},{name:"hidden_size",type:"u32"},{name:"epsilon",type:"f32"}],A=[N("x",e[0].dataType,e[0].dims,x),N("skip",e[1].dataType,e[1].dims,x),N("gamma",e[2].dataType,e[2].dims,x)];f&&A.push(N("beta",e[3].dataType,e[3].dims,x)),g&&A.push(N("bias",e[4].dataType,e[4].dims,x)),A.push(K("output",e[0].dataType,u,x)),y&&A.push(K("mean_output",1,h)),_&&A.push(K("inv_std_output",1,h)),w&&A.push(K("input_skip_bias_sum",e[0].dataType,u,x));let v=Te(e[0].dataType),M=Te(1,x);return`

      ${E.registerUniforms(C).declareVariables(...A)}
      var<workgroup> sum_shared : array<${M}, ${S}>;
      var<workgroup> sum_squared_shared : array<${M}, ${S}>;

      ${E.mainStart([S,1,1])}
        let ix = local_id.x;
        let iy = global_id.x / ${S};

        let hidden_size_vectorized: u32 = uniforms.hidden_size / uniforms.components;
        var stride = hidden_size_vectorized / ${S};
        let offset = ix * stride + iy * hidden_size_vectorized;
        let offset1d = stride * ix;
        if (ix == ${S-1}) {
          stride = hidden_size_vectorized - stride * ix;
        }
        for (var i: u32 = 0; i < stride; i++) {
          let skip_value = skip[offset + i];
          let bias_value = ${g?"bias[offset1d + i]":v+"(0.0)"};
          let input_value = x[offset + i];
          let value = input_value + skip_value + bias_value;
          ${w?"input_skip_bias_sum[offset + i] = value;":""}
          output[offset + i] = value;
          let f32_value = ${Ut(v,x,"value")};
          sum_shared[ix] += f32_value;
          sum_squared_shared[ix] += f32_value * f32_value;
        }
        workgroupBarrier();

        var reduce_size : u32 = ${S};
        for (var curr_size = reduce_size >> 1;  curr_size > 0; curr_size = reduce_size >> 1) {
          reduce_size = curr_size + (reduce_size & 1);
          if (ix < curr_size) {
            sum_shared[ix] += sum_shared[ix + reduce_size];
            sum_squared_shared[ix] += sum_squared_shared[ix + reduce_size];
          }
          workgroupBarrier();
        }

        let sum = sum_shared[0];
        let square_sum = sum_squared_shared[0];
        let mean = ${mt("sum",x)} / f32(uniforms.hidden_size);
        let inv_std_dev = inverseSqrt(${mt("square_sum",x)} / f32(uniforms.hidden_size) ${a?"":"- mean * mean"} + uniforms.epsilon);
        ${y?"mean_output[global_idx] = mean;":""}
        ${_?"inv_std_output[global_idx] = inv_std_dev;":""}

        for (var i: u32 = 0; i < stride; i++) {
          output[offset + i] = (output[offset + i] ${a?"":`- ${v}(mean)`}) *
            ${v}(inv_std_dev) * gamma[offset1d + i]
            ${f?"+ beta[offset1d + i]":""};
        }
      }`},k=[{dims:u,dataType:e[0].dataType}];return r>1&&k.push({dims:h,dataType:1}),r>2&&k.push({dims:h,dataType:1}),r>3&&k.push({dims:n,dataType:e[0].dataType}),{name:"SkipLayerNormalization",shaderCache:{hint:`${x};${y};${_};${w}`,inputDependencies:e.map((E,C)=>"type")},getShaderSource:I,getRunData:()=>({outputs:k,dispatchGroup:{x:Math.ceil(d/p)},programUniforms:b})}},Fh=(e,t)=>{hd(e.inputs);let r=[0];e.outputCount>1&&r.push(-3),e.outputCount>2&&r.push(-3),e.outputCount>3&&r.push(3),e.compute(fd(e.inputs,t,e.outputCount,!1),{outputs:r})}}),md,rr,gd,ua,yd,_d,jh,Kh,Uy=q(()=>{te(),ie(),xe(),ae(),md=(e,t)=>{if(!e||e.length<1)throw new Error("too few inputs");if(t.axes.length!==0){if(t.axes.length!==t.starts.length||t.axes.length!==t.ends.length)throw new Error("axes, starts and ends must have the same length")}else if(t.starts.length!==t.ends.length)throw new Error("starts and ends must have the same length");e.slice(1).forEach((r,i)=>{if(e[i+1].dataType!==6&&e[i+1].dataType!==7)throw new Error(`Input ${i} must be an array of int32 or int64`)})},rr=(e,t)=>{let r=[];if(e.length>t)if(e[t].dataType===7)e[t].getBigInt64Array().forEach(i=>r.push(Number(i)));else if(e[t].dataType===6)e[t].getInt32Array().forEach(i=>r.push(Number(i)));else throw new Error(`Input ${t} must be an array of int32 or int64`);return r},gd=(e,t)=>{if(e.length>1){let r=rr(e,1),i=rr(e,2),a=rr(e,3);return a.length===0&&(a=[...Array(e[0].dims.length).keys()]),he({starts:r,ends:i,axes:a})}else return t},ua=(e,t,r,i,a)=>{let n=e;return e<0&&(n+=r[i[t]]),a[t]<0?Math.max(0,Math.min(n,r[i[t]]-1)):Math.max(0,Math.min(n,r[i[t]]))},yd=(e,t,r)=>`fn calculateInputIndices(output_indices: ${t.type.indices}) -> ${e.type.indices} {
          var input_indices: ${e.type.indices};
          var carry = 0u;
          for (var i = ${r.length-1}; i >= 0; i--) {
            let input_shape_i = ${Z("uniforms.input_shape","i",r.length)};
            let steps_i = ${Z("uniforms.steps","i",r.length)};
            let signs_i = ${Z("uniforms.signs","i",r.length)};
            let starts_i = ${Z("uniforms.starts","i",r.length)};
            var output_index = ${t.indicesGet("output_indices","i")};
            var input_index = output_index * steps_i + starts_i + carry;
            carry = input_index / input_shape_i;
            input_index = input_index % input_shape_i;
            if (signs_i < 0) {
              input_index = input_shape_i - input_index - 1u + starts_i;
            }
            ${e.indicesSet("input_indices","i","input_index")};
          }
          return input_indices;
      }`,_d=(e,t)=>{let r=e[0].dims,i=O.size(r),a=t.axes.length>0?O.normalizeAxes(t.axes,r.length):[...Array(r.length).keys()],n=rr(e,4);n.forEach(x=>x!==0||(()=>{throw new Error("step cannot be 0")})),n.length===0&&(n=Array(a.length).fill(1));let s=t.starts.map((x,b)=>ua(x,b,r,a,n)),u=t.ends.map((x,b)=>ua(x,b,r,a,n));if(a.length!==s.length||a.length!==u.length)throw new Error("start, ends and axes should have the same number of elements");if(a.length!==r.length)for(let x=0;x<r.length;++x)a.includes(x)||(s.splice(x,0,0),u.splice(x,0,r[x]),n.splice(x,0,1));let d=n.map(x=>Math.sign(x));n.forEach((x,b,I)=>{if(x<0){let k=(u[b]-s[b])/x,E=s[b],C=E+k*n[b];s[b]=C,u[b]=E,I[b]=-x}});let p=r.slice(0);a.forEach((x,b)=>{p[x]=Math.ceil((u[x]-s[x])/n[x])});let h={dims:p,dataType:e[0].dataType},f=K("output",e[0].dataType,p.length),g=N("input",e[0].dataType,e[0].dims.length),y=O.size(p),_=[{name:"outputSize",type:"u32"},{name:"starts",type:"u32",length:s.length},{name:"signs",type:"i32",length:d.length},{name:"steps",type:"u32",length:n.length}],w=[{type:12,data:y},{type:12,data:s},{type:6,data:d},{type:12,data:n},...Y(e[0].dims,p)],S=x=>`
      ${x.registerUniforms(_).declareVariables(g,f)}
        ${yd(g,f,r)}
        ${x.mainStart()}
          ${x.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.outputSize")}
          let output_indices = ${f.offsetToIndices("global_idx")};
          let input_indices = calculateInputIndices(output_indices);
          ${f.setByOffset("global_idx",g.getByIndices("input_indices"))}
      }`;return{name:"Slice",shaderCache:{hint:`${d.length}_${s.length}_${n.length}`,inputDependencies:["rank"]},getShaderSource:S,getRunData:()=>({outputs:[h],dispatchGroup:{x:Math.ceil(i/64)},programUniforms:w})}},jh=(e,t)=>{md(e.inputs,t);let r=gd(e.inputs,t);e.compute(_d(e.inputs,r),{inputs:[0]})},Kh=e=>{let t=e.starts,r=e.ends,i=e.axes;return he({starts:t,ends:r,axes:i})}}),wd,bd,Qh,Zh,Py=q(()=>{te(),ie(),xe(),gt(),ae(),wd=e=>{if(!e||e.length!==1)throw new Error("Softmax op requires 1 input.")},bd=(e,t)=>{let r=e.inputs[0],i=r.dims,a=O.size(i),n=i.length,s=O.normalizeAxis(t.axis,n),u=s<i.length-1,d,p=[];u?(p=Array.from({length:n},(A,v)=>v),p[s]=n-1,p[n-1]=s,d=e.compute(Me(r,p),{inputs:[r],outputs:[-1]})[0]):d=r;let h=d.dims,f=h[n-1],g=a/f,y=ve(f),_=f/y,w=64;g===1&&(w=256);let S=(A,v)=>v===4?`max(max(${A}.x, ${A}.y), max(${A}.z, ${A}.w))`:v===2?`max(${A}.x, ${A}.y)`:v===3?`max(max(${A}.x, ${A}.y), ${A}.z)`:A,x=N("x",d.dataType,d.dims,y),b=K("result",d.dataType,d.dims,y),I=x.type.value,k=Te(d.dataType)==="f32"?`var threadMax = ${I}(-3.4028234663852886e+38f);`:`var threadMax = ${I}(-65504.0h);`,E=A=>`
      var<workgroup> rowMaxShared : ${I};
      var<workgroup> rowSumShared : ${I};
      var<workgroup> threadShared : array<${I}, ${w}>;

      fn getValue(row: i32, col: i32, row_stride: i32) -> ${I} {
        let index = row * row_stride + col;
        return x[index];
      }

      fn setValue(row: i32, col: i32, row_stride: i32, value: ${I}) {
        let index = row * row_stride + col;
        result[index] = value;
      }
      ${A.registerUniform("packedCols","i32").declareVariables(x,b)}
      ${A.mainStart(w)}
        let gindex = i32(global_idx);
        let lindex = i32(local_idx);
        const wg = ${w};
        let row = gindex / wg;
        let cols = uniforms.packedCols;
        let row_stride : i32 = uniforms.packedCols;

        // find the rows max
        ${k}
        for (var col = lindex; col < cols; col += wg) {
          let value = getValue(row, col, row_stride);
          threadMax = max(threadMax, value);
        }
        if (lindex < cols) {
          threadShared[lindex] = threadMax;
        }
        workgroupBarrier();

        var reduceSize = min(cols, wg);
        for (var currSize = reduceSize >> 1;  currSize > 0; currSize = reduceSize >> 1) {
          reduceSize = currSize + (reduceSize & 1);
          if (lindex < currSize) {
            threadShared[lindex] = max(threadShared[lindex], threadShared[lindex + reduceSize]);
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowMaxShared = ${I}(${S("threadShared[0]",y)});
        }
        workgroupBarrier();

        // find the rows sum
        var threadSum = ${I}(0.0);
        for (var col = lindex; col < cols; col += wg) {
          let subExp = exp(getValue(row, col, row_stride) - rowMaxShared);
          threadSum += subExp;
        }
        threadShared[lindex] = threadSum;
        workgroupBarrier();

        for (var currSize = wg >> 1;  currSize > 0; currSize = currSize >> 1) {
          if (lindex < currSize) {
            threadShared[lindex] = threadShared[lindex] + threadShared[lindex + currSize];
          }
          workgroupBarrier();
        }
        if (lindex == 0) {
          rowSumShared = ${I}(${mt("threadShared[0]",y)});
        }
        workgroupBarrier();

        // calculate final value for each element in the row
        for (var col = lindex; col < cols; col += wg) {
          var value = exp(getValue(row, col, row_stride) - rowMaxShared) / rowSumShared;
          // max operation protects against NaN since all values should be >=0
          value = max(value, ${I}(0.0));
          setValue(row, col, row_stride, value);
        }
      }`,C=e.compute({name:"Softmax",shaderCache:{hint:`${y};${w}`,inputDependencies:["type"]},getRunData:()=>({outputs:[{dims:h,dataType:d.dataType}],dispatchGroup:{x:g},programUniforms:[{type:6,data:_}]}),getShaderSource:E},{inputs:[d],outputs:[u?-1:0]})[0];u&&e.compute(Me(C,p),{inputs:[C]})},Qh=(e,t)=>{wd(e.inputs),bd(e,t)},Zh=e=>he({axis:e.axis})}),la,$d,vd,xd,Yh,qy=q(()=>{te(),ie(),ae(),la=e=>Array.from(e.getBigInt64Array(),Number),$d=e=>{if(!e||e.length!==2)throw new Error("Tile requires 2 inputs.");if(e[0].dataType!==1&&e[0].dataType!==10&&e[0].dataType!==6&&e[0].dataType!==12)throw new Error("Tile only support float, float16, int32, and uint32 data types");if(e[1].dataType!==7)throw new Error("Tile `repeats` input should be of int64 data type");if(e[1].dims.length!==1)throw new Error("Tile `repeats` input should be 1-D");if(la(e[1]).length!==e[0].dims.length)throw new Error("Tile `repeats` input should have same number of elements as rank of input data tensor")},vd=(e,t)=>{let r=[];for(let i=0;i<e.length;++i)r.push(e[i]*t[i]);return r},xd=(e,t)=>{let r=e[0].dims,i=t??la(e[1]),a=vd(r,i),n=O.size(a),s=e[0].dataType,u=N("input",s,r.length),d=K("output",s,a.length),p=h=>`
      const inputShape = ${u.indices(...r)};
      ${h.registerUniform("output_size","u32").declareVariables(u,d)}
      ${h.mainStart()}
      ${h.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.output_size")}
      let output_indices = ${d.offsetToIndices("global_idx")};
      var input_indices: ${u.type.indices};
      for (var i = 0; i < ${r.length}; i++) {
        let input_dim_i = ${u.indicesGet("uniforms.input_shape","i")};
        let input_dim_value = ${d.indicesGet("output_indices","i")}  % input_dim_i;

        ${u.indicesSet("input_indices","i","input_dim_value")}
      }
      ${d.setByOffset("global_idx",u.getByIndices("input_indices"))}
    }`;return{name:"Tile",shaderCache:{hint:`${i}`,inputDependencies:["rank"]},getRunData:()=>({outputs:[{dims:a,dataType:e[0].dataType}],dispatchGroup:{x:Math.ceil(n/64)},programUniforms:[{type:12,data:n},...Y(e[0].dims,a)]}),getShaderSource:p}},Yh=e=>{$d(e.inputs),e.compute(xd(e.inputs),{inputs:[0]})}}),Sd,Td,Xh,Wy=q(()=>{te(),ie(),ae(),Sd=(e,t,r,i,a)=>{let n=K("output_data",a,r.length,4),s=N("a_data",t[1].dataType,t[1].dims.length,4),u=N("b_data",t[2].dataType,t[2].dims.length,4),d=N("c_data",t[0].dataType,t[0].dims.length,4),p,h=(f,g,y)=>`select(${g}, ${f}, ${y})`;if(!i)p=n.setByOffset("global_idx",h(s.getByOffset("global_idx"),u.getByOffset("global_idx"),d.getByOffset("global_idx")));else{let f=(g,y,_="")=>{let w=`a_data[index_a${y}][component_a${y}]`,S=`b_data[index_b${y}][component_b${y}]`,x=`bool(c_data[index_c${y}] & (0xffu << (component_c${y} * 8)))`;return`
            let output_indices${y} = ${n.offsetToIndices(`global_idx * 4u + ${y}u`)};
            let offset_a${y} = ${s.broadcastedIndicesToOffset(`output_indices${y}`,n)};
            let offset_b${y} = ${u.broadcastedIndicesToOffset(`output_indices${y}`,n)};
            let offset_c${y} = ${d.broadcastedIndicesToOffset(`output_indices${y}`,n)};
            let index_a${y} = offset_a${y} / 4u;
            let index_b${y} = offset_b${y} / 4u;
            let index_c${y} = offset_c${y} / 4u;
            let component_a${y} = offset_a${y} % 4u;
            let component_b${y} = offset_b${y} % 4u;
            let component_c${y} = offset_c${y} % 4u;
            ${g}[${y}] = ${_}(${h(w,S,x)});
          `};a===9?p=`
            var data = vec4<u32>(0);
            ${f("data",0,"u32")}
            ${f("data",1,"u32")}
            ${f("data",2,"u32")}
            ${f("data",3,"u32")}
            output_data[global_idx] = dot(vec4<u32>(0x1, 0x100, 0x10000, 0x1000000), vec4<u32>(data));`:p=`
            ${f("output_data[global_idx]",0)}
            ${f("output_data[global_idx]",1)}
            ${f("output_data[global_idx]",2)}
            ${f("output_data[global_idx]",3)}
          `}return`
        ${e.registerUniform("vec_size","u32").declareVariables(d,s,u,n)}
        ${e.mainStart()}
        ${e.guardAgainstOutOfBoundsWorkgroupSizes("uniforms.vec_size")}
        ${p}
      }`},Td=e=>{let t=e[1].dims,r=e[2].dims,i=e[0].dims,a=e[1].dataType,n=!(O.areEqual(t,r)&&O.areEqual(r,i)),s=t,u=O.size(t);if(n){let p=Pt.calcShape(Pt.calcShape(t,r,!1),i,!1);if(!p)throw new Error("Can't perform where op on the given tensors");s=p,u=O.size(s)}let d=Math.ceil(u/4);return{name:"Where",shaderCache:{inputDependencies:["rank","rank","rank"]},getShaderSource:p=>Sd(p,e,s,n,a),getRunData:()=>({outputs:[{dims:s,dataType:a}],dispatchGroup:{x:Math.ceil(u/64/4)},programUniforms:[{type:12,data:d},...Y(i,t,r,s)]})}},Xh=e=>{e.compute(Td(e.inputs))}}),Jh,Ly=q(()=>{ry(),Ga(),iy(),ay(),ny(),sy(),oy(),cy(),fy(),my(),gy(),yy(),_y(),wy(),by(),$y(),vy(),xy(),Sy(),Ty(),ky(),Iy(),Ey(),zy(),Cy(),_h(),Ay(),Oy(),Ry(),By(),Ny(),Va(),My(),xh(),Dy(),Uy(),Py(),$h(),qy(),gt(),Ha(),Wy(),Jh=new Map([["Abs",[Fp]],["Acos",[jp]],["Acosh",[Kp]],["Add",[Ec]],["ArgMax",[Lp,ba]],["ArgMin",[Wp,ba]],["Asin",[Qp]],["Asinh",[Zp]],["Atan",[Yp]],["Atanh",[Xp]],["Attention",[Vp]],["AveragePool",[Oh,Ah]],["BatchNormalization",[Gp]],["BiasAdd",[Hp]],["BiasSplitGelu",[Ic]],["Cast",[ec,Jp]],["Ceil",[rc]],["Clip",[tc]],["Concat",[Uc,Pc]],["Conv",[ka,Ta]],["ConvTranspose",[Qc,Kc]],["Cos",[ic]],["Cosh",[ac]],["CumSum",[Zc,Yc]],["DepthToSpace",[Xc,Jc]],["DequantizeLinear",[Ph,qh]],["Div",[zc]],["Einsum",[eh,th]],["Elu",[nc,or]],["Equal",[Cc]],["Erf",[sc]],["Exp",[oc]],["Expand",[rh]],["FastGelu",[ih]],["Floor",[uc]],["FusedConv",[ka,Ta]],["Gather",[nh,ah]],["GatherElements",[ph,dh]],["GatherBlockQuantized",[uh,lh]],["GatherND",[sh,oh]],["Gelu",[lc]],["Gemm",[hh,ch]],["GlobalAveragePool",[Bh,Rh]],["GlobalMaxPool",[Uh,Dh]],["Greater",[Bc]],["GreaterOrEqual",[Mc]],["GridSample",[fh,mh]],["GroupQueryAttention",[Sh]],["HardSigmoid",[yc,gc]],["InstanceNormalization",[Th]],["LayerNormalization",[kh]],["LeakyRelu",[dc,or]],["Less",[Nc]],["LessOrEqual",[Dc]],["Log",[Tc]],["MatMul",[Ih]],["MatMulNBits",[Eh,zh]],["MaxPool",[Nh,Mh]],["Mul",[Ac]],["MultiHeadAttention",[yh,gh]],["Neg",[cc]],["Not",[pc]],["Pad",[Ch]],["Pow",[Oc]],["QuickGelu",[kc,or]],["Range",[Wh]],["Reciprocal",[hc]],["ReduceMin",[Mp]],["ReduceMean",[Ap]],["ReduceMax",[Np]],["ReduceSum",[Up]],["ReduceProd",[Dp]],["ReduceL1",[Op]],["ReduceL2",[Rp]],["ReduceLogSum",[qp]],["ReduceLogSumExp",[Bp]],["ReduceSumSquare",[Pp]],["Relu",[fc]],["Resize",[Gh,Hh]],["RotaryEmbedding",[vh]],["ScatterND",[Vh,Lh]],["Sigmoid",[mc]],["Sin",[_c]],["Sinh",[wc]],["Slice",[jh,Kh]],["SkipLayerNormalization",[Fh]],["Split",[wh,bh]],["Sqrt",[bc]],["Softmax",[Qh,Zh]],["Sub",[Rc]],["Tan",[$c]],["Tanh",[vc]],["ThresholdedRelu",[Sc,or]],["Tile",[Yh]],["Transpose",[wp,bp]],["Where",[Xh]]])}),ef,Vy=q(()=>{Ue(),it(),ae(),ef=class{constructor(e){this.backend=e,this.repo=new Map,this.attributesBound=!1}getArtifact(e){return this.repo.get(e)}setArtifact(e,t){this.repo.set(e,t)}run(e,t,r,i,a){Xe(e.programInfo.name);let n=this.backend.device,s=this.backend.getComputePassEncoder();this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2);let u=[];for(let p of t)u.push({binding:u.length,resource:{buffer:p.buffer}});for(let p of r)u.push({binding:u.length,resource:{buffer:p.buffer}});a&&u.push({binding:u.length,resource:a});let d=n.createBindGroup({layout:e.computePipeline.getBindGroupLayout(0),entries:u,label:e.programInfo.name});if(this.backend.sessionStatus==="capturing"){let p={kernelId:this.backend.currentKernelId,computePipeline:e.computePipeline,bindGroup:d,dispatchGroup:i};this.backend.capturedCommandList.get(this.backend.currentSessionId).push(p)}s.setPipeline(e.computePipeline),s.setBindGroup(0,d),s.dispatchWorkgroups(...i),this.backend.writeTimestamp(this.backend.pendingDispatchNumber*2+1),this.backend.pendingDispatchNumber++,(this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber||this.backend.queryType==="at-passes")&&this.backend.endComputePass(),this.backend.pendingDispatchNumber>=this.backend.maxDispatchNumber&&this.backend.flush(),Fe(e.programInfo.name)}dispose(){}build(e,t){Xe(e.name);let r=this.backend.device,i=[];[{feature:"shader-f16",extension:"f16"},{feature:"subgroups",extension:"subgroups"}].forEach(p=>{r.features.has(p.feature)&&i.push(`enable ${p.extension};`)});let a=_p(t,this.backend.device.limits),n=e.getShaderSource(a),s=`${i.join(`
`)}
${a.additionalImplementations}
${n}`,u=r.createShaderModule({code:s,label:e.name});de("verbose",()=>`[WebGPU] ${e.name} shader code: ${s}`);let d=r.createComputePipeline({compute:{module:u,entryPoint:"main"},layout:"auto",label:e.name});return Fe(e.name),{programInfo:e,computePipeline:d,uniformVariablesInfo:a.variablesInfo}}normalizeDispatchGroupSize(e){let t=typeof e=="number"?e:e.x,r=typeof e=="number"?1:e.y||1,i=typeof e=="number"?1:e.z||1,a=this.backend.device.limits.maxComputeWorkgroupsPerDimension;if(t<=a&&r<=a&&i<=a)return[t,r,i];let n=t*r*i,s=Math.ceil(Math.sqrt(n));if(s>a){if(s=Math.ceil(Math.cbrt(n)),s>a)throw new Error("Total dispatch size exceeds WebGPU maximum.");return[s,s,s]}else return[s,s,1]}}}),tf={};Wt(tf,{WebGpuBackend:()=>rf});var kd,Id,Ed,rf,Gy=q(()=>{Ue(),te(),it(),hp(),ey(),Ly(),Vy(),kd=(e,t)=>{if(t.length!==e.length)throw new Error(`inputDependencies length ${t.length} is not equal to inputTensors length ${e.length}.`);let r=[];for(let i=0;i<e.length;++i){let a=e[i].dataType;switch(t[i]){case"none":{r.push("");break}case"type":{r.push(`${a}`);break}case"rank":{let n=e[i].dims.length;r.push(`${a};${n}`);break}case"dims":{let n=e[i].dims.join(",");r.push(`${a};${n}`);break}default:throw new Error(`unsupported input dependency: ${t[i]}`)}}return r.join("|")},Id=(e,t,r)=>{var a,n;let i=e.name;return(a=e.shaderCache)!=null&&a.hint&&(i+="["+e.shaderCache.hint+"]"),i+=":"+r+`:${kd(t,((n=e.shaderCache)==null?void 0:n.inputDependencies)??new Array(t.length).fill("dims"))}`,i},Ed=class{constructor(e){e&&(this.architecture=e.architecture,this.vendor=e.vendor)}isArchitecture(e){return this.architecture===e}isVendor(e){return this.vendor===e}},rf=class{constructor(){this.currentSessionId=null,this.currentKernelId=null,this.commandEncoder=null,this.computePassEncoder=null,this.maxDispatchNumber=16,this.pendingDispatchNumber=0,this.pendingKernels=[],this.pendingQueries=new Map,this.sessionStatus="default",this.capturedCommandList=new Map,this.capturedPendingKernels=new Map,this.sessionExternalDataMapping=new Map}get currentKernelCustomData(){if(this.currentKernelId===null)throw new Error("currentKernelCustomData(): currentKernelId is null. (should not happen)");let e=this.kernelCustomData.get(this.currentKernelId);return e||(e={},this.kernelCustomData.set(this.currentKernelId,e)),e}async initialize(e,t){this.env=e;let r=[],i={requiredLimits:{maxComputeWorkgroupStorageSize:t.limits.maxComputeWorkgroupStorageSize,maxComputeWorkgroupsPerDimension:t.limits.maxComputeWorkgroupsPerDimension,maxStorageBufferBindingSize:t.limits.maxStorageBufferBindingSize,maxBufferSize:t.limits.maxBufferSize,maxComputeInvocationsPerWorkgroup:t.limits.maxComputeInvocationsPerWorkgroup,maxComputeWorkgroupSizeX:t.limits.maxComputeWorkgroupSizeX,maxComputeWorkgroupSizeY:t.limits.maxComputeWorkgroupSizeY,maxComputeWorkgroupSizeZ:t.limits.maxComputeWorkgroupSizeZ},requiredFeatures:r},a=n=>t.features.has(n)&&r.push(n)&&!0;a("chromium-experimental-timestamp-query-inside-passes")||a("timestamp-query"),a("shader-f16"),a("subgroups"),this.device=await t.requestDevice(i),this.adapterInfo=new Ed(t.info||await t.requestAdapterInfo()),this.gpuDataManager=gp(this),this.programManager=new ef(this),this.kernels=new Map,this.kernelPersistentData=new Map,this.kernelCustomData=new Map,Pa(e.logLevel,!!e.debug),this.device.onuncapturederror=n=>{n.error instanceof GPUValidationError&&console.error(`An uncaught WebGPU validation error was raised: ${n.error.message}`)},Object.defineProperty(this.env.webgpu,"device",{value:this.device,writable:!1,enumerable:!0,configurable:!1}),Object.defineProperty(this.env.webgpu,"adapter",{value:t,writable:!1,enumerable:!0,configurable:!1}),this.setQueryType()}dispose(){typeof this.querySet<"u"&&this.querySet.destroy(),this.gpuDataManager.dispose()}getCommandEncoder(){return this.commandEncoder||(this.commandEncoder=this.device.createCommandEncoder()),this.commandEncoder}getComputePassEncoder(){if(!this.computePassEncoder){let e=this.getCommandEncoder(),t={};this.queryType==="at-passes"&&(t.timestampWrites={querySet:this.querySet,beginningOfPassWriteIndex:this.pendingDispatchNumber*2,endOfPassWriteIndex:this.pendingDispatchNumber*2+1}),this.computePassEncoder=e.beginComputePass(t)}return this.computePassEncoder}endComputePass(){this.computePassEncoder&&(this.computePassEncoder.end(),this.computePassEncoder=null)}flush(){if(!this.commandEncoder)return;Xe(),this.endComputePass();let e;this.queryType!=="none"&&(this.commandEncoder.resolveQuerySet(this.querySet,0,this.pendingDispatchNumber*2,this.queryResolveBuffer,0),e=this.device.createBuffer({size:this.pendingDispatchNumber*2*8,usage:GPUBufferUsage.MAP_READ|GPUBufferUsage.COPY_DST}),this.pendingQueries.set(e,this.pendingKernels),this.pendingKernels=[],this.commandEncoder.copyBufferToBuffer(this.queryResolveBuffer,0,e,0,this.pendingDispatchNumber*2*8)),this.device.queue.submit([this.commandEncoder.finish()]),this.gpuDataManager.refreshPendingBuffers(),this.commandEncoder=null,this.pendingDispatchNumber=0,this.queryType!=="none"&&e.mapAsync(GPUMapMode.READ).then(()=>{var i;let t=new BigUint64Array(e.getMappedRange()),r=this.pendingQueries.get(e);for(let a=0;a<t.length/2;a++){let n=r[a],s=n.kernelId,u=this.kernels.get(s),d=u.kernelType,p=u.kernelName,h=n.programName,f=n.inputTensorViews,g=n.outputTensorViews,y=t[a*2],_=t[a*2+1];typeof this.queryTimeBase>"u"&&(this.queryTimeBase=y);let w=Number(y-this.queryTimeBase),S=Number(_-this.queryTimeBase);if(!Number.isSafeInteger(w)||!Number.isSafeInteger(S))throw new RangeError("incorrect timestamp range");if((i=this.env.webgpu.profiling)!=null&&i.ondata)this.env.webgpu.profiling.ondata({version:1,inputsMetadata:f.map(x=>({dims:x.dims,dataType:rt(x.dataType)})),outputsMetadata:g.map(x=>({dims:x.dims,dataType:rt(x.dataType)})),kernelId:s,kernelType:d,kernelName:p,programName:h,startTime:w,endTime:S});else{let x="";f.forEach((I,k)=>{x+=`input[${k}]: [${I.dims}] | ${rt(I.dataType)}, `});let b="";g.forEach((I,k)=>{b+=`output[${k}]: [${I.dims}] | ${rt(I.dataType)}, `}),console.log(`[profiling] kernel "${s}|${d}|${p}|${h}" ${x}${b}start time: ${w} ns, execution time: ${S-w} ns`)}Wr("GPU",`${h}::${y}::${_}`)}e.unmap(),this.pendingQueries.delete(e)}),Fe()}run(e,t,r,i,a,n){Xe(e.name);let s=[];for(let b=0;b<t.length;++b){let I=t[b].data;if(I===0)continue;let k=this.gpuDataManager.get(I);if(!k)throw new Error(`no GPU data for input: ${I}`);s.push(k)}let{outputs:u,dispatchGroup:d,programUniforms:p}=e.getRunData(t),h=r.length===0?u.map((b,I)=>I):r;if(h.length!==u.length)throw new Error(`Output size ${h.length} must be equal to ${u.length}.`);let f=[],g=[];for(let b=0;b<u.length;++b){if(!Number.isInteger(h[b])||h[b]<-3||h[b]>=n)throw new Error(`Invalid output index: ${h[b]}`);if(h[b]===-3)continue;let I=h[b]===-1,k=h[b]===-2,E=I||k?a(u[b].dataType,u[b].dims):i(h[b],u[b].dataType,u[b].dims);if(f.push(E),E.data===0)continue;let C=this.gpuDataManager.get(E.data);if(!C)throw new Error(`no GPU data for output: ${E.data}`);if(I&&this.temporaryData.push(C),k){let A=this.kernelPersistentData.get(this.currentKernelId);A||(A=[],this.kernelPersistentData.set(this.currentKernelId,A)),A.push(C)}g.push(C)}if(s.length!==t.length||g.length!==f.length){if(g.length===0)return Fe(e.name),f;throw new Error(`Program ${e.name} has zero-sized tensor(s) in inputs or outputs. This is not supported now.`)}let y;if(p){let b=0,I=[];p.forEach(A=>{let v=typeof A.data=="number"?[A.data]:A.data;if(v.length===0)return;let M=A.type===10?2:4,D,H;A.type===10?(H=v.length>4?16:v.length>2?8:v.length*M,D=v.length>4?16:M*v.length):(H=v.length<=2?v.length*M:16,D=16),b=Math.ceil(b/H)*H,I.push(b);let G=A.type===10?8:4;b+=v.length>4?Math.ceil(v.length/G)*D:v.length*M});let k=16;b=Math.ceil(b/k)*k;let E=new ArrayBuffer(b);p.forEach((A,v)=>{let M=I[v],D=typeof A.data=="number"?[A.data]:A.data;if(A.type===6)new Int32Array(E,M,D.length).set(D);else if(A.type===12)new Uint32Array(E,M,D.length).set(D);else if(A.type===10)new Uint16Array(E,M,D.length).set(D);else if(A.type===1)new Float32Array(E,M,D.length).set(D);else throw new Error(`Unsupported uniform type: ${rt(A.type)}`)});let C=this.gpuDataManager.create(b,GPUBufferUsage.COPY_DST|GPUBufferUsage.UNIFORM);this.device.queue.writeBuffer(C.buffer,0,E,0,b),this.gpuDataManager.release(C.id),y={offset:0,size:b,buffer:C.buffer}}let _=this.programManager.normalizeDispatchGroupSize(d),w=_[1]===1&&_[2]===1,S=Id(e,t,w),x=this.programManager.getArtifact(S);if(x||(x=this.programManager.build(e,_),this.programManager.setArtifact(S,x),de("info",()=>`[artifact] key: ${S}, programName: ${e.name}`)),p&&x.uniformVariablesInfo){if(p.length!==x.uniformVariablesInfo.length)throw new Error(`Uniform variables count mismatch: expect ${x.uniformVariablesInfo.length}, got ${p.length} in program "${x.programInfo.name}".`);for(let b=0;b<p.length;b++){let I=p[b],k=I.type,E=typeof I.data=="number"?1:I.data.length,[C,A]=x.uniformVariablesInfo[b];if(k!==C||E!==A)throw new Error(`Uniform variable ${b} mismatch: expect type ${C} with size ${A}, got type ${k} with size ${E} in program "${x.programInfo.name}".`)}}if(de("info",()=>`[ProgramManager] run "${e.name}" (key=${S}) with ${_[0]}x${_[1]}x${_[2]}`),this.queryType!=="none"||this.sessionStatus==="capturing"){let b={kernelId:this.currentKernelId,programName:x.programInfo.name,inputTensorViews:t,outputTensorViews:f};this.pendingKernels.push(b),this.sessionStatus==="capturing"&&this.capturedPendingKernels.get(this.currentSessionId).push(b)}return this.programManager.run(x,s,g,_,y),Fe(e.name),f}upload(e,t){this.gpuDataManager.upload(e,t)}memcpy(e,t){this.gpuDataManager.memcpy(e,t)}async download(e,t){await this.gpuDataManager.download(e,t)}alloc(e){return this.gpuDataManager.create(e).id}free(e){return this.gpuDataManager.release(e)}createKernel(e,t,r,i){let a=Jh.get(e);if(!a)throw new Error(`kernel not implemented: ${e}`);let n={kernelType:e,kernelName:i,kernelEntry:a[0],attributes:[a[1],r]};this.kernels.set(t,n)}releaseKernel(e){let t=this.kernelPersistentData.get(e);if(t){for(let r of t)this.gpuDataManager.release(r.id);this.kernelPersistentData.delete(e)}this.kernelCustomData.delete(e),this.kernels.delete(e)}computeKernel(e,t,r){let i=this.kernels.get(e);if(!i)throw new Error(`kernel not created: ${e}`);let a=i.kernelType,n=i.kernelName,s=i.kernelEntry,u=i.attributes;if(this.currentKernelId!==null)throw new Error(`kernel "[${a}] ${n}" is not allowed to be called recursively`);this.currentKernelId=e,u[0]&&(u[1]=u[0](u[1]),u[0]=void 0),de("info",()=>`[WebGPU] Start to run kernel "[${a}] ${n}"...`);let d=this.env.debug;this.temporaryData=[];try{return d&&this.device.pushErrorScope("validation"),s(t,u[1]),0}catch(p){return r.push(Promise.resolve(`[WebGPU] Kernel "[${a}] ${n}" failed. ${p}`)),1}finally{d&&r.push(this.device.popErrorScope().then(p=>p?`GPU validation error for kernel "[${a}] ${n}": ${p.message}`:null));for(let p of this.temporaryData)this.gpuDataManager.release(p.id);this.temporaryData=[],this.currentKernelId=null}}registerBuffer(e,t,r,i){let a=this.sessionExternalDataMapping.get(e);a||(a=new Map,this.sessionExternalDataMapping.set(e,a));let n=a.get(t),s=this.gpuDataManager.registerExternalBuffer(r,i,n);return a.set(t,[s,r]),s}unregisterBuffers(e){let t=this.sessionExternalDataMapping.get(e);t&&(t.forEach(r=>this.gpuDataManager.unregisterExternalBuffer(r[0])),this.sessionExternalDataMapping.delete(e))}getBuffer(e){let t=this.gpuDataManager.get(e);if(!t)throw new Error(`no GPU data for buffer: ${e}`);return t.buffer}createDownloader(e,t,r){return async()=>{let i=await ya(this,e,t);return qa(i.buffer,r)}}writeTimestamp(e){this.queryType==="inside-passes"&&this.computePassEncoder.writeTimestamp(this.querySet,e)}setQueryType(){var e;this.queryType="none",(((e=this.env.webgpu.profiling)==null?void 0:e.mode)==="default"||(typeof this.env.trace>"u"?this.env.wasm.trace:this.env.trace))&&(this.device.features.has("chromium-experimental-timestamp-query-inside-passes")?this.queryType="inside-passes":this.device.features.has("timestamp-query")&&(this.queryType="at-passes"),this.queryType!=="none"&&typeof this.querySet>"u"&&(this.querySet=this.device.createQuerySet({type:"timestamp",count:this.maxDispatchNumber*2}),this.queryResolveBuffer=this.device.createBuffer({size:this.maxDispatchNumber*2*8,usage:GPUBufferUsage.COPY_SRC|GPUBufferUsage.QUERY_RESOLVE})))}captureBegin(){de("info","captureBegin"),this.capturedCommandList.get(this.currentSessionId)||this.capturedCommandList.set(this.currentSessionId,[]),this.capturedPendingKernels.get(this.currentSessionId)||this.capturedPendingKernels.set(this.currentSessionId,[]),this.flush(),this.sessionStatus="capturing"}captureEnd(){de("info","captureEnd"),this.flush(),this.sessionStatus="default"}replay(){de("info","replay"),this.sessionStatus="replaying";let e=this.capturedCommandList.get(this.currentSessionId),t=this.capturedPendingKernels.get(this.currentSessionId),r=e.length;this.pendingKernels=[];for(let i=0;i<r;i++){let a=this.getComputePassEncoder(),n=e[i];this.writeTimestamp(this.pendingDispatchNumber*2),a.setPipeline(n.computePipeline),a.setBindGroup(0,n.bindGroup),a.dispatchWorkgroups(...n.dispatchGroup),this.writeTimestamp(this.pendingDispatchNumber*2+1),this.pendingDispatchNumber++,this.queryType!=="none"&&this.pendingKernels.push(t[i]),(this.pendingDispatchNumber>=this.maxDispatchNumber||this.queryType==="at-passes")&&this.endComputePass(),this.pendingDispatchNumber>=this.maxDispatchNumber&&this.flush()}this.flush(),this.sessionStatus="default"}onCreateSession(){this.gpuDataManager.onCreateSession()}onReleaseSession(e){this.unregisterBuffers(e),this.capturedCommandList.has(e)&&this.capturedCommandList.delete(e),this.capturedPendingKernels.has(e)&&this.capturedPendingKernels.delete(e),this.gpuDataManager.onReleaseSession(e)}onRunStart(e){this.currentSessionId=e,this.setQueryType()}}}),af={};Wt(af,{init:()=>nf});var Mr,zd,nf,Hy=q(()=>{te(),it(),ie(),Jg(),Mr=class sf{constructor(t,r,i,a){this.module=t,this.dataType=r,this.data=i,this.dims=a}getFloat32Array(){if(this.dataType!==1)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Float32Array:new Float32Array(this.module.HEAP8.buffer,this.data,t)}getBigInt64Array(){if(this.dataType!==7)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new BigInt64Array:new BigInt64Array(this.module.HEAP8.buffer,this.data,t)}getInt32Array(){if(this.dataType!==6)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Int32Array:new Int32Array(this.module.HEAP8.buffer,this.data,t)}getUint16Array(){if(this.dataType!==10&&this.dataType!==4)throw new Error("Invalid data type");let t=O.size(this.dims);return t===0?new Uint16Array:new Uint16Array(this.module.HEAP8.buffer,this.data,t)}reshape(t){if(O.size(t)!==O.size(this.dims))throw new Error("Invalid new shape");return new sf(this.module,this.dataType,this.data,t)}},zd=class{constructor(e,t,r){this.module=e,this.backend=t,this.customDataOffset=0,this.customDataSize=0,this.adapterInfo=t.adapterInfo;let i=e.PTR_SIZE,a=r/e.PTR_SIZE,n=i===4?"i32":"i64";this.opKernelContext=Number(e.getValue(i*a++,n));let s=Number(e.getValue(i*a++,n));this.outputCount=Number(e.getValue(i*a++,n)),this.customDataOffset=Number(e.getValue(i*a++,"*")),this.customDataSize=Number(e.getValue(i*a++,n));let u=[];for(let d=0;d<s;d++){let p=Number(e.getValue(i*a++,n)),h=Number(e.getValue(i*a++,"*")),f=Number(e.getValue(i*a++,n)),g=[];for(let y=0;y<f;y++)g.push(Number(e.getValue(i*a++,n)));u.push(new Mr(e,p,h,g))}this.inputs=u}get kernelCustomData(){return this.backend.currentKernelCustomData}get customDataBuffer(){return this.module.HEAPU8.subarray(this.customDataOffset,this.customDataOffset+this.customDataSize)}compute(e,t){var s;let r=((s=t==null?void 0:t.inputs)==null?void 0:s.map(u=>typeof u=="number"?this.inputs[u]:u))??this.inputs,i=(t==null?void 0:t.outputs)??[],a=(u,d,p)=>new Mr(this.module,d,this.output(u,p),p),n=(u,d)=>{let p=kt(u,d);if(!p)throw new Error(`Unsupported data type: ${u}`);let h=p>0?this.backend.gpuDataManager.create(p).id:0;return new Mr(this.module,u,h,d)};return this.backend.run(e,r,i,a,n,this.outputCount)}output(e,t){let r=this.module.stackSave();try{let i=this.module.PTR_SIZE,a=i===4?"i32":"i64",n=this.module.stackAlloc((1+t.length)*i);this.module.setValue(n,t.length,a);for(let s=0;s<t.length;s++)this.module.setValue(n+i*(s+1),t[s],a);return this.module._JsepOutput(this.opKernelContext,e,n)}catch(i){throw new Error(`Failed to generate kernel's output[${e}] with dims [${t}]. If you are running with pre-allocated output, please make sure the output type/dims are correct. Error: ${i}`)}finally{this.module.stackRestore(r)}}},nf=async(e,t,r,i)=>{let a=t.jsepInit;if(!a)throw new Error("Failed to initialize JSEP. The WebAssembly module is not built with JSEP support.");if(e==="webgpu"){let n=(Gy(),dr(tf)).WebGpuBackend,s=new n;await s.initialize(r,i),a("webgpu",[s,u=>s.alloc(Number(u)),u=>s.free(u),(u,d,p,h=!1)=>{if(h)de("verbose",()=>`[WebGPU] jsepCopyGpuToGpu: src=${Number(u)}, dst=${Number(d)}, size=${Number(p)}`),s.memcpy(Number(u),Number(d));else{de("verbose",()=>`[WebGPU] jsepCopyCpuToGpu: dataOffset=${Number(u)}, gpuDataId=${Number(d)}, size=${Number(p)}`);let f=t.HEAPU8.subarray(Number(u>>>0),Number(u>>>0)+Number(p));s.upload(Number(d),f)}},async(u,d,p)=>{de("verbose",()=>`[WebGPU] jsepCopyGpuToCpu: gpuDataId=${u}, dataOffset=${d}, size=${p}`),await s.download(Number(u),()=>t.HEAPU8.subarray(Number(d)>>>0,Number(d+p)>>>0))},(u,d,p)=>s.createKernel(u,Number(d),p,t.UTF8ToString(t._JsepGetNodeName(Number(d)))),u=>s.releaseKernel(u),(u,d,p,h)=>{de("verbose",()=>`[WebGPU] jsepRun: sessionHandle=${p}, kernel=${u}, contextDataOffset=${d}`);let f=new zd(t,s,Number(d));return s.computeKernel(Number(u),f,h)},()=>s.captureBegin(),()=>s.captureEnd(),()=>s.replay()])}else{let n=new mp(r);a("webnn",[n,()=>n.reserveTensorId(),s=>n.releaseTensorId(s),async(s,u,d,p,h)=>n.ensureTensor(s,u,d,p,h),(s,u)=>{n.uploadTensor(s,u)},async(s,u)=>n.downloadTensor(s,u),(s,u)=>n.registerMLContext(s,u),!!r.trace])}}}),Cd,Ya,Xa,ht,Ad,da,Kr,Ja,en,pa,tn,rn,an,of=q(()=>{Ue(),Zg(),Yg(),te(),Ot(),Na(),lp(),Cd=(e,t)=>{ye()._OrtInit(e,t)!==0&&fe("Can't initialize onnxruntime.")},Ya=async e=>{Cd(e.wasm.numThreads,Vr(e.logLevel))},Xa=async(e,t)=>{var i,a;(a=(i=ye()).asyncInit)==null||a.call(i);let r=e.webgpu.adapter;if(t==="webgpu"){if(typeof navigator>"u"||!navigator.gpu)throw new Error("WebGPU is not supported in current environment");if(r){if(typeof r.limits!="object"||typeof r.features!="object"||typeof r.requestDevice!="function")throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.")}else{let n=e.webgpu.powerPreference;if(n!==void 0&&n!=="low-power"&&n!=="high-performance")throw new Error(`Invalid powerPreference setting: "${n}"`);let s=e.webgpu.forceFallbackAdapter;if(s!==void 0&&typeof s!="boolean")throw new Error(`Invalid forceFallbackAdapter setting: "${s}"`);if(r=await navigator.gpu.requestAdapter({powerPreference:n,forceFallbackAdapter:s}),!r)throw new Error('Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.')}}if(t==="webnn"&&(typeof navigator>"u"||!navigator.ml))throw new Error("WebNN is not supported in current environment");{let n=(Hy(),dr(af)).init;t==="webgpu"&&await n("webgpu",ye(),e,r),t==="webnn"&&await n("webnn",ye(),e)}},ht=new Map,Ad=e=>{let t=ye(),r=t.stackSave();try{let i=t.PTR_SIZE,a=t.stackAlloc(2*i);t._OrtGetInputOutputCount(e,a,a+i)!==0&&fe("Can't get session input/output count.");let n=i===4?"i32":"i64";return[Number(t.getValue(a,n)),Number(t.getValue(a+i,n))]}finally{t.stackRestore(r)}},da=(e,t)=>{let r=ye(),i=r.stackSave(),a=0;try{let n=r.PTR_SIZE,s=r.stackAlloc(2*n);r._OrtGetInputOutputMetadata(e,t,s,s+n)!==0&&fe("Can't get session input/output metadata.");let u=Number(r.getValue(s,"*"));a=Number(r.getValue(s+n,"*"));let d=r.HEAP32[a/4];if(d===0)return[u,0];let p=r.HEAPU32[a/4+1],h=[];for(let f=0;f<p;f++){let g=Number(r.getValue(a+8+f*n,"*"));h.push(g!==0?r.UTF8ToString(g):Number(r.getValue(a+8+(f+p)*n,"*")))}return[u,d,h]}finally{r.stackRestore(i),a!==0&&r._OrtFree(a)}},Kr=e=>{let t=ye(),r=t._malloc(e.byteLength);if(r===0)throw new Error(`Can't create a session. failed to allocate a buffer of size ${e.byteLength}.`);return t.HEAPU8.set(e,r),[r,e.byteLength]},Ja=async(e,t)=>{var f,g,y,_;let r,i,a=ye();Array.isArray(e)?[r,i]=e:e.buffer===a.HEAPU8.buffer?[r,i]=[e.byteOffset,e.byteLength]:[r,i]=Kr(e);let n=0,s=0,u=0,d=[],p=[],h=[];try{if([s,d]=await up(t),(t==null?void 0:t.externalData)&&a.mountExternalData){let v=[];for(let M of t.externalData){let D=typeof M=="string"?M:M.path;v.push(Ua(typeof M=="string"?M:M.data).then(H=>{a.mountExternalData(D,H)}))}await Promise.all(v)}for(let v of(t==null?void 0:t.executionProviders)??[])if((typeof v=="string"?v:v.name)==="webnn"){if(a.shouldTransferToMLTensor=!1,typeof v!="string"){let M=v,D=M==null?void 0:M.context,H=M==null?void 0:M.gpuDevice,G=M==null?void 0:M.deviceType,Q=M==null?void 0:M.powerPreference;D?a.currentContext=D:H?a.currentContext=await a.webnnCreateMLContext(H):a.currentContext=await a.webnnCreateMLContext({deviceType:G,powerPreference:Q})}else a.currentContext=await a.webnnCreateMLContext();break}n=await a._OrtCreateSession(r,i,s),(f=a.webgpuOnCreateSession)==null||f.call(a,n),n===0&&fe("Can't create a session."),(g=a.jsepOnCreateSession)==null||g.call(a),a.currentContext&&(a.webnnRegisterMLContext(n,a.currentContext),a.currentContext=void 0,a.shouldTransferToMLTensor=!0);let[w,S]=Ad(n),x=!!(t!=null&&t.enableGraphCapture),b=[],I=[],k=[],E=[],C=[];for(let v=0;v<w;v++){let[M,D,H]=da(n,v);M===0&&fe("Can't get an input name."),p.push(M);let G=a.UTF8ToString(M);b.push(G),k.push(D===0?{name:G,isTensor:!1}:{name:G,isTensor:!0,type:rt(D),shape:H})}for(let v=0;v<S;v++){let[M,D,H]=da(n,v+w);M===0&&fe("Can't get an output name."),h.push(M);let G=a.UTF8ToString(M);I.push(G),E.push(D===0?{name:G,isTensor:!1}:{name:G,isTensor:!0,type:rt(D),shape:H});{if(x&&(t==null?void 0:t.preferredOutputLocation)===void 0){C.push("gpu-buffer");continue}let Q=typeof(t==null?void 0:t.preferredOutputLocation)=="string"?t.preferredOutputLocation:((y=t==null?void 0:t.preferredOutputLocation)==null?void 0:y[G])??"cpu",R=a.webnnIsGraphOutput;if(Q==="cpu"&&R&&R(n,G)){C.push("ml-tensor-cpu-output");continue}if(Q!=="cpu"&&Q!=="cpu-pinned"&&Q!=="gpu-buffer"&&Q!=="ml-tensor")throw new Error(`Not supported preferred output location: ${Q}.`);if(x&&Q!=="gpu-buffer")throw new Error(`Not supported preferred output location: ${Q}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);C.push(Q)}}let A=null;return C.some(v=>v==="gpu-buffer"||v==="ml-tensor"||v==="ml-tensor-cpu-output")&&(u=a._OrtCreateBinding(n),u===0&&fe("Can't create IO binding."),A={handle:u,outputPreferredLocations:C,outputPreferredLocationsEncoded:C.map(v=>v==="ml-tensor-cpu-output"?"ml-tensor":v).map(v=>ma(v))}),ht.set(n,[n,p,h,A,x,!1]),[n,b,I,k,E]}catch(w){throw p.forEach(S=>a._OrtFree(S)),h.forEach(S=>a._OrtFree(S)),u!==0&&a._OrtReleaseBinding(u)!==0&&fe("Can't release IO binding."),n!==0&&a._OrtReleaseSession(n)!==0&&fe("Can't release session."),w}finally{a._free(r),s!==0&&a._OrtReleaseSessionOptions(s)!==0&&fe("Can't release session options."),d.forEach(w=>a._free(w)),(_=a.unmountExternalData)==null||_.call(a)}},en=e=>{var d,p,h;let t=ye(),r=ht.get(e);if(!r)throw new Error(`cannot release session. invalid session id: ${e}`);let[i,a,n,s,u]=r;s&&(u&&t._OrtClearBoundOutputs(s.handle)!==0&&fe("Can't clear bound outputs."),t._OrtReleaseBinding(s.handle)!==0&&fe("Can't release IO binding.")),(d=t.jsepOnReleaseSession)==null||d.call(t,e),(p=t.webnnOnReleaseSession)==null||p.call(t,e),(h=t.webgpuOnReleaseSession)==null||h.call(t,e),a.forEach(f=>t._OrtFree(f)),n.forEach(f=>t._OrtFree(f)),t._OrtReleaseSession(i)!==0&&fe("Can't release session."),ht.delete(e)},pa=async(e,t,r,i,a,n,s=!1)=>{if(!e){t.push(0);return}let u=ye(),d=u.PTR_SIZE,p=e[0],h=e[1],f=e[3],g=f,y,_;if(p==="string"&&(f==="gpu-buffer"||f==="ml-tensor"))throw new Error("String tensor is not supported on GPU.");if(s&&f!=="gpu-buffer")throw new Error(`External buffer must be provided for input/output index ${n} when enableGraphCapture is true.`);if(f==="gpu-buffer"){let x=e[2].gpuBuffer;_=kt(Tt(p),h);{let b=u.jsepRegisterBuffer;if(!b)throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');y=b(i,n,x,_)}}else if(f==="ml-tensor"){let x=e[2].mlTensor;_=kt(Tt(p),h);let b=u.webnnRegisterMLTensor;if(!b)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');y=b(i,x,Tt(p),h)}else{let x=e[2];if(Array.isArray(x)){_=d*x.length,y=u._malloc(_),r.push(y);for(let b=0;b<x.length;b++){if(typeof x[b]!="string")throw new TypeError(`tensor data at index ${b} is not a string`);u.setValue(y+b*d,He(x[b],r),"*")}}else{let b=u.webnnIsGraphInput,I=u.webnnIsGraphOutput;if(p!=="string"&&b&&I){let k=u.UTF8ToString(a);if(b(i,k)||I(i,k)){let E=Tt(p);_=kt(E,h),g="ml-tensor";let C=u.webnnCreateTemporaryTensor,A=u.webnnUploadTensor;if(!C||!A)throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');let v=await C(i,E,h);A(v,new Uint8Array(x.buffer,x.byteOffset,x.byteLength)),y=v}else _=x.byteLength,y=u._malloc(_),r.push(y),u.HEAPU8.set(new Uint8Array(x.buffer,x.byteOffset,_),y)}else _=x.byteLength,y=u._malloc(_),r.push(y),u.HEAPU8.set(new Uint8Array(x.buffer,x.byteOffset,_),y)}}let w=u.stackSave(),S=u.stackAlloc(4*h.length);try{h.forEach((b,I)=>u.setValue(S+I*d,b,d===4?"i32":"i64"));let x=u._OrtCreateTensor(Tt(p),y,_,S,h.length,ma(g));x===0&&fe(`Can't create tensor for input/output. session=${i}, index=${n}.`),t.push(x)}finally{u.stackRestore(w)}},tn=async(e,t,r,i,a,n)=>{var G,Q,R,j;let s=ye(),u=s.PTR_SIZE,d=ht.get(e);if(!d)throw new Error(`cannot run inference. invalid session id: ${e}`);let p=d[0],h=d[1],f=d[2],g=d[3],y=d[4],_=d[5],w=t.length,S=i.length,x=0,b=[],I=[],k=[],E=[],C=[],A=s.stackSave(),v=s.stackAlloc(w*u),M=s.stackAlloc(w*u),D=s.stackAlloc(S*u),H=s.stackAlloc(S*u);try{[x,b]=op(n),It("wasm prepareInputOutputTensor");for(let W=0;W<w;W++)await pa(r[W],I,E,e,h[t[W]],t[W],y);for(let W=0;W<S;W++)await pa(a[W],k,E,e,f[i[W]],w+i[W],y);Et("wasm prepareInputOutputTensor");for(let W=0;W<w;W++)s.setValue(v+W*u,I[W],"*"),s.setValue(M+W*u,h[t[W]],"*");for(let W=0;W<S;W++)s.setValue(D+W*u,k[W],"*"),s.setValue(H+W*u,f[i[W]],"*");if(g&&!_){let{handle:W,outputPreferredLocations:me,outputPreferredLocationsEncoded:U}=g;if(h.length!==w)throw new Error(`input count from feeds (${w}) is expected to be always equal to model's input count (${h.length}).`);It("wasm bindInputsOutputs");for(let P=0;P<w;P++){let J=t[P];await s._OrtBindInput(W,h[J],I[P])!==0&&fe(`Can't bind input[${P}] for session=${e}.`)}for(let P=0;P<S;P++){let J=i[P];(G=a[P])!=null&&G[3]?(C.push(k[P]),s._OrtBindOutput(W,f[J],k[P],0)!==0&&fe(`Can't bind pre-allocated output[${P}] for session=${e}.`)):s._OrtBindOutput(W,f[J],0,U[J])!==0&&fe(`Can't bind output[${P}] to ${me[P]} for session=${e}.`)}Et("wasm bindInputsOutputs"),ht.set(e,[p,h,f,g,y,!0])}(Q=s.jsepOnRunStart)==null||Q.call(s,p),(R=s.webnnOnRunStart)==null||R.call(s,p);let F;g?F=await s._OrtRunWithBinding(p,g.handle,S,D,x):F=await s._OrtRun(p,M,v,w,H,S,D,x),F!==0&&fe("failed to call OrtRun().");let X=[],le=[];It("wasm ProcessOutputTensor");for(let W=0;W<S;W++){let me=Number(s.getValue(D+W*u,"*"));if(me===k[W]||C.includes(k[W])){X.push(a[W]),me!==k[W]&&s._OrtReleaseTensor(me)!==0&&fe("Can't release tensor.");continue}let U=s.stackSave(),P=s.stackAlloc(4*u),J=!1,ee,be=0;try{s._OrtGetTensorData(me,P,P+u,P+2*u,P+3*u)!==0&&fe(`Can't access output tensor data on index ${W}.`);let at=u===4?"i32":"i64",nt=Number(s.getValue(P,at));be=s.getValue(P+u,"*");let Lt=s.getValue(P+u*2,"*"),cr=Number(s.getValue(P+u*3,at)),Oe=[];for(let _e=0;_e<cr;_e++)Oe.push(Number(s.getValue(Lt+_e*u,at)));s._OrtFree(Lt)!==0&&fe("Can't free memory for tensor dims.");let Ce=Oe.reduce((_e,re)=>_e*re,1);ee=rt(nt);let st=g==null?void 0:g.outputPreferredLocations[i[W]];if(ee==="string"){if(st==="gpu-buffer"||st==="ml-tensor")throw new Error("String tensor is not supported on GPU.");let _e=[];for(let re=0;re<Ce;re++){let Re=s.getValue(be+re*u,"*"),hr=s.getValue(be+(re+1)*u,"*"),Vt=re===Ce-1?void 0:hr-Re;_e.push(s.UTF8ToString(Re,Vt))}X.push([ee,Oe,_e,"cpu"])}else if(st==="gpu-buffer"&&Ce>0){let _e=s.jsepGetBuffer;if(!_e)throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');let re=_e(be),Re=kt(nt,Ce);if(Re===void 0||!Ma(ee))throw new Error(`Unsupported data type: ${ee}`);J=!0,X.push([ee,Oe,{gpuBuffer:re,download:s.jsepCreateDownloader(re,Re,ee),dispose:()=>{s._OrtReleaseTensor(me)!==0&&fe("Can't release tensor.")}},"gpu-buffer"])}else if(st==="ml-tensor"&&Ce>0){let _e=s.webnnEnsureTensor,re=s.webnnIsGraphInputOutputTypeSupported;if(!_e||!re)throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');if(kt(nt,Ce)===void 0||!Da(ee))throw new Error(`Unsupported data type: ${ee}`);if(!re(e,ee,!1))throw new Error(`preferredLocation "ml-tensor" for ${ee} output is not supported by current WebNN Context.`);let Re=await _e(e,be,nt,Oe,!1);J=!0,X.push([ee,Oe,{mlTensor:Re,download:s.webnnCreateMLTensorDownloader(be,ee),dispose:()=>{s.webnnReleaseTensorId(be),s._OrtReleaseTensor(me)}},"ml-tensor"])}else if(st==="ml-tensor-cpu-output"&&Ce>0){let _e=s.webnnCreateMLTensorDownloader(be,ee)(),re=X.length;J=!0,le.push((async()=>{let Re=[re,await _e];return s.webnnReleaseTensorId(be),s._OrtReleaseTensor(me),Re})()),X.push([ee,Oe,[],"cpu"])}else{let _e=Qr(ee),re=new _e(Ce);new Uint8Array(re.buffer,re.byteOffset,re.byteLength).set(s.HEAPU8.subarray(be,be+re.byteLength)),X.push([ee,Oe,re,"cpu"])}}finally{s.stackRestore(U),ee==="string"&&be&&s._free(be),J||s._OrtReleaseTensor(me)}}g&&!y&&(s._OrtClearBoundOutputs(g.handle)!==0&&fe("Can't clear bound outputs."),ht.set(e,[p,h,f,g,y,!1]));for(let[W,me]of await Promise.all(le))X[W][2]=me;return Et("wasm ProcessOutputTensor"),X}finally{(j=s.webnnOnRunEnd)==null||j.call(s,p),s.stackRestore(A),I.forEach(F=>s._OrtReleaseTensor(F)),k.forEach(F=>s._OrtReleaseTensor(F)),E.forEach(F=>s._free(F)),x!==0&&s._OrtReleaseRunOptions(x),b.forEach(F=>s._free(F))}},rn=e=>{let t=ye(),r=ht.get(e);if(!r)throw new Error("invalid session id");let i=r[0],a=t._OrtEndProfiling(i);a===0&&fe("Can't get an profile file name."),t._OrtFree(a)},an=e=>{let t=[];for(let r of e){let i=r[2];!Array.isArray(i)&&"buffer"in i&&t.push(i.buffer)}return t}}),ft,Ae,Mt,ir,ar,Dr,ca,Ur,vt,xt,Od,uf,lf,df,pf,cf,hf,ff,mf=q(()=>{Ue(),of(),Ot(),Ra(),ft=()=>!!$e.wasm.proxy&&typeof document<"u",Mt=!1,ir=!1,ar=!1,Ur=new Map,vt=(e,t)=>{let r=Ur.get(e);r?r.push(t):Ur.set(e,[t])},xt=()=>{if(Mt||!ir||ar||!Ae)throw new Error("worker not ready")},Od=e=>{switch(e.data.type){case"init-wasm":Mt=!1,e.data.err?(ar=!0,ca[1](e.data.err)):(ir=!0,ca[0]()),Dr&&(URL.revokeObjectURL(Dr),Dr=void 0);break;case"init-ep":case"copy-from":case"create":case"release":case"run":case"end-profiling":{let t=Ur.get(e.data.type);e.data.err?t.shift()[1](e.data.err):t.shift()[0](e.data.out);break}}},uf=async()=>{if(!ir){if(Mt)throw new Error("multiple calls to 'initWasm()' detected.");if(ar)throw new Error("previous call to 'initWasm()' failed.");if(Mt=!0,ft())return new Promise((e,t)=>{Ae==null||Ae.terminate(),np().then(([r,i])=>{try{Ae=i,Ae.onerror=n=>t(n),Ae.onmessage=Od,ca=[e,t];let a={type:"init-wasm",in:$e};!a.in.wasm.wasmPaths&&(r||fa)&&(a.in.wasm.wasmPaths={wasm:new URL("/FreeTool/assets/ort-wasm-simd-threaded.jsep-C887KxcQ.wasm",import.meta.url).href}),Ae.postMessage(a),Dr=r}catch(a){t(a)}},t)});try{await Ba($e.wasm),await Ya($e),ir=!0}catch(e){throw ar=!0,e}finally{Mt=!1}}},lf=async e=>{if(ft())return xt(),new Promise((t,r)=>{vt("init-ep",[t,r]);let i={type:"init-ep",in:{epName:e,env:$e}};Ae.postMessage(i)});await Xa($e,e)},df=async e=>ft()?(xt(),new Promise((t,r)=>{vt("copy-from",[t,r]);let i={type:"copy-from",in:{buffer:e}};Ae.postMessage(i,[e.buffer])})):Kr(e),pf=async(e,t)=>{if(ft()){if(t!=null&&t.preferredOutputLocation)throw new Error('session option "preferredOutputLocation" is not supported for proxy.');return xt(),new Promise((r,i)=>{vt("create",[r,i]);let a={type:"create",in:{model:e,options:{...t}}},n=[];e instanceof Uint8Array&&n.push(e.buffer),Ae.postMessage(a,n)})}else return Ja(e,t)},cf=async e=>{if(ft())return xt(),new Promise((t,r)=>{vt("release",[t,r]);let i={type:"release",in:e};Ae.postMessage(i)});en(e)},hf=async(e,t,r,i,a,n)=>{if(ft()){if(r.some(s=>s[3]!=="cpu"))throw new Error("input tensor on GPU is not supported for proxy.");if(a.some(s=>s))throw new Error("pre-allocated output tensor is not supported for proxy.");return xt(),new Promise((s,u)=>{vt("run",[s,u]);let d=r,p={type:"run",in:{sessionId:e,inputIndices:t,inputs:d,outputIndices:i,options:n}};Ae.postMessage(p,an(d))})}else return tn(e,t,r,i,a,n)},ff=async e=>{if(ft())return xt(),new Promise((t,r)=>{vt("end-profiling",[t,r]);let i={type:"end-profiling",in:e};Ae.postMessage(i)});rn(e)}}),ha,Rd,gf,Fy=q(()=>{Ue(),mf(),te(),Oa(),lp(),ha=(e,t)=>{switch(e.location){case"cpu":return[e.type,e.dims,e.data,"cpu"];case"gpu-buffer":return[e.type,e.dims,{gpuBuffer:e.gpuBuffer},"gpu-buffer"];case"ml-tensor":return[e.type,e.dims,{mlTensor:e.mlTensor},"ml-tensor"];default:throw new Error(`invalid data location: ${e.location} for ${t()}`)}},Rd=e=>{switch(e[3]){case"cpu":return new Ye(e[0],e[2],e[1]);case"gpu-buffer":{let t=e[0];if(!Ma(t))throw new Error(`not supported data type: ${t} for deserializing GPU tensor`);let{gpuBuffer:r,download:i,dispose:a}=e[2];return Ye.fromGpuBuffer(r,{dataType:t,dims:e[1],download:i,dispose:a})}case"ml-tensor":{let t=e[0];if(!Da(t))throw new Error(`not supported data type: ${t} for deserializing MLTensor tensor`);let{mlTensor:r,download:i,dispose:a}=e[2];return Ye.fromMLTensor(r,{dataType:t,dims:e[1],download:i,dispose:a})}default:throw new Error(`invalid data location: ${e[3]}`)}},gf=class{async fetchModelAndCopyToWasmMemory(e){return df(await Ua(e))}async loadModel(e,t){Xe();let r;typeof e=="string"?r=await this.fetchModelAndCopyToWasmMemory(e):r=e,[this.sessionId,this.inputNames,this.outputNames,this.inputMetadata,this.outputMetadata]=await pf(r,t),Fe()}async dispose(){return cf(this.sessionId)}async run(e,t,r){Xe();let i=[],a=[];Object.entries(e).forEach(f=>{let g=f[0],y=f[1],_=this.inputNames.indexOf(g);if(_===-1)throw new Error(`invalid input '${g}'`);i.push(y),a.push(_)});let n=[],s=[];Object.entries(t).forEach(f=>{let g=f[0],y=f[1],_=this.outputNames.indexOf(g);if(_===-1)throw new Error(`invalid output '${g}'`);n.push(y),s.push(_)});let u=i.map((f,g)=>ha(f,()=>`input "${this.inputNames[a[g]]}"`)),d=n.map((f,g)=>f?ha(f,()=>`output "${this.outputNames[s[g]]}"`):null),p=await hf(this.sessionId,a,u,s,d,r),h={};for(let f=0;f<p.length;f++)h[this.outputNames[s[f]]]=n[f]??Rd(p[f]);return Fe(),h}startProfiling(){}endProfiling(){ff(this.sessionId)}}}),yf={};Wt(yf,{OnnxruntimeWebAssemblyBackend:()=>za,initializeFlags:()=>Ea,wasmBackend:()=>_f});var Ea,za,_f,jy=q(()=>{Ue(),mf(),Fy(),Ea=()=>{(typeof $e.wasm.initTimeout!="number"||$e.wasm.initTimeout<0)&&($e.wasm.initTimeout=0);let e=$e.wasm.simd;if(typeof e!="boolean"&&e!==void 0&&e!=="fixed"&&e!=="relaxed"&&(console.warn(`Property "env.wasm.simd" is set to unknown value "${e}". Reset it to \`false\` and ignore SIMD feature checking.`),$e.wasm.simd=!1),typeof $e.wasm.proxy!="boolean"&&($e.wasm.proxy=!1),typeof $e.wasm.trace!="boolean"&&($e.wasm.trace=!1),typeof $e.wasm.numThreads!="number"||!Number.isInteger($e.wasm.numThreads)||$e.wasm.numThreads<=0)if(typeof self<"u"&&!self.crossOriginIsolated)$e.wasm.numThreads=1;else{let t=typeof navigator>"u"?Rg("node:os").cpus().length:navigator.hardwareConcurrency;$e.wasm.numThreads=Math.min(4,Math.ceil((t||1)/2))}},za=class{async init(e){Ea(),await uf(),await lf(e)}async createInferenceSessionHandler(e,t){let r=new gf;return await r.loadModel(e,t),r}},_f=new za});Ue();Ue();Ue();var Ky="1.24.3",Zy=Jd;{let e=(jy(),dr(yf)).wasmBackend;Dt("webgpu",e,5),Dt("webnn",e,5),Dt("cpu",e,10),Dt("wasm",e,10)}Object.defineProperty($e.versions,"web",{value:Ky,enumerable:!0});/**
* @license
* Copyright 2021 Google LLC. All Rights Reserved.
* Licensed under the Apache License, Version 2.0 (the "License");
* you may not use this file except in compliance with the License.
* You may obtain a copy of the License at
*
* http://www.apache.org/licenses/LICENSE-2.0
*
* Unless required by applicable law or agreed to in writing, software
* distributed under the License is distributed on an "AS IS" BASIS,
* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
* See the License for the specific language governing permissions and
* limitations under the License.
* =============================================================================
*//**
 * @license
 * Copyright 2020 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 *//**
 * @license
 * Copyright 2019 Google LLC. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 * =============================================================================
 */export{Xd as InferenceSession,Wr as TRACE,It as TRACE_EVENT_BEGIN,Et as TRACE_EVENT_END,Xe as TRACE_FUNC_BEGIN,Fe as TRACE_FUNC_END,Ye as Tensor,Zy as default,$e as env,Dt as registerBackend};
