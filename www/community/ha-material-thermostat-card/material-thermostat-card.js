function t(t,e,i,s){var o,a=arguments.length,r=a<3?e:null===s?s=Object.getOwnPropertyDescriptor(e,i):s;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)r=Reflect.decorate(t,e,i,s);else for(var n=t.length-1;n>=0;n--)(o=t[n])&&(r=(a<3?o(r):a>3?o(e,i,r):o(e,i))||r);return a>3&&r&&Object.defineProperty(e,i,r),r}"function"==typeof SuppressedError&&SuppressedError;const e=globalThis,i=e.ShadowRoot&&(void 0===e.ShadyCSS||e.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,s=Symbol(),o=new WeakMap;let a=class{constructor(t,e,i){if(this._$cssResult$=!0,i!==s)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(i&&void 0===t){const i=void 0!==e&&1===e.length;i&&(t=o.get(e)),void 0===t&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),i&&o.set(e,t))}return t}toString(){return this.cssText}};const r=(t,...e)=>{const i=1===t.length?t[0]:e.reduce((e,i,s)=>e+(t=>{if(!0===t._$cssResult$)return t.cssText;if("number"==typeof t)return t;throw Error("Value passed to 'css' function must be a 'css' function result: "+t+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(i)+t[s+1],t[0]);return new a(i,t,s)},n=i?t=>t:t=>t instanceof CSSStyleSheet?(t=>{let e="";for(const i of t.cssRules)e+=i.cssText;return(t=>new a("string"==typeof t?t:t+"",void 0,s))(e)})(t):t,{is:l,defineProperty:d,getOwnPropertyDescriptor:c,getOwnPropertyNames:h,getOwnPropertySymbols:p,getPrototypeOf:u}=Object,m=globalThis,f=m.trustedTypes,g=f?f.emptyScript:"",v=m.reactiveElementPolyfillSupport,_=(t,e)=>t,y={toAttribute(t,e){switch(e){case Boolean:t=t?g:null;break;case Object:case Array:t=null==t?t:JSON.stringify(t)}return t},fromAttribute(t,e){let i=t;switch(e){case Boolean:i=null!==t;break;case Number:i=null===t?null:Number(t);break;case Object:case Array:try{i=JSON.parse(t)}catch(t){i=null}}return i}},b=(t,e)=>!l(t,e),w={attribute:!0,type:String,converter:y,reflect:!1,useDefault:!1,hasChanged:b};Symbol.metadata??=Symbol("metadata"),m.litPropertyMetadata??=new WeakMap;let x=class extends HTMLElement{static addInitializer(t){this._$Ei(),(this.l??=[]).push(t)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(t,e=w){if(e.state&&(e.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(t)&&((e=Object.create(e)).wrapped=!0),this.elementProperties.set(t,e),!e.noAccessor){const i=Symbol(),s=this.getPropertyDescriptor(t,i,e);void 0!==s&&d(this.prototype,t,s)}}static getPropertyDescriptor(t,e,i){const{get:s,set:o}=c(this.prototype,t)??{get(){return this[e]},set(t){this[e]=t}};return{get:s,set(e){const a=s?.call(this);o?.call(this,e),this.requestUpdate(t,a,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(t){return this.elementProperties.get(t)??w}static _$Ei(){if(this.hasOwnProperty(_("elementProperties")))return;const t=u(this);t.finalize(),void 0!==t.l&&(this.l=[...t.l]),this.elementProperties=new Map(t.elementProperties)}static finalize(){if(this.hasOwnProperty(_("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(_("properties"))){const t=this.properties,e=[...h(t),...p(t)];for(const i of e)this.createProperty(i,t[i])}const t=this[Symbol.metadata];if(null!==t){const e=litPropertyMetadata.get(t);if(void 0!==e)for(const[t,i]of e)this.elementProperties.set(t,i)}this._$Eh=new Map;for(const[t,e]of this.elementProperties){const i=this._$Eu(t,e);void 0!==i&&this._$Eh.set(i,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(t){const e=[];if(Array.isArray(t)){const i=new Set(t.flat(1/0).reverse());for(const t of i)e.unshift(n(t))}else void 0!==t&&e.push(n(t));return e}static _$Eu(t,e){const i=e.attribute;return!1===i?void 0:"string"==typeof i?i:"string"==typeof t?t.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(t=>this.enableUpdating=t),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(t=>t(this))}addController(t){(this._$EO??=new Set).add(t),void 0!==this.renderRoot&&this.isConnected&&t.hostConnected?.()}removeController(t){this._$EO?.delete(t)}_$E_(){const t=new Map,e=this.constructor.elementProperties;for(const i of e.keys())this.hasOwnProperty(i)&&(t.set(i,this[i]),delete this[i]);t.size>0&&(this._$Ep=t)}createRenderRoot(){const t=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return((t,s)=>{if(i)t.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(const i of s){const s=document.createElement("style"),o=e.litNonce;void 0!==o&&s.setAttribute("nonce",o),s.textContent=i.cssText,t.appendChild(s)}})(t,this.constructor.elementStyles),t}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(t=>t.hostConnected?.())}enableUpdating(t){}disconnectedCallback(){this._$EO?.forEach(t=>t.hostDisconnected?.())}attributeChangedCallback(t,e,i){this._$AK(t,i)}_$ET(t,e){const i=this.constructor.elementProperties.get(t),s=this.constructor._$Eu(t,i);if(void 0!==s&&!0===i.reflect){const o=(void 0!==i.converter?.toAttribute?i.converter:y).toAttribute(e,i.type);this._$Em=t,null==o?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(t,e){const i=this.constructor,s=i._$Eh.get(t);if(void 0!==s&&this._$Em!==s){const t=i.getPropertyOptions(s),o="function"==typeof t.converter?{fromAttribute:t.converter}:void 0!==t.converter?.fromAttribute?t.converter:y;this._$Em=s;const a=o.fromAttribute(e,t.type);this[s]=a??this._$Ej?.get(s)??a,this._$Em=null}}requestUpdate(t,e,i,s=!1,o){if(void 0!==t){const a=this.constructor;if(!1===s&&(o=this[t]),i??=a.getPropertyOptions(t),!((i.hasChanged??b)(o,e)||i.useDefault&&i.reflect&&o===this._$Ej?.get(t)&&!this.hasAttribute(a._$Eu(t,i))))return;this.C(t,e,i)}!1===this.isUpdatePending&&(this._$ES=this._$EP())}C(t,e,{useDefault:i,reflect:s,wrapped:o},a){i&&!(this._$Ej??=new Map).has(t)&&(this._$Ej.set(t,a??e??this[t]),!0!==o||void 0!==a)||(this._$AL.has(t)||(this.hasUpdated||i||(e=void 0),this._$AL.set(t,e)),!0===s&&this._$Em!==t&&(this._$Eq??=new Set).add(t))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}const t=this.scheduleUpdate();return null!=t&&await t,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(const[t,e]of this._$Ep)this[t]=e;this._$Ep=void 0}const t=this.constructor.elementProperties;if(t.size>0)for(const[e,i]of t){const{wrapped:t}=i,s=this[e];!0!==t||this._$AL.has(e)||void 0===s||this.C(e,void 0,i,s)}}let t=!1;const e=this._$AL;try{t=this.shouldUpdate(e),t?(this.willUpdate(e),this._$EO?.forEach(t=>t.hostUpdate?.()),this.update(e)):this._$EM()}catch(e){throw t=!1,this._$EM(),e}t&&this._$AE(e)}willUpdate(t){}_$AE(t){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(t)),this.updated(t)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(t){return!0}update(t){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(t){}firstUpdated(t){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[_("elementProperties")]=new Map,x[_("finalized")]=new Map,v?.({ReactiveElement:x}),(m.reactiveElementVersions??=[]).push("2.1.2");const $=globalThis,k=t=>t,A=$.trustedTypes,L=A?A.createPolicy("lit-html",{createHTML:t=>t}):void 0,C="$lit$",M=`lit$${Math.random().toFixed(9).slice(2)}$`,S="?"+M,E=`<${S}>`,z=document,O=()=>z.createComment(""),P=t=>null===t||"object"!=typeof t&&"function"!=typeof t,I=Array.isArray,T="[ \t\n\f\r]",R=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Z=/-->/g,D=/>/g,H=RegExp(`>|${T}(?:([^\\s"'>=/]+)(${T}*=${T}*(?:[^ \t\n\f\r"'\`<>=]|("|')|))|$)`,"g"),N=/'/g,F=/"/g,V=/^(?:script|style|textarea|title)$/i,j=t=>(e,...i)=>({_$litType$:t,strings:e,values:i}),U=j(1),q=j(2),W=Symbol.for("lit-noChange"),B=Symbol.for("lit-nothing"),K=new WeakMap,G=z.createTreeWalker(z,129);function X(t,e){if(!I(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return void 0!==L?L.createHTML(e):e}const Y=(t,e)=>{const i=t.length-1,s=[];let o,a=2===e?"<svg>":3===e?"<math>":"",r=R;for(let e=0;e<i;e++){const i=t[e];let n,l,d=-1,c=0;for(;c<i.length&&(r.lastIndex=c,l=r.exec(i),null!==l);)c=r.lastIndex,r===R?"!--"===l[1]?r=Z:void 0!==l[1]?r=D:void 0!==l[2]?(V.test(l[2])&&(o=RegExp("</"+l[2],"g")),r=H):void 0!==l[3]&&(r=H):r===H?">"===l[0]?(r=o??R,d=-1):void 0===l[1]?d=-2:(d=r.lastIndex-l[2].length,n=l[1],r=void 0===l[3]?H:'"'===l[3]?F:N):r===F||r===N?r=H:r===Z||r===D?r=R:(r=H,o=void 0);const h=r===H&&t[e+1].startsWith("/>")?" ":"";a+=r===R?i+E:d>=0?(s.push(n),i.slice(0,d)+C+i.slice(d)+M+h):i+M+(-2===d?e:h)}return[X(t,a+(t[i]||"<?>")+(2===e?"</svg>":3===e?"</math>":"")),s]};class J{constructor({strings:t,_$litType$:e},i){let s;this.parts=[];let o=0,a=0;const r=t.length-1,n=this.parts,[l,d]=Y(t,e);if(this.el=J.createElement(l,i),G.currentNode=this.el.content,2===e||3===e){const t=this.el.content.firstChild;t.replaceWith(...t.childNodes)}for(;null!==(s=G.nextNode())&&n.length<r;){if(1===s.nodeType){if(s.hasAttributes())for(const t of s.getAttributeNames())if(t.endsWith(C)){const e=d[a++],i=s.getAttribute(t).split(M),r=/([.?@])?(.*)/.exec(e);n.push({type:1,index:o,name:r[2],strings:i,ctor:"."===r[1]?st:"?"===r[1]?ot:"@"===r[1]?at:it}),s.removeAttribute(t)}else t.startsWith(M)&&(n.push({type:6,index:o}),s.removeAttribute(t));if(V.test(s.tagName)){const t=s.textContent.split(M),e=t.length-1;if(e>0){s.textContent=A?A.emptyScript:"";for(let i=0;i<e;i++)s.append(t[i],O()),G.nextNode(),n.push({type:2,index:++o});s.append(t[e],O())}}}else if(8===s.nodeType)if(s.data===S)n.push({type:2,index:o});else{let t=-1;for(;-1!==(t=s.data.indexOf(M,t+1));)n.push({type:7,index:o}),t+=M.length-1}o++}}static createElement(t,e){const i=z.createElement("template");return i.innerHTML=t,i}}function Q(t,e,i=t,s){if(e===W)return e;let o=void 0!==s?i._$Co?.[s]:i._$Cl;const a=P(e)?void 0:e._$litDirective$;return o?.constructor!==a&&(o?._$AO?.(!1),void 0===a?o=void 0:(o=new a(t),o._$AT(t,i,s)),void 0!==s?(i._$Co??=[])[s]=o:i._$Cl=o),void 0!==o&&(e=Q(t,o._$AS(t,e.values),o,s)),e}class tt{constructor(t,e){this._$AV=[],this._$AN=void 0,this._$AD=t,this._$AM=e}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(t){const{el:{content:e},parts:i}=this._$AD,s=(t?.creationScope??z).importNode(e,!0);G.currentNode=s;let o=G.nextNode(),a=0,r=0,n=i[0];for(;void 0!==n;){if(a===n.index){let e;2===n.type?e=new et(o,o.nextSibling,this,t):1===n.type?e=new n.ctor(o,n.name,n.strings,this,t):6===n.type&&(e=new rt(o,this,t)),this._$AV.push(e),n=i[++r]}a!==n?.index&&(o=G.nextNode(),a++)}return G.currentNode=z,s}p(t){let e=0;for(const i of this._$AV)void 0!==i&&(void 0!==i.strings?(i._$AI(t,i,e),e+=i.strings.length-2):i._$AI(t[e])),e++}}class et{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(t,e,i,s){this.type=2,this._$AH=B,this._$AN=void 0,this._$AA=t,this._$AB=e,this._$AM=i,this.options=s,this._$Cv=s?.isConnected??!0}get parentNode(){let t=this._$AA.parentNode;const e=this._$AM;return void 0!==e&&11===t?.nodeType&&(t=e.parentNode),t}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(t,e=this){t=Q(this,t,e),P(t)?t===B||null==t||""===t?(this._$AH!==B&&this._$AR(),this._$AH=B):t!==this._$AH&&t!==W&&this._(t):void 0!==t._$litType$?this.$(t):void 0!==t.nodeType?this.T(t):(t=>I(t)||"function"==typeof t?.[Symbol.iterator])(t)?this.k(t):this._(t)}O(t){return this._$AA.parentNode.insertBefore(t,this._$AB)}T(t){this._$AH!==t&&(this._$AR(),this._$AH=this.O(t))}_(t){this._$AH!==B&&P(this._$AH)?this._$AA.nextSibling.data=t:this.T(z.createTextNode(t)),this._$AH=t}$(t){const{values:e,_$litType$:i}=t,s="number"==typeof i?this._$AC(t):(void 0===i.el&&(i.el=J.createElement(X(i.h,i.h[0]),this.options)),i);if(this._$AH?._$AD===s)this._$AH.p(e);else{const t=new tt(s,this),i=t.u(this.options);t.p(e),this.T(i),this._$AH=t}}_$AC(t){let e=K.get(t.strings);return void 0===e&&K.set(t.strings,e=new J(t)),e}k(t){I(this._$AH)||(this._$AH=[],this._$AR());const e=this._$AH;let i,s=0;for(const o of t)s===e.length?e.push(i=new et(this.O(O()),this.O(O()),this,this.options)):i=e[s],i._$AI(o),s++;s<e.length&&(this._$AR(i&&i._$AB.nextSibling,s),e.length=s)}_$AR(t=this._$AA.nextSibling,e){for(this._$AP?.(!1,!0,e);t!==this._$AB;){const e=k(t).nextSibling;k(t).remove(),t=e}}setConnected(t){void 0===this._$AM&&(this._$Cv=t,this._$AP?.(t))}}class it{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(t,e,i,s,o){this.type=1,this._$AH=B,this._$AN=void 0,this.element=t,this.name=e,this._$AM=s,this.options=o,i.length>2||""!==i[0]||""!==i[1]?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=B}_$AI(t,e=this,i,s){const o=this.strings;let a=!1;if(void 0===o)t=Q(this,t,e,0),a=!P(t)||t!==this._$AH&&t!==W,a&&(this._$AH=t);else{const s=t;let r,n;for(t=o[0],r=0;r<o.length-1;r++)n=Q(this,s[i+r],e,r),n===W&&(n=this._$AH[r]),a||=!P(n)||n!==this._$AH[r],n===B?t=B:t!==B&&(t+=(n??"")+o[r+1]),this._$AH[r]=n}a&&!s&&this.j(t)}j(t){t===B?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,t??"")}}class st extends it{constructor(){super(...arguments),this.type=3}j(t){this.element[this.name]=t===B?void 0:t}}class ot extends it{constructor(){super(...arguments),this.type=4}j(t){this.element.toggleAttribute(this.name,!!t&&t!==B)}}class at extends it{constructor(t,e,i,s,o){super(t,e,i,s,o),this.type=5}_$AI(t,e=this){if((t=Q(this,t,e,0)??B)===W)return;const i=this._$AH,s=t===B&&i!==B||t.capture!==i.capture||t.once!==i.once||t.passive!==i.passive,o=t!==B&&(i===B||s);s&&this.element.removeEventListener(this.name,this,i),o&&this.element.addEventListener(this.name,this,t),this._$AH=t}handleEvent(t){"function"==typeof this._$AH?this._$AH.call(this.options?.host??this.element,t):this._$AH.handleEvent(t)}}class rt{constructor(t,e,i){this.element=t,this.type=6,this._$AN=void 0,this._$AM=e,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(t){Q(this,t)}}const nt=$.litHtmlPolyfillSupport;nt?.(J,et),($.litHtmlVersions??=[]).push("3.3.3");const lt=globalThis;let dt=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){const t=super.createRenderRoot();return this.renderOptions.renderBefore??=t.firstChild,t}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=((t,e,i)=>{const s=i?.renderBefore??e;let o=s._$litPart$;if(void 0===o){const t=i?.renderBefore??null;s._$litPart$=o=new et(e.insertBefore(O(),t),t,void 0,i??{})}return o._$AI(t),o})(e,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return W}};dt._$litElement$=!0,dt.finalized=!0,lt.litElementHydrateSupport?.({LitElement:dt});const ct=lt.litElementPolyfillSupport;ct?.({LitElement:dt}),(lt.litElementVersions??=[]).push("4.2.2");const ht=t=>(e,i)=>{void 0!==i?i.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)},pt={attribute:!0,type:String,converter:y,reflect:!1,hasChanged:b},ut=(t=pt,e,i)=>{const{kind:s,metadata:o}=i;let a=globalThis.litPropertyMetadata.get(o);if(void 0===a&&globalThis.litPropertyMetadata.set(o,a=new Map),"setter"===s&&((t=Object.create(t)).wrapped=!0),a.set(i.name,t),"accessor"===s){const{name:s}=i;return{set(i){const o=e.get.call(this);e.set.call(this,i),this.requestUpdate(s,o,t,!0,i)},init(e){return void 0!==e&&this.C(s,void 0,t,e),e}}}if("setter"===s){const{name:s}=i;return function(i){const o=this[s];e.call(this,i),this.requestUpdate(s,o,t,!0,i)}}throw Error("Unsupported decorator location: "+s)};function mt(t){return(e,i)=>"object"==typeof i?ut(t,e,i):((t,e,i)=>{const s=e.hasOwnProperty(i);return e.constructor.createProperty(i,t),s?Object.getOwnPropertyDescriptor(e,i):void 0})(t,e,i)}function ft(t){return mt({...t,state:!0,attribute:!1})}function gt(t,e){return(e,i,s)=>((t,e,i)=>(i.configurable=!0,i.enumerable=!0,Reflect.decorate&&"object"!=typeof e&&Object.defineProperty(t,e,i),i))(e,i,{get(){return e=this,e.renderRoot?.querySelector(t)??null;var e}})}var vt,_t;!function(t){t.language="language",t.system="system",t.comma_decimal="comma_decimal",t.decimal_comma="decimal_comma",t.space_comma="space_comma",t.none="none"}(vt||(vt={})),function(t){t.language="language",t.system="system",t.am_pm="12",t.twenty_four="24"}(_t||(_t={}));var yt=function(t,e,i,s){s=s||{},i=null==i?{}:i;var o=new Event(e,{bubbles:void 0===s.bubbles||s.bubbles,cancelable:Boolean(s.cancelable),composed:void 0===s.composed||s.composed});return o.detail=i,t.dispatchEvent(o),o};const bt=t=>(...e)=>({_$litDirective$:t,values:e});let wt=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,i){this._$Ct=t,this._$AM=e,this._$Ci=i}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};const xt="important",$t=" !"+xt,kt=bt(class extends wt{constructor(t){if(super(t),1!==t.type||"style"!==t.name||t.strings?.length>2)throw Error("The `styleMap` directive must be used in the `style` attribute and must be the only part in the attribute.")}render(t){return Object.keys(t).reduce((e,i)=>{const s=t[i];return null==s?e:e+`${i=i.includes("-")?i:i.replace(/(?:^(webkit|moz|ms|o)|)(?=[A-Z])/g,"-$&").toLowerCase()}:${s};`},"")}update(t,[e]){const{style:i}=t.element;if(void 0===this.ft)return this.ft=new Set(Object.keys(e)),this.render(e);for(const t of this.ft)null==e[t]&&(this.ft.delete(t),t.includes("-")?i.removeProperty(t):i[t]=null);for(const t in e){const s=e[t];if(null!=s){this.ft.add(t);const e="string"==typeof s&&s.endsWith($t);t.includes("-")||e?i.setProperty(t,e?s.slice(0,-11):s,e?xt:""):i[t]=s}}return W}}),At="material-thermostat-card",Lt="material-thermostat-card-editor",Ct=100,Mt=r`
  :host {
    --mt-primary: var(--md-sys-color-primary, var(--primary-color, #6750a4));
    --mt-on-primary: var(--md-sys-color-on-primary, #ffffff);
    --mt-primary-container: var(--md-sys-color-primary-container, rgba(103, 80, 164, 0.16));
    --mt-on-primary-container: var(--md-sys-color-on-primary-container, var(--primary-text-color, #21005d));

    --mt-surface: var(--md-sys-color-surface, var(--card-background-color, #fef7ff));
    /* Surface containers. Under material-you-theme the real M3 tokens are used.
       Everywhere else we tint the card background toward the on-surface color so
       tiles/lists read as a distinct, slightly elevated surface instead of
       blending into the card (the tint darkens in light themes and lightens in
       dark themes — the right direction for elevation in both). The steps mirror
       M3's container / high / highest elevation ladder. */
    --mt-surface-bg: var(--ha-card-background, var(--card-background-color, #f3edf7));
    --mt-surface-container: var(
      --md-sys-color-surface-container,
      color-mix(in srgb, var(--mt-on-surface) 8%, var(--mt-surface-bg))
    );
    --mt-surface-container-high: var(
      --md-sys-color-surface-container-high,
      color-mix(in srgb, var(--mt-on-surface) 11%, var(--mt-surface-bg))
    );
    --mt-surface-container-highest: var(
      --md-sys-color-surface-container-highest,
      color-mix(in srgb, var(--mt-on-surface) 14%, var(--mt-surface-bg))
    );

    --mt-on-surface: var(--md-sys-color-on-surface, var(--primary-text-color, #1c1b1f));
    --mt-on-surface-variant: var(--md-sys-color-on-surface-variant, var(--secondary-text-color, #49454f));

    --mt-secondary-container: var(--md-sys-color-secondary-container, rgba(103, 80, 164, 0.14));
    --mt-on-secondary-container: var(--md-sys-color-on-secondary-container, var(--primary-text-color, #1d192b));

    --mt-outline: var(--md-sys-color-outline, var(--divider-color, #79747e));
    --mt-outline-variant: var(--md-sys-color-outline-variant, var(--divider-color, #cac4d0));
    --mt-error: var(--md-sys-color-error, var(--error-color, #b3261e));

    /* Filled "selected" segment color (matches the stock card's accent). */
    --mt-selected-bg: var(--md-sys-color-primary, var(--primary-color, #6750a4));
    --mt-selected-fg: var(--md-sys-color-on-primary, #ffffff);

    --mt-shape-card: var(--md-sys-shape-corner-extra-large, 28px);
    --mt-shape-chip-square: var(--md-sys-shape-corner-large, 16px);
    --mt-shape-full: var(--md-sys-shape-corner-full, 9999px);

    /* State layer opacities per M3 spec. */
    --mt-state-hover: 0.08;
    --mt-state-pressed: 0.12;

    /* Motion — prefer Material You theme motion tokens, fall back to M3 defaults. */
    --mt-motion-dur: var(--md-sys-motion-duration-medium2, 280ms);
    --mt-motion-ease: var(--md-sys-motion-easing-emphasized, cubic-bezier(0.2, 0, 0, 1));
  }
`,St={off:"mdi:power",heat:"mdi:fire",cool:"mdi:snowflake",heat_cool:"mdi:sun-snowflake-variant",auto:"mdi:thermostat-auto",dry:"mdi:water-percent",fan_only:"mdi:fan"},Et=["electric","gas","heat_pump","eco","performance","high_demand","off"],zt={electric:"mdi:lightning-bolt",gas:"mdi:fire-circle",heat_pump:"mdi:heat-pump",eco:"mdi:leaf",performance:"mdi:rocket-launch",high_demand:"mdi:finance",off:"mdi:power",on:"mdi:power"},Ot="mdi:account-arrow-right";function Pt(t){return Object.prototype.hasOwnProperty.call(zt,t)?zt[t]:"mdi:water-boiler"}function It(t){return"off"===t?Tt("off"):"eco"===t?Zt("eco"):Tt("heat")}function Tt(t){switch(t){case"cool":return"var(--state-climate-cool-color, #2b9af9)";case"heat":return"var(--state-climate-heat-color, #ff8100)";case"heat_cool":return"var(--state-climate-heat_cool-color, #009688)";case"auto":return"var(--state-climate-auto-color, #e5c454)";case"dry":return"var(--state-climate-dry-color, #efbd07)";case"fan_only":return"var(--state-climate-fan_only-color, #8a8a8a)";default:return"var(--state-climate-off-color, var(--mt-on-surface-variant))"}}function Rt(t){const e=t.toLowerCase();return e.includes("auto")?"mdi:fan-auto":e.includes("off")||"0"===e?"mdi:fan-off":/quiet|silent/.test(e)?"mdi:power-sleep":/(^|[^0-9])1([^0-9]|$)|low|min/.test(e)?"mdi:fan-speed-1":/(^|[^0-9])2([^0-9]|$)|mid|med/.test(e)?"mdi:fan-speed-2":/(^|[^0-9])3([^0-9]|$)|high|max|strong|turbo/.test(e)?"mdi:fan-speed-3":"mdi:fan"}function Zt(t){const e=t.toLowerCase();return e.includes("eco")?"#4caf50":e.includes("sleep")?"#2196f3":void 0}function Dt(t){const e=t.toLowerCase();return"none"===e||"off"===e?"mdi:cancel":e.includes("eco")?"mdi:leaf":e.includes("away")?"mdi:home-export-outline":e.includes("home")?"mdi:home":e.includes("sleep")||e.includes("night")?"mdi:power-sleep":e.includes("boost")||e.includes("turbo")?"mdi:rocket-launch":e.includes("comfort")?"mdi:sofa":e.includes("activity")?"mdi:run-fast":"mdi:tune-variant"}function Ht(t){return t.toLowerCase().replace(/[-_\s]+/g," ").trim()}function Nt(t,...e){return e.some(e=>t.includes(e))}function Ft(t){const e=Ht(t),i=e.split(" ");if("off"===e||"stop"===e||"fixed"===e)return"mdi:arrow-expand-vertical";if("both"===e)return"mdi:arrow-all";if(i.includes("horizontal"))return"mt:swing-horizontal-full";if(Nt(i,"swing","range")){if(Nt(i,"top","upper","high","up"))return"mt:swing-vertical-top";if(Nt(i,"middle","mid","center","centre"))return"mt:swing-vertical-middle";if(Nt(i,"bottom","lower","low","down"))return"mt:swing-vertical-bottom"}return["on","swing","vertical","full","auto","all"].includes(e)||Nt(i,"full","auto")?"mt:swing-vertical-full":i.includes("top")&&i.includes("middle")||Nt(i,"upper","high")?"mt:swing-vertical-fixed-upper-middle":i.includes("bottom")&&i.includes("middle")||Nt(i,"lower","low")?"mt:swing-vertical-fixed-lower-middle":Nt(i,"top","highest","up")?"mt:swing-vertical-fixed-top":Nt(i,"middle","mid","center","centre")?"mt:swing-vertical-fixed-middle":Nt(i,"bottom","lowest","down")?"mt:swing-vertical-fixed-bottom":"mdi:swap-vertical"}function Vt(t){const e=Ht(t),i=e.split(" ");if("off"===e)return"mdi:arrow-collapse-horizontal";if(Nt(i,"swing","range")){if(i.includes("left"))return"mt:swing-horizontal-left";if(i.includes("right"))return"mt:swing-horizontal-right";if(Nt(i,"middle","center","centre","mid"))return"mt:swing-horizontal-middle"}return["on","swing","both","full","auto","wide","all"].includes(e)||Nt(i,"full","auto")?"mt:swing-horizontal-full":i.includes("left")&&Nt(i,"middle","center")?"mt:swing-horizontal-fixed-left-middle":i.includes("right")&&Nt(i,"middle","center")?"mt:swing-horizontal-fixed-right-middle":Nt(i,"left","leftmost")?"mt:swing-horizontal-fixed-left":Nt(i,"right","rightmost")?"mt:swing-horizontal-fixed-right":Nt(i,"middle","center","centre","mid")?"mt:swing-horizontal-fixed-middle":"mdi:arrow-left-right"}function jt(t,e,i){if(i?.length){const e=new Set(t);t=i.filter(t=>e.has(t))}if(!e?.length)return t;const s=new Set(t),o=e.filter(t=>s.has(t)),a=new Set(o);return[...o,...t.filter(t=>!a.has(t))]}function Ut(t){const e=t.trim().toLowerCase();return""===e||"off"===e||"none"===e||"false"===e||"null"===e||"0"===e||"unavailable"===e||"unknown"===e}function qt(t){return"heat_cool"===t?"Heat/Cool":t.replace(/_/g," ").replace(/\b\w/g,t=>t.toUpperCase())}function Wt(t){return t?.startsWith("climate.")?"climate":t?.startsWith("water_heater.")?"water_heater":void 0}function Bt(t,e){const i=t?.attributes.supported_features;return"number"!=typeof i||0!==(i&e)}function Kt(t){return!t||"unavailable"===t.state||"unknown"===t.state}function Gt(t,e){const i=t.attributes,s="water_heater"===Wt(t.entity_id),o="°F"===e,a=s?o?110:43:o?45:7,r=s?o?140:60:o?95:35,n={min:"number"==typeof i.min_temp&&Number.isFinite(i.min_temp)?i.min_temp:a,max:"number"==typeof i.max_temp&&Number.isFinite(i.max_temp)?i.max_temp:r,step:"number"==typeof i.target_temp_step&&Number.isFinite(i.target_temp_step)&&i.target_temp_step>0?i.target_temp_step:o?1:.5};return Bt(t,1)&&"number"==typeof i.temperature&&Number.isFinite(i.temperature)?{kind:"single",value:i.temperature,...n}:!s&&Bt(t,2)&&"number"==typeof i.target_temp_low&&Number.isFinite(i.target_temp_low)&&"number"==typeof i.target_temp_high&&Number.isFinite(i.target_temp_high)?{kind:"dual",low:i.target_temp_low,high:i.target_temp_high,...n}:{kind:"none",...n}}function Xt(t){return"water_heater"===Wt(t.entity_id)?void 0:t.attributes.hvac_action}function Yt(t,e,i){const s=t;if("function"==typeof s?.formatEntityState){const t=s.formatEntityState(e,i),o=i??e.state;return"string"==typeof t&&t===o?qt(o):t}return qt(i??e.state)}function Jt(t,e,i,s){const o=t;if("function"==typeof o?.formatEntityAttributeValue){const t=o.formatEntityAttributeValue(e,i,s),a=void 0===s?e.attributes[i]:s;return"string"==typeof t&&t===a?qt(t):t}return qt(String(s??e.attributes[i]??""))}function Qt(t,e,i,s){const o=t;if("function"==typeof o?.formatEntityAttributeName){const t=o.formatEntityAttributeName(e,i);if("string"==typeof t&&t)return t}return s}function te(t,e,i){const s=t;if("function"==typeof s?.localize){const t=s.localize(e);if("string"==typeof t&&t)return t}return i}const ee=new Map([["climate-hvac-modes","hvac_modes"],["climate-preset-modes","preset_modes"],["climate-fan-modes","fan_modes"],["climate-swing-modes","swing_modes"],["climate-swing-horizontal-modes","swing_horizontal_modes"],["water-heater-operation-modes","operation_modes"]]);function ie(t){const e={...t};return delete e.show_state_label,void 0===t.features||(e.features=t.features.map(t=>{const e=ee.get(t.type);if(void 0===e)return t;const i={...t};return void 0!==i.display||"icons"!==i.style&&"dropdown"!==i.style||(i.display=i.style),void 0===i.include&&Array.isArray(i[e])&&(i.include=i[e]),delete i.style,delete i[e],i})),e}const se=new WeakMap;function oe(t){return 5*(t-32)/9}function ae(t){return 1e3*Math.exp(16.6536-4030.183/(t+235))}function re(t,e){const i=Math.max(0,Math.min(100,e))/100*ae(t);return.62198*i/(101325-i)}function ne(t){if("number"==typeof t)return Number.isFinite(t)?t:void 0;if("string"!=typeof t)return;const e=parseFloat(t.trim());return Number.isFinite(e)?e:void 0}function le(t){if("string"==typeof t)switch(t.trim().toLowerCase()){case"°c":case"ºc":case"c":case"℃":case"celsius":return"°C";case"°f":case"ºf":case"f":case"℉":case"fahrenheit":return"°F";case"k":case"kelvin":return"K";default:return}}function de(t){return le(t?.config?.unit_system?.temperature)??"°C"}function ce(t,e){return le(t?.states?.[e]?.attributes?.unit_of_measurement)??de(t)}function he(t,e){return"°F"===e?5*(t-32)/9:"K"===e?t-273.15:t}function pe(t,e){return"°F"===e?9*t/5+32:"K"===e?t+273.15:t}const ue={"swing-vertical-fixed-top":{path:"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM20.444 6.827A16 16 0 0 1 19.746 9.756L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268Z",secondary:"M19.295 10.929A16 16 0 0 1 17.849 13.57L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM17.104 14.582A16 16 0 0 1 15.012 16.748L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM14.027 17.528A16 16 0 0 1 11.438 19.065L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM10.282 19.557A16 16 0 0 1 7.378 20.357L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z"},"swing-vertical-fixed-upper-middle":{path:"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM19.295 10.929A16 16 0 0 1 17.849 13.57L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499Z",secondary:"M20.444 6.827A16 16 0 0 1 19.746 9.756L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM17.104 14.582A16 16 0 0 1 15.012 16.748L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM14.027 17.528A16 16 0 0 1 11.438 19.065L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM10.282 19.557A16 16 0 0 1 7.378 20.357L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z"},"swing-vertical-fixed-middle":{path:"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM17.104 14.582A16 16 0 0 1 15.012 16.748L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595Z",secondary:"M20.444 6.827A16 16 0 0 1 19.746 9.756L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM19.295 10.929A16 16 0 0 1 17.849 13.57L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM14.027 17.528A16 16 0 0 1 11.438 19.065L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM10.282 19.557A16 16 0 0 1 7.378 20.357L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z"},"swing-vertical-fixed-lower-middle":{path:"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM14.027 17.528A16 16 0 0 1 11.438 19.065L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478Z",secondary:"M20.444 6.827A16 16 0 0 1 19.746 9.756L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM19.295 10.929A16 16 0 0 1 17.849 13.57L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM17.104 14.582A16 16 0 0 1 15.012 16.748L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM10.282 19.557A16 16 0 0 1 7.378 20.357L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z"},"swing-vertical-fixed-bottom":{path:"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM10.282 19.557A16 16 0 0 1 7.378 20.357L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z",secondary:"M20.444 6.827A16 16 0 0 1 19.746 9.756L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM19.295 10.929A16 16 0 0 1 17.849 13.57L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM17.104 14.582A16 16 0 0 1 15.012 16.748L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM14.027 17.528A16 16 0 0 1 11.438 19.065L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478Z"},"swing-vertical-top":{path:"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM17.077 6.354A12.6 12.6 0 0 1 16.528 8.661L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM16.172 9.584A12.6 12.6 0 0 1 15.034 11.664L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM14.447 12.461A12.6 12.6 0 0 1 12.8 14.167L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM19.935 9.505A16.1 16.1 0 0 1 16.994 14.876L15.762 13.855A14.5 14.5 0 0 0 18.411 9.017ZM19.965 6.785L21.268 9.931L17.077 8.591ZM14.719 16.367L14.684 12.961L18.072 15.77Z",secondary:"M12.024 14.781A12.6 12.6 0 0 1 9.985 15.991L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM9.074 16.379A12.6 12.6 0 0 1 6.788 17.009L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z"},"swing-vertical-middle":{path:"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM16.172 9.584A12.6 12.6 0 0 1 15.034 11.664L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM14.447 12.461A12.6 12.6 0 0 1 12.8 14.167L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM12.024 14.781A12.6 12.6 0 0 1 9.985 15.991L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM18.097 13.377A16.1 16.1 0 0 1 13.843 17.782L12.924 16.472A14.5 14.5 0 0 0 16.756 12.505ZM18.844 10.762L19.271 14.141L15.582 11.742ZM11.255 18.62L12.121 15.326L14.647 18.929Z",secondary:"M17.077 6.354A12.6 12.6 0 0 1 16.528 8.661L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM9.074 16.379A12.6 12.6 0 0 1 6.788 17.009L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087Z"},"swing-vertical-bottom":{path:"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM14.447 12.461A12.6 12.6 0 0 1 12.8 14.167L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM12.024 14.781A12.6 12.6 0 0 1 9.985 15.991L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM9.074 16.379A12.6 12.6 0 0 1 6.788 17.009L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087ZM15.303 16.628A16.1 16.1 0 0 1 10.037 19.754L9.497 18.248A14.5 14.5 0 0 0 14.239 15.432ZM16.713 14.302L16.233 17.674L13.308 14.387ZM7.319 19.879L9.024 16.93L10.51 21.072Z",secondary:"M17.077 6.354A12.6 12.6 0 0 1 16.528 8.661L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM16.172 9.584A12.6 12.6 0 0 1 15.034 11.664L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499Z"},"swing-vertical-full":{path:"M2.8 2.4L2.8 20.9A0.9 0.9 0 0 0 4.6 20.9L4.6 2.4L2.8 2.4ZM2.8 4.2L20.2 4.2A0.9 0.9 0 0 0 20.2 2.4L2.8 2.4L2.8 4.2ZM17.077 6.354A12.6 12.6 0 0 1 16.528 8.661L9.144 6.147A4.8 4.8 0 0 0 9.353 5.268ZM16.172 9.584A12.6 12.6 0 0 1 15.034 11.664L8.575 7.291A4.8 4.8 0 0 0 9.009 6.499ZM14.447 12.461A12.6 12.6 0 0 1 12.8 14.167L7.724 8.245A4.8 4.8 0 0 0 8.351 7.595ZM12.024 14.781A12.6 12.6 0 0 1 9.985 15.991L6.651 8.94A4.8 4.8 0 0 0 7.428 8.478ZM9.074 16.379A12.6 12.6 0 0 1 6.788 17.009L5.434 9.327A4.8 4.8 0 0 0 6.305 9.087ZM19.935 9.505A16.1 16.1 0 0 1 10.037 19.754L9.497 18.248A14.5 14.5 0 0 0 18.411 9.017ZM19.965 6.785L21.268 9.931L17.077 8.591ZM7.319 19.879L9.024 16.93L10.51 21.072Z"},"swing-horizontal-fixed-left":{path:"M3.6 6L20.4 6A1 1 0 0 0 20.4 4L3.6 4A1 1 0 0 0 3.6 6ZM5.188 19.477A16 16 0 0 1 2.595 17.944L9.649 8.236A4 4 0 0 0 10.297 8.619Z",secondary:"M9.249 20.762A16 16 0 0 1 6.344 19.967L10.586 8.742A4 4 0 0 0 11.312 8.94ZM13.506 20.929A16 16 0 0 1 10.494 20.929L11.624 8.982A4 4 0 0 0 12.376 8.982ZM17.656 19.967A16 16 0 0 1 14.751 20.762L12.688 8.94A4 4 0 0 0 13.414 8.742ZM21.405 17.944A16 16 0 0 1 18.812 19.477L13.703 8.619A4 4 0 0 0 14.351 8.236Z"},"swing-horizontal-fixed-left-middle":{path:"M3.6 6L20.4 6A1 1 0 0 0 20.4 4L3.6 4A1 1 0 0 0 3.6 6ZM9.249 20.762A16 16 0 0 1 6.344 19.967L10.586 8.742A4 4 0 0 0 11.312 8.94Z",secondary:"M5.188 19.477A16 16 0 0 1 2.595 17.944L9.649 8.236A4 4 0 0 0 10.297 8.619ZM13.506 20.929A16 16 0 0 1 10.494 20.929L11.624 8.982A4 4 0 0 0 12.376 8.982ZM17.656 19.967A16 16 0 0 1 14.751 20.762L12.688 8.94A4 4 0 0 0 13.414 8.742ZM21.405 17.944A16 16 0 0 1 18.812 19.477L13.703 8.619A4 4 0 0 0 14.351 8.236Z"},"swing-horizontal-fixed-middle":{path:"M3.6 6L20.4 6A1 1 0 0 0 20.4 4L3.6 4A1 1 0 0 0 3.6 6ZM13.506 20.929A16 16 0 0 1 10.494 20.929L11.624 8.982A4 4 0 0 0 12.376 8.982Z",secondary:"M5.188 19.477A16 16 0 0 1 2.595 17.944L9.649 8.236A4 4 0 0 0 10.297 8.619ZM9.249 20.762A16 16 0 0 1 6.344 19.967L10.586 8.742A4 4 0 0 0 11.312 8.94ZM17.656 19.967A16 16 0 0 1 14.751 20.762L12.688 8.94A4 4 0 0 0 13.414 8.742ZM21.405 17.944A16 16 0 0 1 18.812 19.477L13.703 8.619A4 4 0 0 0 14.351 8.236Z"},"swing-horizontal-fixed-right-middle":{path:"M3.6 6L20.4 6A1 1 0 0 0 20.4 4L3.6 4A1 1 0 0 0 3.6 6ZM17.656 19.967A16 16 0 0 1 14.751 20.762L12.688 8.94A4 4 0 0 0 13.414 8.742Z",secondary:"M5.188 19.477A16 16 0 0 1 2.595 17.944L9.649 8.236A4 4 0 0 0 10.297 8.619ZM9.249 20.762A16 16 0 0 1 6.344 19.967L10.586 8.742A4 4 0 0 0 11.312 8.94ZM13.506 20.929A16 16 0 0 1 10.494 20.929L11.624 8.982A4 4 0 0 0 12.376 8.982ZM21.405 17.944A16 16 0 0 1 18.812 19.477L13.703 8.619A4 4 0 0 0 14.351 8.236Z"},"swing-horizontal-fixed-right":{path:"M3.6 6L20.4 6A1 1 0 0 0 20.4 4L3.6 4A1 1 0 0 0 3.6 6ZM21.405 17.944A16 16 0 0 1 18.812 19.477L13.703 8.619A4 4 0 0 0 14.351 8.236Z",secondary:"M5.188 19.477A16 16 0 0 1 2.595 17.944L9.649 8.236A4 4 0 0 0 10.297 8.619ZM9.249 20.762A16 16 0 0 1 6.344 19.967L10.586 8.742A4 4 0 0 0 11.312 8.94ZM13.506 20.929A16 16 0 0 1 10.494 20.929L11.624 8.982A4 4 0 0 0 12.376 8.982ZM17.656 19.967A16 16 0 0 1 14.751 20.762L12.688 8.94A4 4 0 0 0 13.414 8.742Z"},"swing-horizontal-left":{path:"M3.6 6L20.4 6A1 1 0 0 0 20.4 4L3.6 4A1 1 0 0 0 3.6 6ZM6.635 16.401A12.6 12.6 0 0 1 4.594 15.194L9.649 8.236A4 4 0 0 0 10.297 8.619ZM9.834 17.412A12.6 12.6 0 0 1 7.546 16.787L10.586 8.742A4 4 0 0 0 11.312 8.94ZM13.186 17.544A12.6 12.6 0 0 1 10.814 17.544L11.624 8.982A4 4 0 0 0 12.376 8.982ZM10.783 21.054A16.1 16.1 0 0 1 4.876 19.438L5.584 18.003A14.5 14.5 0 0 0 10.904 19.458ZM13.436 20.453L10.677 22.45L11.009 18.062ZM2.898 17.57L6.203 16.748L4.256 20.693Z",secondary:"M16.454 16.787A12.6 12.6 0 0 1 14.166 17.412L12.688 8.94A4 4 0 0 0 13.414 8.742ZM19.406 15.194A12.6 12.6 0 0 1 17.365 16.401L13.703 8.619A4 4 0 0 0 14.351 8.236Z"},"swing-horizontal-middle":{path:"M3.6 6L20.4 6A1 1 0 0 0 20.4 4L3.6 4A1 1 0 0 0 3.6 6ZM9.834 17.412A12.6 12.6 0 0 1 7.546 16.787L10.586 8.742A4 4 0 0 0 11.312 8.94ZM13.186 17.544A12.6 12.6 0 0 1 10.814 17.544L11.624 8.982A4 4 0 0 0 12.376 8.982ZM16.454 16.787A12.6 12.6 0 0 1 14.166 17.412L12.688 8.94A4 4 0 0 0 13.414 8.742ZM15.062 20.806A16.1 16.1 0 0 1 8.938 20.806L9.242 19.235A14.5 14.5 0 0 0 14.758 19.235ZM17.462 19.526L15.328 22.181L14.491 17.861ZM6.538 19.526L9.509 17.861L8.672 22.181Z",secondary:"M6.635 16.401A12.6 12.6 0 0 1 4.594 15.194L9.649 8.236A4 4 0 0 0 10.297 8.619ZM19.406 15.194A12.6 12.6 0 0 1 17.365 16.401L13.703 8.619A4 4 0 0 0 14.351 8.236Z"},"swing-horizontal-right":{path:"M3.6 6L20.4 6A1 1 0 0 0 20.4 4L3.6 4A1 1 0 0 0 3.6 6ZM13.186 17.544A12.6 12.6 0 0 1 10.814 17.544L11.624 8.982A4 4 0 0 0 12.376 8.982ZM16.454 16.787A12.6 12.6 0 0 1 14.166 17.412L12.688 8.94A4 4 0 0 0 13.414 8.742ZM19.406 15.194A12.6 12.6 0 0 1 17.365 16.401L13.703 8.619A4 4 0 0 0 14.351 8.236ZM19.124 19.438A16.1 16.1 0 0 1 13.217 21.054L13.096 19.458A14.5 14.5 0 0 0 18.416 18.003ZM21.102 17.57L19.744 20.693L17.797 16.748ZM10.564 20.453L12.991 18.062L13.323 22.45Z",secondary:"M6.635 16.401A12.6 12.6 0 0 1 4.594 15.194L9.649 8.236A4 4 0 0 0 10.297 8.619ZM9.834 17.412A12.6 12.6 0 0 1 7.546 16.787L10.586 8.742A4 4 0 0 0 11.312 8.94Z"},"swing-horizontal-full":{path:"M3.6 6L20.4 6A1 1 0 0 0 20.4 4L3.6 4A1 1 0 0 0 3.6 6ZM6.635 16.401A12.6 12.6 0 0 1 4.594 15.194L9.649 8.236A4 4 0 0 0 10.297 8.619ZM9.834 17.412A12.6 12.6 0 0 1 7.546 16.787L10.586 8.742A4 4 0 0 0 11.312 8.94ZM13.186 17.544A12.6 12.6 0 0 1 10.814 17.544L11.624 8.982A4 4 0 0 0 12.376 8.982ZM16.454 16.787A12.6 12.6 0 0 1 14.166 17.412L12.688 8.94A4 4 0 0 0 13.414 8.742ZM19.406 15.194A12.6 12.6 0 0 1 17.365 16.401L13.703 8.619A4 4 0 0 0 14.351 8.236ZM19.124 19.438A16.1 16.1 0 0 1 4.876 19.438L5.584 18.003A14.5 14.5 0 0 0 18.416 18.003ZM21.102 17.57L19.744 20.693L17.797 16.748ZM2.898 17.57L6.203 16.748L4.256 20.693Z"}},me=bt(class extends wt{constructor(t){if(super(t),1!==t.type||"class"!==t.name||t.strings?.length>2)throw Error("`classMap()` can only be used in the `class` attribute and must be the only part in the attribute.")}render(t){return" "+Object.keys(t).filter(e=>t[e]).join(" ")+" "}update(t,[e]){if(void 0===this.st){this.st=new Set,void 0!==t.strings&&(this.nt=new Set(t.strings.join(" ").split(/\s/).filter(t=>""!==t)));for(const t in e)e[t]&&!this.nt?.has(t)&&this.st.add(t);return this.render(e)}const i=t.element.classList;for(const t of this.st)t in e||(i.remove(t),this.st.delete(t));for(const t in e){const s=!!e[t];s===this.st.has(t)||this.nt?.has(t)||(s?(i.add(t),this.st.add(t)):(i.remove(t),this.st.delete(t)))}return W}});var fe;try{CSS.registerProperty?.({name:"--dial-color",syntax:"<color>",inherits:!0,initialValue:"transparent"}),CSS.registerProperty?.({name:"--mode-tint",syntax:"<color>",inherits:!0,initialValue:"transparent"}),CSS.registerProperty?.({name:"--mode-light",syntax:"<color>",inherits:!0,initialValue:"transparent"})}catch{}const ge=["cool","heat","heat_cool","auto","dry","fan_only"],ve=320,_e=160,ye=207,be=306;function we(t){return"number"==typeof t&&Number.isFinite(t)}function xe(t,e){const i=(t-90)*Math.PI/180;return{x:_e+e*Math.cos(i),y:_e+e*Math.sin(i)}}let $e=fe=class extends dt{constructor(){super(...arguments),this.value=20,this.min=7,this.max=35,this.step=.5,this.mode="off",this.dialStyle="halo",this.modeLabel="",this.modeColors={},this.modeIcons={},this.unit="°C",this.showCurrentAsPrimary=!1,this.disabled=!1,this.readonly=!1,this.dual=!1,this._dragging=!1,this._dragValue=0,this._dragLow=0,this._dragHigh=0,this._activeHandle=null,this._selected=null,this._pressX=0,this._pressY=0,this._tapArmed=!1,this._wipeFrom=null,this._prevSegVisible=!1,this._prevOff=!1,this._showRangeTimer=!1,this._labelResizeObserver=new ResizeObserver(()=>this._measureLabels()),this._observedLabels=new WeakSet,this._onPointerDown=t=>{this.disabled||this.readonly||!this._isRingHit(t.clientX,t.clientY)||(this._pressX=t.clientX,this._pressY=t.clientY,"touch"!==t.pointerType?(this._beginDrag(t,null),this._emitFromValue(this._valueFromPoint(t.clientX,t.clientY))):this._tapArmed=!0)},this._onPointerMove=t=>{this._tapArmed&&this._movedPastSlop(t)&&(this._tapArmed=!1),this._dragging&&this._emitFromValue(this._valueFromPoint(t.clientX,t.clientY))},this._onPointerUp=t=>{if(this._tapArmed)return this._tapArmed=!1,void this._commitTap(t);this._dragging&&this._endDrag(t)},this._onPointerCancel=t=>{this._tapArmed=!1,this._dragging&&this._endDrag(t)},this._onKeyDown=(t,e=null)=>{if(this.disabled||this.readonly||this.dual&&null===e)return;const i="low"===e?this._displayLow:"high"===e?this._displayHigh:this.value;let s;if("ArrowUp"===t.key||"ArrowRight"===t.key?s=i+this.step:"ArrowDown"===t.key||"ArrowLeft"===t.key?s=i-this.step:"PageUp"===t.key?s=i+10*this.step:"PageDown"===t.key?s=i-10*this.step:"Home"===t.key?s=this.min:"End"===t.key&&(s=this.max),void 0!==s){if(t.preventDefault(),null!==e){this._selected=e;const t={low:"low"===e?Math.min(this._roundToStep(s),this._displayHigh-this.step):this._displayLow,high:"high"===e?Math.max(this._roundToStep(s),this._displayLow+this.step):this._displayHigh};return this._emit("value-changing",t),void this._emit("value-changed",t)}this._emit("value-changed",{value:this._roundToStep(s)})}}}get _dualActive(){return this.dual?"cool"===this.mode?"cool":"heat"===this.mode?"heat":we(this.current)&&we(this._displayLow)&&we(this._displayHigh)?this.current>this._displayHigh?"cool":this.current<this._displayLow?"heat":null:null:null}get _selSide(){return this._selected?this._selected:we(this.current)?Math.abs(this.current-this._displayLow)<=Math.abs(this.current-this._displayHigh)?"low":"high":"low"}get _effectiveMode(){return this.dual?this._dualActive??"heat_cool":this.mode}get _demandSensible(){return!(!we(this.current)||!we(this._displayValue))&&("cool"===this.mode?this.current>this._displayValue:"heat"!==this.mode||this.current<this._displayValue)}get _singleActive(){return!!ge.includes(this.mode)&&(this.hvacAction?"idle"!==this.hvacAction&&"off"!==this.hvacAction:this._demandSensible)}get _dualIdle(){return this.dual&&!this.readonly&&("off"===this.mode||"idle"===this.hvacAction||"off"===this.hvacAction)}get _demandColored(){return ge.includes(this.mode)&&(this._singleActive||this._demandSensible)}_modeColor(t){return this.modeColors[t]??Tt(t)}_modeIcon(t){return this.modeIcons[t]??St[t]??"mdi:thermostat"}get _dialColor(){return this.readonly?this._modeColor(this.mode):this._dualIdle?fe.IDLE_COLOR:(this.dual||!ge.includes(this.mode)||this._singleActive)&&ge.includes(this._effectiveMode)?this._modeColor(this._effectiveMode):fe.IDLE_COLOR}get _singleSegColor(){return!this.dual&&this._demandColored?this._modeColor(this.mode):this._dialColor}get _singleSegVisible(){return!this.dual&&we(this.current)&&we(this._displayValue)&&this.current>=this.min&&this.current<=this.max&&ge.includes(this.mode)&&(!("heat"===this.mode||"cool"===this.mode)||this._demandSensible)}get _showRange(){return this._dragging||this._showRangeTimer||null===this._dualActive}get _centerTight(){const t=t=>{if(!we(t))return!1;const e=(this._angleOf(t)%360+360)%360;return Math.min(Math.abs(e-90),Math.abs(e-270))<=26};return this.dual?t(this._displayLow)||t(this._displayHigh)||!this.showCurrentAsPrimary&&t(this.current):t(this.showCurrentAsPrimary?this._displayValue:this.current)&&this._singleReadoutWide}get _singleReadoutWide(){const t=this.showCurrentAsPrimary&&null!=this.current,e=t?this.current:this._displayValue,i=t?1:this._precision,[s,o]=this._centerParts(e,i);return s.length+(o?o.length+1:0)>=4}_bumpRangeDisplay(){this._showRangeTimer=!0,this._rangeTimer&&clearTimeout(this._rangeTimer),this._rangeTimer=window.setTimeout(()=>{this._showRangeTimer=!1},5e3)}connectedCallback(){super.connectedCallback(),this._labelResizeObserver.observe(this)}disconnectedCallback(){super.disconnectedCallback(),this._labelResizeObserver.disconnect(),this._observedLabels=new WeakSet,this._rangeTimer&&clearTimeout(this._rangeTimer)}_measureLabels(){for(const t of this.renderRoot.querySelectorAll(".o-label, .o-label ha-icon"))this._observedLabels.has(t)||(this._labelResizeObserver.observe(t),this._observedLabels.add(t));const t=this.renderRoot.querySelector(".dial").offsetWidth;if(t<=0)return;const e=ve/t;for(const t of this.renderRoot.querySelectorAll(".o-label")){const i=t.offsetWidth/2,s=t.offsetHeight/2,o=[{left:0,top:0,right:t.offsetWidth,bottom:t.offsetHeight},...Array.from(t.querySelectorAll("sup, .mode-icon.inline"),e=>{let i=0,s=0;for(let o=e;o!==t;o=o.offsetParent)i+=o.offsetLeft,s+=o.offsetTop;return e.classList.contains("inline")&&(s-=e.offsetHeight/2),{left:i,top:s,right:i+e.offsetWidth,bottom:s+e.offsetHeight}})],a=Math.min(...o.map(t=>t.left)),r=Math.max(...o.map(t=>t.right)),n=Math.min(...o.map(t=>t.top)),l=Math.max(...o.map(t=>t.bottom)),d=Number(t.dataset.angle)*Math.PI/180,c=Math.sin(d),h=-Math.cos(d),p=Math.max((a-i)*c,(r-i)*c)*e+Math.max((n-s)*h,(l-s)*h)*e,u=parseFloat(t.style.getPropertyValue("--s"));(!Number.isFinite(u)||Math.abs(p-u)>.05)&&t.style.setProperty("--s",String(p))}}get _precision(){return this.step<1?1:0}get _displayValue(){const t=this._dragging?this._dragValue:this.value;return we(t)?t:NaN}get _displayLow(){const t=this._dragging?this._dragLow:this.lowValue??this.min;return we(t)?t:NaN}get _displayHigh(){const t=this._dragging?this._dragHigh:this.highValue??this.max;return we(t)?t:NaN}_angleOf(t){if(!we(t))return NaN;const e=(t-this.min)/(this.max-this.min||1);return ye+Math.min(1,Math.max(0,e))*be}_fracOf(t){return(this._angleOf(t)-ye)/be}_roundToStep(t){const e=Math.min(this.max,Math.max(this.min,t)),i=Math.round(e/this.step)*this.step;return Math.min(this.max,Math.max(this.min,parseFloat(i.toFixed(this._precision))))}_isRingHit(t,e){const i=this._svg.getBoundingClientRect(),s=i.width/ve||1,o=t-(i.left+i.width/2),a=e-(i.top+i.height/2),r=Math.hypot(o,a)/s;if(r<98||r>152)return!1;let n=180*Math.atan2(a,o)/Math.PI+90;return n=(n%360+360)%360,n>=ye||n<=153}_valueFromPoint(t,e){const i=this._svg.getBoundingClientRect(),s=i.left+i.width/2,o=i.top+i.height/2;let a,r=180*Math.atan2(e-o,t-s)/Math.PI+90;r=(r%360+360)%360,a=r>=ye?r-ye:r<=153?r+360-ye:r<180?be:0;const n=Math.min(1,Math.max(0,a/be));return this._roundToStep(this.min+n*(this.max-this.min))}_applyDual(t){"low"===this._activeHandle?this._dragLow=Math.min(t,this._dragHigh-this.step):this._dragHigh=Math.max(t,this._dragLow+this.step)}_emitFromValue(t){this.dual?(this._applyDual(t),this._emit("value-changing",{low:this._dragLow,high:this._dragHigh})):(this._dragValue=t,this._emit("value-changing",{value:t}))}_movedPastSlop(t){return Math.hypot(t.clientX-this._pressX,t.clientY-this._pressY)>10}_beginDrag(t,e){t.preventDefault(),this._svg.setPointerCapture(t.pointerId),this._tapArmed=!1;const i=this._displayLow,s=this._displayHigh,o=this._displayValue;if(this._dragging=!0,this.dual){if(this._dragLow=i,this._dragHigh=s,e)this._activeHandle=e;else{const e=this._valueFromPoint(t.clientX,t.clientY);this._activeHandle=Math.abs(e-this._dragLow)<=Math.abs(e-this._dragHigh)?"low":"high"}this._selected=this._activeHandle}else this._dragValue=o}_endDrag(t){this._svg.releasePointerCapture(t.pointerId),this._dragging=!1,this.dual?(this._emit("value-changed",{low:this._dragLow,high:this._dragHigh}),this._activeHandle=null):this._emit("value-changed",{value:this._dragValue})}_commitTap(t){const e=this._valueFromPoint(t.clientX,t.clientY);if(this.dual){const t=this._displayLow,i=this._displayHigh;Math.abs(e-t)<=Math.abs(e-i)?(this._selected="low",this._emit("value-changed",{low:Math.min(e,i-this.step),high:i})):(this._selected="high",this._emit("value-changed",{low:t,high:Math.max(e,t+this.step)}))}else this._emit("value-changed",{value:e})}_onHandlePointerDown(t,e){this.disabled||this.readonly||(t.stopPropagation(),this._beginDrag(t,e))}_step(t){if(!this.disabled&&!this.readonly)if(this.dual)if("low"===this._selSide){const e=Math.min(this._roundToStep(this._displayLow+t*this.step),this._displayHigh-this.step);this._emit("value-changed",{low:e,high:this._displayHigh})}else{const e=Math.max(this._roundToStep(this._displayHigh+t*this.step),this._displayLow+this.step);this._emit("value-changed",{low:this._displayLow,high:e})}else this._emit("value-changed",{value:this._roundToStep(this.value+t*this.step)})}_emit(t,e){this.readonly||this.dispatchEvent(new CustomEvent(t,{detail:e,bubbles:!0,composed:!0}))}_fmt(t,e,i=!0){return we(t)?i&&this.formatNumber?this.formatNumber(t,e):t.toFixed(e):"—"}_fmtCompact(t){return we(t)?this.formatNumber?this.formatNumber(t,Number.isInteger(t)?0:1):Number.isInteger(t)?String(t):t.toFixed(1):"—"}_fmtLabel(t,e){const[i,s]=this._fmt(t,Number.isInteger(t)?0:1,!1).split(".");return U`<span class="label-number" aria-hidden="true"
       >${i}${s?U`<sup>${s}</sup>`:B}</span
    ><span class="sr-only">${e} ${this._fmtCompact(t)} ${this.unit}</span>`}_centerParts(t,e){const[i,s]=this._fmt(t,e,!1).split(".");return[i,s&&"0"!==s?s:""]}_fmtCenter(t,e){const[i,s]=this._centerParts(t,e);return U`${i}${s?U`<sup>${s}</sup>`:B}`}_dotOrbit(t,e){return Number.isFinite(t)?U`<div class="orbit" style=${`transform: rotate(${t}deg)`}>
      <div class="o-dot ${e}"></div>
    </div>`:B}_labelOrbit(t,e,i=!1){return Number.isFinite(t)?U`<div class="orbit" style=${`transform: rotate(${t}deg)`}>
      <div class=${me({"o-label":!0,"icon-label":i})} data-angle=${t} style=${`transform: translate(-50%, -50%) rotate(${-t}deg)`}>
        ${e}
      </div>
    </div>`:B}_handleOrbit(t,e){return Number.isFinite(t)?U`<div class="orbit" style=${`transform: rotate(${t}deg)`}>
      <div
        class="handle"
        role=${null===e?B:"slider"}
        tabindex=${null===e?B:this.disabled?-1:0}
        aria-label=${null===e?B:("low"===e?"Low":"High")+" target temperature"}
        aria-valuemin=${null===e?B:"low"===e?this.min:this._displayLow+this.step}
        aria-valuemax=${null===e?B:"low"===e?this._displayHigh-this.step:this.max}
        aria-valuenow=${null===e?B:"low"===e?this._displayLow:this._displayHigh}
        aria-valuetext=${null===e?B:`${this._fmt("low"===e?this._displayLow:this._displayHigh,this._precision)} ${this.unit}`}
        aria-disabled=${null===e?B:String(this.disabled)}
        @keydown=${t=>this._onKeyDown(t,e)}
        @pointerdown=${t=>this._onHandlePointerDown(t,e)}
      ></div>
    </div>`:B}updated(t){this._measureLabels(),this.dual&&(t.has("lowValue")||t.has("highValue"))&&((void 0!==this._prevLow&&this._prevLow!==this.lowValue||void 0!==this._prevHigh&&this._prevHigh!==this.highValue)&&this._bumpRangeDisplay(),this._prevLow=this.lowValue,this._prevHigh=this.highValue);const e=this._singleSegColor,i=!ge.includes(this.mode);t.has("mode")&&!this.dual&&void 0!==this._prevSegColor&&this._prevSegColor!==e&&!i&&!this._prevOff&&this._prevSegVisible&&this._singleSegVisible&&(this._wipeFrom=this._prevSegColor,this.updateComplete.then(()=>this._runWipe())),this._prevSegColor=e,this._prevSegVisible=this._singleSegVisible,this._prevOff=i}_runWipe(){const t=this.renderRoot.querySelector(".value:not(.wipe-value)"),e=this.renderRoot.querySelector(".wipe-value"),i=()=>{this._wipeFrom=null};if(!t||!e)return i();const s=parseFloat(t.getAttribute("stroke-dasharray")),o=-parseFloat(t.getAttribute("stroke-dashoffset"));if(s<=0)return i();const a={duration:460,easing:"cubic-bezier(0.2, 0, 0, 1)"};t.animate([{strokeDasharray:"0 1000",strokeDashoffset:"0"},{strokeDasharray:`${s} 1000`,strokeDashoffset:""+-o}],a),e.animate([{strokeDasharray:`${s} 1000`,strokeDashoffset:""+-o},{strokeDasharray:`${s} 1000`,strokeDashoffset:"-1000"}],{...a,fill:"forwards"}).finished.then(i,i)}render(){const t="minimal"===this.dialStyle||"google"===this.dialStyle?this.dialStyle:"halo",e=!ge.includes(this.mode),i=!e&&(this.dual?this._dualIdle:!this._singleActive),s=this._dialColor,o=e?"var(--mt-on-surface)":`color-mix(in srgb, ${this._modeColor(this.mode)} 20%, var(--mt-on-surface))`,a=this._demandColored?this._modeColor(this.mode):o,r=this._modeIcon(this.mode),n=we(this.current)&&this.current>=this.min&&this.current<=this.max,l=this._angleOf(this._displayValue),d=n?this._angleOf(this.current):0,c=!this.dual&&n&&!e&&Math.abs(l-d)<18,h=this._angleOf(this._displayLow),p=this._angleOf(this._displayHigh),u=this.dual?this._selSide:null,m=function(t,e,i){const s=xe(207,i),o=xe(513,i);return`M ${s.x} ${s.y} A 130 130 0 1 1 ${o.x} ${o.y}`}(0,0,130);let f=0,g=0,v=!1,_=s;!this.dual&&n&&!e&&we(this._displayValue)&&(f=Math.min(this._fracOf(this._displayValue),this._fracOf(this.current)),g=Math.max(this._fracOf(this._displayValue),this._fracOf(this.current)),v=this._singleSegVisible,_=this._singleSegColor);const y=`${(1e3*(g-f)).toFixed(2)} 1000`,b=(1e3*-f).toFixed(2),w=[];if(this.dual&&we(this._displayLow)&&we(this._displayHigh)){const t=this._fracOf(this._displayLow),e=this._fracOf(this._displayHigh),i=this._dualActive;w.push({from:t,to:e,color:null===i?this._modeColor("heat_cool"):fe.IDLE_COLOR,opacity:null===i?1:.5,cls:"range"});const s=n?this._fracOf(this.current):e,o=we(this.current)&&this.current>=(this._displayLow+this._displayHigh)/2;w.push({from:o?e:Math.min(t,s),to:o?Math.max(e,s):t,color:o?this._modeColor("cool"):this._modeColor("heat"),opacity:null!==i&&we(this.current)?1:0,cls:"demand"})}const x=this._dualActive,$=this.dual&&!this._showRange,k=U`<span class="num current">${this._fmtLabel(this.current,"Current")}</span>`,A=U`<ha-icon class="mode-icon" icon=${r}></ha-icon>`,L=U`<ha-icon
      class="mode-icon dual-mode-icon"
      icon=${this._modeIcon("cool"===x?"cool":"heat")}
    ></ha-icon>`,C=this.dual&&n&&!this.showCurrentAsPrimary,M=$&&"heat"===x&&!this.showCurrentAsPrimary?L:U`<span class="num ${"low"===u?"sel":""}"
            >${this._fmtLabel(this._displayLow,"Low")}</span
          >`,S=$&&"cool"===x&&!this.showCurrentAsPrimary?L:U`<span class="num ${"high"===u?"sel":""}"
            >${this._fmtLabel(this._displayHigh,"High")}</span
          >`,E=C?[h,p,d]:[h,p],z=this.dual?function(t){const e=t.length;if(e<2)return t.slice();const i=t.map((t,e)=>e).sort((e,i)=>t[e]-t[i]),s=i.map((e,i)=>t[e]-24*i),o=function(t){const e=[],i=[];for(const s of t)for(e.push(s),i.push(1);e.length>1&&e[e.length-2]>e[e.length-1];){const t=e.pop(),s=i.pop(),o=e.pop(),a=i.pop();e.push((o*a+t*s)/(a+s)),i.push(a+s)}const s=[];return e.forEach((t,e)=>{for(let o=0;o<i[e];o++)s.push(t)}),s}(s),a=new Array(e);i.forEach((t,e)=>{a[t]=o[e]+24*e});{const t=Math.min(...a),i=Math.max(...a);let s=0;if(t<207?s=207-t:i>513&&(s=513-i),0!==s)for(let t=0;t<e;t++)a[t]+=s}return a}(E):[];return U`
      <div
        class=${me({dial:!0,[`style-${t}`]:!0,dual:this.dual&&!this.readonly,off:e,idle:i,disabled:this.disabled,dragging:this._dragging})}
        style=${`--dial-color: ${s};${this.dual?"":` --mode-tint: ${a}; --mode-light: ${o};`}`}
      >
        <svg
          viewBox="0 0 ${ve} ${ve}"
          role=${this.readonly||this.dual?B:"slider"}
          tabindex=${this.readonly||this.dual?B:this.disabled?-1:0}
          aria-valuemin=${this.readonly||this.dual?B:this.min}
          aria-valuemax=${this.readonly||this.dual?B:this.max}
           aria-valuenow=${this.readonly||this.dual||!we(this._displayValue)?B:this._displayValue}
          aria-valuetext=${this.readonly||this.dual?B:`${this._fmt(this._displayValue,this._precision)} ${this.unit}`}
          aria-label=${this.readonly||this.dual?B:"Target temperature"}
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerCancel}
          @keydown=${this._onKeyDown}
        >
          <defs>
            <!-- Fuller halo: retain color farther toward the ring, then fade
                 to fully transparent at the perimeter to avoid a hard edge. -->
            <radialGradient id="mt-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stop-color="var(--dial-color)" stop-opacity="0.38" />
              <stop offset="25%" stop-color="var(--dial-color)" stop-opacity="0.35" />
              <stop offset="45%" stop-color="var(--dial-color)" stop-opacity="0.3" />
              <stop offset="65%" stop-color="var(--dial-color)" stop-opacity="0.21" />
              <stop offset="80%" stop-color="var(--dial-color)" stop-opacity="0.12" />
              <stop offset="92%" stop-color="var(--dial-color)" stop-opacity="0.04" />
              <stop offset="100%" stop-color="var(--dial-color)" stop-opacity="0" />
            </radialGradient>
          </defs>
          ${"google"===t?q`<circle class="disc" cx=${_e} cy=${_e} r="148.5" fill="var(--mt-surface-container-high)" />`:B}
          <circle class="glow" cx=${_e} cy=${_e} r="150" fill="url(#mt-glow)" />
          <path class="ring" d=${m} />
          ${this.readonly?B:this.dual?w.map(t=>q`<path
                  class=${`value ${t.cls}`}
                  d=${m}
                  pathLength="1000"
                  stroke-dasharray=${`${(1e3*Math.max(0,t.to-t.from)).toFixed(2)} 1000`}
                  stroke-dashoffset=${(1e3*-t.from).toFixed(2)}
                  style=${`opacity:${t.opacity};stroke:${t.color}`}
                />`):q`<path
                class="value"
                d=${m}
                pathLength="1000"
                stroke-dasharray=${y}
                stroke-dashoffset=${b}
                style=${`opacity:${v?1:0};stroke:${_}`}
              />`}
          <path class="hit" d=${m} />
          ${!this.readonly&&!this.dual&&this._wipeFrom&&v?q`<path
                class="value wipe-value"
                d=${m}
                pathLength="1000"
                stroke-dasharray=${y}
                stroke-dashoffset=${b}
                style=${`stroke:${this._wipeFrom};opacity:1`}
              />`:B}
        </svg>

        <div class="markers">
          ${this.readonly?n?this._dotOrbit(d,"current"):B:this.dual?U`
                ${this._dotOrbit(h,"setpoint"+("low"===u?" sel":""))}
                ${this._dotOrbit(p,"setpoint"+("high"===u?" sel":""))}
                ${n?this._dotOrbit(d,"current"):B}
                 ${this._labelOrbit(z[0],M,M===L)}
                 ${this._labelOrbit(z[1],S,S===L)}
                ${C?this._labelOrbit(z[2],k):B}
                ${this._handleOrbit(h,"low")}
                ${this._handleOrbit(p,"high")}
              `:U`
                ${this._dotOrbit(l,"setpoint")}
                ${n?this._dotOrbit(d,"current"):B}
                ${this.showCurrentAsPrimary?this._labelOrbit(l,U`<span class="num">${this._fmtLabel(this._displayValue,"Target")}</span>`):c?this._labelOrbit(d,U`<span class="num current with-icon"
                          ><ha-icon class="mode-icon inline" icon=${r} aria-hidden="true"></ha-icon
                          >${this._fmtLabel(this.current,"Current")}</span
                        >`):U`
                         ${e?B:this._labelOrbit(l,A,!0)}
                        ${n?this._labelOrbit(d,k):B}
                      `}
                ${this._handleOrbit(l,null)}
              `}
        </div>

        ${this.dual&&!this.readonly?this._renderDualCenter():this._renderSingleCenter()}
        ${this._renderPresetIcon()} ${this.readonly?B:this._renderAdjust()}
      </div>
    `}_renderStatus(){return this.disabled&&this.modeLabel?U`<div class="mode">${this.modeLabel}</div>`:B}_renderPresetIcon(){return this.presetIcon?U`<ha-icon
          class="preset-icon"
          icon=${this.presetIcon}
          style=${this.presetIconColor?`color: ${this.presetIconColor}`:B}
        ></ha-icon>`:B}_renderSingleCenter(){const t=this._displayValue,e=this.current,i=this.readonly||this.showCurrentAsPrimary&&null!=e,s=i?e:t,o=i?1:this._precision;return U`
      <div class=${me({center:!0,tight:this._centerTight})}>
        ${this._renderStatus()}
        <div class="temp" aria-hidden="true">
          <span class="value-text">${this._fmtCenter(s,o)}</span>
          <span class="unit">${this.unit}</span>
        </div>
        <span class="sr-only">${i?"Current":"Target"} temperature ${this._fmt(s,o).replace(/\.0$/,"")} ${this.unit}</span>
      </div>
    `}_renderDualCenter(){if(this._showRange){if(this.showCurrentAsPrimary&&null!=this.current)return U`<div class=${me({center:!0,tight:this._centerTight})}>
          ${this._renderStatus()}
          <div class="temp current-primary" aria-hidden="true"><span class="value-text">${this._fmtCenter(this.current,1)}</span><span class="unit">${this.unit}</span></div>
          <span class="sr-only">Current temperature ${this._fmt(this.current,1).replace(/\.0$/,"")} ${this.unit}</span>
          <div class="temp dual settled secondary">
            <span class="value-text">${this._fmtCompact(this._displayLow)}</span>
            <span class="dash">–</span>
            <span class="value-text">${this._fmtCompact(this._displayHigh)}</span>
            <span class="unit">${this.unit}</span>
          </div>
        </div>`;const t=this._dragging||this._showRangeTimer;return U`
        <div class=${me({center:!0,tight:this._centerTight})}>
          ${this._renderStatus()}
          <div class=${me({temp:!0,dual:!0,settled:!t})}>
            <span class="value-text">${this._fmt(this._displayLow,this._precision)}</span>
            <span class="dash">–</span>
            <span class="value-text">${this._fmt(this._displayHigh,this._precision)}</span>
            <span class="unit">${this.unit}</span>
          </div>
        </div>
      `}const t="cool"===this._dualActive?this._displayHigh:this._displayLow,e=this.showCurrentAsPrimary&&null!=this.current,i=e?this.current:t,s=e?1:this._precision;return U`
      <div class=${me({center:!0,tight:this._centerTight})}>
        ${this._renderStatus()}
        <div class="temp">
          <span class="value-text">${this._fmt(i,s)}</span>
          <span class="unit">${this.unit}</span>
        </div>
      </div>
    `}_renderAdjust(){return U`
      <div class="adjust">
        <button
          class="step"
          aria-label="Decrease temperature"
          ?disabled=${this.disabled}
          @click=${()=>this._step(-1)}
        >
          <ha-icon icon="mdi:minus"></ha-icon>
        </button>
        <button
          class="step"
          aria-label="Increase temperature"
          ?disabled=${this.disabled}
          @click=${()=>this._step(1)}
        >
          <ha-icon icon="mdi:plus"></ha-icon>
        </button>
      </div>
    `}};$e.IDLE_COLOR="var(--mt-on-surface-variant)",$e.styles=[Mt,r`
      :host {
        display: block;
        /* Fill the wrapper so the dial has a DEFINITE width. A container
           (container-type below) reports zero intrinsic width, so without this
           the shrink-to-fit host would collapse to ~0 and the dial vanishes. */
        width: 100%;
        /* no grey flash when a tap lands on the dial (mobile WebKit/Blink) */
        -webkit-tap-highlight-color: transparent;
      }
      .sr-only {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip: rect(0 0 0 0);
        clip-path: inset(50%);
        white-space: nowrap;
      }
      .dial {
        --edge: 125;
        position: relative;
        width: 100%;
        max-width: 320px;
        margin: 0 auto;
        aspect-ratio: 1 / 1;
        transition:
          --dial-color var(--mt-motion-dur) var(--mt-motion-ease),
          --mode-tint var(--mt-motion-dur) var(--mt-motion-ease),
          --mode-light var(--mt-motion-dur) var(--mt-motion-ease);
        /* let inner text/markers scale with the dial via cqi units */
        container-type: inline-size;
        /* The orbiting marker layers are full-size squares rotated to ride the
           arc; a rotated square's corners poke past the dial box. Clip them here
           so they don't add page-level horizontal overflow on mobile (the corners
           are empty, so nothing visible is lost). */
        overflow: hidden;
      }
      svg {
        display: block; /* avoid inline baseline gap that offsets the SVG vs marker overlays */
        width: 100%;
        height: 100%;
        /* A swipe over the dial scrolls the page; a tap on the ring sets the
           temperature; scrubbing is done by dragging a setpoint handle (which
           claims its own gesture). */
        touch-action: pan-y;
        outline: none;
        /* the dial is tap/drag controlled — no text selection or grey tap flash */
        -webkit-tap-highlight-color: transparent;
        -webkit-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
      .disc,
      .glow,
      .ring,
      .value {
        pointer-events: none;
      }
      .hit {
        fill: none;
        stroke: transparent;
        stroke-width: 50;
        stroke-linecap: butt;
        pointer-events: stroke;
        /* a swipe here scrolls the page (pan-y); a tap sets the temperature —
           the gesture is only swallowed when dragging a setpoint handle */
        touch-action: pan-y;
        cursor: pointer;
      }
      .dial.disabled .hit {
        cursor: default;
      }
      /* Invisible, finger-sized drag target centered on a setpoint dot. It rides
         the ring via the same orbit/rotate as the markers. Dragging it scrubs
         the dial; touch-action:none keeps a scroll from interrupting the drag. */
      .handle {
        position: absolute;
        left: 50%;
        top: 9.375%; /* on the ring centerline, like .o-dot */
        width: clamp(34px, 16cqi, 48px);
        height: clamp(34px, 16cqi, 48px);
        transform: translate(-50%, -50%);
        border-radius: 50%;
        pointer-events: auto;
        touch-action: none;
        cursor: grab;
        transition: top var(--mt-motion-dur) var(--mt-motion-ease);
        -webkit-tap-highlight-color: transparent;
      }
      .handle:active {
        cursor: grabbing;
      }
      .dial.disabled .handle {
        pointer-events: none;
        cursor: default;
      }
      .ring,
      .value {
        transform-box: view-box;
        transform-origin: 160px 160px;
      }
      .ring {
        fill: none;
        stroke: var(--dial-color);
        stroke-width: 10;
        stroke-linecap: round;
        opacity: 0.18;
        transition:
          stroke-width var(--mt-motion-dur) var(--mt-motion-ease),
          transform var(--mt-motion-dur) var(--mt-motion-ease);
      }
      .value {
        fill: none;
        stroke: var(--dial-color);
        stroke-width: 10;
        stroke-linecap: round;
        transition:
          stroke-width var(--mt-motion-dur) var(--mt-motion-ease),
          transform var(--mt-motion-dur) var(--mt-motion-ease),
          stroke-dasharray var(--mt-motion-dur) var(--mt-motion-ease),
          stroke-dashoffset var(--mt-motion-dur) var(--mt-motion-ease),
          stroke var(--mt-motion-dur) var(--mt-motion-ease),
          opacity var(--mt-motion-dur) var(--mt-motion-ease);
      }
      .glow {
        transition: opacity var(--mt-motion-dur) var(--mt-motion-ease);
      }
      .dial.off .glow,
      .dial.idle .glow {
        opacity: 0.5;
      }
      .dial.style-minimal .glow,
      .dial.style-google .glow {
        opacity: 0;
      }
      /* Mode-change wipe: an overlay of the OLD color value segment is laid over
         the dial — now painted in the NEW color — and slides out through the
         right end of the arc (driven by the Web Animations API in _runWipe),
         while the new color slides in from the left behind it. */
      .wipe-value {
        pointer-events: none;
        transition:
          stroke-width var(--mt-motion-dur) var(--mt-motion-ease),
          transform var(--mt-motion-dur) var(--mt-motion-ease);
      }
      .dial.dragging .ring,
      .dial.dragging .value,
      .dial.dragging .wipe-value {
        /* REST_OUTER = RADIUS + 10/2 = 135; DRAG_WIDTH = 17;
           DRAG_CENTER = REST_OUTER - DRAG_WIDTH/2 = 126.5;
           DRAG_SCALE = DRAG_CENTER/RADIUS = 126.5/130. Scale the stroke too,
           keeping the outer edge fixed without ever changing the path's d. */
        transform: scale(calc(126.5 / 130));
        stroke-width: 17.470356; /* 17 / (126.5 / 130), before scaling */
      }

      /* Markers orbit the center so they ride the arc and stay on the ring. */
      .markers {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .orbit {
        position: absolute;
        inset: 0;
        transform-origin: 50% 50%;
        transition: transform var(--mt-motion-dur) var(--mt-motion-ease);
      }
      .o-dot {
        position: absolute;
        left: 50%;
        top: 9.375%; /* (160-130)/320 — on the ring centerline */
        transform: translate(-50%, -50%);
        border-radius: 50%;
        background: var(--mt-on-surface);
      }
      .o-dot.setpoint {
        width: clamp(9px, 4.4cqi, 14px);
        height: clamp(9px, 4.4cqi, 14px);
        transition:
          top var(--mt-motion-dur) var(--mt-motion-ease),
          width var(--mt-motion-dur) var(--mt-motion-ease),
          height var(--mt-motion-dur) var(--mt-motion-ease),
          border-radius var(--mt-motion-dur) var(--mt-motion-ease),
          box-shadow var(--mt-motion-dur) var(--mt-motion-ease),
          transform var(--mt-motion-dur) var(--mt-motion-ease);
      }
      .dial:not(.dual):not(.off) .o-dot.setpoint {
        background: var(--mode-light);
      }
      /* The setpoint the +/- buttons act on (dual mode): a ring in the dial color
         around the dot makes the active handle obvious. */
      .o-dot.setpoint.sel {
        box-shadow: 0 0 0 3px color-mix(in srgb, var(--dial-color) 70%, transparent);
      }
      .o-dot.current {
        width: clamp(7px, 3.1cqi, 10px);
        height: clamp(7px, 3.1cqi, 10px);
        opacity: 1;
        transition:
          top var(--mt-motion-dur) var(--mt-motion-ease),
          width var(--mt-motion-dur) var(--mt-motion-ease),
          height var(--mt-motion-dur) var(--mt-motion-ease),
          border-radius var(--mt-motion-dur) var(--mt-motion-ease);
      }
      .dial.dragging .o-dot,
      .dial.dragging .handle {
        top: 10.469%; /* (160-126.5)/320 — follow the drag band centerline */
      }
      .dial.dragging .o-dot.setpoint {
        width: clamp(3px, 1.75cqi, 6px);
        height: 8.125cqi;
        border-radius: 999px;
      }
      .dial.dragging .o-dot.current {
        width: clamp(2px, 1.2cqi, 4px);
        height: 7.5cqi;
        border-radius: 999px;
      }
      .o-label {
        position: absolute;
        left: 50%;
        top: calc((160 - (var(--edge) - 5.5 - var(--s, 6))) / 320 * 100%);
        transition:
          transform var(--mt-motion-dur) var(--mt-motion-ease),
          top var(--mt-motion-dur) var(--mt-motion-ease);
      }
      .dial.dragging {
        --edge: 116;
      }
      /* Only the integer participates in centring; the decimal hangs top-right. */
      .o-label .label-number {
        position: relative;
        display: inline-block;
      }
      .o-label sup {
        position: absolute;
        left: 100%;
        top: 0.085em;
        font-size: 0.56em;
        line-height: 1;
        margin-left: 0.05em;
      }
      .o-label .num {
        font-size: clamp(8px, 4.77cqi, 15.3px);
        font-weight: var(--mt-label-weight, 500);
        line-height: 1;
        color: var(--mt-on-surface);
        white-space: nowrap;
      }
      .o-label .num.current {
        color: var(--mt-on-surface);
      }
      /* The selected setpoint's number, tinted to match its highlighted dot. */
      .o-label .num.sel {
        color: var(--dial-color);
      }
      /* Merged marker: temperature stays anchored at its angle; the mode icon
         hangs to its left, vertically centered. */
      .o-label .num.with-icon {
        position: relative;
      }
      .mode-icon {
        --mdc-icon-size: clamp(11px, 5cqi, 16px);
        color: var(--mode-tint, var(--dial-color));
      }
      .dual-mode-icon {
        /* Registered properties have an initial value, so var() cannot fall back
           when --mode-tint is omitted. Dual icons must follow the dial directly. */
        color: var(--dial-color);
      }
      .mode-icon.inline {
        position: absolute;
        right: 100%;
        top: 50%;
        transform: translateY(-50%);
        margin-right: 4px;
      }

      .center {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 2px;
        pointer-events: none;
        color: var(--mt-on-surface);
      }
      .mode {
        font-size: clamp(10px, 5cqi, var(--md-sys-typescale-title-medium-size, 16px));
        color: var(--mt-on-surface-variant);
        font-weight: 500;
      }
      /* Preset icon (à la Google Home's eco leaf) — pinned just above the +/-
         controls and horizontally centered, so it never shifts the temperature
         off the dial's true center. */
      .preset-icon {
        position: absolute;
        left: 50%;
        top: 70%;
        transform: translate(-50%, -50%);
        --mdc-icon-size: clamp(14px, 7cqi, 22px);
        color: var(--mt-on-surface-variant);
        pointer-events: none;
      }
      .temp {
        display: flex;
        align-items: flex-start;
        line-height: 1;
      }
      .temp.dual {
        align-items: center;
        gap: 6px;
      }
      /* The heat/cool range packs two numbers + a dash + unit across the dial, so
         it is sized well below the single-mode hero number — even while being
         actively changed — and shrinks a touch more once it settles. */
      .temp.dual .value-text {
        font-size: clamp(13px, 7cqi, 24px);
      }
      .temp.dual .dash {
        font-size: clamp(13px, 7cqi, 24px);
        color: var(--mt-on-surface-variant);
      }
      /* At rest (not dragging / >5s after a change) the range shrinks so it isn't
         oversized when it's just sitting there idle. */
      .temp.dual.settled .value-text,
      .temp.dual.settled .dash {
        font-size: clamp(12px, 5.5cqi, 20px);
      }
      /* A numeric marker near 3/9 o'clock crowds the centre readout — shrink and
         allow the value/unit to wrap so the orbiting labels don't overlap it. */
      .center.tight .temp {
        max-width: 46%;
        flex-wrap: wrap;
        justify-content: center;
      }
      .center.tight .value-text {
        font-size: clamp(13px, 14cqi, 46px);
      }
      .center.tight .unit {
        font-size: clamp(9px, 5cqi, 16px);
      }
      .center.tight .temp.dual .value-text,
      .center.tight .temp.dual .dash {
        font-size: clamp(12px, 7cqi, 22px);
      }
      .value-text {
        font-size: clamp(22px, 20cqi, var(--md-sys-typescale-display-large-size, 64px));
        font-weight: var(--mt-centre-weight, 400);
        font-variation-settings: var(--mt-centre-axes, normal);
        font-optical-sizing: auto;
        letter-spacing: -0.02em;
        color: var(--dial-color);
      }
      /* Only the integer contributes to a superscript number's layout box. */
      .dial:not(.dual) .value-text,
      .current-primary .value-text {
        position: relative;
      }
      .value-text sup {
        position: absolute;
        left: 100%;
        top: -0.1em;
        font-size: 0.4em;
        line-height: 1;
        margin-left: 0.05em;
      }
      .unit {
        font-size: clamp(11px, 7cqi, var(--md-sys-typescale-title-large-size, 22px));
        margin-top: 0.4em;
        margin-left: 2px;
        color: var(--mt-on-surface-variant);
      }
      .dial:not(.dual) .center:not(.tight) .temp:not(.dual) .value-text {
        font-size: clamp(23px, 21.2cqi, 67.84px);
      }
      .dial:not(.dual) .temp .unit,
      .current-primary .unit {
        display: none;
      }
      .temp.dual .unit {
        margin-top: 0;
        align-self: center;
      }
      .adjust {
        position: absolute;
        left: 50%;
        top: 87.9%;
        transform: translate(-50%, -50%);
        display: grid;
        width: 34%;
        grid-template-columns: repeat(2, 1fr);
        justify-items: center; /* button centres at 50% ± 8.5% of the dial */
        pointer-events: none;
      }
      .step {
        font: inherit;
        /* scale with the dial; low floor so the buttons shrink with the circle
           (not pinned large) at small sizes */
        width: clamp(22px, 11cqi, 38px);
        height: clamp(22px, 11cqi, 38px);
        border-radius: var(--mt-shape-full);
        border: none;
        background: transparent;
        color: var(--mt-on-surface);
        display: grid;
        place-items: center;
        cursor: pointer;
        pointer-events: auto;
        transition:
          background-color 180ms var(--mt-motion-ease),
          transform 120ms var(--mt-motion-ease);
        -webkit-tap-highlight-color: transparent;
      }
      .step ha-icon {
        --mdc-icon-size: clamp(12px, 6.25cqi, 20px);
      }
      .step:hover:not([disabled]) {
        background: color-mix(in srgb, var(--mt-on-surface) 8%, transparent);
      }
      .step:active:not([disabled]) {
        transform: scale(0.92);
      }
      .step[disabled] {
        opacity: 0.38;
        cursor: default;
      }
    `],t([mt({type:Number})],$e.prototype,"value",void 0),t([mt({type:Number})],$e.prototype,"min",void 0),t([mt({type:Number})],$e.prototype,"max",void 0),t([mt({type:Number})],$e.prototype,"step",void 0),t([mt({type:Number})],$e.prototype,"current",void 0),t([mt()],$e.prototype,"mode",void 0),t([mt()],$e.prototype,"dialStyle",void 0),t([mt()],$e.prototype,"hvacAction",void 0),t([mt()],$e.prototype,"modeLabel",void 0),t([mt()],$e.prototype,"presetIcon",void 0),t([mt()],$e.prototype,"presetIconColor",void 0),t([mt({attribute:!1})],$e.prototype,"modeColors",void 0),t([mt({attribute:!1})],$e.prototype,"modeIcons",void 0),t([mt()],$e.prototype,"unit",void 0),t([mt({type:Boolean})],$e.prototype,"showCurrentAsPrimary",void 0),t([mt({type:Boolean})],$e.prototype,"disabled",void 0),t([mt({attribute:!1})],$e.prototype,"formatNumber",void 0),t([mt({type:Boolean})],$e.prototype,"readonly",void 0),t([mt({type:Boolean})],$e.prototype,"dual",void 0),t([mt({type:Number})],$e.prototype,"lowValue",void 0),t([mt({type:Number})],$e.prototype,"highValue",void 0),t([ft()],$e.prototype,"_dragging",void 0),t([ft()],$e.prototype,"_dragValue",void 0),t([ft()],$e.prototype,"_dragLow",void 0),t([ft()],$e.prototype,"_dragHigh",void 0),t([ft()],$e.prototype,"_activeHandle",void 0),t([ft()],$e.prototype,"_selected",void 0),t([ft()],$e.prototype,"_wipeFrom",void 0),t([ft()],$e.prototype,"_showRangeTimer",void 0),t([gt("svg")],$e.prototype,"_svg",void 0),$e=fe=t([ht("mt-circular-dial")],$e);const ke=r`
  .tile {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    /* 40px icon chip + 24px vertical padding = 64px. Capped title/value
       line-heights keep the text shorter than the chip, so every tile variant
       (full, icon-only, and the dropdown/climate tiles) lands on the same 64px
       height and lines up in a mixed feature row. */
    min-height: 64px;
    box-sizing: border-box;
    border: none;
    /* "off" tiles are squarer rounded rectangles; "on" tiles morph to the
       fully rounded pill shape (see the .tile.on rule below). */
    border-radius: var(--mt-shape-chip-square);
    background: var(--mt-surface-container);
    color: var(--mt-on-surface);
    cursor: pointer;
    font: inherit;
    text-align: left;
    transition:
      background-color 200ms cubic-bezier(0.2, 0, 0, 1),
      border-radius 260ms cubic-bezier(0.2, 0, 0, 1),
      color 200ms cubic-bezier(0.2, 0, 0, 1);
    -webkit-tap-highlight-color: transparent;
  }
  .tile:hover {
    background: color-mix(in srgb, var(--mt-on-surface) 6%, var(--mt-surface-container));
  }
  .tile:active {
    background: color-mix(in srgb, var(--mt-on-surface) 12%, var(--mt-surface-container));
  }
  .tile.on {
    /* Fully rounded pill corners + a soft tint of the accent (the HVAC mode color
       for the climate selector, else the primary). */
    border-radius: var(--mt-shape-full);
    background: color-mix(in srgb, var(--mt-tile-accent, var(--mt-primary)) 16%, var(--mt-surface-container));
    color: var(--mt-tile-accent, var(--mt-primary));
  }
  .tile.on:hover {
    background: color-mix(in srgb, var(--mt-tile-accent, var(--mt-primary)) 22%, var(--mt-surface-container));
  }
  .tile .ic {
    flex: 0 0 auto;
    width: 40px;
    height: 40px;
    border-radius: var(--mt-shape-full);
    display: grid;
    place-items: center;
    background: color-mix(in srgb, var(--mt-on-surface-variant) 14%, transparent);
    color: var(--mt-on-surface-variant);
    transition:
      background-color 200ms cubic-bezier(0.2, 0, 0, 1),
      color 200ms cubic-bezier(0.2, 0, 0, 1);
  }
  .tile.on .ic {
    background: color-mix(in srgb, var(--mt-tile-accent, var(--mt-primary)) 26%, transparent);
    color: var(--mt-tile-accent, var(--mt-primary));
  }
  .tile .ic ha-icon {
    --mdc-icon-size: 22px;
  }
  .tile .ic .dot {
    background: currentColor;
  }
  .tile .text {
    display: flex;
    flex-direction: column;
    min-width: 0;
    flex: 1;
  }
  .tile .title {
    font-size: var(--md-sys-typescale-label-medium-size, 13px);
    line-height: 1.2;
    font-weight: 500;
    color: var(--mt-on-surface-variant);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tile.on .title {
    color: currentColor;
  }
  .tile .value {
    font-size: var(--md-sys-typescale-body-large-size, 16px);
    line-height: 1.2;
    font-weight: 500;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--mt-on-surface-variant);
    flex: 0 0 auto;
  }
`;let Ae=class extends dt{constructor(){super(...arguments),this.items=[],this.placeholder="",this.variant="pill",this.label="",this.forceOff=!1,this._open=!1,this._up=!1,this._alignRight=!1,this._onDocClick=t=>{this._open&&!t.composedPath().includes(this)&&(this._open=!1)},this._onOtherOpen=t=>{t.detail!==this&&(this._open=!1)}}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onDocClick),document.addEventListener("mt-dropdown-open",this._onOtherOpen)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._onDocClick),document.removeEventListener("mt-dropdown-open",this._onOtherOpen)}get _active(){return this.items.find(t=>t.active)}get _disabled(){return this.items.every(t=>t.disabled)}get _tileOn(){if(this.forceOff)return!1;const t=this._active;return!!t&&!Ut(t.value)}_toggle(t){if(t.stopPropagation(),!this._disabled){if(!this._open){const t=this.getBoundingClientRect();this._up=t.bottom>.55*window.innerHeight,this._alignRight=t.left+t.width/2>.5*window.innerWidth,document.dispatchEvent(new CustomEvent("mt-dropdown-open",{detail:this}))}this._open=!this._open}}_select(t,e){t.stopPropagation(),this.items.find(t=>t.value===e)?.disabled||(this._open=!1,this.dispatchEvent(new CustomEvent("item-selected",{detail:{value:e}})))}render(){const t=this._active,e="tile"===this.variant?this._renderTile(t):this._renderPill(t);return U`${e}${this._open&&!this._disabled?this._renderMenu():B}`}_renderPill(t){return U`
      <button
        class=${me({trigger:!0,open:this._open})}
        aria-haspopup="listbox"
        ?disabled=${this._disabled}
        aria-expanded=${this._open?"true":"false"}
        @click=${this._toggle}
      >
        ${t?""===t.icon?B:t.icon?U`<ha-icon class="lead" icon=${t.icon}></ha-icon>`:U`<span class="dot"></span>`:U`<ha-icon class="lead" icon="mdi:tune-variant"></ha-icon>`}
        <span class="label">${t?.label??"—"}</span>
        <ha-icon class="chev" icon="mdi:chevron-down"></ha-icon>
      </button>
    `}_renderTile(t){const e=t?.color?`--mt-tile-accent: ${t.color}`:B;return U`
      <button
        class=${me({tile:!0,on:this._tileOn,open:this._open})}
        style=${e}
        aria-haspopup="listbox"
        ?disabled=${this._disabled}
        aria-expanded=${this._open?"true":"false"}
        @click=${this._toggle}
      >
        ${""===t?.icon?B:U`<div class="ic">
              ${t?t.icon?U`<ha-icon icon=${t.icon}></ha-icon>`:U`<span class="dot"></span>`:U`<ha-icon icon="mdi:tune-variant"></ha-icon>`}
            </div>`}
        <div class="text">
          ${this.label?U`<div class="title">${this.label}</div>`:B}
          <div class="value">${t?.label??"—"}</div>
        </div>
      </button>
    `}_renderMenu(){return U`<div
      class=${me({menu:!0,up:this._up,right:this._alignRight})}
      role="listbox"
    >
      ${this.items.map(t=>U`<button
          class=${me({opt:!0,active:!!t.active})}
          role="option"
          aria-selected=${t.active?"true":"false"}
          aria-disabled=${t.disabled?"true":"false"}
          ?disabled=${t.disabled}
          tabindex=${t.disabled?"-1":"0"}
          @click=${e=>this._select(e,t.value)}
        >
          ${""===t.icon?B:t.icon?U`<ha-icon icon=${t.icon}></ha-icon>`:U`<span class="dot"></span>`}
          <span class="label">${t.label}</span>
          ${t.active?U`<ha-icon class="check" icon="mdi:check"></ha-icon>`:B}
        </button>`)}
    </div>`}};Ae.styles=[Mt,ke,r`
      :host {
        position: relative;
        display: block;
        width: 100%;
      }
      .trigger {
        width: 100%;
        height: 48px;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 0 16px;
        border: none;
        border-radius: var(--mt-shape-full);
        background: var(--mt-surface-container);
        color: var(--mt-on-surface);
        cursor: pointer;
        font: inherit;
        transition: background-color 180ms cubic-bezier(0.2, 0, 0, 1);
        -webkit-tap-highlight-color: transparent;
      }
      .trigger:hover {
        background: color-mix(in srgb, var(--mt-on-surface) 6%, var(--mt-surface-container));
      }
      .trigger .label {
        flex: 1;
        text-align: left;
        font-size: var(--md-sys-typescale-body-large-size, 16px);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .trigger .lead {
        --mdc-icon-size: 22px;
        color: var(--mt-on-surface-variant);
      }
      .trigger .chev {
        --mdc-icon-size: 24px;
        color: var(--mt-on-surface-variant);
        transition: transform 200ms cubic-bezier(0.2, 0, 0, 1);
      }
      .trigger.open .chev {
        transform: rotate(180deg);
      }
      .menu {
        --mt-menu-padding: 6px;
        --mt-menu-item-height: 44px;
        box-sizing: border-box;
        position: absolute;
        left: 0;
        right: auto;
        top: calc(100% + 6px);
        z-index: 20;
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding: var(--mt-menu-padding);
        /* at least as wide as the trigger, but grow to fit the widest option
           (so long labels aren't clipped); capped so it stays on screen */
        min-width: 100%;
        width: max-content;
        max-width: min(360px, 85vw);
        background: var(--mt-surface-container-high);
        border-radius: calc(var(--mt-menu-item-height) / 2 + var(--mt-menu-padding));
        box-shadow:
          0 4px 12px rgba(0, 0, 0, 0.3),
          0 1px 3px rgba(0, 0, 0, 0.2);
        max-height: 280px;
        overflow-y: auto;
        animation: mt-pop 130ms cubic-bezier(0.2, 0, 0, 1);
      }
      /* anchor to the right edge so a content-wide menu grows into the card */
      .menu.right {
        left: auto;
        right: 0;
      }
      .menu.up {
        top: auto;
        bottom: calc(100% + 6px);
      }
      .opt {
        box-sizing: border-box;
        min-height: var(--mt-menu-item-height);
        flex-shrink: 0;
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 10px 12px;
        border: none;
        background: transparent;
        color: var(--mt-on-surface);
        border-radius: var(--mt-shape-full);
        cursor: pointer;
        font: inherit;
        text-align: left;
      }
      .opt .label {
        flex: 1;
        white-space: nowrap;
      }
      .opt ha-icon {
        --mdc-icon-size: 22px;
      }
      .opt:hover {
        background: color-mix(in srgb, var(--mt-on-surface) 8%, transparent);
      }
      .opt.active {
        background: var(--mt-secondary-container);
        color: var(--mt-on-secondary-container);
      }
      .opt .check {
        --mdc-icon-size: 20px;
        color: var(--mt-on-secondary-container);
      }
      button:disabled {
        opacity: 0.38;
        cursor: default;
        pointer-events: none;
      }
      @keyframes mt-pop {
        from {
          opacity: 0;
          transform: translateY(-4px);
        }
        to {
          opacity: 1;
          transform: none;
        }
      }
    `],t([mt({attribute:!1})],Ae.prototype,"items",void 0),t([mt()],Ae.prototype,"placeholder",void 0),t([mt()],Ae.prototype,"variant",void 0),t([mt()],Ae.prototype,"label",void 0),t([mt({type:Boolean})],Ae.prototype,"forceOff",void 0),t([ft()],Ae.prototype,"_open",void 0),t([ft()],Ae.prototype,"_up",void 0),t([ft()],Ae.prototype,"_alignRight",void 0),Ae=t([ht("mt-dropdown")],Ae);let Le=class extends dt{constructor(){super(...arguments),this.items=[],this.display="icons",this.forceOff=!1}_select(t){this.dispatchEvent(new CustomEvent("item-selected",{detail:{value:t},bubbles:!0,composed:!0}))}render(){if(!this.items.length)return B;if("tile"===this.display)return this._renderTile();const t="dropdown"===this.display?this._renderDropdown():this._renderIcons();return U`${this.label?U`<div class="title">${this.label}</div>`:B}${t}`}_renderIcons(){return U`
      <div
        class="chips"
        style=${`--chip-count: ${this.items.length}`}
        role="group"
        aria-label=${this.label??"options"}
      >
        ${this.items.map(t=>U`
            <button
              class=${me({chip:!0,active:!!t.active})}
              ?disabled=${t.disabled}
              title=${t.label}
              aria-label=${t.label}
              aria-pressed=${t.active?"true":"false"}
              @click=${()=>this._select(t.value)}
            >
              ${t.icon?U`<ha-icon icon=${t.icon}></ha-icon>`:U`<span class="chip-text">${t.label}</span>`}
            </button>
          `)}
      </div>
    `}_renderDropdown(){return U`<mt-dropdown
      .items=${this.items}
      .placeholder=${this.label??""}
      @item-selected=${t=>this._select(t.detail.value)}
    ></mt-dropdown>`}_renderTile(){return U`<mt-dropdown
      variant="tile"
      .items=${this.items}
      .label=${this.label??""}
      .forceOff=${this.forceOff}
      @item-selected=${t=>this._select(t.detail.value)}
    ></mt-dropdown>`}};function Ce(t){return Array.isArray(t)?t.filter(t=>"string"==typeof t):[]}Le.styles=[Mt,r`
      :host {
        display: block;
        width: 100%;
        min-width: 0;
      }
      .title {
        color: var(--mt-on-surface-variant);
        font-size: var(--md-sys-typescale-label-large-size, 13px);
        font-weight: 500;
        padding: 0 4px 6px;
      }
      .chips {
        display: flex;
        align-items: center;
        justify-content: safe center;
        /* Spend spare width on padding and the original gap, then shrink equal
           chips with neither horizontal padding nor gap under pressure. */
        gap: clamp(
          0px,
          calc((100% - var(--chip-count) * 44px) / max(1, var(--chip-count) - 1)),
          4px
        );
        padding: 4px
          clamp(0px, calc((100% - var(--chip-count) * 44px - (var(--chip-count) - 1) * 4px) / 2), 2px);
        background: var(--mt-surface-container);
        border-radius: var(--mt-shape-full);
        /* Scroll only when the available width cannot hold 22px per chip.
           This extreme-width floor is below WCAG 2.5.8's 24px target size. */
        min-width: 0;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: none;
      }
      .chips::-webkit-scrollbar {
        display: none;
      }
      .chip {
        /* Footprint 44px + 4px gap = 48px per icon. Grow to fill, capped so
           icons never over-stretch when there is spare room. */
        flex: 1 1 44px;
        height: 44px;
        min-width: 22px;
        max-width: 120px;
        display: grid;
        grid-template-columns: minmax(0, 1fr);
        place-items: center;
        container-type: inline-size;
        border: none;
        border-radius: var(--mt-shape-full);
        background: transparent;
        color: var(--mt-on-surface-variant);
        cursor: pointer;
        padding: 0 8px;
        transition:
          background-color 180ms cubic-bezier(0.2, 0, 0, 1),
          color 180ms cubic-bezier(0.2, 0, 0, 1);
        -webkit-tap-highlight-color: transparent;
      }
      .chip:focus-visible {
        /* Use the contrasting chip foreground; keep the outline inside the scrolling row. */
        outline: 2px solid currentColor;
        outline-offset: -2px;
      }
      .chip ha-icon {
        --mdc-icon-size: clamp(18px, 100cqi, 24px);
      }
      .chip-text {
        min-width: 0;
        max-width: 100%;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: var(--md-sys-typescale-label-large-size, 14px);
        font-weight: 500;
        white-space: nowrap;
      }
      .chip:hover:not(.active):not([disabled]) {
        background: color-mix(in srgb, var(--mt-on-surface) 8%, transparent);
      }
      .chip:active:not([disabled]) {
        background: color-mix(in srgb, var(--mt-on-surface) 12%, transparent);
      }
      .chip.active {
        background: var(--mt-selected-bg, var(--mt-primary));
        color: var(--mt-selected-fg, var(--mt-on-primary));
      }
      .chip[disabled] {
        opacity: 0.38;
        cursor: default;
      }
    `],t([mt({attribute:!1})],Le.prototype,"items",void 0),t([mt()],Le.prototype,"display",void 0),t([mt()],Le.prototype,"label",void 0),t([mt({type:Boolean})],Le.prototype,"forceOff",void 0),Le=t([ht("mt-selector-row")],Le);const Me={hvac:"Mode",fan:"Fan",swing:"Swing",preset:"Preset",swing_horizontal:"Horizontal swing",operation:"Mode"};let Se=class extends dt{constructor(){super(...arguments),this.kind="hvac",this.display="icons"}get _stateObj(){return this.hass?.states?.[this.entityId]}_overrideMap(){const t=new Map;return(this.options??[]).forEach(e=>t.set(e.value,e)),t}_build(){const t=this._stateObj;if(!t)return[];const e=this._overrideMap();let i,s,o,a=[];return"hvac"===this.kind?(a=Ce(t.attributes.hvac_modes),i=t.state,s=t=>St[t]??"mdi:thermostat",o=t=>Tt(t)):"fan"===this.kind?(a=Ce(t.attributes.fan_modes),i=t.attributes.fan_mode,s=t=>Rt(t),o=()=>{}):"preset"===this.kind?(a=Ce(t.attributes.preset_modes),i=t.attributes.preset_mode,s=t=>Dt(t),o=t=>Zt(t)):"operation"===this.kind?(a=function(t){const e=t=>{const e=Et.indexOf(t);return-1===e?1/0:e};return[...t].sort((t,i)=>e(t)-e(i))}(Ce(t.attributes.operation_list)),i=t.state,s=Pt,o=It):"swing_horizontal"===this.kind?(a=Ce(t.attributes.swing_horizontal_modes),i=t.attributes.swing_horizontal_mode,s=Vt,o=()=>{}):(a=Ce(t.attributes.swing_modes),i=t.attributes.swing_mode,s=t=>Ft(t),o=()=>{}),jt(a,Ce(this.order),Ce(this.include)).filter(t=>!e.get(t)?.hide).map(a=>({value:a,label:e.get(a)?.label??("hvac"===this.kind||"operation"===this.kind?Yt(this.hass,t,a):Jt(this.hass,t,`${this.kind}_mode`,a)),icon:e.get(a)?.icon??s(a),active:"string"==typeof i&&a===i,color:e.get(a)?.color??o(a),disabled:Kt(t)}))}_onSelect(t){const e=t.detail.value;if(Kt(this._stateObj))return;const i=this.entityId;"hvac"===this.kind?this.hass.callService("climate","set_hvac_mode",{entity_id:i,hvac_mode:e}):"fan"===this.kind?this.hass.callService("climate","set_fan_mode",{entity_id:i,fan_mode:e}):"preset"===this.kind?this.hass.callService("climate","set_preset_mode",{entity_id:i,preset_mode:e}):"operation"===this.kind?this.hass.callService("water_heater","set_operation_mode",{entity_id:i,operation_mode:e}):"swing_horizontal"===this.kind?this.hass.callService("climate","set_swing_horizontal_mode",{entity_id:i,swing_horizontal_mode:e}):this.hass.callService("climate","set_swing_mode",{entity_id:i,swing_mode:e})}render(){const t=this._build();if(!t.length)return B;const e="hvac"===this.kind||"operation"===this.kind?`--mt-selected-bg: var(--md-sys-color-primary, ${("operation"===this.kind?It:Tt)(this._stateObj.state)}); --mt-selected-fg: var(--md-sys-color-on-primary, #fff);`:B,i=this.label??("tile"===this.display?"hvac"===this.kind?te(this.hass,"ui.card.climate.mode","Mode"):Qt(this.hass,this._stateObj,`${this.kind}_mode`,Me[this.kind]):void 0),s="off"===this._stateObj.state;return U`
      <mt-selector-row
        .items=${t}
        display=${this.display}
        .label=${i}
        .forceOff=${s}
        style=${e}
        @item-selected=${this._onSelect}
      ></mt-selector-row>
    `}};t([mt({attribute:!1})],Se.prototype,"hass",void 0),t([mt()],Se.prototype,"entityId",void 0),t([mt()],Se.prototype,"kind",void 0),t([mt()],Se.prototype,"display",void 0),t([mt()],Se.prototype,"label",void 0),t([mt({attribute:!1})],Se.prototype,"options",void 0),t([mt({attribute:!1})],Se.prototype,"order",void 0),t([mt({attribute:!1})],Se.prototype,"include",void 0),Se=t([ht("mt-climate-selector")],Se);let Ee=class extends dt{constructor(){super(...arguments),this.display="icons"}get _stateObj(){return this.hass?.states?.[this.entity]}_overrideMap(){const t=new Map;return(this.options??[]).forEach(e=>t.set(e.value,e)),t}_build(){const t=this._stateObj;if(!t)return[];const e=this._overrideMap();return jt(t.attributes.options??[],this.order).filter(t=>!e.get(t)?.hide).map(i=>({value:i,label:e.get(i)?.label??qt(i),icon:e.get(i)?.icon,active:i===t.state,color:e.get(i)?.color}))}_onSelect(t){this._stateObj&&this.hass.callService("input_select","select_option",{entity_id:this.entity,option:t.detail.value})}render(){const t=this._build();return t.length?U`<mt-selector-row
      .items=${t}
      display=${this.display}
      .label=${this.label}
      @item-selected=${this._onSelect}
    ></mt-selector-row>`:B}};t([mt({attribute:!1})],Ee.prototype,"hass",void 0),t([mt()],Ee.prototype,"entity",void 0),t([mt()],Ee.prototype,"display",void 0),t([mt()],Ee.prototype,"label",void 0),t([mt({attribute:!1})],Ee.prototype,"options",void 0),t([mt({attribute:!1})],Ee.prototype,"order",void 0),Ee=t([ht("mt-input-select")],Ee);let ze=class extends dt{constructor(){super(...arguments),this.entities=[],this.display="icons"}_build(){return(this.entities??[]).filter(t=>t.entity).map(t=>{const e=this.hass?.states?.[t.entity];return{value:t.entity,label:t.label??e?.attributes.friendly_name??t.entity,icon:t.icon??e?.attributes.icon??"mdi:toggle-switch-variant",active:"on"===e?.state,disabled:!e||"unavailable"===e.state,color:t.color}})}async _onSelect(t){const e=t.detail.value,i=(this.entities??[]).map(t=>t.entity).filter(t=>t&&t!==e&&"on"===this.hass.states[t]?.state);i.length&&await this.hass.callService("homeassistant","turn_off",{entity_id:i}),await this.hass.callService("homeassistant","turn_on",{entity_id:e})}render(){const t=this._build();return t.length?U`<mt-selector-row
      .items=${t}
      display=${this.display}
      .label=${this.label}
      @item-selected=${this._onSelect}
    ></mt-selector-row>`:B}};t([mt({attribute:!1})],ze.prototype,"hass",void 0),t([mt({attribute:!1})],ze.prototype,"entities",void 0),t([mt()],ze.prototype,"display",void 0),t([mt()],ze.prototype,"label",void 0),ze=t([ht("mt-switch-group")],ze);let Oe=class extends dt{constructor(){super(...arguments),this.entities=[]}_build(){return(this.entities??[]).filter(t=>t.entity).map(t=>{const e=this.hass?.states?.[t.entity];return{value:t.entity,label:t.label??e?.attributes.friendly_name??t.entity,icon:t.icon??e?.attributes.icon??"mdi:toggle-switch-variant",active:"on"===e?.state,disabled:!e||"unavailable"===e.state}})}_onSelect(t){this.hass.callService("homeassistant","toggle",{entity_id:t.detail.value})}render(){const t=this._build();return t.length?U`<mt-selector-row
      .items=${t}
      display="icons"
      .label=${this.label}
      @item-selected=${this._onSelect}
    ></mt-selector-row>`:B}};function Pe(t,e,i){switch(i.split(".")[0]){case"button":e.callService("button","press",{entity_id:i});break;case"input_button":e.callService("input_button","press",{entity_id:i});break;case"scene":e.callService("scene","turn_on",{entity_id:i});break;case"script":e.callService("script","turn_on",{entity_id:i});break;case"switch":case"light":case"fan":case"input_boolean":e.callService("homeassistant","toggle",{entity_id:i});break;default:yt(t,"hass-more-info",{entityId:i})}}t([mt({attribute:!1})],Oe.prototype,"hass",void 0),t([mt({attribute:!1})],Oe.prototype,"entities",void 0),t([mt()],Oe.prototype,"label",void 0),Oe=t([ht("mt-switch-list")],Oe);let Ie=class extends dt{constructor(){super(...arguments),this.items=[]}_build(){return(this.items??[]).filter(t=>t.entity).map(t=>{const e=this.hass?.states?.[t.entity];return{value:t.entity,label:t.label??e?.attributes.friendly_name??t.entity,icon:t.icon??e?.attributes.icon??"mdi:gesture-tap-button",active:!1,disabled:!e||"unavailable"===e.state}})}_onSelect(t){Pe(this,this.hass,t.detail.value)}render(){const t=this._build();return t.length?U`<mt-selector-row
      .items=${t}
      display="icons"
      .label=${this.label}
      @item-selected=${this._onSelect}
    ></mt-selector-row>`:B}};t([mt({attribute:!1})],Ie.prototype,"hass",void 0),t([mt({attribute:!1})],Ie.prototype,"items",void 0),t([mt()],Ie.prototype,"label",void 0),Ie=t([ht("mt-button-list")],Ie);const Te={sensor:"mdi:gauge",binary_sensor:"mdi:radiobox-marked",switch:"mdi:toggle-switch-variant",light:"mdi:lightbulb",fan:"mdi:fan",button:"mdi:gesture-tap-button",input_button:"mdi:gesture-tap-button",scene:"mdi:palette",script:"mdi:script-text"};let Re=class extends dt{constructor(){super(...arguments),this.forceOff=!1,this._tap=()=>{this.config.entity&&function(t,e,i,s){const o=s??{action:"default"};switch(o.action){case"none":return;case"more-info":return void yt(t,"hass-more-info",{entityId:o.entity??i});case"toggle":return void e.callService("homeassistant","toggle",{entity_id:i});case"url":return void(o.url_path&&window.open(o.url_path));case"navigate":return void(o.navigation_path&&(window.history.pushState(null,"",o.navigation_path),yt(t,"location-changed",{replace:!1})));case"call-service":case"perform-action":{const t=o.perform_action??o.service;if(!t||!t.includes("."))return;const[i,s]=t.split(".");return void e.callService(i,s,o.data??o.service_data??{},o.target)}default:Pe(t,e,i)}}(this,this.hass,this.config.entity,this.config.tap_action)}}get _stateObj(){return this.hass?.states?.[this.config.entity]}get _tileOn(){if(this.forceOff)return!1;const t=this._stateObj;return!!t&&!Ut(t.state)}_secondary(){const t=this._stateObj;if(!t)return;const e=this.config.entity.split(".")[0];if("sensor"===e){const e=t.attributes.unit_of_measurement;return e?`${t.state} ${e}`:t.state}return["switch","light","fan","input_boolean","binary_sensor"].includes(e)?"on"===t.state?"On":"Off":["button","input_button","scene","script"].includes(e)?void 0:t.state}render(){if(!this.config?.entity)return B;const t=this._stateObj,e=this.config.entity.split(".")[0],i=this.config.name??t?.attributes.friendly_name??this.config.entity,s=this.config.icon??t?.attributes.icon??Te[e]??"mdi:eye",o=this._secondary(),a=this._tileOn;if("icon"===(this.config.display??(this.config.compact?"icon":"tile")))return U`
        <button
          class=${me({tile:!0,icon:!0,on:a})}
          @click=${this._tap}
          aria-label=${i}
          title=${i}
        >
          <ha-icon icon=${s}></ha-icon>
        </button>
      `;const r=this.config.color?`--mt-tile-accent: ${this.config.color}`:B,n=o?`${i}: ${o}`:i;return U`
      <button
        class=${me({tile:!0,on:a})}
        style=${r}
        @click=${this._tap}
        aria-label=${n}
        title=${n}
      >
        <div class="ic"><ha-icon icon=${s}></ha-icon></div>
        <div class="text">
          <div class="title">${i}</div>
          ${o?U`<div class="value">${o}</div>`:B}
        </div>
      </button>
    `}};Re.styles=[Mt,ke,r`
      :host {
        display: block;
        container: mt-entity-tile / inline-size;
      }
      .tile .value {
        flex-shrink: 0;
      }
      /* Query the host's allocated width, not the padded button's content box.
         Keep both text lines; sacrifice the decorative chip before the reading. */
      @container mt-entity-tile (width < 120px) {
        .tile:not(.icon) {
          padding-inline: 12px;
        }
        .tile .ic {
          display: none;
        }
      }
      /* Icon display: a bare centered icon (no circle chip), at the same height
         as the full tile (inherits the shared .tile min-height) so mixed rows
         line up. Width is left to the user's configured column span. Still
         follows the tile roundness/color rules via .tile / .tile.on. */
      .tile.icon {
        justify-content: center;
      }
      .tile.icon:not(.on) {
        color: var(--mt-on-surface-variant);
      }
      .tile.icon ha-icon {
        --mdc-icon-size: 24px;
      }
    `],t([mt({attribute:!1})],Re.prototype,"hass",void 0),t([mt({attribute:!1})],Re.prototype,"config",void 0),t([mt({type:Boolean})],Re.prototype,"forceOff",void 0),Re=t([ht("mt-entity-tile")],Re);let Ze=class extends dt{constructor(){super(...arguments),this.items=[]}_value(t){const e=this.hass?.states?.[t.entity];if(!e||"unknown"===e.state||"unavailable"===e.state)return"—";const i=e.attributes.unit_of_measurement;return i?`${e.state} ${i}`:e.state}render(){const t=(this.items??[]).filter(t=>t.entity);return t.length?U`
      ${this.label?U`<div class="label">${this.label}</div>`:B}
      <div class="card">
        ${t.map(t=>{const e=this.hass?.states?.[t.entity],i=t.label??e?.attributes.friendly_name??t.entity;return U`<div class="row">
            ${t.icon?U`<ha-icon class="icon" icon=${t.icon}></ha-icon>`:B}
            <div class="title" title=${i}>${i}</div>
            <div class="val">${this._value(t)}</div>
          </div>`})}
      </div>
    `:B}};Ze.styles=[Mt,r`
      :host {
        display: block;
      }
      .label {
        color: var(--mt-on-surface-variant);
        font-size: var(--md-sys-typescale-label-large-size, 13px);
        font-weight: 500;
        padding: 0 4px 6px;
      }
      /* One container for all sensors (à la Google Home), large M3 radius. */
      .card {
        background: var(--mt-surface-container);
        border-radius: var(--mt-shape-card);
        padding: 6px 0;
        overflow: hidden;
      }
      .row {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 10px 20px;
      }
      .icon {
        flex: 0 0 auto;
        /* same height as the text, no circle/padding/outline */
        --mdc-icon-size: 18px;
        color: var(--mt-on-surface-variant);
        display: inline-flex;
        align-items: center;
      }
      .title {
        flex: 1;
        min-width: 0;
        font-size: var(--md-sys-typescale-body-medium-size, 14px);
        font-weight: 400;
        color: var(--mt-on-surface-variant);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .val {
        flex: 0 0 auto;
        font-size: var(--md-sys-typescale-body-medium-size, 14px);
        font-weight: 700;
        color: var(--mt-on-surface);
        white-space: nowrap;
      }
    `],t([mt({attribute:!1})],Ze.prototype,"hass",void 0),t([mt({attribute:!1})],Ze.prototype,"items",void 0),t([mt()],Ze.prototype,"label",void 0),Ze=t([ht("mt-sensor-list")],Ze);const De=new Set(["off","unavailable","unknown",""]);function He(t,e,i){const s=[];for(const o of t){if(o.t<e)continue;const t=parseFloat(o.state);isFinite(t)&&s.push({t:(o.t-i)/6e4,v:t})}return s}function Ne(t,e,i={}){const s=i.tr??t,o=i.vel??.1,a=i.met??1.1,r=i.clo??.6,n=e/100*ae(t),l=.155*r,d=58.15*a,c=d,h=l<=.078?1+1.29*l:1.05+.645*l,p=12.1*Math.sqrt(o),u=t+273,m=s+273,f=l*h,g=3.96*f,v=100*f,_=f*u,y=308.7-.028*c+g*(m/100)**4;let b=(u+(35.5-t)/(3.5*l+.1))/100,w=b,x=p;for(let t=0;t<150;t++){w=(w+b)/2;const t=2.38*Math.abs(100*w-u)**.25;if(x=p>t?p:t,b=(y+_*x-g*w**4)/(100+v*x),Math.abs(b-w)<=15e-5)break}const $=3.05*.001*(5733-6.99*c-n),k=c>58.15?.42*(c-58.15):0,A=17e-6*d*(5867-n),L=.0014*d*(34-t),C=3.96*h*(b**4-(m/100)**4),M=h*x*(100*b-273-t);return(.303*Math.exp(-.036*d)+.028)*(c-$-k-A-L-C-M)}function Fe(t){return Math.max(.5,Math.min(1,.95-.075*(t-21)))}function Ve(t){if(t.length<4)return null;const e=[...t].sort((t,e)=>t.t-e.t),i=e[0].t,s=e[0].v;if(e[e.length-1].t-i<6)return null;let o=0,a=i,r=s,n=0,l=0,d=0,c=0,h=0;const p=[];for(const t of e){o+=(t.v+r)/2*(t.t-a),a=t.t,r=t.v;const e=o,u=t.t-i,m=t.v-s;p.push({x1:e,x2:u,y:m}),n+=e*e,l+=e*u,d+=u*u,c+=e*m,h+=u*m}const u=n*d-l*l;if(Math.abs(u)<1e-12)return null;const m=(c*d-h*l)/u,f=(n*h-l*c)/u,g=-m;if(!(g>1e-6))return null;const v=f/g;let _=0,y=0;const b=p.reduce((t,e)=>t+e.y,0)/p.length;for(const t of p){const e=m*t.x1+f*t.x2;_+=(t.y-e)**2,y+=(t.y-b)**2}const w=1-_/y;return w<.5?null:{k:g,asymptote:v,r2:w}}function je(t,e,i){const{k:s,asymptote:o}=i;return function(t,e,i){return t<i?e>t&&e<i:t>i&&e<t&&e>i}(t,e,o)?Math.log((t-o)/(e-o))/s:null}function Ue(t){if(!isFinite(t)||t<0)return"";const e=Math.round(t);return e<60?`${Math.max(1,e)}m`:e<120?"1h":"2hr+"}const qe={visible:!1,comfortable:!1};const We=new Set(["unavailable","unknown",""]),Be={comfortable:"mdi:emoticon-happy-outline",warm:"mdi:thermometer-high",cool:"mdi:thermometer-low",humid:"mdi:water-percent"},Ke={comfortable:"heat_cool",warm:"heat",cool:"cool",humid:"cool"};let Ge=class extends dt{constructor(){super(...arguments),this._result={visible:!1,comfortable:!1},this._fetching=!1,this._lastFetchMs=0}connectedCallback(){super.connectedCallback(),this._timer=window.setInterval(()=>{this._tick()},3e4)}async _tick(){this._recompute(),Date.now()-this._lastFetchMs>=6e4&&await this._refresh()}disconnectedCallback(){super.disconnectedCallback(),this._timer&&window.clearInterval(this._timer),this._timer=void 0}updated(t){t.has("entityId")||t.has("tempSensor")||t.has("humiditySensor")||t.has("feature")?this._refresh():t.has("hass")&&this._recompute()}get _climate(){return this.hass?.states?.[this.entityId]}_tempNow(){const t=ne(this.hass?.states?.[this.tempSensor]?.state);if(void 0!==t)return he(t,ce(this.hass,this.tempSensor));const e=ne(this._climate?.attributes?.current_temperature);return void 0===e?void 0:he(e,de(this.hass))}_rhNow(){return ne(this.hass?.states?.[this.humiditySensor]?.state)}_staleMin(){const t=this.hass?.states?.[this.tempSensor]?.last_changed,e=t?new Date(t).getTime():NaN;return isFinite(e)?Math.max(0,(Date.now()-e)/6e4):0}_target(t){const e=this._climate,i=e.attributes,s=de(this.hass),o=ne(i.target_temp_low),a=ne(i.target_temp_high);if("heat_cool"===e.state&&void 0!==o&&void 0!==a){const e=he(o,s),i=he(a,s);return t<e?e:t>i?i:null}if("heat_cool"===e.state&&(void 0!==o||void 0!==a))return null;const r=ne(i.temperature);if(void 0===r)return null;const n=he(r,s);return"cool"===e.state&&t<=n||"heat"===e.state&&t>=n?null:n}_hasReadings(){const t=this._climate;return!!(this.hass&&t&&!We.has(t.state)&&this.tempSensor&&this.humiditySensor&&void 0!==this._tempNow()&&void 0!==this._rhNow())}_isRunning(){const t=this._climate;return!(!t||De.has(t.state))}_recompute(){if(!this._hasReadings())return void this._set({visible:!1,comfortable:!1});const t=this._tempNow(),e=this._cache?.unit===ce(this.hass,this.tempSensor)?this._cache:void 0,i=this._isRunning();this._set(function(t){if(!isFinite(t.tempNow)||!isFinite(t.rhNow))return qe;const e=Ne(t.tempNow,t.rhNow,{clo:Fe(t.tempNow)}),i=re(t.tempNow,t.rhNow),s=e>.5,o=e<-.5;if(!(s||o||i>.012)){const e=t.running?function(t){if(!t.showTargetEta||null==t.target)return;if(Math.abs(t.tempNow-t.target)<.25)return;const e=Ve(t.tempSeries);if(!e)return;const i=t.target<t.tempNow,s="°C"===t.unit?t.target:Math.round(pe(t.target,t.unit)),o=je(t.tempNow,t.target,e);if(null!=o){const e=o-t.staleMin;return e<1.5?`Almost at ${s}${t.unit}`:`${Ue(e)} until ${i?"cooled":"heated"} to ${s}${t.unit}`}return(t.target-t.tempNow)*(e.asymptote-t.tempNow)>0&&!(Math.abs(e.asymptote-t.target)<=.5)?`won't go ${i?"below":"above"} ${Math.round(pe(e.asymptote,t.unit))}${t.unit}`:void 0}(t):void 0;return{visible:!0,comfortable:!0,line:e??"Room feels comfortable",status:"comfortable"}}const a=function(t,e){const i=[];let s,o=0;for(const a of t){for(;o<e.length&&e[o].t<=a.t;)s=e[o].v,o++;void 0!==s&&i.push({t:a.t,l:a.v,r:s})}return i}(t.tempSeries,t.rhSeries);let r,n,l,d;s?(r=a.map(t=>({t:t.t,v:Ne(t.l,t.r,{clo:Fe(t.l)})})),n=e,l=.5,d="warm"):o?(r=a.map(t=>({t:t.t,v:Ne(t.l,t.r,{clo:Fe(t.l)})})),n=e,l=-.5,d="cool"):(r=a.map(t=>({t:t.t,v:re(t.l,t.r)})),n=i,l=.012,d="humid");const c=`Room feels ${d}`,h=r.length?r[r.length-1].t-r[0].t:0;if(!t.running||r.length<2||h<6)return{visible:!0,comfortable:!1,line:c,status:d};const p=Ve(r),u=(p?je(n,l,p):null)??function(t,e){const i=function(t){const e=t.length;if(e<2)return null;let i=0,s=0,o=0,a=0,r=0;for(const e of t)i+=e.t,s+=e.v,o+=e.t*e.t,a+=e.t*e.v,r+=e.v*e.v;const n=e*o-i*i;if(0===n)return null;const l=e*a-i*s,d=l/n,c=e*r-s*s;return{slope:d,intercept:(s-d*i)/e,n:e,r2:0===c?1:l*l/(n*c)}}(t);if(!i||0===i.slope)return null;const s=t[t.length-1],o=(e-i.intercept)/i.slope-s.t;return!(o>0)||o>720?null:o}(r,l);let m=c;if(null!=u){const e=u-t.staleMin;m=e<1.5?"Room should be comfortable soon":`${Ue(e)} until comfortable`}return{visible:!0,comfortable:!1,line:m,status:d}}({tempNow:t,rhNow:this._rhNow(),tempSeries:i?e?.tempSeries??[]:[],rhSeries:i?e?.rhSeries??[]:[],target:i?this._target(t):null,showTargetEta:i&&(this.feature.show_target_eta??!1),running:i,staleMin:this._staleMin(),unit:de(this.hass)}))}_sessionStartMs(){const t=this._climate?.last_changed;if(!t)return null;const e=new Date(t).getTime();return isFinite(e)?e:null}async _refresh(){if(this._recompute(),!this._fetching&&this._hasReadings()&&this._isRunning()){this._fetching=!0,this._lastFetchMs=Date.now();try{const t=Date.now(),e=Math.max(this._sessionStartMs()??0,t-864e5),i=[this.tempSensor,this.humiditySensor],s=await async function(t,e,i,s){const o=await t.callWS({type:"history/history_during_period",start_time:new Date(i).toISOString(),end_time:new Date(s).toISOString(),entity_ids:e,minimal_response:!0,no_attributes:!0}),a={};for(const t of e){const e=Array.isArray(o?.[t])?o[t]:[];a[t]=e.map(t=>{const e=t.lu??t.lc??t.last_updated??t.last_changed??0;return{state:String(t.s??t.state??""),t:1e3*Number(e)}}).filter(t=>t.t>0).sort((t,e)=>t.t-e.t)}return a}(this.hass,i,e,t),o=ce(this.hass,this.tempSensor);this._cache={unit:o,tempSeries:He(s[this.tempSensor],e,e).map(t=>({t:t.t,v:he(t.v,o)})),rhSeries:He(s[this.humiditySensor],e,e)},this._recompute()}catch{}finally{this._fetching=!1}}}_set(t){this._result=t,this.dispatchEvent(new CustomEvent("feature-visibility",{detail:{visible:t.visible},bubbles:!0,composed:!0}))}render(){const t=this._result;if(!t.visible||!t.line)return B;const e=t.status;return U`<div class="comfort" role="status">
      <ha-icon
        icon=${Be[e]}
        style=${`color:${Tt(Ke[e])}`}
      ></ha-icon>
      <span>${t.line}</span>
    </div>`}};function Xe(t){return"number"==typeof t&&!!(4&t)}Ge.styles=[Mt,r`
      :host {
        display: block;
      }
      .comfort {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        padding: 8px 12px;
        color: var(--mt-on-surface-variant);
        font-size: var(--md-sys-typescale-body-medium-size, 14px);
        line-height: 1.3;
        text-align: center;
      }
      .comfort ha-icon {
        flex: 0 0 auto;
        --mdc-icon-size: 18px;
        /* colour is set inline per comfort state (see render) */
      }
    `],t([mt({attribute:!1})],Ge.prototype,"hass",void 0),t([mt()],Ge.prototype,"entityId",void 0),t([mt({attribute:!1})],Ge.prototype,"feature",void 0),t([mt({attribute:!1})],Ge.prototype,"tempSensor",void 0),t([mt({attribute:!1})],Ge.prototype,"humiditySensor",void 0),t([ft()],Ge.prototype,"_result",void 0),Ge=t([ht("mt-comfort")],Ge);let Ye=class extends dt{constructor(){super(...arguments),this.display="icons"}_onSelect(){const t=this.hass?.states?.[this.entityId];Kt(t)||!Xe(t.attributes.supported_features)||"on"!==t.attributes.away_mode&&"off"!==t.attributes.away_mode||this.hass.callService("water_heater","set_away_mode",{entity_id:this.entityId,away_mode:"on"!==t.attributes.away_mode})}render(){const t=this.hass?.states?.[this.entityId];if(!t||!Xe(t.attributes.supported_features)||"on"!==t.attributes.away_mode&&"off"!==t.attributes.away_mode)return B;if("tile"===this.display){const e="on"===t.attributes.away_mode;return U`<button
        type="button"
        class=${e?"tile on":"tile"}
        aria-pressed=${String(e)}
        ?disabled=${Kt(t)}
        @click=${this._onSelect}
      >
        <span class="ic" aria-hidden="true"><ha-icon icon=${Ot}></ha-icon></span>
        <span class="text">
          <span class="title">${this.label??Qt(this.hass,t,"away_mode","Away mode")}</span>
          <span class="value">${Jt(this.hass,t,"away_mode")}</span>
        </span>
      </button>`}return U`<mt-selector-row
      .items=${[{value:"away",label:Qt(this.hass,t,"away_mode","Away mode"),icon:Ot,active:"on"===t.attributes.away_mode,disabled:Kt(t)}]}
      display=${this.display}
      .label=${this.label}
      @item-selected=${this._onSelect}
    ></mt-selector-row>`}};Ye.styles=[ke,r`
    :host { display: block; }
    .tile:disabled { cursor: default; opacity: 0.5; }
    .tile:focus-visible { outline: 2px solid var(--mt-primary); outline-offset: 2px; }
    @media (prefers-reduced-motion: reduce) {
      .tile, .tile .ic { transition: none; }
    }
  `],t([mt({attribute:!1})],Ye.prototype,"hass",void 0),t([mt()],Ye.prototype,"entityId",void 0),t([mt()],Ye.prototype,"display",void 0),t([mt()],Ye.prototype,"label",void 0),Ye=t([ht("mt-water-heater-away")],Ye);let Je=class extends dt{constructor(){super(...arguments),this.span=10,this.gridColumns=10,this.visibilityRevision=0,this._comfortVisible=!1,this._onComfortVisibility=t=>{this._comfortVisible=t.detail.visible}}get _climateOff(){return"off"===this.hass?.states?.[this.entityId]?.state}willUpdate(t){if(t.has("feature")&&"comfort"!==t.get("feature")?.type&&(this._comfortVisible=!1),t.has("span")||t.has("placement")||t.has("gridColumns")||t.has("feature")){const t=this.placement,e=t?.singleton;this.style.gridColumn=t?`${e?1:t.column} / span ${e?this.gridColumns:this.span}`:`span ${Math.max(1,this.span)}`,this.style.gridRow=t?`${t.row}`:"",this.style.width=e?`calc(${100*this.span/this.gridColumns}% - ${12*(1-this.span/this.gridColumns)}px)`:"";const i=this.feature.alignment;this.style.justifySelf=e?"center"===i||"right"===i?i:"left":""}this.toggleAttribute("hidden","comfort"===this.feature?.type&&!this._comfortVisible)}updated(t){"comfort"===this.feature.type&&(t.has("feature")||t.has("_comfortVisible")||t.has("visibilityRevision"))&&this.dispatchEvent(new CustomEvent("feature-row-visibility",{detail:{feature:this.feature,visible:this._comfortVisible}}))}render(){const t=this.feature;switch(t.type){case"climate-hvac-modes":case"climate-fan-modes":case"climate-swing-modes":case"climate-swing-horizontal-modes":case"water-heater-operation-modes":case"climate-preset-modes":{const e="climate-hvac-modes"===t.type?"hvac":"climate-fan-modes"===t.type?"fan":"climate-preset-modes"===t.type?"preset":"climate-swing-horizontal-modes"===t.type?"swing_horizontal":"water-heater-operation-modes"===t.type?"operation":"swing";return U`<mt-climate-selector
          .hass=${this.hass}
          entityId=${this.entityId}
          kind=${e}
          display=${t.display??"icons"}
          .label=${t.label}
          .options=${t.options}
          .order=${t.order}
          .include=${t.include}
        ></mt-climate-selector>`}case"water-heater-away-mode":return U`<mt-water-heater-away
          .hass=${this.hass}
          entityId=${this.entityId}
          display=${t.display??"icons"}
          .label=${t.label}
        ></mt-water-heater-away>`;case"input-select":return U`<mt-input-select
          .hass=${this.hass}
          entity=${t.entity}
          display=${t.display??"icons"}
          .label=${t.label}
          .options=${t.options}
          .order=${t.order}
        ></mt-input-select>`;case"switch-group":return U`<mt-switch-group
          .hass=${this.hass}
          .entities=${t.entities}
          display=${t.display??"icons"}
          .label=${t.label}
        ></mt-switch-group>`;case"switch-list":return U`<mt-switch-list
          .hass=${this.hass}
          .entities=${t.entities}
          .label=${t.label}
        ></mt-switch-list>`;case"button-list":return U`<mt-button-list
          .hass=${this.hass}
          .items=${t.items}
          .label=${t.label}
        ></mt-button-list>`;case"entity-tile":return U`<mt-entity-tile
          .hass=${this.hass}
          .config=${t}
          .forceOff=${this._climateOff}
        ></mt-entity-tile>`;case"sensor-list":return U`<mt-sensor-list
          .hass=${this.hass}
          .items=${t.items}
          .label=${t.label}
        ></mt-sensor-list>`;case"comfort":return U`<mt-comfort
          .hass=${this.hass}
          entityId=${this.entityId}
          .feature=${t}
          .tempSensor=${this.feelsLikeTemp}
          .humiditySensor=${this.feelsLikeHumidity}
          @feature-visibility=${this._onComfortVisibility}
        ></mt-comfort>`;default:return B}}};Je.styles=r`
    :host {
      display: block;
      /* allow shrinking below content so a wide icon list wraps/scrolls inside
         its column instead of overflowing the card */
      min-width: 0;
    }
    :host([hidden]) {
      display: none;
    }
  `,t([mt({attribute:!1})],Je.prototype,"hass",void 0),t([mt()],Je.prototype,"entityId",void 0),t([mt({attribute:!1})],Je.prototype,"feature",void 0),t([mt({type:Number})],Je.prototype,"span",void 0),t([mt({attribute:!1})],Je.prototype,"placement",void 0),t([mt({type:Number})],Je.prototype,"gridColumns",void 0),t([mt({type:Number})],Je.prototype,"visibilityRevision",void 0),t([mt({attribute:!1})],Je.prototype,"feelsLikeTemp",void 0),t([mt({attribute:!1})],Je.prototype,"feelsLikeHumidity",void 0),t([ft()],Je.prototype,"_comfortVisible",void 0),Je=t([ht("mt-feature-row")],Je),function(){const t=window;t.customIcons=t.customIcons||{},t.customIcons.mt||(t.customIcons.mt={getIcon:async t=>{const e=ue[t];if(!e)throw new Error(`Unknown mt icon: mt:${t}`);return e.secondary?{path:e.path,secondaryPath:e.secondary}:{path:e.path}},getIconList:async()=>Object.keys(ue).map(t=>({name:t,keywords:["ac","swing","vane","louver","climate","airflow",...t.split("-")]}))})}(),console.info("%c MATERIAL-THERMOSTAT-CARD %c v1.11.1 ","color: white; background: #6750a4; font-weight: 700;","color: #6750a4; background: white; font-weight: 700;"),window.customCards=window.customCards||[],window.customCards.push({type:At,name:"Material Thermostat Card",description:"A Material 3 Expressive thermostat card with customizable selectors and Nest/Google Home inspired UI.",preview:!0,documentationURL:"https://github.com/lageorgem/ha-material-thermostat-card",getEntitySuggestion:(t,e)=>Wt(e)?{config:{type:`custom:${At}`,entity:e}}:null});const Qe=["language","locale","localize","formatEntityState","formatEntityAttributeValue","formatEntityAttributeName","formatEntityName"];let ti=0,ei=class extends dt{constructor(){super(...arguments),this._widthPx=0,this._comfortVisibility=new Map,this._commitVersion=0,this._nameId="mt-name-"+ ++ti,this._featureRevision=0}static async getConfigElement(){return await Promise.resolve().then(function(){return Ti}),document.createElement(Lt)}static getStubConfig(t){const e=Object.keys(t.states),i=e.find(t=>t.startsWith("climate."))??e.find(t=>t.startsWith("water_heater."))??"";return{type:`custom:${At}`,entity:i,features:[{type:"water_heater"===Wt(i)?"water-heater-operation-modes":"climate-hvac-modes"}]}}setConfig(t){if(!Wt(t.entity))throw new Error("Specify an entity from within the climate or water_heater domain");this._config?.entity!==t.entity&&this._clearPendingTarget(),this._config=ie(t),this._comfortVisibility=new Map,this._featureRevision++,"theme"!==t.font&&function(t=document){if(!t.getElementById("mt-gstatic-preconnect")){const e=t.createElement("link");e.id="mt-gstatic-preconnect",e.rel="preconnect",e.href="https://fonts.gstatic.com",e.crossOrigin="anonymous",t.head.appendChild(e)}if(!t.getElementById("mt-google-sans-flex")){const e=t.createElement("link");e.id="mt-google-sans-flex",e.rel="stylesheet",e.href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,GRAD,ROND@6..144,1..1000,0..100,0..100&display=swap",t.head.appendChild(e)}}()}getCardSize(){return 7+this._features.length}getGridOptions(){return{columns:12,min_columns:6,rows:"auto"}}get _features(){const t=Wt(this._config?.entity);return(this._config?.features??[]).filter(e=>e.type.startsWith("climate-")||"comfort"===e.type?"climate"===t:!e.type.startsWith("water-heater-")||"water_heater"===t)}get _stateObj(){return this.hass?.states?.[this._config?.entity]}_trackedEntityIds(){const t=new Set([this._config.entity]),e=this._config.feels_like;e?.temperature&&t.add(e.temperature),e?.humidity&&t.add(e.humidity);for(const e of this._config.features??[])"entity"in e&&e.entity&&t.add(e.entity),"entities"in e&&e.entities?.forEach(e=>t.add(e.entity)),"items"in e&&e.items?.forEach(e=>t.add(e.entity));return[...t]}_displayCurrent(t){const e=this._config.feels_like;if("water_heater"===Wt(this._config.entity)||!e?.show_as_current||!e.temperature||!e.humidity)return t;const i=ne(this.hass?.states?.[e.temperature]?.state),s=ne(this.hass?.states?.[e.humidity]?.state);return void 0===i||void 0===s?t:pe(function(t,e){return function(t,e){const i=function(t){return 9*t/5+32}(t),s=Math.max(0,Math.min(100,e)),o=.5*(i+61+1.2*(i-68)+.094*s);if((o+i)/2<80)return oe(o);let a=2.04901523*i-42.379+10.14333127*s-.22475541*i*s-.00683783*i*i-.05481717*s*s+.00122874*i*i*s+85282e-8*i*s*s-199e-8*i*i*s*s;return s<13&&i>=80&&i<=112?a-=(13-s)/4*Math.sqrt((17-Math.abs(i-95))/17):s>85&&i>=80&&i<=87&&(a+=(s-85)/10*((87-i)/5)),oe(a)}(t,e)}(he(i,ce(this.hass,e.temperature)),s),de(this.hass))}shouldUpdate(t){if(t.has("_config")||t.has("_selectedTemp")||t.has("_selectedLow")||t.has("_selectedHigh")||t.has("_widthPx")||t.has("_comfortVisibility"))return!0;if(!this._config)return!1;if(t.has("hass")){const e=t.get("hass");return!e||!!Qe.some(t=>e[t]!==this.hass[t])||e.config?.unit_system!==this.hass.config?.unit_system||!(!this._config.theme||e.themes===this.hass.themes)||this._trackedEntityIds().some(t=>e.states[t]!==this.hass.states[t])}return!1}updated(t){if(t.has("hass")||t.has("_config")){const e=t.get("hass");!this._config?.theme&&!t.has("_config")||e&&e.themes===this.hass.themes&&!t.has("_config")||function(t,e,i){const s=i?e?.themes[i]:void 0,o={};if(s){const{modes:t,...i}=s;for(const[s,a]of Object.entries({...i,...t?.[e?.darkMode?"dark":"light"]}))("string"==typeof a||"number"==typeof a&&Number.isFinite(a))&&(o[s]=a)}const a=new Map;for(const[t,e]of Object.entries(o)){const i="string"==typeof e&&/^#([\da-f]{3}|[\da-f]{6})$/i.exec(e);if(i&&!t.startsWith("rgb-")){const e=3===i[1].length?i[1].split("").map(t=>t+t).join(""):i[1];a.set(`--rgb-${t}`,[0,2,4].map(t=>parseInt(e.slice(t,t+2),16)).join(", "))}}for(const[t,e]of Object.entries(o))a.set(`--${t}`,String(e));for(const e of se.get(t)??[])a.has(e)||t.style.removeProperty(e);for(const[e,i]of a)t.style.setProperty(e,i);se.set(t,new Set(a.keys()))}(this,this.hass?.themes,this._config?.theme)}if(t.has("hass")){const t=this._stateObj?.attributes;null!=this._selectedTemp&&t?.temperature===this._selectedTemp&&(this._selectedTemp=void 0),null!=this._selectedLow&&t?.target_temp_low===this._selectedLow&&(this._selectedLow=void 0),null!=this._selectedHigh&&t?.target_temp_high===this._selectedHigh&&(this._selectedHigh=void 0)}}_observeWidth(){this._resizeObserver||"undefined"==typeof ResizeObserver||(this._resizeObserver=new ResizeObserver(t=>{const e=t[0]?.contentRect.width??0,i=Math.max(0,e-32);Math.abs(i-this._widthPx)>=1&&(this._widthPx=i)}),this._resizeObserver.observe(this))}connectedCallback(){super.connectedCallback(),this._observeWidth()}_featureWidthPct(t){return"width"in t&&"number"==typeof t.width&&t.width>0?Math.max(10,Math.min(Ct,10*Math.round(t.width/10))):"entity-tile"===t.type?50:Ct}_featureSpan(t){return e=this._featureWidthPct(t),Math.max(1,Math.min(10,Math.round(e/10)));var e}_onFeatureVisibility(t){const e=t.currentTarget.feature;if("comfort"!==e.type||t.detail.feature!==e)return;const i=t.detail.visible;(this._comfortVisibility.get(e)??!1)!==i&&(this._comfortVisibility=new Map(this._comfortVisibility).set(e,i))}_layout(){const t=this._features,e=this._widthPx,i=t.length?Math.max(...t.map(t=>this._featureWidthPct(t))):100,s=e*(100-i)/100;if(!(t.length>0&&i<100&&e>=560&&s>=240)){const t=Math.min(e,320),i="google"===this._config.dial_style?.035:.065;return{wide:!1,dialStyle:{marginBottom:`-${Math.round(i*t)}px`},featureStyle:{},gridCols:10}}return{wide:!0,dialStyle:{flex:"1 1 auto"},featureStyle:{flex:`0 0 ${i}%`},gridCols:Math.max(1,i/10)}}_scheduleCommit(){this._cancelResync(),this._debounceTimer&&window.clearTimeout(this._debounceTimer);const t=this._config.entity,e=this.hass.states[t],i=e&&Gt(e,this.hass.config?.unit_system?.temperature??"°C").kind;this._debounceTimer=window.setTimeout(()=>{this._debounceTimer=void 0;const e=this.hass.states[t];if(this._config.entity!==t||!e)return void this._clearPendingTarget();const s=Gt(e,this.hass.config?.unit_system?.temperature??"°C");if("none"===i||s.kind!==i)return void this._clearPendingTarget();const o=function(t,e,i){const s=Wt(t.entity_id)??"climate",o={entity_id:t.entity_id};return"climate"===s&&"dual"===e?(o.target_temp_low=i.low,o.target_temp_high=i.high):o.temperature=i.value,{domain:s,service:"set_temperature",data:o}}(e,i,{value:this._selectedTemp??s.value,low:this._selectedLow??s.low,high:this._selectedHigh??s.high}),a=this._commitVersion,r="dual"===i?{_selectedLow:this._selectedLow,_selectedHigh:this._selectedHigh}:{_selectedTemp:this._selectedTemp},n=()=>{if(a===this._commitVersion)for(const t of Object.keys(r))this[t]===r[t]&&(this[t]=void 0)};Promise.resolve(this.hass.callService(o.domain,o.service,o.data)).then(()=>{a===this._commitVersion&&(this._resyncTimer=window.setTimeout(n,3e3))},t=>{n(),console.warn("Temperature update failed:",t instanceof Error?t.message:String(t))})},600)}_clearPendingTarget(){window.clearTimeout(this._debounceTimer),this._debounceTimer=void 0,this._cancelResync(),this._selectedTemp=void 0,this._selectedLow=void 0,this._selectedHigh=void 0}_cancelResync(){this._commitVersion++,window.clearTimeout(this._resyncTimer),this._resyncTimer=void 0}_onChanging(t){this._cancelResync();const{value:e,low:i,high:s}=t.detail;null!=i||null!=s?(this._selectedLow=i,this._selectedHigh=s):this._selectedTemp=e}_onChanged(t){this._onChanging(t),this._scheduleCommit()}_showMoreInfo(){yt(this,"hass-more-info",{entityId:this._config.entity})}_operationOverride(t,e){const i=t??[];for(let t=i.length-1;t>=0;t--)if(i[t].value===e)return i[t]}_presetIcon(){if("water_heater"===Wt(this._config.entity)){const t=this._features.find(t=>"water-heater-operation-modes"===t.type);if(!t)return;const e=this._stateObj?.state;if(!e||"off"===e||"unavailable"===e||"unknown"===e)return;const i=this._operationOverride(t.options,e);return void 0!==i?.icon?i.icon||void 0:Pt(e)}const t=this._features.find(t=>"climate-preset-modes"===t.type);if(!t)return;const e=this._stateObj?.attributes.preset_mode;if(!e||"none"===e||"off"===e)return;const i=t.options?.find(t=>t.value===e);return void 0!==i?.icon?i.icon||void 0:Dt(e)}_hvacColors(){const t=this._features.find(t=>"climate-hvac-modes"===t.type),e={};for(const i of t?.options??[])i.color&&(e[i.value]=i.color);return e}_hvacIcons(){const t=this._features.find(t=>"climate-hvac-modes"===t.type),e={};for(const i of t?.options??[])i.icon?e[i.value]=i.icon:delete e[i.value];return e}_presetColor(){if("water_heater"===Wt(this._config.entity)){const t=this._features.find(t=>"water-heater-operation-modes"===t.type);if(!t)return;const e=this._stateObj?.state;if(!e||"off"===e||"unavailable"===e||"unknown"===e)return;const i=this._operationOverride(t.options,e);return i?.color??It(e)}const t=this._features.find(t=>"climate-preset-modes"===t.type);if(!t)return;const e=this._stateObj?.attributes.preset_mode;if(!e||"none"===e||"off"===e)return;const i=t.options?.find(t=>t.value===e);return i?.color??Zt(e)}render(){if(!this._config||!this.hass)return U``;const t="theme"===this._config.font?"":"font-rounded",e=this._stateObj;if(!e)return U`<ha-card class=${t}
        ><div class="error">${this.hass.localize?.("ui.panel.lovelace.warning.entity_not_found","entity",this._config.entity)||`Entity not found: ${this._config.entity}`}</div></ha-card
      >`;const i=e.attributes,s=function(t,e,i,s){if("string"==typeof s)return s;const o=t;if("function"==typeof o?.formatEntityName&&e){const t=o.formatEntityName(e,s);if("string"==typeof t&&t)return t}return e?.attributes.friendly_name??i}(this.hass,e,this._config.entity,this._config.name),o=Kt(e),a=this.hass.config?.unit_system?.temperature??"°C",r=Gt(e,a),n=function(t){if("water_heater"===Wt(t.entity_id))return"off"===t.state||Kt(t)?"off":"heat";switch(Xt(t)){case"cooling":return"cool";case"heating":return"heat";case"drying":return"dry";case"fan":return"fan_only";default:return t.state}}(e),l="water_heater"===Wt(this._config.entity),d=this._features.find(t=>"water-heater-operation-modes"===t.type),c=l?this._operationOverride(d?.options,e.state)?.color??It(e.state):Tt(n),h=l?{heat:c}:this._hvacColors(),p=Xt(e),u=Yt(this.hass,e),m=this._features,f=this._layout(),g=function(t,e){const i=[];let s=e;t.forEach((t,o)=>{void 0!==t&&(s+t>e&&(i.push([]),s=0),i[i.length-1].push({index:o,span:t}),s+=t)});const o=t.map(()=>{});return i.forEach((t,e)=>{let i=1;t.forEach(({index:s,span:a})=>{o[s]={row:e+1,column:i,singleton:1===t.length},i+=a})}),o}(m.map(t=>"comfort"!==t.type||this._comfortVisibility.get(t)?this._featureSpan(t):void 0),f.gridCols);return U`
      <ha-card role="group" aria-labelledby=${this._nameId} class=${t} style=${`--mt-active-color: ${c}`}>
        <div class="header">
          <div class="name" id=${this._nameId} title=${s}>${s}</div>
          <button class="more" aria-label=${te(this.hass,"ui.panel.lovelace.cards.show_more_info","More information")} @click=${this._showMoreInfo}>
            <ha-icon icon="mdi:dots-vertical"></ha-icon>
          </button>
        </div>

        <div class=${"body "+(f.wide?"wide":"stacked")}>
          <div class="dial-wrap" style=${kt(f.dialStyle)}>
            <mt-circular-dial
              .dialStyle=${this._config.dial_style??"halo"}
              .value=${this._selectedTemp??r.value??r.min}
              .min=${r.min}
              .max=${r.max}
              .step=${r.step}
              .current=${this._displayCurrent(i.current_temperature)}
              .mode=${n}
              .hvacAction=${p}
              .modeLabel=${u}
              .formatNumber=${(t,e)=>function(t,e,i){try{return new Intl.NumberFormat(function(t){const e=t;switch(e?.locale?.number_format){case"system":return;case"comma_decimal":return["en-US","en"];case"decimal_comma":return["de","es","it"];case"space_comma":return["fr","sv","cs"];default:return e?.locale?.language??e?.language}}(t),{minimumFractionDigits:i,maximumFractionDigits:i,useGrouping:!1}).format(e)}catch(t){if(t instanceof RangeError)return e.toFixed(i);throw t}}(this.hass,t,e)}
              .presetIcon=${this._presetIcon()}
              .presetIconColor=${this._presetColor()}
              .modeColors=${h}
              .modeIcons=${this._hvacIcons()}
              .unit=${a}
              .dual=${"dual"===r.kind}
              .readonly=${"none"===r.kind}
              .lowValue=${this._selectedLow??r.low}
              .highValue=${this._selectedHigh??r.high}
              .showCurrentAsPrimary=${this._config.show_current_as_primary??!1}
              .disabled=${o}
              @value-changing=${this._onChanging}
              @value-changed=${this._onChanged}
            ></mt-circular-dial>
          </div>

          ${m.length?U`<div
                class="features"
                style=${kt({...f.featureStyle,gridTemplateColumns:`repeat(${f.gridCols}, minmax(0, 1fr))`})}
              >
                ${m.map((t,e)=>U`<mt-feature-row
                      .hass=${this.hass}
                      .entityId=${this._config.entity}
                      .feature=${t}
                      .span=${this._featureSpan(t)}
                      .placement=${g[e]}
                      .gridColumns=${f.gridCols}
                      .visibilityRevision=${this._featureRevision}
                      @feature-row-visibility=${this._onFeatureVisibility}
                      .feelsLikeTemp=${this._config.feels_like?.temperature}
                      .feelsLikeHumidity=${this._config.feels_like?.humidity}
                    ></mt-feature-row>`)}
              </div>`:B}
        </div>
      </ha-card>
    `}disconnectedCallback(){super.disconnectedCallback(),this._clearPendingTarget(),this._resizeObserver?.disconnect(),this._resizeObserver=void 0}};ei.styles=[Mt,r`
      :host {
        display: block;
      }
      .font-rounded {
        --mt-centre-weight: 450;
        --mt-centre-axes: "ROND" 100, "opsz" 14;
        --mt-label-weight: 400;
        font-family:
          'Google Sans Flex',
          var(--ha-font-family-body, var(--primary-font-family, Roboto, Noto, sans-serif));
        font-variation-settings: 'ROND' 100;
      }
      ha-card {
        /* bottom padding equals the inter-control gap (see .body.stacked) */
        padding: 12px 16px 12px;
        border-radius: var(--mt-shape-card);
        /* visible so an open dropdown menu can extend past the card edge */
        overflow: visible;
      }
      .header {
        display: grid;
        grid-template-columns: 1fr auto;
        align-items: center;
        min-height: 36px;
      }
      .name {
        grid-column: 1 / -1;
        grid-row: 1;
        text-align: center;
        font-size: var(--md-sys-typescale-title-large-size, 20px);
        color: var(--mt-on-surface);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        padding: 0 36px;
      }
      .more {
        grid-column: 2;
        grid-row: 1;
        z-index: 1;
        width: 36px;
        height: 36px;
        border: none;
        border-radius: var(--mt-shape-full);
        background: transparent;
        color: var(--mt-on-surface-variant);
        display: grid;
        place-items: center;
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }
      .more:hover {
        background: color-mix(in srgb, var(--mt-on-surface) 8%, transparent);
      }
      .body {
        display: flex;
        margin-top: 8px;
      }
      /* Stacked (narrow): controls above a full-width feature area. The gap here
         (dial → first control row) matches the inter-row gap and bottom padding
         so the spacing below the dial is even. */
      .body.stacked {
        flex-direction: column;
        gap: ${12}px;
      }
      /* Side-by-side (wide): the feature area takes the widest feature's % on the
         right; the dial-wrap fills the rest and centers the fixed-size dial. */
      .body.wide {
        flex-direction: row;
        align-items: center;
        gap: 16px;
      }
      .dial-wrap {
        box-sizing: border-box;
        display: flex;
        justify-content: center;
        min-width: 0;
      }
      /* A full feature area has 10 columns. Explicit placements preserve sparse
         auto-flow rows while singleton hosts align inside a full-row grid area. */
      .features {
        box-sizing: border-box;
        display: grid;
        align-content: flex-start;
        gap: ${12}px;
        min-width: 0;
      }
      .error {
        padding: 24px;
        text-align: center;
        color: var(--mt-error);
      }
    `],t([mt({attribute:!1})],ei.prototype,"hass",void 0),t([ft()],ei.prototype,"_config",void 0),t([ft()],ei.prototype,"_selectedTemp",void 0),t([ft()],ei.prototype,"_selectedLow",void 0),t([ft()],ei.prototype,"_selectedHigh",void 0),t([ft()],ei.prototype,"_widthPx",void 0),t([ft()],ei.prototype,"_comfortVisibility",void 0),ei=t([ht(At)],ei);const ii=[{value:"icons",label:"Icons",icon:"mdi:dots-grid"},{value:"dropdown",label:"Dropdown",icon:"mdi:form-dropdown"},{value:"tile",label:"Tile",icon:"mdi:card-text-outline"}];let si=class extends dt{constructor(){super(...arguments),this.value="icons",this.options=ii}_set(t){t!==this.value&&this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t},bubbles:!0,composed:!0}))}render(){return U`
      <div class="seg">
        ${this.options.map(t=>U`<button
            class=${this.value===t.value?"on":""}
            @click=${()=>this._set(t.value)}
          >
            <ha-icon icon=${t.icon}></ha-icon><span>${t.label}</span>
          </button>`)}
      </div>
    `}};si.styles=r`
    .seg {
      display: inline-flex;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      overflow: hidden;
    }
    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      border: none;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      font: inherit;
      font-size: 14px;
    }
    button + button {
      border-left: 1px solid var(--divider-color);
    }
    button.on {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    ha-icon {
      --mdc-icon-size: 18px;
    }
  `,t([mt()],si.prototype,"value",void 0),t([mt({attribute:!1})],si.prototype,"options",void 0),si=t([ht("mt-display-toggle")],si);const oi=new Set(["ArrowRight","ArrowUp","ArrowLeft","ArrowDown","PageUp","PageDown","Home","End"]);let ai=class extends dt{constructor(){super(...arguments),this.disabled=!1,this.step=1,this.min=1,this.max=4,this.tooltipMode="interaction",this._pressed=!1,this._tooltipVisible=!1,this._onPointerDown=t=>{this.disabled||(t.preventDefault(),this._slider.setPointerCapture(t.pointerId),this._pressed=!0,this._tooltipVisible=!0,this.value=this._range*this._pctFromX(t.clientX))},this._onPointerMove=t=>{this._pressed&&!this.disabled&&(this.value=this._range*this._pctFromX(t.clientX),this._emit("slider-moved",this._stepped(this._bounded(this.value))))},this._onPointerUp=t=>{this._pressed&&(this._slider.releasePointerCapture(t.pointerId),this._pressed=!1,this._tooltipVisible=!1,this.value=this._stepped(this._bounded(this._range*this._pctFromX(t.clientX))),this._emit("value-changed",this.value))},this._onKeyDown=t=>{if(this.disabled||!oi.has(t.key))return;t.preventDefault();const e=this.value??this.min;switch(t.key){case"ArrowRight":case"ArrowUp":this.value=this._bounded(e+this.step);break;case"ArrowLeft":case"ArrowDown":this.value=this._bounded(e-this.step);break;case"PageUp":this.value=this._stepped(this._bounded(e+this._bigStep));break;case"PageDown":this.value=this._stepped(this._bounded(e-this._bigStep));break;case"Home":this.value=this.min;break;case"End":this.value=this.max}this._emit("value-changed",this.value)}}get _range(){return this.range??this.max}_bounded(t){return Math.min(Math.max(t,this.min),this.max)}_stepped(t){return Math.round(t/this.step)*this.step}_valueToPct(t){return this._bounded(t)/this._range}_pctFromX(t){const e=this._slider.getBoundingClientRect();return Math.max(0,Math.min(1,(t-e.left)/e.width))}updated(t){if(t.has("value")){const t=this._stepped(this.value??0).toString();this.setAttribute("aria-valuenow",t),this.setAttribute("aria-valuetext",t)}t.has("min")&&this.setAttribute("aria-valuemin",this.min.toString()),t.has("max")&&this.setAttribute("aria-valuemax",this.max.toString())}connectedCallback(){super.connectedCallback(),this.setAttribute("role","slider"),this.hasAttribute("tabindex")||this.setAttribute("tabindex","0"),this.setAttribute("aria-orientation","horizontal"),this.addEventListener("keydown",this._onKeyDown)}disconnectedCallback(){super.disconnectedCallback(),this.removeEventListener("keydown",this._onKeyDown)}get _bigStep(){return Math.max(this.step,(this.max-this.min)/10)}_emit(t,e){this.dispatchEvent(new CustomEvent(t,{detail:{value:e},bubbles:!0,composed:!0}))}_renderTooltip(){if("never"===this.tooltipMode)return B;const t="always"===this.tooltipMode||this._tooltipVisible&&"interaction"===this.tooltipMode,e=this._bounded(this._stepped(this.value??0));return U`<span aria-hidden="true" class=${me({tooltip:!0,visible:t})}
      >${e}</span
    >`}render(){const t=Math.round(this._range/this.step);return U`
      <div class=${me({container:!0,pressed:this._pressed})}
        style=${kt({"--value":`${this._valueToPct(this.value??0)}`})}>
        <div
          id="slider"
          class="slider"
          @pointerdown=${this._onPointerDown}
          @pointermove=${this._onPointerMove}
          @pointerup=${this._onPointerUp}
          @pointercancel=${this._onPointerUp}
        >
          <div class="track">
            <div class="background"></div>
            <div
              class="active"
              style=${kt({"--min":""+this.min/this._range,"--max":""+(1-this.max/this._range)})}
            ></div>
          </div>
          ${Array(t).fill(0).map((e,i)=>0===i?B:U`<div class="dot" style=${kt({"--value":""+i/t})}></div>`)}
          ${void 0!==this.value?U`<div class="handle"></div>`:B}
          ${this._renderTooltip()}
        </div>
      </div>
    `}};ai.styles=r`
    :host {
      display: block;
      height: 36px;
      width: 100%;
      outline: none;
    }
    /* Keyboard focus: a soft ring on the handle only — NOT a box around the whole
       control, which read as a stray colored band over the editor background. */
    :host(:focus-visible) .handle::after {
      box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary-color) 45%, transparent);
    }
    .container {
      position: relative;
      height: 100%;
      width: 100%;
    }
    .slider {
      position: relative;
      height: 100%;
      width: 100%;
      transform: translateZ(0);
      overflow: visible;
      cursor: pointer;
      touch-action: pan-y;
    }
    .slider * {
      pointer-events: none;
      user-select: none;
    }
    .track {
      position: absolute;
      inset: 0;
      margin: auto;
      height: 16px;
      width: 100%;
      border-radius: var(--ha-border-radius-md, 8px);
      overflow: hidden;
    }
    /* The unfilled track is transparent so it reads as the surrounding surface
       (the editor's feature panel) rather than a stray tinted band. */
    .background {
      position: absolute;
      inset: 0;
      background: transparent;
    }
    .active {
      position: absolute;
      background: var(--primary-color, #6750a4);
      border-radius: var(--ha-border-radius-md, 8px);
      top: 0;
      right: calc(var(--max) * 100%);
      bottom: 0;
      left: calc(var(--min) * 100%);
    }
    .handle {
      position: absolute;
      top: 0;
      height: 100%;
      width: 16px;
      transform: translate(-50%, 0);
      background: var(--card-background-color, #1c1b22);
      left: calc(var(--value, 0) * 100%);
      transition: left 180ms ease-in-out;
    }
    .handle::after {
      position: absolute;
      inset: 0;
      width: 4px;
      border-radius: 2px;
      height: 100%;
      margin: auto;
      background: var(--primary-color, #6750a4);
      content: '';
    }
    .dot {
      position: absolute;
      top: 0;
      bottom: 0;
      opacity: 0.6;
      margin: auto;
      width: 4px;
      height: 4px;
      flex-shrink: 0;
      transform: translate(-50%, 0);
      background: var(--card-background-color, #1c1b22);
      left: calc(var(--value, 0) * 100%);
      border-radius: 2px;
    }
    :host([disabled]) .slider {
      cursor: not-allowed;
    }
    :host([disabled]) .track {
      opacity: 0.5;
    }
    :host([disabled]) .handle::after,
    :host([disabled]) .active {
      background: var(--disabled-color, #bdbdbd);
    }
    .tooltip {
      position: absolute;
      top: 0;
      left: calc(min(max(var(--value) * 100%, 0%), 100%));
      transform: translate3d(-50%, calc(-100% - 4px), 0);
      background-color: var(--clear-background-color, var(--card-background-color, #2b2933));
      color: var(--primary-text-color, #e6e1e9);
      font-size: var(--control-slider-tooltip-font-size, 14px);
      border-radius: var(--ha-border-radius-lg, 12px);
      padding: 0.2em 0.4em;
      opacity: 0;
      white-space: nowrap;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
      pointer-events: none;
      transition:
        opacity 180ms ease-in-out,
        left 180ms ease-in-out;
    }
    .tooltip.visible {
      opacity: 1;
    }
    .pressed .handle {
      transition: none;
    }
  `,t([mt({type:Boolean,reflect:!0})],ai.prototype,"disabled",void 0),t([mt({type:Number})],ai.prototype,"value",void 0),t([mt({type:Number})],ai.prototype,"step",void 0),t([mt({type:Number})],ai.prototype,"min",void 0),t([mt({type:Number})],ai.prototype,"max",void 0),t([mt({type:Number})],ai.prototype,"range",void 0),t([mt({attribute:"tooltip-mode"})],ai.prototype,"tooltipMode",void 0),t([ft()],ai.prototype,"_pressed",void 0),t([ft()],ai.prototype,"_tooltipVisible",void 0),t([gt("#slider")],ai.prototype,"_slider",void 0),ai=t([ht("mt-grid-slider")],ai);const ri=[{value:"left",label:"Align left",icon:"mdi:format-align-left"},{value:"center",label:"Align centre",icon:"mdi:format-align-center"},{value:"right",label:"Align right",icon:"mdi:format-align-right"}];let ni=class extends dt{get _selected(){return"center"===this.value||"right"===this.value?this.value:"left"}_set(t){t!==this._selected&&this.dispatchEvent(new CustomEvent("alignment-changed",{detail:{value:t},bubbles:!0,composed:!0}))}render(){return U`
      <div class="seg" role="group" aria-label="Feature alignment" aria-describedby="help">
        ${ri.map(t=>U`<button
            type="button"
            class=${this._selected===t.value?"on":""}
            aria-label=${t.label}
            aria-pressed=${this._selected===t.value?"true":"false"}
            @click=${()=>this._set(t.value)}
          >
            <ha-icon icon=${t.icon} aria-hidden="true"></ha-icon>
          </button>`)}
      </div>
      <span id="help" class="sr-only">
        Alignment applies only when this feature is alone on its row.
      </span>
    `}};ni.styles=r`
    :host {
      display: block;
    }
    .seg {
      display: inline-flex;
      border: 1px solid var(--divider-color);
      border-radius: 999px;
      overflow: hidden;
    }
    button {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 8px 16px;
      min-height: 44px;
      border: none;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      font: inherit;
      font-size: 14px;
    }
    button + button {
      border-left: 1px solid var(--divider-color);
    }
    button.on {
      background: var(--primary-color);
      color: var(--text-primary-color, #fff);
    }
    /* A real border survives forced colours; keep it inside the separate focus outline. */
    button.on::after {
      content: '';
      position: absolute;
      bottom: 8px;
      left: 50%;
      width: 18px;
      border-bottom: 2px solid currentColor;
      transform: translateX(-50%);
      pointer-events: none;
    }
    button:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: -4px;
    }
    ha-icon {
      display: inline-flex;
      width: 18px;
      height: 18px;
      --mdc-icon-size: 18px;
    }
    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }
  `,t([mt()],ni.prototype,"value",void 0),ni=t([ht("mt-alignment-toggle")],ni);let li=class extends dt{constructor(){super(...arguments),this.default=Ct}_emit(t){this.dispatchEvent(new CustomEvent("width-changed",{detail:{value:t},bubbles:!0,composed:!0}))}_onChanged(t){const e=t.detail?.value;this._emit("number"==typeof e?e:void 0)}_reset(){null!=this.value&&this._emit(void 0)}render(){const t=null!=this.value,e=this.value??this.default;return U`
      <div class="label">Width (% of card)</div>
      <div class="control">
        <div class="width-controls">
          <button
            class="reset"
            aria-label="Reset width to full"
            title="Reset to full width"
            ?disabled=${!t}
            @click=${this._reset}
          >
            <ha-icon icon="mdi:restore"></ha-icon>
          </button>
          <mt-grid-slider
            .value=${e}
            .min=${10}
            .max=${Ct}
            .step=${10}
            tooltip-mode="always"
            @value-changed=${this._onChanged}
          ></mt-grid-slider>
        </div>
        <mt-alignment-toggle .value=${this.alignment}></mt-alignment-toggle>
      </div>
      ${t?B:U`<div class="hint">
            Default — ${this.default===Ct?"full width":`${this.default}%`}.
          </div>`}
      <div class="alignment-help">
        Alignment applies only when this feature is alone on its row.
      </div>
    `}};li.styles=r`
    :host {
      display: block;
    }
    .label {
      color: var(--secondary-text-color);
      font-size: 0.85rem;
      margin-bottom: 4px;
    }
    .control {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 8px;
      /* room above the slider for the floating value tooltip */
      padding-top: 20px;
    }
    .width-controls {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1 1 160px;
      min-width: 0;
    }
    mt-alignment-toggle {
      flex: 0 0 auto;
    }
    .reset {
      flex: 0 0 auto;
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 50%;
      background: transparent;
      color: var(--secondary-text-color);
      cursor: pointer;
      display: grid;
      place-items: center;
      -webkit-tap-highlight-color: transparent;
    }
    .reset:hover:not([disabled]) {
      background: rgba(var(--rgb-primary-text-color, 0, 0, 0), 0.08);
    }
    .reset[disabled] {
      opacity: 0.38;
      cursor: default;
    }
    .reset ha-icon {
      --mdc-icon-size: 20px;
    }
    mt-grid-slider {
      flex: 1 1 auto;
      min-width: 0;
    }
    .hint,
    .alignment-help {
      color: var(--secondary-text-color);
      font-size: 0.78rem;
      margin-top: 4px;
    }
  `,t([mt({attribute:!1})],li.prototype,"hass",void 0),t([mt({type:Number})],li.prototype,"value",void 0),t([mt()],li.prototype,"alignment",void 0),t([mt({type:Number})],li.prototype,"default",void 0),li=t([ht("mt-width-field")],li);let di=class extends dt{constructor(){super(...arguments),this.items=[],this.value="",this.placeholder="Search…",this.allowCustom=!1,this.customPrefix="",this._query=""}firstUpdated(){this._searchInput?.focus()}_filtered(){const t=this._query.trim().toLowerCase();return t?this.items.filter(e=>e.value.toLowerCase().includes(t)||e.primary.toLowerCase().includes(t)||(e.secondary?.toLowerCase().includes(t)??!1)||(e.keywords?.some(e=>e.toLowerCase().includes(t))??!1)).slice(0,50):this.items.slice(0,50)}_customValue(){const t=this._query.trim();return this.customPrefix&&!t.includes(":")?this.customPrefix+t:t}_pick(t){this.dispatchEvent(new CustomEvent("pick",{detail:{value:t},bubbles:!0,composed:!0}))}_onKey(t){"Escape"===t.key?(t.stopPropagation(),this.dispatchEvent(new CustomEvent("dismiss",{bubbles:!0,composed:!0}))):"Enter"===t.key&&this.allowCustom&&this._query.trim()&&this._pick(this._customValue())}render(){const t=this._filtered(),e=this._customValue(),i=this.allowCustom&&this._query.trim().length>0&&!t.some(t=>t.value===e);return U`
      <input
        class="search"
        type="text"
        placeholder=${this.placeholder}
        .value=${this._query}
        @input=${t=>this._query=t.target.value}
        @keydown=${this._onKey}
      />
      <div class="results" role="listbox">
        ${t.map(t=>U`<button
            type="button"
            class=${me({opt:!0,active:t.value===this.value})}
            role="option"
            @click=${()=>this._pick(t.value)}
          >
            ${t.icon?U`<ha-icon icon=${t.icon}></ha-icon>`:B}
            <span class="opt-text">
              <span class="opt-name">${t.primary}</span>
              ${t.secondary?U`<span class="opt-sub">${t.secondary}</span>`:B}
            </span>
          </button>`)}
        ${i?U`<button type="button" class="opt custom" @click=${()=>this._pick(e)}>
              <ha-icon icon=${this.customPrefix?e:"mdi:plus"}></ha-icon>
              <span class="opt-text"><span class="opt-name">Use “${e}”</span></span>
            </button>`:B}
        ${0!==t.length||i?B:U`<div class="empty">No matches</div>`}
      </div>
    `}};di.styles=r`
    :host {
      display: block;
    }
    .search {
      width: 100%;
      box-sizing: border-box;
      height: 38px;
      padding: 0 12px;
      margin-bottom: 6px;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      border: 1px solid var(--md-sys-color-outline-variant, var(--divider-color));
      background: var(--md-sys-color-surface-container, var(--card-background-color));
      color: var(--md-sys-color-on-surface, var(--primary-text-color));
      font: inherit;
      font-size: 14px;
      outline: none;
    }
    .search:focus {
      border-color: var(--md-sys-color-primary, var(--primary-color));
    }
    .results {
      max-height: 240px;
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .opt {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 8px 10px;
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface, var(--primary-text-color));
      border-radius: 10px;
      cursor: pointer;
      font: inherit;
      text-align: left;
    }
    .opt:hover {
      background: color-mix(in srgb, currentColor 8%, transparent);
    }
    .opt.active {
      background: var(--md-sys-color-secondary-container, rgba(127, 127, 127, 0.18));
    }
    .opt ha-icon {
      --mdc-icon-size: 20px;
      flex: 0 0 auto;
      color: var(--md-sys-color-on-surface-variant, var(--secondary-text-color));
    }
    .opt-text {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }
    .opt-name {
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .opt-sub {
      font-size: 12px;
      color: var(--md-sys-color-on-surface-variant, var(--secondary-text-color));
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .empty {
      padding: 10px;
      color: var(--md-sys-color-on-surface-variant, var(--secondary-text-color));
      font-size: 13px;
      text-align: center;
    }
  `,t([mt({attribute:!1})],di.prototype,"items",void 0),t([mt()],di.prototype,"value",void 0),t([mt()],di.prototype,"placeholder",void 0),t([mt({type:Boolean})],di.prototype,"allowCustom",void 0),t([mt()],di.prototype,"customPrefix",void 0),t([ft()],di.prototype,"_query",void 0),t([gt(".search")],di.prototype,"_searchInput",void 0),di=t([ht("mt-search-panel")],di);const ci=["thermostat","thermostat-auto","thermometer","snowflake","snowflake-variant","sun-snowflake-variant","fire","water-percent","air-conditioner","air-filter","air-humidifier","air-purifier","heat-pump","radiator","radiator-disabled","fan","fan-auto","fan-off","fan-speed-1","fan-speed-2","fan-speed-3","fan-chevron-up","fan-chevron-down","leaf","sofa","sofa-outline","bed","sleep","power-sleep","home","home-outline","home-thermometer","home-automation","home-export-outline","run-fast","rocket-launch","cancel","snowman","sun-thermometer","snowflake-thermometer","coolant-temperature","weather-sunny","weather-night","weather-cloudy","weather-partly-cloudy","weather-rainy","weather-pouring","weather-snowy","weather-windy","weather-fog","weather-lightning","weather-hail","weather-sunset","white-balance-sunny","umbrella","power","flash","lightning-bolt","battery","solar-power","transmission-tower","ev-station","gauge","speedometer","meter-electric","lightbulb","lightbulb-group","ceiling-light","floor-lamp","lamp","led-strip","brightness-5","brightness-6","palette","door","door-open","garage","garage-variant","gate","window-closed","window-open","blinds","curtains","fence","television","speaker","music","volume-high","play","pause","stop","motion-sensor","smoke-detector","fire-alert","water","water-alert","valve","pump","eye","eye-off","lock","lock-open","bell","alarm","fridge","stove","microwave","dishwasher","washing-machine","tumble-dryer","robot-vacuum","vacuum","shower","bathtub","toilet","water-boiler","grill","pool","tree","flower","sprout","watering-can","sprinkler","car","tune","tune-variant","cog","sync","refresh","restart","arrow-up","arrow-down","arrow-left","arrow-right","arrow-all","arrow-up-down","arrow-left-right","swap-vertical","account","account-group","calendar","clock","star","heart","flag","map-marker","tag"];let hi,pi=class extends dt{constructor(){super(...arguments),this.label="Icon",this._open=!1,this._alignRight=!1,this._icons=[],this._onDocClick=t=>{this._open&&!t.composedPath().includes(this)&&(this._open=!1)}}get _none(){return""===this.value}get _custom(){return!!this.value}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onDocClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._onDocClick)}_emit(t){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t},bubbles:!0,composed:!0}))}_hostBounds(){const t=this.getRootNode().host;return t?t.getBoundingClientRect():null}_toggle(t){if(t.stopPropagation(),!this._open){const t=this.getBoundingClientRect(),e=this._hostBounds(),i=e?(e.left+e.right)/2:window.innerWidth/2;this._alignRight=t.left+t.width/2>i}this._open=!this._open,this._open&&0===this._icons.length&&async function(){if(hi)return hi;const t=ci.map(t=>({value:`mdi:${t}`,primary:`mdi:${t}`,icon:`mdi:${t}`,keywords:t.split("-")})),e=window.customIcons;if(e)for(const i of Object.keys(e)){const s=e[i]?.getIconList;if("function"==typeof s)try{const e=await s();for(const s of e)t.push({value:`${i}:${s.name}`,primary:`${i}:${s.name}`,icon:`${i}:${s.name}`,keywords:s.keywords})}catch{}}return hi=t,hi}().then(t=>{this._icons=t})}_toggleNone(t){t.stopPropagation(),this._open=!1,this._emit(this._none?void 0:"")}_onPick(t){this._open=!1,this._emit(t.detail.value)}render(){const t=this._none,e=this._custom,i=e?this.value:this.defaultIcon??"mdi:image-plus";return U`
      <div class="pill">
        <button
          type="button"
          class=${me({seg:!0,icon:!0,active:e,preview:!e})}
          aria-haspopup="listbox"
          aria-expanded=${this._open?"true":"false"}
          title=${this.label}
          @click=${this._toggle}
        >
          <ha-icon icon=${i}></ha-icon>
        </button>
        <button
          type="button"
          class=${me({seg:!0,cancel:!0,active:t})}
          aria-pressed=${t?"true":"false"}
          title=${t?"No icon — click to use the default":"No icon"}
          @click=${this._toggleNone}
        >
          <ha-icon icon="mdi:cancel"></ha-icon>
        </button>
      </div>
      ${this._open?U`<div class=${me({panel:!0,right:this._alignRight})}>
            <mt-search-panel
              .items=${this._icons}
              .value=${this.value||""}
              .allowCustom=${!0}
              customPrefix="mdi:"
              placeholder="Search icons…"
              @pick=${this._onPick}
              @dismiss=${()=>this._open=!1}
            ></mt-search-panel>
          </div>`:B}
    `}};pi.styles=r`
    :host {
      display: inline-block;
      position: relative;
    }
    .pill {
      display: inline-flex;
      height: 40px;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      background: var(--md-sys-color-surface-container-high, var(--secondary-background-color));
      border: 1px solid var(--md-sys-color-outline-variant, var(--divider-color));
      overflow: hidden;
    }
    .seg {
      width: 40px;
      height: 100%;
      padding: 0;
      display: grid;
      place-items: center;
      border: none;
      background: transparent;
      color: var(--md-sys-color-on-surface-variant, var(--secondary-text-color));
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
      transition:
        background-color 150ms cubic-bezier(0.2, 0, 0, 1),
        color 150ms cubic-bezier(0.2, 0, 0, 1);
    }
    .seg + .seg {
      border-left: 1px solid var(--md-sys-color-outline-variant, var(--divider-color));
    }
    .seg:hover {
      background: color-mix(in srgb, currentColor 10%, transparent);
    }
    .seg.active {
      background: var(--md-sys-color-primary, var(--primary-color));
      color: var(--md-sys-color-on-primary, var(--text-primary-color, #fff));
    }
    /* The faded "this is just the default / add an icon" preview. */
    .seg.icon.preview:not(.active) ha-icon {
      opacity: 0.5;
    }
    .seg ha-icon {
      --mdc-icon-size: 20px;
    }
    /* Rounded search panel anchored under the pill (matches mt-entity-picker). */
    .panel {
      position: absolute;
      z-index: 30;
      top: calc(100% + 6px);
      left: 0;
      width: 256px;
      box-sizing: border-box;
      padding: 8px;
      background: var(--md-sys-color-surface-container-high, var(--card-background-color, #fff));
      border: 1px solid var(--md-sys-color-outline-variant, var(--divider-color));
      border-radius: 16px;
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.2);
    }
    /* Anchored to the right edge of the pill so it grows leftward (used near the
       viewport's right edge to avoid horizontal overflow/scroll). */
    .panel.right {
      left: auto;
      right: 0;
    }
  `,t([mt({attribute:!1})],pi.prototype,"hass",void 0),t([mt()],pi.prototype,"value",void 0),t([mt()],pi.prototype,"label",void 0),t([mt()],pi.prototype,"defaultIcon",void 0),t([ft()],pi.prototype,"_open",void 0),t([ft()],pi.prototype,"_alignRight",void 0),t([ft()],pi.prototype,"_icons",void 0),pi=t([ht("mt-icon-field")],pi);let ui=class extends dt{constructor(){super(...arguments),this.value="",this.label="",this.flatLeft=!1}_onInput(t){const e=t.target.value;this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:e},bubbles:!0,composed:!0}))}render(){return U`<input
      type="text"
      class=${me({"flat-left":this.flatLeft})}
      .value=${this.value??""}
      placeholder=${this.label}
      aria-label=${this.label}
      @input=${this._onInput}
    />`}};ui.styles=r`
    :host {
      display: block;
      min-width: 0;
    }
    input {
      width: 100%;
      box-sizing: border-box;
      height: 40px;
      padding: 0 14px;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      border: 1px solid var(--md-sys-color-outline-variant, var(--divider-color));
      background: var(--md-sys-color-surface-container-high, var(--secondary-background-color));
      color: var(--md-sys-color-on-surface, var(--primary-text-color));
      font: inherit;
      font-size: 14px;
      outline: none;
      transition: border-color 150ms cubic-bezier(0.2, 0, 0, 1);
    }
    input::placeholder {
      color: var(--md-sys-color-on-surface-variant, var(--secondary-text-color));
    }
    input:focus {
      border-color: var(--md-sys-color-primary, var(--primary-color));
    }
    /* Attach seamlessly to a control on the left (e.g. the color pill). */
    input.flat-left {
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
      border-left: none;
    }
  `,t([mt()],ui.prototype,"value",void 0),t([mt()],ui.prototype,"label",void 0),t([mt({type:Boolean})],ui.prototype,"flatLeft",void 0),ui=t([ht("mt-text-field")],ui);let mi=class extends dt{constructor(){super(...arguments),this.defaultColor="var(--md-sys-color-primary, var(--primary-color, #6750a4))",this.label="Color",this.attached=!1,this._open=!1,this._onDocClick=t=>{this._open&&!t.composedPath().includes(this)&&(this._open=!1)}}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onDocClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._onDocClick)}_emit(t){this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t},bubbles:!0,composed:!0}))}_toggle(t){t.stopPropagation(),this._open=!this._open}_onInput(t){t.stopPropagation(),this._emit(t.target.value)}_reset(t){t.stopPropagation(),this._open=!1,this._emit(void 0)}_resolveHex(){if(this.value)return this.value;const t=document.createElement("span");t.style.color=this.defaultColor,this.shadowRoot.appendChild(t);const e=getComputedStyle(t).color;t.remove();const i=e.match(/\d+/g);return i?"#"+i.slice(0,3).map(t=>Number(t).toString(16).padStart(2,"0")).join(""):"#000000"}render(){return U`
      <button
        type="button"
        class="swatch"
        style=${`--swatch-color: ${this.value??this.defaultColor}`}
        aria-haspopup="dialog"
        aria-expanded=${this._open?"true":"false"}
        title=${this.label}
        @click=${this._toggle}
      ></button>
      ${this._open?U`<div class="popover" role="dialog">
            <input
              type="color"
              aria-label=${this.label}
              .value=${this._resolveHex()}
              @input=${this._onInput}
            />
            ${this.value?U`<button type="button" class="reset" @click=${this._reset}>
                  Reset to default
                </button>`:B}
          </div>`:B}
    `}};mi.styles=r`
    :host {
      --color-field-height: 40px;
      --color-field-width: 56px;
      --color-field-inset: 4px;
      display: inline-flex;
      position: relative;
      flex-shrink: 0;
    }
    .swatch {
      position: relative;
      box-sizing: border-box;
      width: var(--color-field-width);
      height: var(--color-field-height);
      padding: 0;
      border: 1px solid var(--md-sys-color-outline-variant, var(--divider-color));
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      background: var(--md-sys-color-surface-container-high, var(--secondary-background-color));
      cursor: pointer;
      -webkit-tap-highlight-color: transparent;
    }
    .swatch::before {
      content: '';
      position: absolute;
      inset: var(--color-field-inset);
      border-radius: inherit;
      background: var(--swatch-color);
      pointer-events: none;
    }
    /* MtTextField.flatLeft has no left border: retain ours as the single seam. */
    :host([attached]) .swatch {
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    .popover {
      position: absolute;
      z-index: 30;
      top: calc(100% + 6px);
      left: 0;
      /* Fixed width so the color preview fills a proper rectangle — otherwise,
         with no reset button (default color), a percentage-width input collapses
         to a sliver inside a shrink-to-fit popover and shows no visible color. */
      width: 180px;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 8px;
      background: var(--md-sys-color-surface-container-high, var(--card-background-color, #fff));
      border: 1px solid var(--md-sys-color-outline-variant, var(--divider-color));
      border-radius: 16px;
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.2);
    }
    .popover input[type='color'] {
      width: 100%;
      height: 44px;
      border: 1px solid var(--md-sys-color-outline-variant, var(--divider-color));
      border-radius: 10px;
      background: none;
      cursor: pointer;
      padding: 2px;
    }
    .reset {
      border: none;
      background: transparent;
      color: var(--md-sys-color-primary, var(--primary-color));
      cursor: pointer;
      font: inherit;
      font-size: 13px;
      padding: 4px;
      border-radius: 8px;
    }
    .reset:hover {
      background: color-mix(in srgb, currentColor 10%, transparent);
    }
  `,t([mt()],mi.prototype,"value",void 0),t([mt()],mi.prototype,"defaultColor",void 0),t([mt()],mi.prototype,"label",void 0),t([mt({type:Boolean,reflect:!0})],mi.prototype,"attached",void 0),t([ft()],mi.prototype,"_open",void 0),mi=t([ht("mt-color-field")],mi);const fi="var(--md-sys-color-primary, var(--primary-color, #6750a4))";let gi=class extends dt{_values(){const t=this.hass?.states?.[this.entityId]?.attributes;return t?"hvac"===this.kind?t.hvac_modes??[]:"fan"===this.kind?t.fan_modes??[]:"preset"===this.kind?t.preset_modes??[]:"operation"===this.kind?t.operation_list??[]:"swing-horizontal"===this.kind?t.swing_horizontal_modes??[]:t.swing_modes??[]:[]}_orderedValues(){return jt(this._values(),this.feature.order)}_defaultIcon(t){return"hvac"===this.kind?St[t]??"mdi:thermostat":"fan"===this.kind?Rt(t):"preset"===this.kind?Dt(t):"operation"===this.kind?"mdi:water-boiler":Ft(t)}_defaultColor(t){return"hvac"===this.kind?Tt(t):"preset"===this.kind?Zt(t)??fi:fi}_moveOption(t){t.stopPropagation();const{oldIndex:e,newIndex:i}=t.detail,s=this._orderedValues(),[o]=s.splice(e,1);s.splice(i,0,o),this._emit({order:s})}_override(t){return this.feature.options?.filter(e=>e.value===t).pop()}_emit(t){this.dispatchEvent(new CustomEvent("feature-changed",{detail:{feature:{...this.feature,...t}},bubbles:!0,composed:!0}))}_setOverride(t,e){const i=this.feature.options??[],s=i.map(t=>t.value).lastIndexOf(t),o=i.filter((e,i)=>e.value!==t||i===s),a=o.findIndex(e=>e.value===t),r={...a>=0?o[a]:{value:t},...e};""===r.label&&delete r.label,void 0===r.icon&&delete r.icon,r.hide||delete r.hide,r.color||delete r.color;const n=void 0!==r.label||void 0!==r.icon||!!r.hide||!!r.color;a>=0?n?o[a]=r:o.splice(a,1):n&&o.push(r),this._emit({options:o})}render(){const t=this._values(),e=this.feature.display??"icons",i="hvac"===this.kind||"preset"===this.kind||"tile"===e;return U`
      <div class="editor">
        <mt-text-field
          label="Title (optional)"
          .value=${this.feature.label??""}
          @value-changed=${t=>this._emit({label:t.detail.value||void 0})}
        ></mt-text-field>

        <div class="field">
          <span class="field-label">Display</span>
          <mt-display-toggle
            .value=${e}
            @value-changed=${t=>this._emit({display:t.detail.value})}
          ></mt-display-toggle>
        </div>

        <mt-width-field
          .hass=${this.hass}
          .value=${this.feature.width}
          .alignment=${this.feature.alignment}
          @width-changed=${t=>this._emit({width:t.detail.value})}
          @alignment-changed=${t=>this._emit({alignment:"left"===t.detail.value?void 0:t.detail.value})}
        ></mt-width-field>

        ${0===t.length?U`<p class="hint">
              Pick a ${"operation"===this.kind?"water heater":"climate"} entity that exposes ${this.kind} options to customize them.
            </p>`:U`<ha-sortable handle-selector=".handle" @item-moved=${this._moveOption}>
              <div class="options">
                ${this._orderedValues().map(t=>this._renderOption(t,i))}
              </div>
            </ha-sortable>`}
      </div>
    `}_renderOption(t,e){const i=this._override(t),s=!!i?.hide;return U`
      <div class="opt">
        <div class="handle"><ha-icon icon="mdi:drag"></ha-icon></div>
        <div class="opt-name" title=${t}>${qt(t)}</div>
        <div class="title-group">
          ${e?U`<mt-color-field
                .attached=${!0}
                .value=${i?.color}
                .defaultColor=${this._defaultColor(t)}
                @value-changed=${e=>this._setOverride(t,{color:e.detail.value})}
              ></mt-color-field>`:B}
          <mt-text-field
            class="opt-label"
            label=${qt(t)}
            .flatLeft=${e}
            .value=${i?.label??""}
            @value-changed=${e=>this._setOverride(t,{label:e.detail.value})}
          ></mt-text-field>
        </div>
        <mt-icon-field
          class="opt-icon"
          .hass=${this.hass}
          .value=${i?.icon}
          .defaultIcon=${this._defaultIcon(t)}
          @value-changed=${e=>this._setOverride(t,{icon:e.detail.value})}
        ></mt-icon-field>
        <button
          class="opt-hide ${s?"on":""}"
          aria-label=${s?"Show option":"Hide option"}
          title=${s?"Hidden":"Visible"}
          @click=${()=>this._setOverride(t,{hide:!s})}
        >
          <ha-icon icon=${s?"mdi:eye-off":"mdi:eye"}></ha-icon>
        </button>
      </div>
    `}};gi.styles=r`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px 0;
    }
    .field {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .field-label {
      color: var(--secondary-text-color);
      font-size: 14px;
    }
    .options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .opt {
      display: grid;
      grid-template-columns: auto minmax(60px, 1fr) 2fr auto auto;
      align-items: center;
      gap: 8px;
    }
    .handle {
      cursor: grab;
      color: var(--secondary-text-color);
      display: grid;
      place-items: center;
    }
    .handle ha-icon {
      --mdc-icon-size: 20px;
    }
    .opt-name {
      font-size: 13px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    /* The color pill + title field form a single attached pill. */
    .title-group {
      display: flex;
      align-items: stretch;
      min-width: 0;
    }
    .title-group mt-text-field {
      flex: 1;
      min-width: 0;
    }
    .opt-icon {
      min-width: 0;
    }
    .opt-hide {
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: 50%;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .opt-hide.on {
      color: var(--error-color);
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 13px;
      margin: 0;
    }
  `,t([mt({attribute:!1})],gi.prototype,"hass",void 0),t([mt()],gi.prototype,"entityId",void 0),t([mt()],gi.prototype,"kind",void 0),t([mt({attribute:!1})],gi.prototype,"feature",void 0),gi=t([ht("mt-climate-feature-editor")],gi);const vi={sensor:"mdi:gauge",binary_sensor:"mdi:radiobox-marked",switch:"mdi:toggle-switch-variant",light:"mdi:lightbulb",fan:"mdi:fan",input_boolean:"mdi:toggle-switch",input_select:"mdi:format-list-bulleted",button:"mdi:gesture-tap-button",input_button:"mdi:gesture-tap-button",scene:"mdi:palette",script:"mdi:script-text",climate:"mdi:thermostat"};let _i=class extends dt{constructor(){super(...arguments),this.value="",this.label="Entity",this.allowCustom=!1,this.clearable=!1,this._open=!1,this._onDocClick=t=>{this._open&&!t.composedPath().includes(this)&&(this._open=!1)}}connectedCallback(){super.connectedCallback(),document.addEventListener("click",this._onDocClick)}disconnectedCallback(){super.disconnectedCallback(),document.removeEventListener("click",this._onDocClick)}_iconFor(t,e){return e??vi[t.split(".")[0]]??"mdi:tag"}_items(){const t=this.hass?.states??{};return Object.keys(t).filter(t=>!this.includeDomains||this.includeDomains.includes(t.split(".")[0])).map(e=>{const i=t[e].attributes;return{value:e,primary:i.friendly_name??e,secondary:e,icon:this._iconFor(e,i.icon)}}).sort((t,e)=>t.primary.localeCompare(e.primary))}_selected(){if(!this.value)return;const t=this.hass?.states?.[this.value]?.attributes;return{name:t?.friendly_name??this.value,icon:this._iconFor(this.value,t?.icon)}}_toggle(t){t.stopPropagation(),this._open=!this._open}_onPick(t){this._open=!1,this.dispatchEvent(new CustomEvent("value-changed",{detail:{value:t.detail.value},bubbles:!0,composed:!0}))}_clear(t){t.stopPropagation(),this._onPick(new CustomEvent("pick",{detail:{value:""}}))}render(){const t=this._selected();return U`
      <div class=${me({"trigger-row":!0,open:this._open})} @click=${this._toggle}>
      <button
        type="button"
        class="trigger"
        aria-label=${this.label||B}
        aria-haspopup="listbox"
        aria-expanded=${this._open?"true":"false"}
        @click=${this._toggle}
      >
        ${t?U`<ha-icon class="lead" icon=${t.icon}></ha-icon>
              <span class="text">${t.name}</span>`:U`<span class="text muted">${this.label}</span>`}
      </button>
      ${this.clearable&&this.value?U`<button type="button" class="clear" aria-label=${`Clear ${this.label}`} @click=${this._clear}>
            <ha-icon icon="mdi:close"></ha-icon>
          </button>`:B}
      <ha-icon class="chev" icon="mdi:chevron-down" aria-hidden="true"></ha-icon>
      </div>
      ${this._open?U`<div class="panel">
            <mt-search-panel
              .items=${this._items()}
              .value=${this.value}
              .allowCustom=${this.allowCustom}
              placeholder="Search entities…"
              @pick=${this._onPick}
              @dismiss=${()=>this._open=!1}
            ></mt-search-panel>
          </div>`:B}
    `}};_i.styles=r`
    :host {
      display: block;
      position: relative;
    }
    .trigger-row {
      width: 100%;
      box-sizing: border-box;
      height: 40px;
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 10px 0 14px;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      border: 1px solid var(--md-sys-color-outline-variant, var(--divider-color));
      background: var(--md-sys-color-surface-container-high, var(--secondary-background-color));
      color: var(--md-sys-color-on-surface, var(--primary-text-color));
      cursor: pointer;
      font: inherit;
      font-size: 14px;
      -webkit-tap-highlight-color: transparent;
    }
    .trigger {
      display: flex;
      align-items: center;
      gap: inherit;
      flex: 1;
      min-width: 0;
      height: 100%;
      padding: 0;
      border: 0;
      background: transparent;
      color: inherit;
      font: inherit;
      cursor: pointer;
      border-radius: inherit;
    }
    .clear {
      display: flex;
      align-items: center;
      justify-content: center;
      flex: 0 0 32px;
      height: 32px;
      padding: 0;
      border: 0;
      border-radius: var(--md-sys-shape-corner-full, 9999px);
      background: transparent;
      color: var(--md-sys-color-on-surface-variant, var(--secondary-text-color));
      cursor: pointer;
      --mdc-icon-size: 20px;
    }
    .trigger .lead {
      --mdc-icon-size: 20px;
      flex: 0 0 auto;
      color: var(--md-sys-color-on-surface-variant, var(--secondary-text-color));
    }
    .trigger .text {
      flex: 1;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .trigger .text.muted {
      color: var(--md-sys-color-on-surface-variant, var(--secondary-text-color));
    }
    .trigger-row .chev {
      flex: 0 0 auto;
      --mdc-icon-size: 20px;
      color: var(--md-sys-color-on-surface-variant, var(--secondary-text-color));
      transition: transform 150ms cubic-bezier(0.2, 0, 0, 1);
    }
    .trigger-row.open .chev {
      transform: rotate(180deg);
    }
    .panel {
      position: absolute;
      z-index: 30;
      top: calc(100% + 6px);
      left: 0;
      right: 0;
      padding: 8px;
      box-sizing: border-box;
      background: var(--md-sys-color-surface-container-high, var(--card-background-color, #fff));
      border: 1px solid var(--md-sys-color-outline-variant, var(--divider-color));
      border-radius: 16px;
      box-shadow:
        0 4px 12px rgba(0, 0, 0, 0.3),
        0 1px 3px rgba(0, 0, 0, 0.2);
    }
  `,t([mt({attribute:!1})],_i.prototype,"hass",void 0),t([mt()],_i.prototype,"value",void 0),t([mt()],_i.prototype,"label",void 0),t([mt({attribute:!1})],_i.prototype,"includeDomains",void 0),t([mt({type:Boolean})],_i.prototype,"allowCustom",void 0),t([mt({type:Boolean})],_i.prototype,"clearable",void 0),t([ft()],_i.prototype,"_open",void 0),_i=t([ht("mt-entity-picker")],_i);let yi=class extends dt{_values(){return this.hass?.states?.[this.feature.entity]?.attributes?.options??[]}_orderedValues(){return jt(this._values(),this.feature.order)}_moveOption(t){t.stopPropagation();const{oldIndex:e,newIndex:i}=t.detail,s=this._orderedValues(),[o]=s.splice(e,1);s.splice(i,0,o),this._emit({order:s})}_override(t){return this.feature.options?.find(e=>e.value===t)}_emit(t){this.dispatchEvent(new CustomEvent("feature-changed",{detail:{feature:{...this.feature,...t}},bubbles:!0,composed:!0}))}_setOverride(t,e){const i=[...this.feature.options??[]],s=i.findIndex(e=>e.value===t),o={...s>=0?i[s]:{value:t},...e};""===o.label&&delete o.label,void 0===o.icon&&delete o.icon,o.hide||delete o.hide,o.color||delete o.color;const a=void 0!==o.label||void 0!==o.icon||!!o.hide||!!o.color;s>=0?a?i[s]=o:i.splice(s,1):a&&i.push(o),this._emit({options:i})}render(){const t=this._values(),e=this.feature.display??"icons";return U`
      <div class="editor">
        <mt-entity-picker
          .hass=${this.hass}
          .value=${this.feature.entity??""}
          .includeDomains=${["input_select"]}
          label="Input select entity"
          .allowCustom=${!0}
          @value-changed=${t=>this._emit({entity:t.detail.value})}
        ></mt-entity-picker>

        <mt-text-field
          label="Row label (optional)"
          .value=${this.feature.label??""}
          @value-changed=${t=>this._emit({label:t.detail.value||void 0})}
        ></mt-text-field>

        <div class="field">
          <span class="field-label">Display</span>
          <mt-display-toggle
            .value=${e}
            @value-changed=${t=>this._emit({display:t.detail.value})}
          ></mt-display-toggle>
        </div>

        <mt-width-field
          .hass=${this.hass}
          .value=${this.feature.width}
          .alignment=${this.feature.alignment}
          @width-changed=${t=>this._emit({width:t.detail.value})}
          @alignment-changed=${t=>this._emit({alignment:"left"===t.detail.value?void 0:t.detail.value})}
        ></mt-width-field>

        ${0===t.length?U`<p class="hint">Pick an input_select entity to customize its options.</p>`:U`<ha-sortable handle-selector=".handle" @item-moved=${this._moveOption}>
              <div class="options">
              ${this._orderedValues().map(t=>{const i=this._override(t),s=!!i?.hide,o="tile"===e;return U`<div class="opt">
                  <div class="handle"><ha-icon icon="mdi:drag"></ha-icon></div>
                  <div class="opt-name" title=${t}>${qt(t)}</div>
                  <div class="title-group">
                    ${o?U`<mt-color-field
                          .attached=${!0}
                          .value=${i?.color}
                          @value-changed=${e=>this._setOverride(t,{color:e.detail.value})}
                        ></mt-color-field>`:B}
                    <mt-text-field
                      label=${qt(t)}
                      .flatLeft=${o}
                      .value=${i?.label??""}
                      @value-changed=${e=>this._setOverride(t,{label:e.detail.value})}
                    ></mt-text-field>
                  </div>
                  <mt-icon-field
                    .hass=${this.hass}
                    .value=${i?.icon}
                    @value-changed=${e=>this._setOverride(t,{icon:e.detail.value})}
                  ></mt-icon-field>
                  <button
                    class="opt-hide ${s?"on":""}"
                    title=${s?"Hidden":"Visible"}
                    @click=${()=>this._setOverride(t,{hide:!s})}
                  >
                    <ha-icon icon=${s?"mdi:eye-off":"mdi:eye"}></ha-icon>
                  </button>
                </div>`})}
              </div>
            </ha-sortable>`}
      </div>
    `}};yi.styles=r`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px 0;
    }
    mt-entity-picker {
      display: block;
      width: 100%;
    }
    .field {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .field-label {
      color: var(--secondary-text-color);
      font-size: 14px;
    }
    .options {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .opt {
      display: grid;
      grid-template-columns: auto minmax(60px, 1fr) 2fr auto auto;
      align-items: center;
      gap: 8px;
    }
    .handle {
      cursor: grab;
      color: var(--secondary-text-color);
      display: grid;
      place-items: center;
    }
    .handle ha-icon {
      --mdc-icon-size: 20px;
    }
    .opt-name {
      font-size: 13px;
      color: var(--secondary-text-color);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .title-group {
      display: flex;
      align-items: stretch;
      min-width: 0;
    }
    .title-group mt-text-field {
      flex: 1;
      min-width: 0;
    }
    mt-icon-field {
      min-width: 0;
    }
    .opt-hide {
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: 50%;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .opt-hide.on {
      color: var(--error-color);
    }
    .hint {
      color: var(--secondary-text-color);
      font-size: 13px;
      margin: 0;
    }
  `,t([mt({attribute:!1})],yi.prototype,"hass",void 0),t([mt({attribute:!1})],yi.prototype,"feature",void 0),yi=t([ht("mt-input-select-editor")],yi);let bi=class extends dt{constructor(){super(...arguments),this.itemsKey="entities",this.showDisplay=!1}get _items(){return this.feature[this.itemsKey]??[]}_emit(t){this.dispatchEvent(new CustomEvent("feature-changed",{detail:{feature:{...this.feature,...t}},bubbles:!0,composed:!0}))}_setItems(t){this._emit({[this.itemsKey]:t})}_updateItem(t,e){const i=[...this._items],s={...i[t],...e};""===s.label&&delete s.label,void 0===s.icon&&delete s.icon,s.color||delete s.color,i[t]=s,this._setItems(i)}_addItem(){this._setItems([...this._items,{entity:""}])}_moveItem(t){t.stopPropagation();const{oldIndex:e,newIndex:i}=t.detail,s=[...this._items],[o]=s.splice(e,1);s.splice(i,0,o),this._setItems(s)}_removeItem(t){const e=[...this._items];e.splice(t,1),this._setItems(e)}render(){const t=this.feature.display??"icons",e=this.showDisplay&&"tile"===t;return U`
      <div class="editor">
        <mt-text-field
          label="Row label (optional)"
          .value=${this.feature.label??""}
          @value-changed=${t=>this._emit({label:t.detail.value||void 0})}
        ></mt-text-field>

        ${this.showDisplay?U`<div class="field">
              <span class="field-label">Display</span>
              <mt-display-toggle
                .value=${t}
                @value-changed=${t=>this._emit({display:t.detail.value})}
              ></mt-display-toggle>
            </div>`:B}

        <mt-width-field
          .hass=${this.hass}
          .value=${this.feature.width}
          .alignment=${this.feature.alignment}
          @width-changed=${t=>this._emit({width:t.detail.value})}
          @alignment-changed=${t=>this._emit({alignment:"left"===t.detail.value?void 0:t.detail.value})}
        ></mt-width-field>

        <ha-sortable handle-selector=".handle" @item-moved=${this._moveItem}>
          <div class="items">
            ${this._items.map((t,i)=>{const s=this.hass?.states?.[t.entity]?.attributes?.icon;return U`<div class="item">
                <div class="handle"><ha-icon icon="mdi:drag"></ha-icon></div>
                <div class="body">
                  <mt-entity-picker
                    .hass=${this.hass}
                    .value=${t.entity??""}
                    label="Entity"
                    .includeDomains=${this.includeDomains}
                    .allowCustom=${!0}
                    @value-changed=${t=>this._updateItem(i,{entity:t.detail.value})}
                  ></mt-entity-picker>
                  <div class="row2">
                    <mt-icon-field
                      .hass=${this.hass}
                      .value=${t.icon}
                      .defaultIcon=${s}
                      @value-changed=${t=>this._updateItem(i,{icon:t.detail.value})}
                    ></mt-icon-field>
                    <div class="title-group">
                      ${e?U`<mt-color-field
                            .attached=${!0}
                            .value=${t.color}
                            @value-changed=${t=>this._updateItem(i,{color:t.detail.value})}
                          ></mt-color-field>`:B}
                      <mt-text-field
                        class="title-field"
                        label="Custom title"
                        .flatLeft=${e}
                        .value=${t.label??""}
                        @value-changed=${t=>this._updateItem(i,{label:t.detail.value})}
                      ></mt-text-field>
                    </div>
                  </div>
                </div>
                <button class="del" title="Remove" @click=${()=>this._removeItem(i)}>
                  <ha-icon icon="mdi:close"></ha-icon>
                </button>
              </div>`})}
          </div>
        </ha-sortable>

        <ha-button @click=${this._addItem}>
          <ha-icon icon="mdi:plus" slot="icon"></ha-icon>
          Add entity
        </ha-button>
      </div>
    `}};bi.styles=r`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px 0;
    }
    .field {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .field-label {
      color: var(--secondary-text-color);
      font-size: 14px;
    }
    .items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    /* Two lines per item: entity picker on top, then the icon pill + custom
       title below. The drag handle and delete button flank both lines. */
    .item {
      display: grid;
      grid-template-columns: auto 1fr auto;
      align-items: center;
      gap: 8px;
      padding: 8px;
      border-radius: 12px;
      background: var(--md-sys-color-surface-container-high, var(--secondary-background-color));
    }
    .body {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }
    .row2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    /* Color pill + title field attach into a single pill. */
    .title-group {
      display: flex;
      align-items: stretch;
      flex: 1;
      min-width: 0;
    }
    .title-field {
      flex: 1;
      min-width: 0;
    }
    .handle {
      cursor: grab;
      color: var(--secondary-text-color);
      display: grid;
      place-items: center;
    }
    .handle ha-icon {
      --mdc-icon-size: 20px;
    }
    .del {
      width: 40px;
      height: 40px;
      border: none;
      background: transparent;
      border-radius: 50%;
      color: var(--secondary-text-color);
      cursor: pointer;
    }
    .del:hover {
      color: var(--error-color);
    }
    ha-button {
      align-self: flex-start;
      --mdc-theme-primary: var(--primary-color);
    }
  `,t([mt({attribute:!1})],bi.prototype,"hass",void 0),t([mt({attribute:!1})],bi.prototype,"feature",void 0),t([mt()],bi.prototype,"itemsKey",void 0),t([mt({type:Boolean})],bi.prototype,"showDisplay",void 0),t([mt({attribute:!1})],bi.prototype,"includeDomains",void 0),bi=t([ht("mt-entity-list-editor")],bi);const wi=[{value:"icon",label:"Icon",icon:"mdi:card-outline"},{value:"tile",label:"Tile",icon:"mdi:card-text-outline"}];let xi=class extends dt{get _display(){return this.feature.display??(this.feature.compact?"icon":"tile")}_patch(t){const e={...this.feature,...t};e.name||delete e.name,void 0===e.icon&&delete e.icon,e.color||delete e.color,delete e.compact,this.dispatchEvent(new CustomEvent("feature-changed",{detail:{feature:e},bubbles:!0,composed:!0}))}render(){const t=this._display,e="tile"===t,i=this.hass?.states?.[this.feature.entity]?.attributes?.icon;return U`
      <div class="editor">
        <div class="field">
          <span class="field-label">Display</span>
          <mt-display-toggle
            .value=${t}
            .options=${wi}
            @value-changed=${t=>this._patch({display:t.detail.value})}
          ></mt-display-toggle>
        </div>

        <mt-width-field
          .hass=${this.hass}
          .value=${this.feature.width}
          .alignment=${this.feature.alignment}
          .default=${50}
          @width-changed=${t=>this._patch({width:t.detail.value})}
          @alignment-changed=${t=>this._patch({alignment:"left"===t.detail.value?void 0:t.detail.value})}
        ></mt-width-field>

        <div class="item">
          <mt-entity-picker
            .hass=${this.hass}
            .value=${this.feature.entity??""}
            label="Entity"
            .allowCustom=${!0}
            @value-changed=${t=>this._patch({entity:t.detail.value})}
          ></mt-entity-picker>
          <div class="row2">
            <div class="title-group">
              ${e?U`<mt-color-field
                    .attached=${!0}
                    .value=${this.feature.color}
                    @value-changed=${t=>this._patch({color:t.detail.value})}
                  ></mt-color-field>`:B}
              <mt-text-field
                class="title-field"
                label="Custom title"
                .flatLeft=${e}
                .value=${this.feature.name??""}
                @value-changed=${t=>this._patch({name:t.detail.value})}
              ></mt-text-field>
            </div>
            <mt-icon-field
              .hass=${this.hass}
              .value=${this.feature.icon}
              .defaultIcon=${i}
              @value-changed=${t=>this._patch({icon:t.detail.value})}
            ></mt-icon-field>
          </div>
        </div>
      </div>
    `}};xi.styles=r`
    .editor {
      display: flex;
      flex-direction: column;
      gap: 12px;
      padding: 4px 0;
    }
    .field {
      display: flex;
      align-items: center;
      gap: 12px;
      flex-wrap: wrap;
    }
    .field-label {
      color: var(--secondary-text-color);
      font-size: 14px;
    }
    /* Two lines: the entity picker, then the color pill + title and the icon
       pill below — mirroring the entity-list editor's item. */
    .item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }
    .row2 {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    /* Color pill + title field attach into a single pill. */
    .title-group {
      display: flex;
      align-items: stretch;
      flex: 1;
      min-width: 0;
    }
    .title-field {
      flex: 1;
      min-width: 0;
    }
  `,t([mt({attribute:!1})],xi.prototype,"hass",void 0),t([mt({attribute:!1})],xi.prototype,"feature",void 0),xi=t([ht("mt-entity-tile-editor")],xi);const $i=[{name:"show_target_eta",selector:{boolean:{}}}];let ki,Ai=class extends dt{constructor(){super(...arguments),this.feelsLikeConfigured=!1,this._computeLabel=t=>"show_target_eta"===t.name?"Also show time until target temperature":t.name}get _data(){return{show_target_eta:this.feature.show_target_eta??!1}}_emit(t){this.dispatchEvent(new CustomEvent("feature-changed",{detail:{feature:{...this.feature,...t}},bubbles:!0,composed:!0}))}_changed(t){const e=t.detail.value;this._emit({show_target_eta:e.show_target_eta||void 0})}render(){return U`
      ${this.feelsLikeConfigured?B:U`<p class="warn">
            Set the temperature and humidity sensors in the “Feels-like temperature” section above
            — this feature needs them.
          </p>`}
      <ha-form
        .hass=${this.hass}
        .data=${this._data}
        .schema=${$i}
        .computeLabel=${this._computeLabel}
        @value-changed=${this._changed}
      ></ha-form>
      <mt-width-field
        .hass=${this.hass}
        .value=${this.feature.width}
        .alignment=${this.feature.alignment}
        @width-changed=${t=>this._emit({width:t.detail.value})}
        @alignment-changed=${t=>this._emit({alignment:"left"===t.detail.value?void 0:t.detail.value})}
      ></mt-width-field>
    `}};Ai.styles=r`
    :host {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .warn {
      margin: 0;
      padding: 8px 12px;
      border-radius: 8px;
      background: color-mix(in srgb, var(--warning-color, #ffa600) 14%, transparent);
      color: var(--primary-text-color);
      font-size: 13px;
    }
  `,t([mt({attribute:!1})],Ai.prototype,"hass",void 0),t([mt({attribute:!1})],Ai.prototype,"feature",void 0),t([mt({type:Boolean})],Ai.prototype,"feelsLikeConfigured",void 0),Ai=t([ht("mt-comfort-editor")],Ai);const Li=t=>({select:{mode:"dropdown",options:t}}),Ci=[{name:"entity",selector:{entity:{domain:["climate","water_heater"]}}},{name:"name",selector:{text:{}}},{name:"theme",selector:{theme:{}}},{name:"",type:"expandable",title:"Style",icon:"mdi:palette-outline",flatten:!0,schema:[{name:"dial_style",selector:Li([{value:"halo",label:"Halo"},{value:"minimal",label:"Minimal"},{value:"google",label:"Google Home"}])},{name:"show_current_as_primary",selector:{boolean:{}}},{name:"font",selector:Li([{value:"rounded",label:"Google Sans Flex (rounded)"},{value:"theme",label:"Theme font"}])}]}],Mi=[{name:"show_as_current",selector:{boolean:{}}}],Si=[{type:"climate-hvac-modes",label:"Climate HVAC modes",icon:"mdi:thermostat"},{type:"climate-fan-modes",label:"Climate fan modes",icon:"mdi:fan"},{type:"climate-swing-modes",label:"Climate vertical swing modes",icon:"mdi:arrow-oscillating"},{type:"climate-swing-horizontal-modes",label:"Climate horizontal swing modes",icon:"mdi:arrow-left-right"},{type:"climate-preset-modes",label:"Climate preset modes",icon:"mdi:leaf"},{type:"comfort",label:"Comfort & time to comfortable",icon:"mdi:emoticon-happy-outline"},{type:"water-heater-operation-modes",label:"Water heater operation modes",icon:"mdi:water-boiler"},{type:"water-heater-away-mode",label:"Water heater away mode",icon:"mdi:account-arrow-right"},{type:"input-select",label:"Input select",icon:"mdi:form-select"},{type:"switch-group",label:"Switch group",icon:"mdi:toggle-switch-outline"},{type:"switch-list",label:"Switch list",icon:"mdi:format-list-checks"},{type:"button-list",label:"Button list",icon:"mdi:gesture-tap-button"},{type:"entity-tile",label:"Entity tile",icon:"mdi:card-outline"},{type:"sensor-list",label:"Sensor list",icon:"mdi:format-list-bulleted"}],Ei={"climate-hvac-modes":"hvac_modes","climate-fan-modes":"fan_modes","climate-swing-modes":"swing_modes","climate-swing-horizontal-modes":"swing_horizontal_modes","climate-preset-modes":"preset_modes"},zi=new Set(["comfort"]);function Oi(t){switch(t){case"input-select":case"entity-tile":return{type:t,entity:""};case"switch-group":case"switch-list":return{type:t,entities:[]};case"button-list":case"sensor-list":return{type:t,items:[]};case"comfort":return{type:t,show_target_eta:!1};default:return{type:t}}}const Pi={"climate-hvac-modes":"Climate HVAC modes","climate-fan-modes":"Climate fan modes","climate-swing-modes":"Climate vertical swing modes","climate-preset-modes":"Climate preset modes","climate-swing-horizontal-modes":"Climate horizontal swing modes","water-heater-operation-modes":"Water heater operation modes","water-heater-away-mode":"Water heater away mode",comfort:"Comfort & time to comfortable","input-select":"Input select","switch-group":"Switch group","switch-list":"Switch list","button-list":"Button list","entity-tile":"Entity tile","sensor-list":"Sensor list"};let Ii=class extends dt{constructor(){super(...arguments),this._editingIndex=null,this._addOpen=!1,this._computeLabel=t=>{switch(t.name){case"entity":return"Climate or water heater entity (required)";case"name":return"Name";case"theme":return"Theme";case"dial_style":return"Dial style";case"font":return"Font";case"show_current_as_primary":return"Show current temperature as primary information";case"temperature":return"Temperature sensor";case"humidity":return"Humidity sensor";case"show_as_current":return"Show feels-like as the current temperature";default:return t.name}},this._computeHelper=t=>{switch(t.name){case"dial_style":return"Halo glows in the mode colour; Minimal has no glow; Google Home adds a flat dial background like the Google Home app.";case"font":return"Rounded loads Google Sans Flex from Google Fonts; Theme font uses your Home Assistant theme's font.";default:return}}}connectedCallback(){super.connectedCallback(),(ki||(ki=(async()=>{if(customElements.get("ha-form")&&customElements.get("ha-entity-picker")&&customElements.get("ha-icon-picker"))return;const t=window.loadCardHelpers;if(t)try{const e=await t(),i=await e.createCardElement({type:"entities",entities:[]}),s=i?.constructor;s?.getConfigElement&&await s.getConfigElement()}catch{}})(),ki)).then(()=>this.requestUpdate())}setConfig(t){this._config=t}get _baseData(){return{entity:this._config.entity,name:this._config.name,theme:this._config.theme,dial_style:this._config.dial_style??"halo",font:this._config.font??"rounded",show_current_as_primary:this._config.show_current_as_primary??!1}}get _feelsLikeData(){const t=this._config.feels_like??{};return{temperature:t.temperature,humidity:t.humidity,show_as_current:t.show_as_current??!1}}_emit(t){this._config=ie(t),yt(this,"config-changed",{config:this._config})}_baseChanged(t){const e=t.detail.value,i={...this._config,entity:e.entity,name:"string"==typeof this._config.name||void 0===this._config.name?e.name||void 0:this._config.name,theme:e.theme||void 0,dial_style:"halo"===e.dial_style?void 0:e.dial_style,font:"rounded"===e.font?void 0:e.font,show_current_as_primary:e.show_current_as_primary||void 0};this._emit(i)}_feelsLikeChanged(t){const e={...this._feelsLikeData,...t.detail.value},i={temperature:e.temperature||void 0,humidity:e.humidity||void 0,show_as_current:e.show_as_current||void 0},s=!i.temperature&&!i.humidity&&!i.show_as_current;this._emit({...this._config,feels_like:s?void 0:i})}_feelsLikeSensorChanged(t,e){e.stopPropagation(),this._feelsLikeChanged(new CustomEvent("value-changed",{detail:{value:{[t]:e.detail.value}}}))}get _features(){return this._config.features??[]}_addableFeatures(){const t=this.hass?.states?.[this._config.entity],e=t?.attributes??{},i=Wt(this._config.entity),s=new Set(this._features.map(t=>t.type));return Si.filter(({type:t})=>{if(zi.has(t))return"climate"===i&&!s.has(t);if("water-heater-away-mode"===t)return"water_heater"===i&&!s.has(t)&&"number"==typeof e.supported_features&&!!(4&e.supported_features);if("water-heater-operation-modes"===t)return"water_heater"===i&&!s.has(t)&&Array.isArray(e.operation_list)&&e.operation_list.length>0;const o=Ei[t];return!o||"climate"===i&&!s.has(t)&&Array.isArray(e[o])&&e[o].length>0})}_setFeatures(t){this._emit({...this._config,features:t})}_pickFeature(t){this._addOpen=!1;const e=[...this._features,Oi(t)];this._editingIndex=e.length-1,this._setFeatures(e)}_removeFeature(t){const e=[...this._features];e.splice(t,1),this._editingIndex=null,this._setFeatures(e)}_moveFeature(t){const{oldIndex:e,newIndex:i}=t.detail,s=[...this._features],[o]=s.splice(e,1);s.splice(i,0,o),this._editingIndex=null,this._setFeatures(s)}async _handleReorder(t,e){if("ArrowUp"!==e.key&&"ArrowDown"!==e.key)return;e.preventDefault();const i=t+("ArrowUp"===e.key?-1:1);i<0||i>=this._features.length||(this._moveFeature(new CustomEvent("item-moved",{detail:{oldIndex:t,newIndex:i}})),await this.updateComplete,this.shadowRoot.querySelectorAll(".handle")[i].focus())}_addMenuKeydown(t){"Escape"===t.key&&this._addOpen&&(t.preventDefault(),t.stopPropagation(),this._addOpen=!1,this.shadowRoot.querySelector(".add-btn").focus())}_labeledField(t,e){return U`<div class="field-column"><span class="field-label">${t}</span>${e}</div>`}_featureChanged(t,e){const i=[...this._features];i[t]=e.detail.feature,this._setFeatures(i)}render(){return this._config&&this.hass?U`
      <div class="editor">
        <ha-form
          .hass=${this.hass}
          .data=${this._baseData}
          .schema=${Ci.filter(t=>"name"!==t.name||"string"==typeof this._config.name||void 0===this._config.name)}
          .computeLabel=${this._computeLabel}
          .computeHelper=${this._computeHelper}
          @value-changed=${this._baseChanged}
        ></ha-form>

        ${"water_heater"===Wt(this._config.entity)?B:U`<ha-expansion-panel outlined .hass=${this.hass}>
          <div slot="header" class="panel-header">
            <ha-icon icon="mdi:thermometer-water"></ha-icon>
            <span>Feels-like temperature</span>
          </div>
          <div class="fields">
            <div class="field-row halves">
              ${["temperature","humidity"].map(t=>{const e=this._computeLabel({name:t});return this._labeledField(e,U`<mt-entity-picker
                  .hass=${this.hass}
                  .label=${e}
                  clearable
                  .includeDomains=${["sensor"]}
                  .value=${this._feelsLikeData[t]??""}
                  @value-changed=${e=>this._feelsLikeSensorChanged(t,e)}
                ></mt-entity-picker>`)})}
            </div>
        <ha-form
          .hass=${this.hass}
          .data=${this._feelsLikeData}
          .schema=${Mi}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._feelsLikeChanged}
        ></ha-form>
          </div>
        </ha-expansion-panel>`}

        <div class="features-header">
          <span>Features</span>
        </div>

        ${this._features.length?B:U`<p class="hint">No features yet. Add a feature below.</p>`}
        <ha-sortable handle-selector=".handle" @item-moved=${this._moveFeature}>
          <div class="features">
            ${this._features.map((t,e)=>this._renderFeatureRow(t,e))}
          </div>
        </ha-sortable>

        <div class="add" @keydown=${this._addMenuKeydown}>
          <button
            class="add-btn"
            aria-expanded=${this._addOpen?"true":"false"}
            @click=${()=>this._addOpen=!this._addOpen}
          >
            <ha-icon icon=${this._addOpen?"mdi:close":"mdi:plus"}></ha-icon>
            <span>Add feature</span>
          </button>
          ${this._addOpen?U`<div class="add-menu">
                ${this._addableFeatures().map(t=>U`<button class="add-opt" @click=${()=>this._pickFeature(t.type)}>
                    <ha-icon icon=${t.icon}></ha-icon>${t.label}
                  </button>`)}
              </div>`:B}
        </div>
      </div>
    `:U``}_summary(t){return"entities"in t?`${t.entities.length} entities`:"items"in t?`${t.items.length} entities`:"entity"in t?t.entity||"No entity selected":"comfort"===t.type?"Comfort":"options"in t&&t.options?`${t.options.length} modes`:"All modes"}_renderFeatureRow(t,e){const i=this._editingIndex===e,s=Pi[t.type]??t.type,o=Si.find(e=>e.type===t.type);return U`
      <div class="feature">
        <div class="feature-head">
          <div class="handle" tabindex="0" role="button"
            aria-label=${`Reorder ${s}. Use up and down arrow keys.`}
            @keydown=${t=>this._handleReorder(e,t)}
          ><ha-icon icon="mdi:drag"></ha-icon></div>
          <ha-icon icon=${o?.icon??"mdi:card-outline"}></ha-icon>
          <div class="feature-title"><div>${s}</div><div class="hint">${this._summary(t)}</div></div>
          <button
            class="icon-btn"
            aria-label="Edit feature"
            aria-expanded=${String(i)}
            @click=${()=>this._editingIndex=i?null:e}
          >
            <ha-icon icon=${i?"mdi:chevron-up":"mdi:pencil"}></ha-icon>
          </button>
          <button
            class="icon-btn"
            aria-label="Delete feature"
            @click=${()=>this._removeFeature(e)}
          >
            <ha-icon icon="mdi:delete"></ha-icon>
          </button>
        </div>
        ${i?this._renderFeatureEditor(t,e):B}
      </div>
    `}_renderFeatureEditor(t,e){const i=t=>this._featureChanged(e,t);let s;switch(t.type){case"climate-hvac-modes":case"climate-fan-modes":case"climate-swing-modes":case"climate-swing-horizontal-modes":case"water-heater-operation-modes":case"climate-preset-modes":{const e="climate-hvac-modes"===t.type?"hvac":"climate-fan-modes"===t.type?"fan":"climate-preset-modes"===t.type?"preset":"climate-swing-horizontal-modes"===t.type?"swing-horizontal":"water-heater-operation-modes"===t.type?"operation":"swing";s=U`<mt-climate-feature-editor
          .hass=${this.hass}
          .entityId=${this._config.entity}
          kind=${e}
          .feature=${t}
          @feature-changed=${i}
        ></mt-climate-feature-editor>`;break}case"water-heater-away-mode":s=U`
          <mt-text-field
            label="Title (optional)"
            .value=${t.label??""}
            @value-changed=${e=>i(new CustomEvent("feature-changed",{detail:{feature:{...t,label:e.detail.value||void 0}}}))}
          ></mt-text-field>
          ${this._labeledField("Display",U`<mt-display-toggle
            .value=${t.display??"icons"}
            .options=${[{value:"icons",label:"Icons",icon:"mdi:dots-grid"},{value:"tile",label:"Tile",icon:"mdi:card-text-outline"}]}
            @value-changed=${e=>i(new CustomEvent("feature-changed",{detail:{feature:{...t,display:e.detail.value}}}))}
          ></mt-display-toggle>`)}
          <mt-width-field
            .hass=${this.hass}
            .value=${t.width}
            .alignment=${t.alignment}
            @width-changed=${e=>i(new CustomEvent("feature-changed",{detail:{feature:{...t,width:e.detail.value}}}))}
            @alignment-changed=${e=>i(new CustomEvent("feature-changed",{detail:{feature:{...t,alignment:"left"===e.detail.value?void 0:e.detail.value}}}))}
          ></mt-width-field>
        `;break;case"input-select":s=U`<mt-input-select-editor
          .hass=${this.hass}
          .feature=${t}
          @feature-changed=${i}
        ></mt-input-select-editor>`;break;case"switch-group":s=U`<mt-entity-list-editor
          .hass=${this.hass}
          .feature=${t}
          itemsKey="entities"
          .showDisplay=${!0}
          .includeDomains=${["switch","input_boolean","light","fan"]}
          @feature-changed=${i}
        ></mt-entity-list-editor>`;break;case"switch-list":s=U`<mt-entity-list-editor
          .hass=${this.hass}
          .feature=${t}
          itemsKey="entities"
          .includeDomains=${["switch","input_boolean","light","fan"]}
          @feature-changed=${i}
        ></mt-entity-list-editor>`;break;case"button-list":s=U`<mt-entity-list-editor
          .hass=${this.hass}
          .feature=${t}
          itemsKey="items"
          .includeDomains=${["button","input_button","scene","script"]}
          @feature-changed=${i}
        ></mt-entity-list-editor>`;break;case"entity-tile":s=U`<mt-entity-tile-editor
          .hass=${this.hass}
          .feature=${t}
          @feature-changed=${i}
        ></mt-entity-tile-editor>`;break;case"sensor-list":s=U`<mt-entity-list-editor
          .hass=${this.hass}
          .feature=${t}
          itemsKey="items"
          .includeDomains=${["sensor","binary_sensor"]}
          @feature-changed=${i}
        ></mt-entity-list-editor>`;break;case"comfort":s=U`<mt-comfort-editor
          .hass=${this.hass}
          .feature=${t}
          .feelsLikeConfigured=${!(!this._config.feels_like?.temperature||!this._config.feels_like?.humidity)}
          @feature-changed=${i}
        ></mt-comfort-editor>`;break;default:s=U`<p class="hint">No editor available.</p>`}return U`<div class="feature-editor">${s}</div>`}};Ii.styles=[Mt,r`
    :host {
      display: block;
      container-type: inline-size;
    }
    ha-expansion-panel {
      --ha-card-border-radius: var(--ha-border-radius-lg, 12px);
      --expansion-panel-border-radius: var(--ha-border-radius-lg, 12px);
    }
    .panel-header {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .panel-header ha-icon {
      --mdc-icon-size: 24px;
    }
    .fields {
      display: flex;
      flex-direction: column;
      gap: 12px;
      min-width: 0;
      padding: 12px;
    }
    .field-row {
      display: grid;
      gap: 12px;
      min-width: 0;
    }
    .field-column {
      display: flex;
      flex-direction: column;
      gap: 8px;
      color: var(--mt-on-surface-variant);
    }
    .field-row > * {
      min-width: 0;
    }
    .halves {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    @container (width < 480px) {
      .field-row {
        grid-template-columns: minmax(0, 1fr);
      }
    }
    .editor {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .features-header {
      font-weight: 500;
      color: var(--mt-on-surface);
    }
    .features {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .feature {
      border: 1px solid var(--mt-outline-variant);
      border-radius: var(--mt-shape-chip-square);
      /* visible (not hidden) so a feature's icon-picker popover can extend past
         the card edge instead of being clipped inside it */
      overflow: visible;
      background: var(--mt-surface-container);
    }
    .feature-head {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px;
    }
    .handle {
      cursor: grab;
      color: var(--mt-on-surface-variant);
      display: grid;
      place-items: center;
      min-width: 44px;
      min-height: 44px;
      flex-shrink: 0;
    }
    .feature-title {
      flex: 1;
      min-width: 0;
      color: var(--mt-on-surface);
      overflow-wrap: anywhere;
    }
    .icon-btn {
      width: 44px;
      height: 44px;
      flex-shrink: 0;
      border: none;
      background: transparent;
      border-radius: var(--mt-shape-full);
      color: var(--mt-on-surface-variant);
      cursor: pointer;
    }
    button {
      font: inherit;
    }
    button:hover {
      background: var(--mt-surface-container-highest);
    }
    button:focus-visible,
    .handle:focus-visible {
      outline: 2px solid var(--mt-primary);
      outline-offset: 2px;
    }
    .feature-editor {
      padding: 8px 12px 12px;
      border-top: 1px solid var(--mt-outline-variant);
    }
    .hint {
      color: var(--mt-on-surface-variant);
      font-size: 13px;
      margin: 0;
      overflow-wrap: anywhere;
    }
    .add {
      position: relative;
    }
    .add-btn {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      padding: 10px 18px;
      border: none;
      border-radius: var(--mt-shape-full);
      background: var(--mt-primary);
      color: var(--mt-on-primary);
      cursor: pointer;
      font: inherit;
      font-weight: 500;
    }
    .add-btn:hover {
      background: var(--mt-primary);
      filter: brightness(0.95);
    }
    .add-btn ha-icon {
      --mdc-icon-size: 18px;
    }
    .add-menu {
      margin-top: 8px;
      display: flex;
      flex-direction: column;
      background: var(--mt-surface);
      border: 1px solid var(--mt-outline-variant);
      border-radius: var(--mt-shape-chip-square);
      overflow: hidden;
    }
    .add-opt {
      display: flex;
      align-items: center;
      gap: 8px;
      min-height: 44px;
      text-align: left;
      padding: 12px 16px;
      border: none;
      background: transparent;
      color: var(--mt-on-surface);
      cursor: pointer;
      font: inherit;
    }
  `],t([mt({attribute:!1})],Ii.prototype,"hass",void 0),t([ft()],Ii.prototype,"_config",void 0),t([ft()],Ii.prototype,"_editingIndex",void 0),t([ft()],Ii.prototype,"_addOpen",void 0),Ii=t([ht(Lt)],Ii);var Ti=Object.freeze({__proto__:null,get MaterialThermostatCardEditor(){return Ii}});export{ei as MaterialThermostatCard};
