import wx from './../../../adaptor.js';
const uneval=require("./uneval"),balancingGroup=require("../utils/balancing-group"),extractFn=require("../utils/extra-function");function defQuery(e,t){return[e,`${t} = ${t} || {}; ${t}.query = ${t}.query || {};`].join("")}function convert(jsText,isWpy){return jsText.replace(/(require\(['"])(\w+)/g,"$1./$2").replace(/(from\s+['"])(\w+)/g,(e,t)=>e.replace(t,[t,isWpy?"":"./"].join(""))).replace(/(let|var|const)\s+fetch\s*=/g,"$1 renameFetch = ").replace(/(\s+)renameFetch([;\s]*)$/,"$1renameFetch$2").replace(/[^\w.'"]fetch[.(]/g,e=>e.replace(/fetch/g,"renameFetch")).replace(/App\({[\s\S]+(onLaunch|onShow):\s*function\s*\(\s*(\w+)\s*\)[^{]*{/g,(e,t,r)=>defQuery(e,r)).replace(/App\({[\s\S]+(onLaunch|onShow)\s*\(\s*(\w+)\s*\)[^{]*{/g,(e,t,r)=>defQuery(e,r)).replace(/App\({[\s\S]+(onLaunch|onShow):\s*\(\s*(\w+)\s*\)\s*=>\s*[^{]*{/g,(e,t,r)=>defQuery(e,r)).replace(/Component\([\s\S]+properties:[^{]*{/,e=>e.replace("properties","props")).replace(/\.props/g,e=>e.replace(".props",".props")).replace(/Component\([\s\S]+methods:[^{]*{/,e=>[e,",\r\ntriggerEvent: function(name, opt) {\n            this.props['on' + name[0].toUpperCase() + name.substring(1)]({detail:opt});\n          },\r\n"].join("")).replace(/[\s\S]+/,match=>{if(!match.match(/Component\(/))return match;const lifeCircleNames=["created","attached","ready","detached"],lifeCircleFns=lifeCircleNames.map(e=>{const{args:t,body:r}=extractFn(match,e);return`${e}(${t})${r||"{}"}`}).join(",\n"),methods=(match.match(/methods:[\s\n]*{/)||{})[0];match=methods?match.replace(methods,[methods,lifeCircleFns].join("\r\n")):match.replace("let _observers = null;
Component({

        didMount() {
          this.data = Object.assign({}, this.data, this.props);
          
          this.created && this.created.apply(this, arguments);
          this.attached && this.attached.apply(this, arguments);
          this.ready && this.ready.apply(this, arguments);
        },
        didUnmount() {
          this.detached && this.detached.apply(this, arguments);
        },
          didUpdate: function(prevProps, preData) {
            for (let key in this.props) {
              if (_observers && typeof(_observers[key]) === 'function') {
                if (JSON.stringify(prevProps[key]) !== JSON.stringify(this.props[key]) && 
                JSON.stringify(preData[key]) !== JSON.stringify(this.props[key])) {
                  this.setData(Object.assign({}, this.data, {[key]: this.props[key]}));
                  _observers[key].apply(this, [this.props[key], prevProps[key]]);
                }
              } else if (this.props[key] !== prevProps[key]) {
                this.data[key] = this.props[key];
                this.setData(this.data);
              }
            }
          },",["Component({","methods: {
created(){},
attached(){},
ready(){},
detached(){}",lifeCircleFns,"}"].join("\r\n"));const props=(match.match(/props:[\s\S]+/)||{})[0]||"";if(!props)return match;const str=balancingGroup(props),obj=eval(`(${str})`),has=Object.prototype.hasOwnProperty,propMap={};let observerMap=null;const events=match.match(/\.triggerEvent\(['"]\w+['"]/g)||[];for(let e=0;e<events.length;e++){const t=events[e];let r=t.match(/\(['"](\w+)['"]/)[1];r=`on${r[0].toUpperCase()}${r.substring(1)}`,propMap[r]=(()=>{})}Object.keys(obj).forEach(key=>{if(has.call(obj,key)){const item=obj[key];propMap[key]=item.value,item.observer&&(observerMap=observerMap||{},"function"==typeof item.observer?observerMap[key]=item.observer:observerMap[key]=eval(`() => {\n                  this["${item.observer}"].apply(this, arguments);\n                }`))}});const didMount="\n        didMount() {\n          this.data = Object.assign({}, this.data, this.props);\n          \n          this.created && this.created.apply(this, arguments);\n          this.attached && this.attached.apply(this, arguments);\n          this.ready && this.ready.apply(this, arguments);\n        }",didUnmount=",\n        didUnmount() {\n          this.detached && this.detached.apply(this, arguments);\n        }",didUpdate=",\n          didUpdate: function(prevProps, preData) {\n            for (let key in this.props) {\n              if (_observers && typeof(_observers[key]) === 'function') {\n                if (JSON.stringify(prevProps[key]) !== JSON.stringify(this.props[key]) && \n                JSON.stringify(preData[key]) !== JSON.stringify(this.props[key])) {\n                  this.setData(Object.assign({}, this.data, {[key]: this.props[key]}));\n                  _observers[key].apply(this, [this.props[key], prevProps[key]]);\n                }\n              } else if (this.props[key] !== prevProps[key]) {\n                this.data[key] = this.props[key];\n                this.setData(this.data);\n              }\n            }\n          },",lifeCircle=[didMount,didUnmount,didUpdate].join(""),observers=uneval(observerMap).replace(/^\(|\)$/g,"").replace(/observer\(/g,"function(").replace(/\(\) => {/g,"function() {"),newProps=props.replace(str,uneval(propMap).replace(/^\(|\)$/g,""));return match.replace("Component({",`let _observers = ${observers};\r\nComponent({\r\n${lifeCircle}`).replace(props,newProps)}).replace(/methods:[\s\n]*{,
triggerEvent: function(name, opt) {
            this.props['on' + name[0].toUpperCase() + name.substring(1)]({detail:opt});
          },
[\s\S]*/g,e=>e.replace(/on\w+\((\w+)\)\s*{/g,(e,t)=>[e,`if (${t} && ${t}.target && ${t}.target.targetDataset) {\n              ${t}.target.dataset = ${t}.target.targetDataset;\n            }`].join("\r\n")))}module.exports=convert;