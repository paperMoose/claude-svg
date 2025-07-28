/**
 * @file ext-markers.js
 *
 * @license Apache-2.0
 *
 * @copyright 2010 Will Schleter based on ext-arrows.js by Copyright(c) 2010 Alexis Deveria
 * @copyright 2021 OptimistikSAS
 *
 * This extension provides for the addition of markers to the either end
 * or the middle of a line, polyline, path, polygon.
 *
 * Markers are graphics
 *
 * to simplify the coding and make the implementation as robust as possible,
 * markers are not shared - every object has its own set of markers.
 * this relationship is maintained by a naming convention between the
 * ids of the markers and the ids of the object
 *
 * The following restrictions exist for simplicty of use and programming
 *    objects and their markers to have the same color
 *    marker size is fixed
 *    an application specific attribute - se_type - is added to each marker element
 *        to store the type of marker
 *
 * @todo
 *    remove some of the restrictions above
 *
*/
var t={name:"markers",async init(){const{svgCanvas:t}=this,{BatchCommand:e,RemoveElementCommand:r,InsertElementCommand:n}=t.history,{$id:i,addSVGElementsFromJson:a}=t,s=["start","mid","end"],o=["line","path","polyline","polygon"],l={nomarker:{},leftarrow:{element:"path",attr:{d:"M0,50 L100,90 L70,50 L100,10 Z"}},rightarrow:{element:"path",attr:{d:"M100,50 L0,90 L30,50 L0,10 Z"}},box:{element:"path",attr:{d:"M20,20 L20,80 L80,80 L80,20 Z"}},mcircle:{element:"circle",attr:{r:30,cx:50,cy:50}}};["leftarrow","rightarrow","box","mcircle"].forEach((t=>{l[t+"_o"]=l[t]}));const getLinked=(e,r)=>{const n=e.getAttribute(r);if(!n)return null;const i=n.match(/\(#(.*)\)/);return i&&2===i.length?t.getElement(i[1]):null},showPanel=(t,e)=>{i("marker_panel").style.display=t?"block":"none",t&&e&&s.forEach((t=>{const r=getLinked(e,"marker-"+t);r?.attributes?.se_type?i(`${t}_marker_list_opts`).setAttribute("value",r.attributes.se_type.value):i(`${t}_marker_list_opts`).setAttribute("value","nomarker")}))},addMarker=(e,r)=>{const n=t.getSelectedElements();let i=t.getElement(e);if(i)return;if(""===r||"nomarker"===r)return;const s=n[0].getAttribute("stroke");if(!l[r])return void console.error(`unknown marker type: ${r}`);i=a({element:"marker",attr:{id:e,markerUnits:"strokeWidth",orient:"auto",style:"pointer-events:none",se_type:r}});const o=a(l[r]),m="_o"===r.substr(-2)?"none":s;return o.setAttribute("fill",m),o.setAttribute("stroke",s),o.setAttribute("stroke-width",10),i.append(o),i.setAttribute("viewBox","0 0 100 100"),i.setAttribute("markerWidth",5),i.setAttribute("markerHeight",5),i.setAttribute("refX",50),i.setAttribute("refY",50),t.findDefs().append(i),i},setMarker=(i,o)=>{const l=t.getSelectedElements();if(0===l.length)return;const m="marker-"+i,c=l[0],u=getLinked(c,m);u&&u.remove(),c.removeAttribute(m);let d=o;if(""===d&&(d="nomarker"),"nomarker"===d)return void t.call("changed",l);const b="mkr_"+i+"_"+c.id;addMarker(b,d),t.changeSelectedAttribute(m,"url(#"+b+")"),"line"===c.tagName&&"mid"===i&&(i=>{if("line"!==i.tagName)return i;const o=Number(i.getAttribute("x1")),l=Number(i.getAttribute("x2")),m=Number(i.getAttribute("y1")),c=Number(i.getAttribute("y2")),{id:u}=i,d=a({element:"polyline",attr:{points:o+","+m+" "+(o+l)/2+","+(m+c)/2+" "+l+","+c,stroke:i.getAttribute("stroke"),"stroke-width":i.getAttribute("stroke-width"),fill:"none",opacity:i.getAttribute("opacity")||1}});s.forEach((t=>{const e="marker-"+t;i.getAttribute(e)&&d.setAttribute(e,i.getAttribute(e))}));const b=new e;b.addSubCommand(new r(i,i.parentNode)),b.addSubCommand(new n(d)),i.insertAdjacentElement("afterend",d),i.remove(),t.clearSelection(),d.id=u,t.addToSelection([d]),t.addCommandToHistory(b)})(c),t.call("changed",l)};return{name:this.i18next.t(`${name}:name`),callback(){const t=document.createElement("template");let e='<div id="marker_panel">';s.forEach((t=>{e+=`<se-list id="${t}_marker_list_opts" title="tools.${t}_marker_list_opts" label="" width="22px" height="22px">`,Object.entries(l).forEach((r=>{let[n,i]=r;e+=`<se-list-item id="mkr_${t}_${n}" value="${n}" title="tools.mkr_${n}" src="${n}.svg" img-height="22px"></se-list-item>`})),e+="</se-list>"})),e+="</div>",t.innerHTML=e,i("tools_top").appendChild(t.content.cloneNode(!0)),showPanel(!1),s.forEach((t=>{i(`${t}_marker_list_opts`).addEventListener("change",(e=>{setMarker(t,e.detail.value)}))}))},selectedChanged(t){0===t.elems.length&&showPanel(!1),t.elems.forEach((e=>{e&&o.includes(e.tagName)&&t.selectedElement&&!t.multiselected?showPanel(!0,e):showPanel(!1)}))},elementChanged(e){const r=e.elems[0];r&&(r.getAttribute("marker-start")||r.getAttribute("marker-mid")||r.getAttribute("marker-end"))&&((t=>{const e=t.getAttribute("stroke");s.forEach((r=>{const n=getLinked(t,"marker-"+r);if(!n)return;if(!n.attributes.se_type)return;const i=n.lastElementChild;if(!i)return;const a=i.getAttribute("fill"),s=i.getAttribute("stroke");a&&"none"!==a&&i.setAttribute("fill",e),s&&"none"!==s&&i.setAttribute("stroke",e)}))})(r),(e=>{const r=t.getSelectedElements();s.forEach((n=>{const i="marker-"+n,a=getLinked(e,i);if(!a||!a.attributes.se_type)return;const s=e.getAttribute(i);if(s){const o=e.id.length,l=s.substr(-o-1,o);if(e.id!==l){const s="mkr_"+n+"_"+e.id;addMarker(s,a.attributes.se_type.value),t.changeSelectedAttribute(i,"url(#"+s+")"),t.call("changed",r)}}}))})(r))}}}};export{t as default};
//# sourceMappingURL=ext-markers.js.map
