const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/index--XpplzUE.js","assets/index-Dnrav0ok.css"])))=>i.map(i=>d[i]);
import{b as R,c as T,_ as D,i as C,m as P,v as V,e as u,w as j,a as L,o as m,n as U,E as M,A as B}from"./index--XpplzUE.js";const p=()=>L(),x=new WeakMap;function H(a){let s=x.get(a);return s||(s={selectedId:null,status:"",notes:"",lastCaptureSeconds:null,objectUrls:[],markers:[],selectedMarkerId:null},x.set(a,s)),s}function _(a){for(const s of a.objectUrls)URL.revokeObjectURL(s);a.objectUrls=[]}function N(a,s){const r=a.target.startSeconds??0,v=w>0?w:1;return Math.max(0,Math.min(100,r/v*100))}let w=0;function y(a){if(!Number.isFinite(a))return"00:00.000";const s=Math.floor(a/60),r=a%60;return`${String(s).padStart(2,"0")}:${r.toFixed(3).padStart(6,"0")}`}async function O(a,s){const r=H(a);s&&(r.selectedId=s);const v=(await p().evidence.toArray()).filter(t=>t.mediaType==="video"&&t.kind==="original").sort((t,e)=>e.createdAt-t.createdAt);!r.selectedId&&v.length>0&&(r.selectedId=v[0].id);const l=v.find(t=>t.id===r.selectedId);_(r);let f="";if(l){const t=await R().read(l.opfsPath);t?(f=URL.createObjectURL(new Blob([t],{type:l.mimeType??"video/mp4"})),r.objectUrls.push(f)):r.status="The managed copy is not present in browser storage."}const b=new T(p());r.markers=l?(await b.listForEvidence(l.id)).filter(t=>t.annotationType==="videoRange"):[],r.selectedMarkerId&&!r.markers.some(t=>t.id===r.selectedMarkerId)&&(r.selectedMarkerId=null);const{CaseRepository:g}=await D(async()=>{const{CaseRepository:t}=await import("./index--XpplzUE.js").then(e=>e.d);return{CaseRepository:t}},__vite__mapDeps([0,1])),k=await new g(p()).listCases(200);C(a),P(a,V("Video Analysis",`
      <div class="case-form" data-root="video-analysis" data-epoch="${Date.now()}-${Math.random()}">
        <p class="cc-meta"><strong>Note on origin parity:</strong> video analysis was a placeholder in the original
        iPad application ("Coming soon in future build"). This view implements the stated intent — import, playback,
        timeline navigation, frame inspection and frame capture — using real video data only.
        <strong>No motion events, objects, anomalies or detection confidence are generated</strong>, and no frame
        metadata is invented; frame accuracy is limited by the browser decoder's seek behaviour.</p>

        <h3 class="cc-section-title">Import Video</h3>
        <div class="detail-grid">
          <div class="detail-field"><label for="va-case">Case</label>
            <select id="va-case">
              ${k.length===0?'<option value="">— no cases yet —</option>':k.map(t=>`<option value="${t.id}">${u(t.caseNumber)} — ${u(t.title)}</option>`).join("")}
            </select></div>
          <div class="detail-field"><label for="va-room">Room (optional)</label>
            <select id="va-room"><option value="">Unassigned</option></select></div>
        </div>
        <div class="detail-field"><label for="va-files">Video files</label>
          <input id="va-files" type="file" accept="video/*" multiple></div>
        <div class="form-actions"><button class="button-primary" id="va-import" type="button">Import Video</button></div>
        <p class="cc-meta" id="va-status" role="status">${u(r.status)}</p>
        <p class="cc-meta">Codec support varies by browser. An unplayable format is reported here rather than hidden; the file is still stored and hashed so it can be reviewed later.</p>

        <h3 class="cc-section-title">Case Videos (${v.length})</h3>
        ${v.length===0?'<div class="cc-empty">No videos imported for any case.</div>':v.map(t=>`
          <div class="case-row">
            <div>
              <div class="case-title">${u(t.title)}</div>
              <div class="case-meta">${new Date(t.createdAt).toLocaleString()} • ${u(t.mimeType??"unknown type")} • ${Math.round(t.fileSizeBytes/1024)} KB • integrity: ${u(t.verificationStatus??"unverified")}</div>
            </div>
            <button class="back-button" data-open-video="${t.id}" type="button">Open</button>
          </div>`).join("")}

        ${l&&f?`
        <h3 class="cc-section-title">Playback — ${u(l.title)}</h3>
        <div class="case-form" data-video-player="${l.id}">
          <video id="va-video" controls playsinline src="${f}" style="width:100%;max-height:60vh;background:#0B0E12;border:1px solid #2A3441;border-radius:8px;" aria-label="Video playback"></video>

          <div class="detail-field" style="margin-top:12px;">
            <label for="va-seek">Timeline position (seconds)</label>
            <input id="va-seek" type="range" min="0" max="100" step="0.001" value="0">
            <div class="case-meta"><span id="va-time">00:00.000</span> / <span id="va-duration">—</span></div>
          </div>
          <div class="form-actions">
            <button class="back-button" id="va-step-back" type="button">◀ Frame −0.040 s</button>
            <button class="back-button" id="va-step-fwd" type="button">Frame +0.040 s ▶</button>
            <button class="button-secondary" id="va-mark" type="button">Add Marker at Current Position…</button>
          </div>
          <div class="case-meta" id="va-markers"></div>

          <h3 class="cc-section-title">Timeline Markers (${r.markers.length})</h3>
          <p class="cc-meta">Markers are stored as <strong>annotations on the evidence record</strong> — they never alter the original video.
          The original iPad application had no marker model (the video screen was a placeholder), so this is the closest equivalent of its stated
          "Markers" intent; no automatic anomaly detection is performed.</p>
          <div id="va-marker-timeline" style="position:relative;height:26px;background:var(--background-deep);border:1px solid var(--border);border-radius:6px;margin:6px 0;">
            ${r.markers.map((t,e)=>`<button class="va-marker-pin" data-marker-goto="${t.id}" type="button" title="Marker ${e+1}: ${u(t.description)}" aria-label="Marker ${e+1}: ${u(t.description)}" style="position:absolute;left:${N(t)}%;top:2px;transform:translateX(-50%);background:${t.id===r.selectedMarkerId?"var(--cyan)":"transparent"};border:1px solid var(--cyan);border-radius:3px;width:6px;height:20px;padding:0;cursor:pointer;"></button>`).join("")}
          </div>
          ${r.markers.length===0?'<div class="cc-empty">No markers yet.</div>':r.markers.map((t,e)=>`
            <div class="case-row" data-marker-row="${t.id}">
              <div>
                <div class="case-title">Marker ${e+1} — ${y(t.target.startSeconds??0)}${t.id===r.selectedMarkerId?" ▸":""}</div>
                <div class="case-meta">${u(t.description)}${t.notes?` • Notes: ${u(t.notes)}`:""} • ${u(t.author)} • ${new Date(t.createdAt).toLocaleString()} • revision ${t.revision}</div>
              </div>
              <div style="display:flex;gap:6px;">
                <button class="back-button" data-marker-goto="${t.id}" type="button">Go</button>
                <button class="back-button" data-marker-edit="${t.id}" type="button">Edit…</button>
                <button class="back-button" data-marker-remove="${t.id}" type="button">Remove…</button>
              </div>
            </div>`).join("")}

          <h3 class="cc-section-title">Frame Capture</h3>
          <div class="form-actions">
            <button class="button-primary" id="va-capture" type="button">Capture Frame at Current Position</button>
          </div>
          <p class="cc-meta">The captured frame is saved as <strong>derived evidence</strong> recording the source video id,
          the seek time, the extraction method and its own SHA-256 digest. Frame accuracy is limited by the browser's
          decoder seek behaviour: the frame shown at the marked time is what is captured, and browsers may land on the
          nearest decodable frame. No motion events, objects, anomalies or detection confidence are generated.</p>

          <h3 class="cc-section-title">Investigator Notes</h3>
          <div class="detail-field"><label for="va-notes">Notes</label>
            <textarea id="va-notes" rows="3">${u(l.notes??r.notes)}</textarea></div>
          <div class="form-actions">
            <button class="button-secondary" id="va-save-notes" type="button">Save Notes</button>
          </div>
          <div class="case-form">
            <div class="case-title">Source</div>
            <div class="case-meta">${u(l.originalFileName??l.fileName)} • SHA-256 ${u(l.contentHash.slice(0,24))}… • captured ${new Date(l.captureTimestamp??l.acquiredAt).toLocaleString()}</div>
          </div>
        </div>`:l?'<div class="cc-empty">This video could not be read from browser storage, so playback is unavailable.</div>':""}

        <div class="form-actions"><button class="back-button" id="va-back" type="button">← Back</button></div>
      </div>
    `)),W(a,r,()=>O(a,r.selectedId??void 0)),j(a)}function W(a,s,r){m(a,"click","#va-back",()=>U("forensic")),m(a,"change","#va-case",async e=>{const o=e.value,n=a.querySelector("#va-room");if(!o||!n)return;const i=await p().propertyStructures.where("caseId").equals(o).first(),c=i?(await p().structureRooms.where("structureId").equals(i.id).toArray()).filter(d=>!d.archived):[];n.innerHTML=`<option value="">Unassigned</option>${c.map(d=>`<option value="${d.id}">${u(d.name)}</option>`).join("")}`}),m(a,"click","#va-import",async()=>{const e=a.querySelector("#va-case")?.value??"",o=a.querySelector("#va-room")?.value||null,n=Array.from(a.querySelector("#va-files")?.files??[]);if(!e){s.status="Select a case before importing video.",await r();return}if(n.length===0){s.status="Select at least one video file.",await r();return}const i=new M(p());let c=0;for(const d of n){const h=await i.storeOriginal({caseId:e,mediaType:"video",title:d.name.replace(/\.[^.]+$/,"")||"Imported Video",fileName:d.name,data:d,origin:"import",recordedBy:"not recorded"});await p().evidence.put({...h,originalFileName:d.name,sourceDescription:"Imported video; original source not recorded.",importedAt:Date.now(),verificationStatus:"verified",verifiedAt:Date.now(),verificationDetail:"Stored unchanged on import and hashed.",roomId:o,captureTimestamp:d.lastModified||null,captureTimestampSource:d.lastModified?"fileMetadata":"unknown"}),c+=1}s.status=`${c} video(s) imported.`,await r()}),m(a,"click","[data-open-video]",e=>{s.selectedId=e.dataset.openVideo??null,r()});const v=()=>a.querySelector("#va-video");let l=async()=>{};const f=()=>{const e=v(),o=a.querySelector("#va-seek"),n=a.querySelector("#va-time"),i=a.querySelector("#va-duration");e&&(o&&Number.isFinite(e.duration)&&e.duration>0&&(o.max=String(e.duration),document.activeElement!==o&&(o.value=String(e.currentTime))),n&&(n.textContent=y(e.currentTime)),i&&(i.textContent=Number.isFinite(e.duration)?y(e.duration):"—"))},b=v();b&&(b.addEventListener("timeupdate",f),b.addEventListener("loadedmetadata",()=>{w=Number.isFinite(b.duration)?b.duration:0,f(),l()}),b.addEventListener("error",()=>{s.status="This browser cannot decode the video's codec. The file is stored and hashed; review it in a player that supports the format."})),m(a,"input","#va-seek",()=>{const e=v(),o=a.querySelector("#va-seek");e&&o&&(e.currentTime=Number(o.value),f())});const g=e=>{const o=v();o&&(o.pause(),o.currentTime=Math.max(0,Math.min(o.duration||0,o.currentTime+e)),w=Number.isFinite(o.duration)?o.duration:0,f(),l())};m(a,"click","#va-step-back",()=>g(-.04)),m(a,"click","#va-step-fwd",()=>g(.04));const k=new T(p()),t=()=>a.querySelector("[data-video-player]")?.dataset.videoPlayer??null;l=async()=>{const e=a.querySelector("#va-marker-timeline");if(!e)return;const o=t();if(!o)return;const n=(await k.listForEvidence(o)).filter(i=>i.annotationType==="videoRange"&&!i.archived);e.innerHTML=n.map((i,c)=>`<button data-marker-goto="${i.id}" type="button" title="Marker ${c+1}: ${u(i.description)}" aria-label="Marker ${c+1}: ${u(i.description)}" style="position:absolute;left:${N(i)}%;top:2px;transform:translateX(-50%);background:${i.id===s.selectedMarkerId?"var(--cyan)":"transparent"};border:1px solid var(--cyan);border-radius:3px;width:6px;height:20px;padding:0;cursor:pointer;"></button>`).join("")},m(a,"click","#va-mark",async()=>{const e=v(),o=t();if(!e||!o)return;const n=e.currentTime,i=window.prompt(`Marker description at ${y(n)}:`,"");if(i===null||!i.trim()){s.status="A marker description is required.",await r();return}const c=window.prompt("Investigator name (marker attribution):","")??"";if(!c.trim()){s.status="Investigator attribution is required; no marker was saved.",await r();return}const d=window.prompt("Investigator notes (optional):","")??"";await k.create(o,{author:c.trim(),annotationType:"videoRange",target:{startSeconds:n,endSeconds:n},description:i.trim(),notes:d}),s.status=`Marker added at ${y(n)}.`,await r()}),m(a,"click","[data-marker-goto]",e=>{const o=e.dataset.markerGoto??"",n=s.markers.find(c=>c.id===o);if(!n)return;s.selectedMarkerId=o;const i=v();i&&(i.currentTime=n.target.startSeconds??0,i.pause()),r()}),m(a,"click","[data-marker-edit]",async e=>{const o=e.dataset.markerEdit??"",n=s.markers.find(h=>h.id===o);if(!n)return;const i=window.prompt("Revised marker description:",n.description);if(i===null)return;const c=window.prompt("Investigator notes:",n.notes??"");if(c===null)return;const d=window.prompt("Reason for this marker revision:","");if(!d?.trim()){alert("A revision requires a documented reason — the prior marker value is preserved.");return}try{await k.revise(o,{description:i,notes:c,reason:d}),s.status="Marker revised; the previous revision is preserved.",await r()}catch(h){alert(h.message)}}),m(a,"click","[data-marker-remove]",async e=>{const o=e.dataset.markerRemove??"",n=s.markers.find(i=>i.id===o);n&&window.confirm(`Remove marker "${n.description}"? An audit event records the removal; the video is unchanged.`)&&(await k.revise(o,{description:n.description,archived:!0,reason:"Marker removed by investigator (video unchanged; prior value preserved)."}),s.status="Marker removed (prior value preserved in the revision history).",await r())}),m(a,"click","#va-capture",async()=>{const e=v(),n=a.querySelector("[data-video-player]")?.dataset.videoPlayer;if(!e||!n)return;const i=await p().evidence.get(n);if(!i)return;if(!e.videoWidth||!e.videoHeight){s.status="The video has no decodable frame at this position, so nothing was captured.",await r();return}const c=e.currentTime,d=document.createElement("canvas");d.width=e.videoWidth,d.height=e.videoHeight;const h=d.getContext("2d");if(!h){s.status="Frame could not be rendered.",await r();return}h.drawImage(e,0,0,d.width,d.height);const S=await new Promise(q=>d.toBlob(E=>q(E),"image/png"));if(!S){s.status="Frame could not be encoded.",await r();return}const A=a.querySelector("#va-notes")?.value??s.notes,F=new M(p()),$=`${(i.originalFileName??i.fileName).replace(/\.[^.]+$/,"")}-frame-${c.toFixed(3)}s.png`,I=await F.createDerived({sourceId:i.id,mediaType:"photo",title:`${i.title} — frame @ ${y(c)}`,fileName:$,data:new Blob([S],{type:"image/png"})});await p().evidence.put({...I,originalFileName:$,sourceDescription:`Frame extracted from ${i.originalFileName??i.fileName}`,importedAt:Date.now(),verificationStatus:"verified",verifiedAt:Date.now(),verificationDetail:"Rendered from the decoded video frame and hashed on write.",roomId:i.roomId??null,captureTimestamp:Date.now(),captureTimestampSource:"investigator",derivationMethod:"video-frame-extraction",derivationParameters:{sourceEvidenceId:i.id,seekSeconds:c,method:"canvas.drawImage on the seeked video element",format:"image/png",sourceWidth:d.width,sourceHeight:d.height},notes:`Frame extracted at ${y(c)} (browser seek position; accuracy limited by the decoder). Analyst notes: ${A||"(none)"}`}),await new B(p()).record("evidenceProcessed","Video frame extracted as derived evidence.",{caseId:i.caseId,affectedRecordId:I.id,metadata:{parentId:i.id,seekSeconds:Math.round(c*1e3)/1e3}}),s.lastCaptureSeconds=c,s.status=`Frame at ${y(c)} saved as "${$}". The source video is unchanged.`,await r()}),m(a,"click","#va-save-notes",async()=>{const o=a.querySelector("[data-video-player]")?.dataset.videoPlayer,n=a.querySelector("#va-notes")?.value??"";if(!o)return;const i=await p().evidence.get(o);i&&(await p().evidence.put({...i,notes:n,updatedAt:Date.now()}),s.notes=n,s.status="Notes saved.",await r())})}export{O as renderVideoAnalysis};
//# sourceMappingURL=VideoAnalysis-CY5_mWUm.js.map
