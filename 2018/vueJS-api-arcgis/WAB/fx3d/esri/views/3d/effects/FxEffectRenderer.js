/**
 * Copyright @ 2018 Esri.
 * All rights reserved under the copyright laws of the United States and applicable international laws, treaties, and conventions.
 */
define(["dojo/_base/lang","dojo/_base/array","esri/core/declare","esri/core/scheduling","esri/core/watchUtils","../webgl-engine-extensions/ShaderSnippets","esri/views/3d/support/earthUtils","esri/views/3d/lib/gl-matrix","esri/views/3d/webgl-engine/lib/RenderSlot","esri/layers/GraphicsLayer","./Effect","../support/fx3dUtils","dojo/text!./CommonShaders.xml"],function(e,i,t,s,a,n,r,_,o,h,l,c,f){var d=_.mat4d,w=_.vec3d,u=null,x=t(null,{declaredClass:"esri.views.3d.effects.FxEffectRenderer",constructor:function(){this._sceneView=null,this._internallyReady=!1,this._effects=[],this._fx3dFrameTask=null,this._shaderSnippets=null,this._normalMatrix=d.create(),this._viewDirection=w.create()},_init:function(i){!this._internallyReady&&e.isObject(i)&&(this._sceneView=i,a.whenTrue(this._sceneView,"ready",this._viewReadyHandler.bind(this)))},_showGround:function(e){if("boolean"==typeof e&&this._sceneView.map&&this._sceneView.map.ground){var i=this._sceneView.map.ground.layers;i.forEach(function(i){i&&i.set("visible",e)})}},_viewReadyHandler_bak:function(){this._gl=this._sceneView._stage&&this._sceneView._stage.view&&this._sceneView._stage.view._gl,this._gl instanceof window.WebGLRenderingContext&&(this._internallyReady!==!0&&(this._enableExtensions()?(this._shaderSnippets||(this._shaderSnippets=new n,this._shaderSnippets._parse(f)),this._internallyReady=!0):c.extensionsMessage()),this._internallyReady&&(this._fx3dFrameTask||this._initializeFrameTask()))},_viewReadyHandler:function(){this._sceneView._stage&&(this._sceneView._stage.addRenderPlugin([o.OPAQUE_EXTERNAL],this),this._labelsLayer=new h({id:"-labelinfo-layer",listMode:"hide"}),this._sceneView.map.add(this._labelsLayer))},_enableExtensions:function(e){var i=null;return window.WebGLRenderingContext&&this._gl instanceof window.WebGLRenderingContext?i=this._gl.getExtension("OES_texture_float")||this._gl.getExtension("OES_texture_float_linear")||this._gl.getExtension("OES_texture_half_float")||this._gl.getExtension("OES_texture_half_float_linear"):window.WebGL2RenderingContext&&this._gl instanceof window.WebGL2RenderingContext&&(i={}),null==i?console.error("Float texture extension is not supported in this browser."):this._vaoExt=e.vao,!!i},_update:function(){this._lightingData=this._sceneView._stage&&this._sceneView._stage.view._viewport.getLightingData(),this._camera=this._sceneView._stage&&this._sceneView._stage.getCamera(),this._cameraPos=this._camera._eye,this._viewMatrix=this._camera.viewMatrix,this._projMatrix=this._camera.projectionMatrix,this._viewInverseTransposeMatrix=this._camera.viewInverseTransposeMatrix,this._viewport=this._camera.viewport,d.set(this._viewInverseTransposeMatrix,this._normalMatrix),this._normalMatrix[3]=this._normalMatrix[7]=this._normalMatrix[11]=0,w.set3(this._viewMatrix[12],this._viewMatrix[13],this._viewMatrix[14],this._viewDirection)},initializeRenderContext:function(e){if(this.needsRender=!1,this._gl=e.gl,this._internallyReady!==!0){var i=e.rctx.extensions||e.rctx.capabilities;this._enableExtensions(i)?(this._shaderSnippets||(this._shaderSnippets=new n,this._shaderSnippets._parse(f)),this._internallyReady=!0,this.needsRender=!0):(this._sceneView._stage&&this._sceneView._stage.removeRenderPlugin(this),c.extensionsMessage())}},uninitializeRenderContext:function(e){},render:function(e){1!=e.pass&&(d.set(e.camera.viewInverseTransposeMatrix,this._normalMatrix),this._normalMatrix[3]=this._normalMatrix[7]=this._normalMatrix[11]=0,u=e.rctx||this._sceneView._stage.view._rctx,this._effects.forEach(function(i){i.effect.preRender(),i.effect.render({zoom:this._sceneView.zoom,proj:e.camera.projectionMatrix,view:e.camera.viewMatrix,viewInvTransp:e.camera.viewInverseTransposeMatrix,normalMat:this._normalMatrix,camPos:e.camera._eye,lightingData:e.lightingData,viewport:e.camera.viewport},u),i.effect.update()}.bind(this)))},_initializeFrameTask:function(){var e=this;this._frameTask={preRender:function(){e._update(),e._effects.forEach(function(e){e.effect.preRender()})},render:function(){e._effects.forEach(function(i){i.effect.render({proj:e._projMatrix,view:e._viewMatrix,normalMat:e._normalMatrix,camPos:e._cameraPos,lightingData:e._lightingData,viewport:e._viewport})})},update:function(){e._effects.forEach(function(e){e.effect.update()}),e._sceneView._stage.setNeedsRender()}},this._fx3dFrameTask=s.addFrameTask(this._frameTask)},_add:function(t,s){if(e.isObject(t)&&"esri.layers.FxLayer"===t.declaredClass&&s instanceof l){var a=i.filter(this._effects,function(e){return e.id===t.id&&e.effect.effectName==s.effectName});if(a.length>0)return console.warn("Layer "+t.id+" in "+s.effectName+" effect has already existed."),!1;if(e.isObject(s))return t.emit("hide-feature-label"),this._labelsLayer.id=t.id+this._labelsLayer.id,t._labelsLayer=this._labelsLayer,this._labelsLayer.visible=t.visible,t.watch("visible",function(e,i,s){this._labelsLayer&&(t.emit("hide-feature-label"),this._labelsLayer.set("visible",!!e))}.bind(this)),this._effects.push({id:t.id,effect:s}),"function"==typeof s.setContext&&s.setContext({gl:this._gl,vaoExt:this._vaoExt,shaderSnippets:this._shaderSnippets}),!0}return!1},_remove:function(e,t){if(e&&t){var s=-1,a=i.filter(this._effects,function(i,a){return i.id===t&&e==i.effect.effectName&&(s=a,!0)});a.length>0&&s>-1&&(a[0].effect.destroy(),this._effects.splice(s,1)),0===this._effects.length&&(this._fx3dFrameTask&&(this._fx3dFrameTask.remove(),this._fx3dFrameTask=null),this._internallyReady=!1,this._sceneView._stage&&this._sceneView._stage.removeRenderPlugin(this),this._labelsLayer&&(this._labelsLayer.removeAll(),this._sceneView.map.remove(this._labelsLayer)))}}}),p=null;return x.init=function(e){p||(p=new x),p._init(e)},x.add=function(e,i){return!!p&&p._add(e,i)},x.destroy=function(e,i){p&&p._remove(e,i)},x.pause=function(){p&&(p._fx3dFrameTask&&p._fx3dFrameTask.pause(),p.needsRender=!1)},x});