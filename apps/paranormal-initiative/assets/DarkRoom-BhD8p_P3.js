const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index-D2uSuh3G.js","assets/index-DrN_BrRH.css"])))=>i.map(i=>d[i]);
import{b as A,i as D,m as N,v as M,e as g,w as R,a as j,_ as P,o as h,n as W,A as w,E as y}from"./index-D2uSuh3G.js";const m=()=>j(),v={min:-.4,max:.4,default:0},b={min:.6,max:1.8,default:1},k=new WeakMap;function C(i){let t=k.get(i);return t||(t={selectedId:null,brightness:v.default,contrast:b.default,blackAndWhite:!1,includeInFindings:!1,notes:"",status:"",objectUrls:[],image:null},k.set(i,t)),t}function F(i){for(const t of i.objectUrls)URL.revokeObjectURL(t);i.objectUrls=[]}function $(i,t,a,l){if(t<=0||a<=0)return;const n=i.getImageData(0,0,t,a),r=n.data,s=l.brightness*255,e=l.contrast;for(let o=0;o<r.length;o+=4){let d=r[o]??0,c=r[o+1]??0,u=r[o+2]??0;if(l.blackAndWhite){const p=.2126*d+.7152*c+.0722*u;d=p,c=p,u=p}d=(d-128)*e+128+s,c=(c-128)*e+128+s,u=(u-128)*e+128+s,r[o]=Math.max(0,Math.min(255,d)),r[o+1]=Math.max(0,Math.min(255,c)),r[o+2]=Math.max(0,Math.min(255,u))}i.putImageData(n,0,0)}async function q(i,t){const a=C(i);t&&(a.selectedId=t);const l=(await m().evidence.toArray()).filter(e=>e.mediaType==="photo"&&e.kind==="original").sort((e,o)=>o.createdAt-e.createdAt);!a.selectedId&&l.length>0&&(a.selectedId=l[0].id);const n=l.find(e=>e.id===a.selectedId);F(a),a.image=null;const r=new Map;for(const e of l.slice(0,50))try{const o=await A().read(e.opfsPath);if(!o)continue;const d=URL.createObjectURL(new Blob([o],{type:e.mimeType??"image/*"}));a.objectUrls.push(d),r.set(e.id,d)}catch{}if(n){const e=r.get(n.id);if(e){const o=new Image;o.src=e,await o.decode().catch(()=>{}),a.image=o}else a.status="The managed copy is not present in browser storage."}const s=await T();if(D(i),N(i,M("Dark Room",`
      <div class="case-form" data-root="dark-room" data-epoch="${Date.now()}-${Math.random()}">
        <h3 class="cc-section-title">Import Photo</h3>
        <div class="detail-grid">
          <div class="detail-field"><label for="dr-case">Case</label>
            <select id="dr-case">
              ${s.length===0?'<option value="">— no cases yet —</option>':s.map(e=>`<option value="${e.id}">${g(e.caseNumber)} — ${g(e.title)}</option>`).join("")}
            </select></div>
          <div class="detail-field"><label for="dr-room">Room (optional)</label>
            <select id="dr-room"><option value="">Unassigned</option></select></div>
        </div>
        <div class="detail-field"><label for="dr-files">Images (multiple allowed)</label>
          <input id="dr-files" type="file" accept="image/*" multiple></div>
        <div class="form-actions">
          <button class="button-primary" id="dr-import" type="button">Import Photo</button>
          <button class="button-secondary" id="dr-capture" type="button">Capture from Camera…</button>
        </div>
        <p class="cc-meta" id="dr-status" role="status">${g(a.status)}</p>
        <p class="cc-meta">Imported photos are stored unchanged (original bytes, SHA-256 hashed). Camera access depends on the browser and device; <strong>Import Photo</strong> always works as the fallback.</p>

        <h3 class="cc-section-title">Case Photos (${l.length})</h3>
        ${l.length===0?'<div class="cc-empty">No photos imported. Import photos to this case, then open each item for dark room review and flagging.</div>':l.map(e=>{const o=r.get(e.id)??"";return`
            <div class="case-row" data-photo="${e.id}">
              <div style="display:flex;gap:12px;align-items:center;">
                ${o?`<img src="${o}" alt="" width="66" height="66" style="object-fit:cover;border-radius:10px;border:1px solid var(--border);">`:'<div aria-hidden="true" style="width:66px;height:66px;border-radius:10px;border:1px solid var(--border);background:var(--background-deep);"></div>'}
                <div>
                  <div class="case-title">${g(e.title||"Imported Photo")}</div>
                  <div class="case-meta">${new Date(e.createdAt).toLocaleString()}${e.reviewStatus==="flagged"||e.reviewStatus==="reviewed"?" • <strong>Included in Findings</strong>":""}</div>
                </div>
              </div>
              <button class="back-button" data-open-photo="${e.id}" type="button">Open</button>
            </div>`}).join("")}

        ${n?`
        <h3 class="cc-section-title">Dark Room Adjustments (Preview Only)</h3>
        <div class="case-form" data-photo-editor="${n.id}">
          <div class="detail-grid">
            <div class="detail-field"><label for="dr-brightness">Brightness (${v.min}…${v.max})</label>
              <input id="dr-brightness" type="range" min="${v.min}" max="${v.max}" step="0.01" value="${a.brightness}">
              <div class="case-meta" id="dr-brightness-value">${a.brightness.toFixed(2)}</div></div>
            <div class="detail-field"><label for="dr-contrast">Contrast (${b.min}…${b.max})</label>
              <input id="dr-contrast" type="range" min="${b.min}" max="${b.max}" step="0.01" value="${a.contrast}">
              <div class="case-meta" id="dr-contrast-value">${a.contrast.toFixed(2)}</div></div>
          </div>
          <div class="detail-field"><label class="cc-count"><input type="checkbox" id="dr-bw" ${a.blackAndWhite?"checked":""}> Black &amp; White</label></div>
          <div class="detail-field"><label class="cc-count"><input type="checkbox" id="dr-findings" ${n.reviewStatus==="flagged"||a.includeInFindings?"checked":""}> Include in Findings</label></div>

          <div style="margin:12px 0;">
            <canvas id="dr-preview" width="900" height="560" style="width:100%;max-height:60vh;background:#0B0E12;border:1px solid #2A3441;border-radius:8px;object-fit:contain;" aria-label="Dark Room preview"></canvas>
          </div>
          <div class="form-actions">
            <button class="button-primary" id="dr-save-derivative" type="button">Save Adjusted Copy to Case</button>
            <button class="back-button" id="dr-reset-adjust" type="button">Reset Adjustments</button>
          </div>

          <h3 class="cc-section-title">Notes</h3>
          <div class="detail-field"><label for="dr-notes">Investigator notes</label>
            <textarea id="dr-notes" rows="3">${g(n.notes??a.notes)}</textarea></div>
          <div class="form-actions"><button class="button-secondary" id="dr-save-notes" type="button">Save Notes</button></div>
          <p class="cc-meta">Notes and flags are stored as investigator assessment. Ambiguous shapes are <strong>not</strong> labelled as paranormal evidence — record what you observe and what you considered as an explanation.</p>
          <div class="case-form">
            <div class="case-title">Source</div>
            <div class="case-meta">${g(n.originalFileName??n.fileName)} • ${Math.round(n.fileSizeBytes/1024)} KB • SHA-256 ${g(n.contentHash.slice(0,24))}… • integrity ${g(n.verificationStatus??"unverified")}</div>
          </div>
        </div>`:""}

        <div class="form-actions"><button class="back-button" id="dr-back" type="button">← Back</button></div>
      </div>
    `)),a.image&&a.image.complete&&a.image.naturalWidth>0){const e=i.querySelector("#dr-preview"),o=e?.getContext("2d");if(e&&o){const d=Math.min(e.width/a.image.naturalWidth,e.height/a.image.naturalHeight),c=Math.floor(a.image.naturalWidth*d),u=Math.floor(a.image.naturalHeight*d);e.width=c,e.height=u,o.drawImage(a.image,0,0,c,u),$(o,c,u,{brightness:a.brightness,contrast:a.contrast,blackAndWhite:a.blackAndWhite})}}await I(i,a),U(i,a),R(i)}async function T(){const{CaseRepository:i}=await P(async()=>{const{CaseRepository:a}=await import("./index-D2uSuh3G.js").then(l=>l.d);return{CaseRepository:a}},__vite__mapDeps([0,1]));return(await new i(m()).listCases(200)).map(a=>({id:a.id,caseNumber:a.caseNumber,title:a.title}))}async function I(i,t){const a=i.querySelector("#dr-case"),l=i.querySelector("#dr-room");if(!a||!l)return;const n=a.value;if(!n)return;const r=await m().propertyStructures.where("caseId").equals(n).first(),s=r?(await m().structureRooms.where("structureId").equals(r.id).toArray()).filter(e=>!e.archived):[];l.innerHTML=`<option value="">Unassigned</option>${s.map(e=>`<option value="${e.id}"${t.selectedId&&e.id===""?" selected":""}>${g(e.name)}</option>`).join("")}`}function U(i,t){const a=()=>q(i,t.selectedId??void 0);h(i,"click","#dr-back",()=>W("forensic")),h(i,"change","#dr-case",()=>void I(i,t));const l=async(r,s,e)=>{const o=new y(m());let d=0;for(const c of r){const u=await o.storeOriginal({caseId:s,mediaType:"photo",title:c.name.replace(/\.[^.]+$/,"")||"Imported Photo",fileName:c.name,data:c,origin:"photo-import",recordedBy:"local-user"});await m().evidence.put({...u,originalFileName:c.name,sourceDescription:"Imported photo",importedAt:Date.now(),verificationStatus:"verified",verifiedAt:Date.now(),verificationDetail:"Stored unchanged on import and hashed.",roomId:e,captureTimestamp:c.lastModified||null,captureTimestampSource:c.lastModified?"fileMetadata":"unknown"}),d+=1}t.status=`${d} photo(s) imported.`,await a()};h(i,"click","#dr-import",async()=>{const r=i.querySelector("#dr-case")?.value??"",s=i.querySelector("#dr-room")?.value||null,e=Array.from(i.querySelector("#dr-files")?.files??[]);if(!r){t.status="Select a case before importing photos.",await a();return}if(e.length===0){t.status="Select at least one image.",await a();return}await l(e,r,s)}),h(i,"click","#dr-capture",async()=>{const r=i.querySelector("#dr-case")?.value??"",s=i.querySelector("#dr-room")?.value||null;if(!r){t.status="Select a case before capturing.",await a();return}if(!navigator.mediaDevices?.getUserMedia){t.status="This browser cannot access a camera. Use Import Photo instead.",await a();return}let e=null;try{e=await navigator.mediaDevices.getUserMedia({video:!0});const o=document.createElement("video");o.srcObject=e,await o.play(),await new Promise(p=>setTimeout(p,350));const d=document.createElement("canvas");d.width=o.videoWidth||1280,d.height=o.videoHeight||720,d.getContext("2d")?.drawImage(o,0,0,d.width,d.height);const c=await new Promise(p=>d.toBlob(f=>p(f),"image/png"));if(!c)throw new Error("the captured frame could not be encoded");const u=`camera_${Date.now()}.png`;await l([new File([c],u,{type:"image/png"})],r,s),t.status="Camera photo captured and saved."}catch(o){const d=o.name==="NotAllowedError"?"Camera permission was denied. Use Import Photo instead.":`Camera capture failed: ${o.message}`;t.status=d}finally{if(e)for(const o of e.getTracks())o.stop();await a()}});const n=()=>{const r=i.querySelector("#dr-preview"),s=r?.getContext("2d");if(!r||!s||!t.image||!t.image.complete)return;const e=Math.min(r.width/t.image.naturalWidth,r.height/t.image.naturalHeight),o=Math.max(1,Math.floor(t.image.naturalWidth*e)),d=Math.max(1,Math.floor(t.image.naturalHeight*e));r.width=o,r.height=d,s.drawImage(t.image,0,0,o,d),$(s,o,d,{brightness:t.brightness,contrast:t.contrast,blackAndWhite:t.blackAndWhite})};h(i,"input","#dr-brightness",r=>{t.brightness=Number(r.value);const s=i.querySelector("#dr-brightness-value");s&&(s.textContent=t.brightness.toFixed(2)),n()}),h(i,"input","#dr-contrast",r=>{t.contrast=Number(r.value);const s=i.querySelector("#dr-contrast-value");s&&(s.textContent=t.contrast.toFixed(2)),n()}),h(i,"change","#dr-bw",r=>{t.blackAndWhite=r.checked,n()}),h(i,"click","#dr-reset-adjust",()=>{t.brightness=v.default,t.contrast=b.default,t.blackAndWhite=!1,a()}),h(i,"change","#dr-findings",async r=>{const s=r.checked,e=i.querySelector("[data-photo-editor]")?.dataset.photoEditor;if(!e)return;const o=await m().evidence.get(e);if(!o)return;await m().evidence.put({...o,reviewStatus:s?"flagged":"raw",updatedAt:Date.now()}),await new w(m()).record("evidenceReviewUpdated",s?"Photo flagged as Included in Findings.":"Photo flag cleared.",{caseId:o.caseId,affectedRecordId:e,metadata:{flagged:s}}),t.status=s?"Photo included in findings.":"Photo flag cleared.",await a()}),h(i,"click","#dr-save-notes",async()=>{const r=i.querySelector("[data-photo-editor]")?.dataset.photoEditor,s=i.querySelector("#dr-notes")?.value??"";if(!r)return;const e=await m().evidence.get(r);e&&(await m().evidence.put({...e,notes:s,updatedAt:Date.now()}),t.notes=s,t.status="Notes saved.",await a())}),h(i,"click","#dr-save-derivative",async()=>{const r=i.querySelector("[data-photo-editor]")?.dataset.photoEditor;if(!r||!t.image)return;const s=await m().evidence.get(r),e=i.querySelector("#dr-preview");if(!s||!e)return;const o=await new Promise(S=>e.toBlob(x=>S(x),"image/png"));if(!o){t.status="The adjusted copy could not be encoded.",await a();return}const d=new y(m()),u=`${(s.originalFileName??s.fileName).replace(/\.[^.]+$/,"")}-adjusted.png`,p=await d.createDerived({sourceId:s.id,mediaType:"photo",title:`${s.title} — adjusted`,fileName:u,data:new Blob([o],{type:"image/png"})});await m().evidence.put({...p,originalFileName:u,sourceDescription:`Derived from ${s.originalFileName??s.fileName}`,importedAt:Date.now(),verificationStatus:"verified",verifiedAt:Date.now(),verificationDetail:"Rendered from the preview and hashed on write.",roomId:s.roomId??null,captureTimestamp:Date.now(),captureTimestampSource:"investigator",derivationMethod:"dark-room-adjustment",derivationParameters:{sourceEvidenceId:s.id,brightness:t.brightness,contrast:t.contrast,blackAndWhite:t.blackAndWhite},notes:`Dark Room adjustments — brightness ${t.brightness.toFixed(2)}, contrast ${t.contrast.toFixed(2)}${t.blackAndWhite?", black & white":""}. Source: ${s.originalFileName??s.fileName}`}),await new w(m()).record("evidenceProcessed","Dark Room adjusted copy saved as derived evidence.",{caseId:s.caseId,affectedRecordId:p.id,metadata:{parentId:s.id,brightness:t.brightness,contrast:t.contrast,blackAndWhite:t.blackAndWhite}}),t.status=`Saved adjusted copy "${u}" — the original photo is unchanged.`,await a()}),h(i,"click","[data-open-photo]",r=>{t.selectedId=r.dataset.openPhoto??null,a()})}export{v as BRIGHTNESS_RANGE,b as CONTRAST_RANGE,$ as applyPhotoAdjustments,q as renderDarkRoom};
//# sourceMappingURL=DarkRoom-BhD8p_P3.js.map
