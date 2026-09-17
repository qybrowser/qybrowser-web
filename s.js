(function () {
  function kind() {
    var u = navigator.userAgent
    if (/Edg\//.test(u)) return "edge"
    if (/Firefox|FxiOS/.test(u)) return "firefox"
    if (/Safari/.test(u) && !/Chrome|Chromium|Android/.test(u)) return "safari"
    if (/Chrome|Chromium|CriOS/.test(u)) return "chrome"
    return "other"
  }
  function canvasFingerprint() {
    if (navigator.userAgent.indexOf("Trident") > -1) return "IE"
    var canvas = document.createElement("canvas")
    var ctx = canvas.getContext("2d")
    var text =
      'bzl|abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !"#$%&\'()*+,-./0123456789:;<=>?@[\\]^_`{|}~😃☺'
    canvas.width = 2000
    canvas.height = 200
    ctx.textBaseline = "top"
    ctx.font = '23px "Arial"'
    ctx.textBaseline = "alphabetic"
    ctx.fillStyle = "#f60"
    ctx.fillRect(125, 1, 62, 20)
    ctx.fillStyle = "#069"
    ctx.fillText(text, 2, 15)
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)"
    ctx.fillText(text, 4, 17)
    return canvas.toDataURL()
  }
  function getWebGLContext() {
    if (navigator.userAgent.indexOf("Trident") > -1) return "IE"
    try {
      var canvas = document.createElement("canvas")
      canvas.width = 256
      canvas.height = 128
      var opts = { preserveDrawingBuffer: true }
      return (
        canvas.getContext("webgl2", opts) ||
        canvas.getContext("experimental-webgl2", opts) ||
        canvas.getContext("webgl", opts) ||
        canvas.getContext("experimental-webgl", opts) ||
        canvas.getContext("moz-webgl", opts)
      )
    } catch (e) {
      return false
    }
  }
  function webglFingerprint() {
    var gl = getWebGLContext()
    try {
      if (gl == null || gl.getParameter(gl.VERSION) == null) return false
    } catch (e) {
      return false
    }
    try {
      var vertexMeta = gl.createBuffer()
      var buffer = gl.createBuffer()
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-0.2, -0.9, 0, 0.4, -0.26, 0, 0, 0.7321, 0]),
        gl.STATIC_DRAW
      )
      vertexMeta.itemSize = 3
      vertexMeta.numItems = 3
      var program = gl.createProgram()
      var vs = gl.createShader(gl.VERTEX_SHADER)
      gl.shaderSource(
        vs,
        "attribute vec2 attrVertex;varying vec2 varyinTexCoordinate;uniform vec2 uniformOffset;void main(){varyinTexCoordinate=attrVertex+uniformOffset;gl_Position=vec4(attrVertex,0,1);}"
      )
      gl.compileShader(vs)
      var fs = gl.createShader(gl.FRAGMENT_SHADER)
      gl.shaderSource(
        fs,
        "precision mediump float;varying vec2 varyinTexCoordinate;void main() {gl_FragColor=vec4(varyinTexCoordinate,0,1);}"
      )
      gl.compileShader(fs)
      gl.attachShader(program, vs)
      gl.attachShader(program, fs)
      gl.linkProgram(program)
      gl.useProgram(program)
      program.vertexPosAttrib = gl.getAttribLocation(program, "attrVertex")
      program.offsetUniform = gl.getUniformLocation(program, "uniformOffset")
      gl.enableVertexAttribArray(program.vertexPosArray)
      gl.vertexAttribPointer(
        program.vertexPosAttrib,
        vertexMeta.itemSize,
        gl.FLOAT,
        false,
        0,
        0
      )
      gl.uniform2f(program.offsetUniform, 1, 1)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertexMeta.numItems)
    } catch (e) {
      return false
    }
    var raw = ""
    try {
      var pixels = new Uint8Array(131072)
      gl.readPixels(0, 0, 256, 128, gl.RGBA, gl.UNSIGNED_BYTE, pixels)
      raw = JSON.stringify(pixels).replace(/,?"[0-9]+":/g, "")
      if (raw.replace(/^{[0]+}$/g, "") === "") return 1
    } catch (e) {
      return raw
    }
    return raw
  }
  function vendorRenderer() {
    var v = ""
    var r = ""
    try {
      var gl = getWebGLContext()
      if (!gl || gl === "IE") return { v: v, r: r }
      var info = gl.getExtension("WEBGL_debug_renderer_info")
      if (info) {
        v = String(gl.getParameter(info.UNMASKED_VENDOR_WEBGL) || "")
        r = String(gl.getParameter(info.UNMASKED_RENDERER_WEBGL) || "")
      }
    } catch (e) {}
    return { v: v, r: r }
  }
  function collectBoss() {
    var c = canvasFingerprint()
    var w = webglFingerprint()
    if (typeof c !== "string" || !c || c === "IE") return null
    if (typeof w !== "string" || !w) return null
    var vr = vendorRenderer()
    return { b: "boss", v: vr.v, r: vr.r, c: c, w: w }
  }
  function doneHas(k) {
    try {
      return JSON.parse(localStorage.getItem("_qc") || "[]").indexOf(k) >= 0
    } catch (e) {
      return false
    }
  }
  function mark(k) {
    try {
      var a = JSON.parse(localStorage.getItem("_qc") || "[]")
      if (a.indexOf(k) < 0) {
        a.push(k)
        localStorage.setItem("_qc", JSON.stringify(a))
      }
    } catch (e) {}
  }
  function endpoint() {
    var h = location.hostname
    if (h === "usefullc.com" || h === "www.usefullc.com")
      return "https://api.usefullc.com/api/v1/client/fp-collect"
    return "/api/v1/client/fp-collect"
  }
  function run() {
    try {
      var key = "boss:web"
      if (doneHas(key)) return
      var item = collectBoss()
      if (!item) return
      fetch(endpoint(), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ p: "web", k: kind(), items: [item] }),
      })
        .then(function (res) {
          if (!res.ok) return null
          return res.json()
        })
        .then(function (data) {
          if (data && data.success) mark(key)
        })
        .catch(function () {})
    } catch (e) {}
  }
  if (typeof requestIdleCallback === "function")
    requestIdleCallback(run, { timeout: 8000 })
  else setTimeout(run, 4000)
})()
