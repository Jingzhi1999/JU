/* ============================================================================
 * JU 共有语言提取 · skins-r9.js —— Halo / Sunset 背景皮肤（来源 R9，不是 V27）
 * 来源文件：/home/user/JU/.build/baseline/R9.html（去 base64 副本 R9.code.html，行号相同，共 88131 行）。
 * 三个 IIFE 均取自 <script data-bundled-source="vendor/v17-skins.js">（R9.code.html L81919-L83440）并按原样复制：
 *   ① Halo   —— R9.code.html L82119-L82749：class SharedHaloRenderer + HaloBackgroundElement，customElements.define("ju-halo-skin")
 *   ② Sunset —— R9.code.html L82752-L83313：同名 SharedHaloRenderer/HaloBackgroundElement（独立作用域），define("ju-sunset-skin")
 *   ③ 皮肤壳 —— R9.code.html L83316-L83440：<ju-legacy-background> 包装元素 + html[data-ju-skin] + localStorage("ju-background-skin-v1") + [data-ju-skin-select]
 * 同一脚本的前两个 IIFE（L81919-L82116，R9 自己重做的 "ju-cotton-skin" 棉花糖近似版）未收入：V27 的 Cotton Candy 原件是
 *   R9.code.html L81880-L81919 的 vendor/cotton-bg.js，与 V27 的 ./cotton-bg.js 逐字节相同（diff 为空），已提取为 backgrounds.js。
 * 依赖：无（Halo / Sunset 为裸 WebGL1，不用 three.js）；无外部图片 / 视频资源。R9 L86865 的 skin-previews.js 只是设置弹窗里的静态预览 PNG，不参与渲染。
 * 结构：每个皮肤一个共享离屏 WebGL 画布（MASTER 376×830，alpha:false，preserveDrawingBuffer）按 rAF 渲染，再 drawImage 到每个
 *   实例 shadow DOM 里的 2D canvas（copy 合成）；document.hidden 或 prefers-reduced-motion 时停 rAF（只画一帧）；WebGL 失败时
 *   paintFallback() 画 CSS 线性渐变。颜色、速度、亮度参数见 spec/baseline-v27.md「Halo / Sunset（来源 R9）」。
 * 页面级切换（R9.code.html L87289-L87312，setSkin：html[data-skin] + 650ms opacity/blur 交叉淡入）附在文件末尾注释中，未改。
 * ========================================================================== */

/* ---------- ① Halo  R9.code.html L82119-L82749 ---------- */
(() => {
  "use strict";

  const MASTER_WIDTH = 376;
  const MASTER_HEIGHT = 830;
  // The official Halo preset uses 0.4. This mobile background is deliberately
  // much calmer: one broad composition change takes roughly 40–50 seconds.
  const HALO_SPEED = 0.025;
  const HALO_BRIGHTNESS = 1.2;
  const requestedStartTime = new URLSearchParams(window.location.search).get(
    "haloTime",
  );
  const parsedStartTime = requestedStartTime === null
    ? Number.NaN
    : Number(requestedStartTime);
  const HALO_START_TIME = Number.isFinite(parsedStartTime)
    ? parsedStartTime
    : 340;

  const BASE_VERTEX_SHADER = `
    precision highp float;

    attribute vec3 aPosition;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uAspect;
    varying vec3 vPos;

    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 permute(vec4 x) {
      return mod289(((x * 34.0) + 1.0) * x);
    }

    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }

    vec3 fade(vec3 t) {
      return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }

    float cnoise(vec3 p) {
      vec3 pi0 = floor(p);
      vec3 pi1 = pi0 + vec3(1.0);
      pi0 = mod289(pi0);
      pi1 = mod289(pi1);
      vec3 pf0 = fract(p);
      vec3 pf1 = pf0 - vec3(1.0);
      vec4 ix = vec4(pi0.x, pi1.x, pi0.x, pi1.x);
      vec4 iy = vec4(pi0.yy, pi1.yy);
      vec4 iz0 = pi0.zzzz;
      vec4 iz1 = pi1.zzzz;

      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);

      vec4 gx0 = ixy0 * (1.0 / 7.0);
      vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);

      vec4 gx1 = ixy1 * (1.0 / 7.0);
      vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(0.0, gx1) - 0.5);
      gy1 -= sz1 * (step(0.0, gy1) - 0.5);

      vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
      vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
      vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
      vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
      vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
      vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
      vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
      vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

      vec4 norm0 = taylorInvSqrt(vec4(
        dot(g000, g000), dot(g010, g010),
        dot(g100, g100), dot(g110, g110)
      ));
      g000 *= norm0.x;
      g010 *= norm0.y;
      g100 *= norm0.z;
      g110 *= norm0.w;

      vec4 norm1 = taylorInvSqrt(vec4(
        dot(g001, g001), dot(g011, g011),
        dot(g101, g101), dot(g111, g111)
      ));
      g001 *= norm1.x;
      g011 *= norm1.y;
      g101 *= norm1.z;
      g111 *= norm1.w;

      float n000 = dot(g000, pf0);
      float n100 = dot(g100, vec3(pf1.x, pf0.yz));
      float n010 = dot(g010, vec3(pf0.x, pf1.y, pf0.z));
      float n110 = dot(g110, vec3(pf1.xy, pf0.z));
      float n001 = dot(g001, vec3(pf0.xy, pf1.z));
      float n101 = dot(g101, vec3(pf1.x, pf0.y, pf1.z));
      float n011 = dot(g011, vec3(pf0.x, pf1.yz));
      float n111 = dot(g111, pf1);

      vec3 fadeXYZ = fade(pf0);
      vec4 nz = mix(
        vec4(n000, n100, n010, n110),
        vec4(n001, n101, n011, n111),
        fadeXYZ.z
      );
      vec2 nyz = mix(nz.xy, nz.zw, fadeXYZ.y);
      return 2.2 * mix(nyz.x, nyz.y, fadeXYZ.x);
    }

    void main() {
      float t = uTime * uSpeed;
      float distortion = 0.75 * cnoise(0.43 * aPosition * 1.3 + vec3(t));
      vec3 local = aPosition + vec3(0.0, 0.0, distortion * 4.0);
      vPos = local;

      // Three.js Euler XYZ with rotation (0deg, 10deg, 50deg).
      const float cy = 0.984807753012208;
      const float sy = 0.173648177666930;
      const float cz = 0.642787609686539;
      const float sz = 0.766044443118978;
      vec3 world = vec3(
        cy * cz * local.x - cy * sz * local.y + sy * local.z,
        sz * local.x + cz * local.y,
        -sy * cz * local.x + sy * sz * local.y + cy * local.z
      );
      world.x -= 1.4;

      // Camera at (0, 0, -3.6), looking at the origin.
      vec3 camera = vec3(-world.x, world.y, -(world.z + 3.6));
      const float focal = 2.414213562373095;
      const float projectionA = -1.000200020002000;
      const float projectionB = -0.200020002000200;
      gl_Position = vec4(
        camera.x * focal / uAspect,
        camera.y * focal,
        projectionA * camera.z + projectionB,
        -camera.z
      );
    }
  `;

  const BASE_FRAGMENT_SHADER = `
    precision highp float;

    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uBrightness;
    varying vec3 vPos;

    void main() {
      vec3 color = mix(
        mix(uColor1, uColor2, smoothstep(-3.0, 3.0, vPos.x)),
        uColor3,
        vPos.z
      );

      // Ambient light is brightness * PI. The original material's
      // metalness is 0.2, giving brightness * (1.0 - metalness).
      gl_FragColor = vec4(color * uBrightness * 0.8, 1.0);
    }
  `;

  const HALFTONE_VERTEX_SHADER = `
    precision highp float;

    attribute vec2 aPosition;
    varying vec2 vUV;
    varying vec2 vPosition;

    void main() {
      vUV = aPosition * 0.5 + 0.5;
      vPosition = aPosition;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;

  const HALFTONE_FRAGMENT_SHADER = `
    precision highp float;

    uniform sampler2D uTexture;
    varying vec2 vUV;

    void main() {
      // Clean presentation pass: preserve Halo color and motion without
      // scatter, halftone dots, or high-frequency grain.
      gl_FragColor = texture2D(uTexture, vUV);
    }
  `;

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || "Unknown shader compile error";
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || "Unknown shader link error";
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  function createPlaneVertices() {
    const rows = 192;
    const vertices = new Float32Array((rows + 1) * 2 * 3);
    let cursor = 0;
    for (let row = 0; row <= rows; row += 1) {
      const y = 5 - (row / rows) * 10;
      vertices[cursor++] = -5;
      vertices[cursor++] = y;
      vertices[cursor++] = 0;
      vertices[cursor++] = 5;
      vertices[cursor++] = y;
      vertices[cursor++] = 0;
    }
    return vertices;
  }

  class SharedHaloRenderer {
    constructor() {
      this.instances = new Set();
      this.master = null;
      this.gl = null;
      this.resources = null;
      this.contextLost = false;
      this.failed = false;
      this.raf = 0;
      // Start on the recognizable Halo composition instead of the nearly
      // monochrome opening phase; motion then continues at the slower speed.
      this.elapsed = HALO_START_TIME;
      this.lastTimestamp = null;
      this.tick = this.tick.bind(this);

      this.motionQuery = typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
      this.reducedMotion = Boolean(this.motionQuery && this.motionQuery.matches);
      this.handleMotionChange = this.handleMotionChange.bind(this);
      this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

      if (this.motionQuery) {
        if (typeof this.motionQuery.addEventListener === "function") {
          this.motionQuery.addEventListener("change", this.handleMotionChange);
        } else if (typeof this.motionQuery.addListener === "function") {
          this.motionQuery.addListener(this.handleMotionChange);
        }
      }
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }

    ensureRenderer() {
      if (this.gl || this.failed) return;

      this.master = document.createElement("canvas");
      this.master.width = MASTER_WIDTH;
      this.master.height = MASTER_HEIGHT;
      this.master.setAttribute("aria-hidden", "true");

      this.master.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        this.contextLost = true;
        this.stop();
      });

      this.master.addEventListener("webglcontextrestored", () => {
        this.contextLost = false;
        try {
          this.resources = this.buildResources(this.gl);
          this.failed = false;
          this.lastTimestamp = null;
          this.renderAndMirror();
          this.start();
        } catch (error) {
          this.fail(error);
        }
      });

      this.gl = this.master.getContext("webgl", {
        alpha: false,
        antialias: false,
        depth: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      }) || this.master.getContext("experimental-webgl", {
        alpha: false,
        antialias: false,
        depth: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
      });

      if (!this.gl) {
        this.fail(new Error("WebGL is unavailable"));
        return;
      }

      try {
        this.resources = this.buildResources(this.gl);
      } catch (error) {
        this.fail(error);
      }
    }

    buildResources(gl) {
      const baseProgram = createProgram(gl, BASE_VERTEX_SHADER, BASE_FRAGMENT_SHADER);
      const halftoneProgram = createProgram(
        gl,
        HALFTONE_VERTEX_SHADER,
        HALFTONE_FRAGMENT_SHADER,
      );

      const planeVertices = createPlaneVertices();
      const planeBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, planeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, planeVertices, gl.STATIC_DRAW);

      const quadBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, 3, -1, -1, 3, -1]),
        gl.STATIC_DRAW,
      );

      const baseTexture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, baseTexture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGBA,
        MASTER_WIDTH,
        MASTER_HEIGHT,
        0,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        null,
      );

      const depthBuffer = gl.createRenderbuffer();
      gl.bindRenderbuffer(gl.RENDERBUFFER, depthBuffer);
      gl.renderbufferStorage(
        gl.RENDERBUFFER,
        gl.DEPTH_COMPONENT16,
        MASTER_WIDTH,
        MASTER_HEIGHT,
      );

      const framebuffer = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
      gl.framebufferTexture2D(
        gl.FRAMEBUFFER,
        gl.COLOR_ATTACHMENT0,
        gl.TEXTURE_2D,
        baseTexture,
        0,
      );
      gl.framebufferRenderbuffer(
        gl.FRAMEBUFFER,
        gl.DEPTH_ATTACHMENT,
        gl.RENDERBUFFER,
        depthBuffer,
      );

      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) {
        throw new Error("Halo framebuffer is incomplete");
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);

      return {
        baseProgram,
        halftoneProgram,
        planeBuffer,
        planeVertexCount: planeVertices.length / 3,
        quadBuffer,
        baseTexture,
        depthBuffer,
        framebuffer,
        base: {
          position: gl.getAttribLocation(baseProgram, "aPosition"),
          time: gl.getUniformLocation(baseProgram, "uTime"),
          speed: gl.getUniformLocation(baseProgram, "uSpeed"),
          aspect: gl.getUniformLocation(baseProgram, "uAspect"),
          color1: gl.getUniformLocation(baseProgram, "uColor1"),
          color2: gl.getUniformLocation(baseProgram, "uColor2"),
          color3: gl.getUniformLocation(baseProgram, "uColor3"),
          brightness: gl.getUniformLocation(baseProgram, "uBrightness"),
        },
        halftone: {
          position: gl.getAttribLocation(halftoneProgram, "aPosition"),
          texture: gl.getUniformLocation(halftoneProgram, "uTexture"),
          resolution: gl.getUniformLocation(halftoneProgram, "uResolution"),
        },
      };
    }

    add(instance) {
      this.instances.add(instance);
      this.ensureRenderer();
      if (this.failed) {
        instance.paintFallback();
        return;
      }
      this.renderAndMirror();
      this.start();
    }

    remove(instance) {
      this.instances.delete(instance);
      if (this.instances.size === 0) this.stop();
    }

    fail(error) {
      this.failed = true;
      this.stop();
      console.warn("[halo-bg] Falling back because the WebGL renderer failed.", error);
      this.instances.forEach((instance) => instance.paintFallback());
    }

    render() {
      const gl = this.gl;
      const resources = this.resources;
      if (!gl || !resources || this.contextLost || this.failed) return;

      gl.bindFramebuffer(gl.FRAMEBUFFER, resources.framebuffer);
      gl.viewport(0, 0, MASTER_WIDTH, MASTER_HEIGHT);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.CULL_FACE);
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(resources.baseProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, resources.planeBuffer);
      gl.enableVertexAttribArray(resources.base.position);
      gl.vertexAttribPointer(resources.base.position, 3, gl.FLOAT, false, 0, 0);
      gl.uniform1f(resources.base.time, this.elapsed);
      gl.uniform1f(resources.base.speed, HALO_SPEED);
      gl.uniform1f(resources.base.aspect, MASTER_WIDTH / MASTER_HEIGHT);
      gl.uniform3f(resources.base.color1, 1, 80 / 255, 5 / 255);
      gl.uniform3f(resources.base.color2, 219 / 255, 186 / 255, 149 / 255);
      gl.uniform3f(resources.base.color3, 208 / 255, 188 / 255, 225 / 255);
      gl.uniform1f(resources.base.brightness, HALO_BRIGHTNESS);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, resources.planeVertexCount);

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, MASTER_WIDTH, MASTER_HEIGHT);
      gl.disable(gl.DEPTH_TEST);
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.useProgram(resources.halftoneProgram);
      gl.bindBuffer(gl.ARRAY_BUFFER, resources.quadBuffer);
      gl.enableVertexAttribArray(resources.halftone.position);
      gl.vertexAttribPointer(resources.halftone.position, 2, gl.FLOAT, false, 0, 0);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, resources.baseTexture);
      gl.uniform1i(resources.halftone.texture, 0);
      gl.uniform2f(resources.halftone.resolution, MASTER_WIDTH, MASTER_HEIGHT);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.flush();
    }

    renderAndMirror() {
      if (this.failed) return;
      this.render();
      if (!this.master || this.contextLost) return;
      this.instances.forEach((instance) => instance.paint(this.master));
    }

    tick(timestamp) {
      this.raf = 0;
      if (
        this.instances.size === 0 ||
        this.reducedMotion ||
        document.hidden ||
        this.contextLost ||
        this.failed
      ) {
        this.lastTimestamp = null;
        return;
      }

      if (this.lastTimestamp !== null) {
        this.elapsed += Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      }
      this.lastTimestamp = timestamp;
      this.renderAndMirror();
      this.start();
    }

    start() {
      if (
        this.raf ||
        this.instances.size === 0 ||
        this.reducedMotion ||
        document.hidden ||
        this.contextLost ||
        this.failed
      ) return;
      this.raf = requestAnimationFrame(this.tick);
    }

    stop() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.lastTimestamp = null;
    }

    handleMotionChange(event) {
      this.reducedMotion = event.matches;
      this.stop();
      this.renderAndMirror();
      this.start();
    }

    handleVisibilityChange() {
      this.stop();
      if (!document.hidden) {
        this.renderAndMirror();
        this.start();
      }
    }
  }

  const sharedRenderer = new SharedHaloRenderer();

  class HaloBackgroundElement extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
        :host {
          position: absolute;
          inset: 0;
          display: block;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
          contain: paint;
        }

        canvas {
          display: block;
          width: 100%;
          height: 100%;
          background: #ff5005;
          pointer-events: none;
        }
      `;

      this.canvas = document.createElement("canvas");
      this.canvas.width = MASTER_WIDTH;
      this.canvas.height = MASTER_HEIGHT;
      this.canvas.setAttribute("aria-hidden", "true");
      this.context = this.canvas.getContext("2d", { alpha: false });
      root.append(style, this.canvas);
    }

    connectedCallback() {
      this.setAttribute("aria-hidden", "true");
      sharedRenderer.add(this);
    }

    disconnectedCallback() {
      sharedRenderer.remove(this);
    }

    paint(source) {
      if (!this.context) return;
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      this.context.globalCompositeOperation = "copy";
      this.context.drawImage(source, 0, 0, MASTER_WIDTH, MASTER_HEIGHT);
      this.context.globalCompositeOperation = "source-over";
    }

    paintFallback() {
      if (!this.context) return;
      const gradient = this.context.createLinearGradient(0, 0, MASTER_WIDTH, MASTER_HEIGHT);
      gradient.addColorStop(0, "#ff5005");
      gradient.addColorStop(0.58, "#dbba95");
      gradient.addColorStop(1, "#d0bce1");
      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, MASTER_WIDTH, MASTER_HEIGHT);
    }
  }

  if (!customElements.get("ju-halo-skin")) {
    customElements.define("ju-halo-skin", HaloBackgroundElement);
  }
})();

/* ---------- ② Sunset  R9.code.html L82752-L83313 ---------- */
(() => {
  "use strict";

  const MASTER_WIDTH = 376;
  const MASTER_HEIGHT = 830;
  const SUNSET_SPEED = 0.1;
  const SUNSET_BRIGHTNESS = 1.5;
  const searchParams = new URLSearchParams(window.location.search);
  const requestedStartTime = searchParams.get("sunsetTime")
    ?? searchParams.get("haloTime");
  const parsedStartTime = requestedStartTime === null
    ? Number.NaN
    : Number(requestedStartTime);
  const SUNSET_START_TIME = Number.isFinite(parsedStartTime)
    ? parsedStartTime
    : 0;
  const SUNSET_PAUSED = searchParams.get("sunsetPaused") === "1";

  const SUNSET_VERTEX_SHADER = `
    precision highp float;

    attribute vec3 aPosition;
    uniform float uTime;
    uniform float uSpeed;
    uniform float uAspect;
    varying vec3 vPos;

    vec3 mod289(vec3 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 mod289(vec4 x) {
      return x - floor(x * (1.0 / 289.0)) * 289.0;
    }

    vec4 permute(vec4 x) {
      return mod289(((x * 34.0) + 1.0) * x);
    }

    vec4 taylorInvSqrt(vec4 r) {
      return 1.79284291400159 - 0.85373472095314 * r;
    }

    vec3 fade(vec3 t) {
      return t * t * t * (t * (t * 6.0 - 15.0) + 10.0);
    }

    float pnoise(vec3 p, vec3 repetition) {
      vec3 pi0 = mod(floor(p), repetition);
      vec3 pi1 = mod(pi0 + vec3(1.0), repetition);
      pi0 = mod289(pi0);
      pi1 = mod289(pi1);
      vec3 pf0 = fract(p);
      vec3 pf1 = pf0 - vec3(1.0);
      vec4 ix = vec4(pi0.x, pi1.x, pi0.x, pi1.x);
      vec4 iy = vec4(pi0.yy, pi1.yy);
      vec4 iz0 = pi0.zzzz;
      vec4 iz1 = pi1.zzzz;

      vec4 ixy = permute(permute(ix) + iy);
      vec4 ixy0 = permute(ixy + iz0);
      vec4 ixy1 = permute(ixy + iz1);

      vec4 gx0 = ixy0 * (1.0 / 7.0);
      vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;
      gx0 = fract(gx0);
      vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);
      vec4 sz0 = step(gz0, vec4(0.0));
      gx0 -= sz0 * (step(0.0, gx0) - 0.5);
      gy0 -= sz0 * (step(0.0, gy0) - 0.5);

      vec4 gx1 = ixy1 * (1.0 / 7.0);
      vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;
      gx1 = fract(gx1);
      vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);
      vec4 sz1 = step(gz1, vec4(0.0));
      gx1 -= sz1 * (step(0.0, gx1) - 0.5);
      gy1 -= sz1 * (step(0.0, gy1) - 0.5);

      vec3 g000 = vec3(gx0.x, gy0.x, gz0.x);
      vec3 g100 = vec3(gx0.y, gy0.y, gz0.y);
      vec3 g010 = vec3(gx0.z, gy0.z, gz0.z);
      vec3 g110 = vec3(gx0.w, gy0.w, gz0.w);
      vec3 g001 = vec3(gx1.x, gy1.x, gz1.x);
      vec3 g101 = vec3(gx1.y, gy1.y, gz1.y);
      vec3 g011 = vec3(gx1.z, gy1.z, gz1.z);
      vec3 g111 = vec3(gx1.w, gy1.w, gz1.w);

      vec4 norm0 = taylorInvSqrt(vec4(
        dot(g000, g000), dot(g010, g010),
        dot(g100, g100), dot(g110, g110)
      ));
      g000 *= norm0.x;
      g010 *= norm0.y;
      g100 *= norm0.z;
      g110 *= norm0.w;

      vec4 norm1 = taylorInvSqrt(vec4(
        dot(g001, g001), dot(g011, g011),
        dot(g101, g101), dot(g111, g111)
      ));
      g001 *= norm1.x;
      g011 *= norm1.y;
      g101 *= norm1.z;
      g111 *= norm1.w;

      float n000 = dot(g000, pf0);
      float n100 = dot(g100, vec3(pf1.x, pf0.yz));
      float n010 = dot(g010, vec3(pf0.x, pf1.y, pf0.z));
      float n110 = dot(g110, vec3(pf1.xy, pf0.z));
      float n001 = dot(g001, vec3(pf0.xy, pf1.z));
      float n101 = dot(g101, vec3(pf1.x, pf0.y, pf1.z));
      float n011 = dot(g011, vec3(pf0.x, pf1.yz));
      float n111 = dot(g111, pf1);

      vec3 fadeXYZ = fade(pf0);
      vec4 nz = mix(
        vec4(n000, n100, n010, n110),
        vec4(n001, n101, n011, n111),
        fadeXYZ.z
      );
      vec2 nyz = mix(nz.xy, nz.zw, fadeXYZ.y);
      return 2.2 * mix(nyz.x, nyz.y, fadeXYZ.x);
    }

    mat3 rotation3dY(float angle) {
      float sine = sin(angle);
      float cosine = cos(angle);
      return mat3(
        cosine, 0.0, -sine,
        0.0, 1.0, 0.0,
        sine, 0.0, cosine
      );
    }

    void main() {
      float t = uTime * uSpeed;
      vec3 surfaceNormal = normalize(aPosition);
      float uvY = 0.5 + asin(clamp(surfaceNormal.y, -1.0, 1.0))
        / 3.141592653589793;
      float distortion = pnoise(
        (surfaceNormal + vec3(t)) * 1.1,
        vec3(10.0)
      ) * 0.4;
      float spiral = sin(uvY * 5.5 + t) * 1.4;
      vec3 local = aPosition + surfaceNormal * distortion;
      local = rotation3dY(spiral) * local;
      vPos = local;

      // ShaderGradient fixes sphere distance at 14, then applies azimuth 60,
      // polar 90, camera zoom 15.3 and FOV 45 from the 07 Sunset preset.
      vec3 world = local + vec3(0.0, -0.15, 0.0);
      const vec3 eye = vec3(12.124355652982141, 0.0, 7.0);
      const vec3 cameraRight = vec3(0.5, 0.0, -0.866025403784439);
      const vec3 cameraUp = vec3(0.0, 1.0, 0.0);
      const vec3 cameraForward = vec3(-0.866025403784439, 0.0, -0.5);
      vec3 fromEye = world - eye;
      float cameraX = dot(fromEye, cameraRight);
      float cameraY = dot(fromEye, cameraUp);
      float cameraDepth = dot(fromEye, cameraForward);
      float cameraZ = -cameraDepth;
      const float focal = 36.937467503643563;
      const float projectionA = -1.000200020002000;
      const float projectionB = -0.200020002000200;
      gl_Position = vec4(
        cameraX * focal / uAspect,
        cameraY * focal,
        projectionA * cameraZ + projectionB,
        -cameraZ
      );
    }
  `;

  const SUNSET_FRAGMENT_SHADER = `
    precision highp float;

    uniform vec3 uColor1;
    uniform vec3 uColor2;
    uniform vec3 uColor3;
    uniform float uBrightness;
    varying vec3 vPos;

    void main() {
      float distanceToCenter = distance(vPos, vec3(0.0));
      vec3 verticalBlend = mix(
        uColor2,
        uColor1,
        smoothstep(-1.0, 1.0, vPos.y)
      );
      vec3 color = mix(uColor3, verticalBlend, distanceToCenter);

      // ShaderGradient's 3D light is brightness * PI. MeshPhysicalMaterial's
      // metalness 0.2 leaves 80% diffuse energy under this ambient-only light.
      gl_FragColor = vec4(color * uBrightness * 0.8, 1.0);
    }
  `;

  function compileShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const message = gl.getShaderInfoLog(shader) || "Unknown shader compile error";
      gl.deleteShader(shader);
      throw new Error(message);
    }
    return shader;
  }

  function createProgram(gl, vertexSource, fragmentSource) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const message = gl.getProgramInfoLog(program) || "Unknown shader link error";
      gl.deleteProgram(program);
      throw new Error(message);
    }
    return program;
  }

  function createSphereVertices() {
    const latitudeSegments = 64;
    const longitudeSegments = 128;
    const vertices = new Float32Array(
      latitudeSegments * longitudeSegments * 6 * 3,
    );
    let cursor = 0;

    const writePoint = (theta, phi) => {
      const sinTheta = Math.sin(theta);
      vertices[cursor++] = sinTheta * Math.cos(phi);
      vertices[cursor++] = Math.cos(theta);
      vertices[cursor++] = sinTheta * Math.sin(phi);
    };

    for (let latitude = 0; latitude < latitudeSegments; latitude += 1) {
      const theta0 = (latitude / latitudeSegments) * Math.PI;
      const theta1 = ((latitude + 1) / latitudeSegments) * Math.PI;
      for (let longitude = 0; longitude < longitudeSegments; longitude += 1) {
        const phi0 = (longitude / longitudeSegments) * Math.PI * 2;
        const phi1 = ((longitude + 1) / longitudeSegments) * Math.PI * 2;
        writePoint(theta0, phi0);
        writePoint(theta1, phi0);
        writePoint(theta1, phi1);
        writePoint(theta0, phi0);
        writePoint(theta1, phi1);
        writePoint(theta0, phi1);
      }
    }
    return vertices;
  }

  class SharedHaloRenderer {
    constructor() {
      this.instances = new Set();
      this.master = null;
      this.gl = null;
      this.resources = null;
      this.contextLost = false;
      this.failed = false;
      this.raf = 0;
      this.elapsed = SUNSET_START_TIME;
      this.lastTimestamp = null;
      this.tick = this.tick.bind(this);

      this.motionQuery = typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
      this.reducedMotion = SUNSET_PAUSED
        || Boolean(this.motionQuery && this.motionQuery.matches);
      this.handleMotionChange = this.handleMotionChange.bind(this);
      this.handleVisibilityChange = this.handleVisibilityChange.bind(this);

      if (this.motionQuery) {
        if (typeof this.motionQuery.addEventListener === "function") {
          this.motionQuery.addEventListener("change", this.handleMotionChange);
        } else if (typeof this.motionQuery.addListener === "function") {
          this.motionQuery.addListener(this.handleMotionChange);
        }
      }
      document.addEventListener("visibilitychange", this.handleVisibilityChange);
    }

    ensureRenderer() {
      if (this.gl || this.failed) return;

      this.master = document.createElement("canvas");
      this.master.width = MASTER_WIDTH;
      this.master.height = MASTER_HEIGHT;
      this.master.setAttribute("aria-hidden", "true");

      this.master.addEventListener("webglcontextlost", (event) => {
        event.preventDefault();
        this.contextLost = true;
        this.stop();
      });

      this.master.addEventListener("webglcontextrestored", () => {
        this.contextLost = false;
        try {
          this.resources = this.buildResources(this.gl);
          this.failed = false;
          this.lastTimestamp = null;
          this.renderAndMirror();
          this.start();
        } catch (error) {
          this.fail(error);
        }
      });

      const contextOptions = {
        alpha: false,
        antialias: true,
        depth: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true,
        powerPreference: "high-performance",
      };
      this.gl = this.master.getContext("webgl", contextOptions)
        || this.master.getContext("experimental-webgl", contextOptions);

      if (!this.gl) {
        this.fail(new Error("WebGL is unavailable"));
        return;
      }

      try {
        this.resources = this.buildResources(this.gl);
      } catch (error) {
        this.fail(error);
      }
    }

    buildResources(gl) {
      const program = createProgram(
        gl,
        SUNSET_VERTEX_SHADER,
        SUNSET_FRAGMENT_SHADER,
      );
      const sphereVertices = createSphereVertices();
      const sphereBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, sphereBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, sphereVertices, gl.STATIC_DRAW);

      return {
        program,
        sphereBuffer,
        sphereVertexCount: sphereVertices.length / 3,
        uniforms: {
          position: gl.getAttribLocation(program, "aPosition"),
          time: gl.getUniformLocation(program, "uTime"),
          speed: gl.getUniformLocation(program, "uSpeed"),
          aspect: gl.getUniformLocation(program, "uAspect"),
          color1: gl.getUniformLocation(program, "uColor1"),
          color2: gl.getUniformLocation(program, "uColor2"),
          color3: gl.getUniformLocation(program, "uColor3"),
          brightness: gl.getUniformLocation(program, "uBrightness"),
        },
      };
    }

    add(instance) {
      this.instances.add(instance);
      this.ensureRenderer();
      if (this.failed) {
        instance.paintFallback();
        return;
      }
      this.renderAndMirror();
      this.start();
    }

    remove(instance) {
      this.instances.delete(instance);
      if (this.instances.size === 0) this.stop();
    }

    fail(error) {
      this.failed = true;
      this.stop();
      console.warn("[halo-bg] Falling back because the Sunset renderer failed.", error);
      this.instances.forEach((instance) => instance.paintFallback());
    }

    render() {
      const gl = this.gl;
      const resources = this.resources;
      if (!gl || !resources || this.contextLost || this.failed) return;

      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      gl.viewport(0, 0, MASTER_WIDTH, MASTER_HEIGHT);
      gl.enable(gl.DEPTH_TEST);
      gl.depthFunc(gl.LEQUAL);
      gl.disable(gl.CULL_FACE);
      gl.clearColor(0, 0, 0, 1);
      gl.clearDepth(1);
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.useProgram(resources.program);
      gl.bindBuffer(gl.ARRAY_BUFFER, resources.sphereBuffer);
      gl.enableVertexAttribArray(resources.uniforms.position);
      gl.vertexAttribPointer(
        resources.uniforms.position,
        3,
        gl.FLOAT,
        false,
        0,
        0,
      );
      gl.uniform1f(resources.uniforms.time, this.elapsed);
      gl.uniform1f(resources.uniforms.speed, SUNSET_SPEED);
      gl.uniform1f(resources.uniforms.aspect, MASTER_WIDTH / MASTER_HEIGHT);
      gl.uniform3f(resources.uniforms.color1, 1, 122 / 255, 51 / 255);
      gl.uniform3f(resources.uniforms.color2, 51 / 255, 160 / 255, 1);
      gl.uniform3f(resources.uniforms.color3, 1, 197 / 255, 61 / 255);
      gl.uniform1f(resources.uniforms.brightness, SUNSET_BRIGHTNESS);
      gl.drawArrays(gl.TRIANGLES, 0, resources.sphereVertexCount);
      gl.flush();
    }

    renderAndMirror() {
      if (this.failed) return;
      this.render();
      if (!this.master || this.contextLost) return;
      this.instances.forEach((instance) => instance.paint(this.master));
    }

    tick(timestamp) {
      this.raf = 0;
      if (
        this.instances.size === 0
        || this.reducedMotion
        || document.hidden
        || this.contextLost
        || this.failed
      ) {
        this.lastTimestamp = null;
        return;
      }

      if (this.lastTimestamp !== null) {
        this.elapsed += Math.min((timestamp - this.lastTimestamp) / 1000, 0.1);
      }
      this.lastTimestamp = timestamp;
      this.renderAndMirror();
      this.start();
    }

    start() {
      if (
        this.raf
        || this.instances.size === 0
        || this.reducedMotion
        || document.hidden
        || this.contextLost
        || this.failed
      ) return;
      this.raf = requestAnimationFrame(this.tick);
    }

    stop() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.lastTimestamp = null;
    }

    handleMotionChange(event) {
      this.reducedMotion = event.matches;
      this.stop();
      this.renderAndMirror();
      this.start();
    }

    handleVisibilityChange() {
      this.stop();
      if (!document.hidden) {
        this.renderAndMirror();
        this.start();
      }
    }
  }

  const sharedRenderer = new SharedHaloRenderer();

  class HaloBackgroundElement extends HTMLElement {
    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = `
        :host {
          position: absolute;
          inset: 0;
          display: block;
          overflow: hidden;
          z-index: 0;
          pointer-events: none;
          contain: paint;
        }

        canvas {
          display: block;
          width: 100%;
          height: 100%;
          background: #ff7a33;
          pointer-events: none;
        }
      `;

      this.canvas = document.createElement("canvas");
      this.canvas.width = MASTER_WIDTH;
      this.canvas.height = MASTER_HEIGHT;
      this.canvas.setAttribute("aria-hidden", "true");
      this.context = this.canvas.getContext("2d", { alpha: false });
      root.append(style, this.canvas);
    }

    connectedCallback() {
      this.setAttribute("aria-hidden", "true");
      sharedRenderer.add(this);
    }

    disconnectedCallback() {
      sharedRenderer.remove(this);
    }

    paint(source) {
      if (!this.context) return;
      this.context.setTransform(1, 0, 0, 1, 0, 0);
      this.context.globalCompositeOperation = "copy";
      this.context.drawImage(source, 0, 0, MASTER_WIDTH, MASTER_HEIGHT);
      this.context.globalCompositeOperation = "source-over";
    }

    paintFallback() {
      if (!this.context) return;
      const gradient = this.context.createLinearGradient(
        0,
        0,
        0,
        MASTER_HEIGHT,
      );
      gradient.addColorStop(0, "#fea669");
      gradient.addColorStop(0.32, "#f99674");
      gradient.addColorStop(0.58, "#cb9ca3");
      gradient.addColorStop(0.8, "#9ca2d1");
      gradient.addColorStop(1, "#85a2e8");
      this.context.fillStyle = gradient;
      this.context.fillRect(0, 0, MASTER_WIDTH, MASTER_HEIGHT);
    }
  }

  if (!customElements.get("ju-sunset-skin")) {
    customElements.define("ju-sunset-skin", HaloBackgroundElement);
  }
})();

/* ---------- ③ 皮肤壳 ju-legacy-background  R9.code.html L83316-L83440 ---------- */
(() => {
  "use strict";

  const STORAGE_KEY = "ju-background-skin-v1";
  const TAGS = Object.freeze({
    cotton: "ju-cotton-skin",
    halo: "ju-halo-skin",
    sunset: "ju-sunset-skin",
  });
  const instances = new Set();
  let activeSkin = "cotton";

  function isSkin(value) {
    return Object.prototype.hasOwnProperty.call(TAGS, value);
  }

  try {
    const savedSkin = window.localStorage.getItem(STORAGE_KEY);
    if (isSkin(savedSkin)) activeSkin = savedSkin;
  } catch (_) {}

  function syncControls() {
    document.querySelectorAll("[data-ju-skin-select]").forEach((control) => {
      if (control.value !== activeSkin) control.value = activeSkin;
    });
  }

  function applySkin(value, persist) {
    const nextSkin = isSkin(value) ? value : "cotton";
    const changed = nextSkin !== activeSkin;
    activeSkin = nextSkin;
    if (persist) {
      try { window.localStorage.setItem(STORAGE_KEY, activeSkin); } catch (_) {}
    }
    document.documentElement.setAttribute("data-ju-skin", activeSkin);
    instances.forEach((instance) => instance.renderSkin(activeSkin));
    syncControls();
    if (changed) {
      window.dispatchEvent(new CustomEvent("ju-skin-change", {
        detail: { skin: activeSkin },
      }));
    }
    return activeSkin;
  }

  class JuSkinBackground extends HTMLElement {
    static get observedAttributes() { return ["seed", "src"]; }

    constructor() {
      super();
      const root = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent =
        ":host{position:absolute;inset:0;display:block;overflow:hidden;" +
        "z-index:0;pointer-events:none;contain:paint}" +
        "div{position:absolute;inset:0;overflow:hidden}" +
        "ju-cotton-skin,ju-halo-skin,ju-sunset-skin{" +
        "position:absolute;inset:0;display:block}";
      this._holder = document.createElement("div");
      root.append(style, this._holder);
      this._child = null;
      this._skin = null;
    }

    connectedCallback() {
      this.setAttribute("aria-hidden", "true");
      instances.add(this);
      this.renderSkin(activeSkin);
    }

    disconnectedCallback() {
      instances.delete(this);
    }

    attributeChangedCallback(name, oldValue, newValue) {
      if (!this._child || oldValue === newValue) return;
      if (newValue === null) this._child.removeAttribute(name);
      else this._child.setAttribute(name, newValue);
      if (name === "seed") this._child.seed = newValue;
    }

    renderSkin(value) {
      const nextSkin = isSkin(value) ? value : "cotton";
      if (this._skin === nextSkin && this._child?.isConnected) return;
      const child = document.createElement(TAGS[nextSkin]);
      const seed = this.getAttribute("seed") ?? this.seed;
      const source = this.getAttribute("src") ?? this.src;
      if (seed !== null && seed !== undefined && seed !== "") {
        child.setAttribute("seed", String(seed));
        child.seed = seed;
      }
      if (source) child.setAttribute("src", String(source));
      child.setAttribute("aria-hidden", "true");
      this._holder.replaceChildren(child);
      this._child = child;
      this._skin = nextSkin;
    }
  }

  if (!customElements.get("ju-legacy-background")) {
    customElements.define("ju-legacy-background", JuSkinBackground);
  }

  document.addEventListener("change", (event) => {
    const control = event.target;
    if (control instanceof HTMLSelectElement &&
        control.matches("[data-ju-skin-select]")) {
      applySkin(control.value, true);
    }
  });

  window.addEventListener("storage", (event) => {
    if (event.key === STORAGE_KEY) applySkin(event.newValue, false);
  });

  window.JU_SET_SKIN = (value) => applySkin(value, true);
  window.JU_GET_SKIN = () => activeSkin;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", syncControls, { once: true });
  } else {
    queueMicrotask(syncControls);
  }
  applySkin(activeSkin, false);
})();</script><script data-bundled-source="v17-data.js">window.JU_CREATE_BASE={"source":"JU_开局流程_v17（三皮肤·离线版）.html / __bundler/template","phrases":["深夜救急火锅局","菜狗快乐羽毛球","宜家大件拼车，有卡","周末看展搭子局","下班 Coffee Chat 半小时","早八自习互相监督","打不过就加入·麻将","一起去 Costco 补货","看完展去吃小笼包","周五夜骑绕一圈","摆烂咖啡两小时","新手友好桌游夜","中央公园野餐局","雨天火锅不出门","谁陪我去看演出"],"themes":[{"id":"food","g":"🍲","l":"热饭","s":"简餐 / 漂亮饭"},{"id":"coffee","g":"☕️","l":"咖啡","s":"CHAT / NETWORK"},{"id":"sports","g":"🏸","l":"运动","s":"暴汗局 / 养生局"},{"id":"games","g":"🎲","l":"桌游","s":"GAMES / 麻将"},{"id":"culture","g":"🎬","l":"展览","s":"ART / 电影"},{"id":"code","g":"💻","l":"干活","s":"自习 / WORKSHOP"},{"id":"walk","g":"🛍️","l":"逛街","s":"CITYWALK / SHOP"},{"id":"night","g":"🍸","l":"夜生活","s":"ROOFTOP / CLUB"},{"id":"outdoor","g":"⛺️","l":"户外","s":"HIKE / CAMP"},{"id":"music","g":"🎤","l":"音乐会","s":"LIVEHOUSE / GIG"},{"id":"custom","g":"✍️","l":"自定义","s":"CUSTOM"}],"packs":[{"id":"invite","n":"邀请函","en":"INVITE"},{"id":"street","n":"街拍","en":"STREET"},{"id":"grain","n":"深夜颗粒","en":"GRAIN"},{"id":"mono","n":"终端","en":"MONO"},{"id":"riso","n":"纸感","en":"RISO"},{"id":"acid","n":"荧光","en":"ACID"}],"cityOptions":[{"id":"NYC","zh":"纽约","en":"NEW YORK"},{"id":"BOS","zh":"波士顿","en":"BOSTON"},{"id":"LA","zh":"洛杉矶","en":"LOS ANGELES"},{"id":"SFO","zh":"湾区","en":"BAY AREA"},{"id":"SEA","zh":"西雅图","en":"SEATTLE"},{"id":"CHI","zh":"芝加哥","en":"CHICAGO"}],"hoodMap":{"NYC":["Queens-法拉盛","Queens-长岛市","Manhattan-中城","Manhattan-上东区","Manhattan-东村","Manhattan-下城","Brooklyn-威廉斯堡","Brooklyn-八大道","NJ-JSQ","NJ-Grove Street","自定义"],"BOS":["Cambridge-哈佛广场","Cambridge-中央广场","Boston-Allston","Boston-后湾","Boston-中国城","Boston-Fenway","Brookline-Coolidge","Quincy-Wollaston","自定义"],"LA":["SGV-Arcadia","SGV-Rowland","LA-韩国城","LA-西好莱坞","LA-DTLA","Pasadena-Old Town","Santa Monica-海滨","Irvine-Diamond","自定义"],"SFO":["South Bay-Milpitas","South Bay-Palo Alto","South Bay-Cupertino","East Bay-Fremont","East Bay-Oakland","East Bay-Berkeley","SF-Sunset","SF-SOMA","自定义"],"SEA":["Seattle-Capitol Hill","Seattle-U District","Seattle-国际区","Seattle-Ballard","Bellevue-Downtown","Redmond-Overlake","Kirkland-Totem Lake","Tacoma-Downtown","自定义"],"CHI":["Chicago-中国城","Chicago-Loop","Chicago-River North","Chicago-Wicker Park","Chicago-Hyde Park","Chicago-Lincoln Park","Evanston-NU","Naperville-Downtown","自定义"]},"feedRows":{"NYC":[["food","invite","深夜救急火锅局","HOTPOT RESCUE","12.18","19:30","Queens-法拉盛","老杨",4],["food","grain","川菜辣度分级评审团","SPICE PANEL","12.19","18:30","Brooklyn-八大道","麻酱",5],["food","riso","漂亮饭 · 只拍不吃派","PRETTY PLATE","12.21","12:30","Manhattan-下城","鱼丸",3],["coffee","street","下班 Coffee Chat 半小时","AFTER WORK","12.17","18:00","Manhattan-中城","Nina",1],["coffee","mono","早八摆烂咖啡局","SLOW MORNING","12.22","08:30","Manhattan-东村","小满",2],["coffee","grain","产品人瞎聊 Networks","PM TALK","12.23","19:00","Manhattan-中城","Ivy",4],["sports","acid","菜狗羽毛球拼局","BADMINTON","12.19","14:00","Queens-长岛市","球球",2],["sports","mono","跑不动也来 5K","EASY 5K","12.20","08:00","Manhattan-上东区","Ken",6],["sports","street","养生局 · 拉伸半小时","STRETCH","12.22","20:00","Brooklyn-威廉斯堡","阿檬",3],["games","invite","四缺一 · 别装了","MAHJONG","12.18","20:30","Queens-法拉盛","阿宽",1],["games","riso","狼人杀新手场","WEREWOLF","12.20","19:00","Manhattan-下城","大熊",5],["games","acid","桌游店包场 · 随便玩","BOARD NIGHT","12.26","15:00","NJ-JSQ","Tin",4],["culture","riso","周末看展搭子局","PS1 WALK","12.20","13:00","Queens-长岛市","蛋挞",3],["culture","mono","午夜场老电影","MIDNIGHT REEL","12.19","23:00","Manhattan-东村","老周",2],["culture","grain","独立书店逛到关门","BOOKSTORE","12.27","16:00","Brooklyn-威廉斯堡","西西",3],["code","mono","Vibe Coding 通宵场","BUILD NIGHT","12.18","21:00","Manhattan-中城","Ray",3],["code","street","自习室拼桌 · 别摸鱼","DEEP WORK","12.21","10:00","Manhattan-上东区","Momo",5],["walk","street","SoHo 逛街扫货","SOHO SHOP","12.20","14:30","Manhattan-下城","Kiki",4],["walk","invite","Vintage 淘货 Citywalk","VINTAGE DIG","12.27","13:00","Brooklyn-威廉斯堡","阿蒋",3],["night","invite","天台小酒 · 看天际线","ROOFTOP","12.19","21:30","Manhattan-中城","Leo",4],["night","acid","蹦到腿软 · 电子场","CLUB NIGHT","12.26","23:30","Brooklyn-威廉斯堡","Cyc",6],["outdoor","grain","中央公园野餐","PARK PICNIC","12.21","11:30","Manhattan-上东区","花卷",6],["outdoor","mono","布鲁克林桥夜骑","NIGHT RIDE","12.18","21:00","Brooklyn-威廉斯堡","Bike",3],["music","riso","Livehouse 站前排","FRONT ROW","12.20","20:00","Brooklyn-威廉斯堡","Nono",2],["music","street","爵士小酒馆蹲一晚","JAZZ BAR","12.23","21:00","Manhattan-东村","老K",3]],"BOS":[["food","invite","Allston 麻辣香锅拼桌","MALA POT","12.19","19:00","Boston-Allston","小林",3],["food","grain","东北菜硬核局","NORTHEAST","12.22","18:00","Quincy-Wollaston","铁蛋",4],["coffee","riso","Cambridge 早八自习局","MORNING DESK","12.21","08:30","Cambridge-哈佛广场","阿檬",4],["coffee","mono","Back Bay 咖啡瞎聊","SLOW CHAT","12.26","15:00","Boston-后湾","Yuki",2],["sports","acid","MIT 体育馆羽毛球","GYM SMASH","12.20","16:00","Cambridge-中央广场","Sam",4],["games","invite","麻将三缺一","MAHJONG","12.18","20:00","Boston-Allston","老陈",1],["culture","riso","美术馆免费夜","MFA NIGHT","12.24","18:30","Boston-后湾","Lulu",3],["code","mono","Hackathon 前夜赶工","HACK EVE","12.19","21:00","Cambridge-哈佛广场","Neo",5],["walk","street","Newbury 街扫货","NEWBURY","12.20","13:30","Boston-后湾","Mia",3],["night","acid","学生场 Club","STUDENT NIGHT","12.26","22:30","Boston-Allston","Dee",6],["outdoor","grain","查尔斯河边散步","RIVER WALK","12.20","15:30","Boston-后湾","Yuki",2],["music","riso","小场地 Indie Gig","INDIE GIG","12.23","20:00","Boston-Allston","Ada",3]],"LA":[["food","grain","Arcadia 半夜烤肉","LATE KBBQ","12.18","22:00","SGV-Arcadia","阿宽",4],["food","invite","Koreatown 豆腐汤","SOON TOFU","12.21","19:00","LA-韩国城","Jae",3],["coffee","mono","西好莱坞 Vibe Coding","BUILD DAY","12.23","19:00","LA-西好莱坞","Tin",3],["coffee","street","Pasadena 晴天咖啡","SUNNY CAFE","12.20","10:30","Pasadena-Old Town","Cleo",2],["sports","acid","Santa Monica 慢跑","BEACH RUN","12.20","07:30","Santa Monica-海滨","Ray",5],["sports","mono","攀岩馆抱石","BOULDER","12.22","18:30","Pasadena-Old Town","Ben",4],["games","riso","桌游 + 披萨","GAME PIZZA","12.19","19:30","SGV-Arcadia","小鹿",5],["culture","riso","Getty 看展","GETTY","12.27","13:00","Santa Monica-海滨","Mimi",3],["walk","street","Melrose 淘 Vintage","MELROSE","12.26","14:00","LA-韩国城","Zoe",4],["night","invite","天台落日酒","SUNSET BAR","12.19","18:30","Santa Monica-海滨","Sol",4],["outdoor","grain","Runyon 徒步看日出","SUNRISE HIKE","12.21","06:30","Pasadena-Old Town","Hux",6],["music","acid","Echo Park 小型 Gig","ECHO GIG","12.24","20:30","LA-韩国城","Rae",3]],"SFO":[["food","invite","Milpitas 老火锅夜","HOTPOT NIGHT","12.18","20:00","South Bay-Milpitas","汤圆",3],["food","grain","Sunset 粤菜早茶","DIM SUM","12.20","10:30","SF-Sunset","阿珍",4],["coffee","mono","湾区周末 Build 局","WEEKEND BUILD","12.19","10:00","South Bay-Palo Alto","Ken",4],["coffee","street","Oakland 咖啡瞎聊","OAK CHAT","12.22","16:00","East Bay-Oakland","Nia",2],["sports","acid","羽毛球俱乐部","CLUB SMASH","12.21","18:00","South Bay-Milpitas","Wei",4],["games","riso","剧本杀中文场","MURDER GAME","12.26","19:00","South Bay-Milpitas","小鱼",5],["culture","riso","SFMOMA 慢慢看","SFMOMA","12.27","13:30","SF-Sunset","Lin",3],["walk","street","Union Square 扫货","UNION SQ","12.20","14:00","SF-SOMA","Coco",3],["night","invite","天台看湾区夜景","BAY VIEW","12.19","21:00","East Bay-Oakland","Van",4],["outdoor","grain","Lands End 海边走","LANDS END","12.21","11:00","SF-Sunset","Bo",5]],"SEA":[["food","invite","中国城打边炉","HOTPOT","12.19","19:00","Bellevue-Downtown","阿海",4],["food","grain","西雅图三文鱼局","SALMON","12.22","18:30","Seattle-U District","Kai",3],["coffee","street","雨天咖啡摆烂局","RAINY CAFE","12.19","16:00","Bellevue-Downtown","西西",3],["coffee","mono","Redmond 早八自习","EARLY DESK","12.21","08:00","Redmond-Overlake","Ann",4],["sports","acid","室内羽毛球","INDOOR SMASH","12.20","17:00","Redmond-Overlake","Jun",4],["games","riso","Capitol Hill 桌游","BOARD GAME","12.26","19:30","Seattle-Capitol Hill","Momo",5],["walk","street","Capitol Hill 逛唱片店","RECORD DIG","12.20","14:00","Seattle-Capitol Hill","Momo",2],["night","invite","小酒馆听黑胶","VINYL BAR","12.23","21:00","Seattle-Capitol Hill","Ola",3],["outdoor","grain","Discovery Park 徒步","DISCOVERY","12.21","10:00","Seattle-U District","Fern",6]],"CHI":[["food","grain","中国城暖锅局","WARM POT","12.19","18:30","Chicago-中国城","老周",4],["food","invite","深盘披萨挑战","DEEP DISH","12.21","19:00","Chicago-Loop","Max",3],["coffee","mono","Loop 早八咖啡","LOOP CAFE","12.22","08:30","Chicago-Loop","Iris",2],["sports","acid","室内篮球半场","HALF COURT","12.20","16:00","Evanston-NU","Duke",5],["games","riso","麻将 + 夜宵","MAHJONG","12.18","20:00","Chicago-中国城","阿玲",1],["culture","riso","美术馆免费日","ART FREE","12.27","13:00","Chicago-Loop","Sun",3],["night","invite","爵士老酒馆","JAZZ ROOM","12.23","21:00","Chicago-Lincoln Park","Ray",4],["outdoor","grain","湖边暴走","LAKE WALK","12.20","11:00","Chicago-Lincoln Park","Bea",5]]},"applicants":[{"id":1,"name":"小面","intro":"刚考完 midterm，特别能吃辣","v":"columbia.edu","wx":"noodle_0v0","st":"locked"},{"id":2,"name":"Momo","intro":"带一杯冷萃当见面礼 ☕️","v":"nyu.edu","wx":"momo-coldbrew","st":"locked"},{"id":3,"name":"Leon","intro":"在曼哈顿上班，可以带锅底","v":"google.com","wx":"leon_hotpot","st":"pending"},{"id":4,"name":"Kiki","intro":"战斗力弱但很爱吃，新手友好吗？","v":null,"wx":"kiki1210","st":"pending"},{"id":5,"name":"阿蒋","intro":"SVA 在读，想认识点新朋友","v":"sva.edu","wx":"jiang.sva","st":"pending"}],"limits":{"title":30,"place":24,"hood":20,"need":[1,12]},"deadlines":["开局前 2 小时","前一天 24:00","满了就关"]};</script><script data-bundled-source="text-rules.js">/* JU R9 editorial-text contract. No identity or system-ID fields are changed here. */

/* ---------- 参考：R9 页面级 setSkin / openSettings（R9.code.html L87289-L87312，原文，仅注释） ----------
function openSettings(){
  const skins=[['cotton','Cotton Candy','棉糖'],['halo','Halo','光晕'],['sunset','Sunset','落日']];
  openModal('背景',`<div class="skin-choices">${skins.map(([id,name,zh])=>`<button class="skin-choice" data-skin="${id}" aria-pressed="${H.state.skin===id}"><span class="skin-preview" data-preview="${id}"><img src="${window.JU_SKIN_PREVIEWS?.[id]||''}" alt="${zh}背景静态预览"></span><span class="skin-caption"><strong>${zh}</strong><span>${name}</span></span><span class="skin-selected" aria-hidden="true">${icon('check',18)}</span></button>`).join('')}</div>`,'',sheet=>{$$('.skin-choice',sheet).forEach(b=>b.onclick=()=>{if(setSkin(b.dataset.skin)!==false)closeModal()})});
}
function setSkin(skin){
  if(!['cotton','halo','sunset'].includes(skin))return false;
  if(!safe(H.commit(s=>{s.skin=skin})))return false;
  document.documentElement.dataset.skin=skin;
  $('#skin').value=skin;
  const bg=$('#background');
  bg.innerHTML=skin==='cotton'?'<cotton-bg seed="1"></cotton-bg>':`<ju-${skin}-skin style="position:absolute;inset:0;display:block" seed="1"></ju-${skin}-skin>`;
  JUR2.motion(bg,[{opacity:.25,filter:'blur(12px)'},{opacity:1,filter:'blur(0)'}],{duration:650});
  return true;
}
function timeParts(e){const [y,m,d]=e.dateISO.split('-').map(Number);return {y,m,d,week:'周'+'日一二三四五六'[new Date(y,m-1,d).getDay()]};}
function localZone(e){try{const t=H.instant(e);return new Intl.DateTimeFormat('zh-CN',{timeZone:e.timezone,timeZoneName:'shortOffset'}).formatToParts(t).find(x=>x.type==='timeZoneName').value.replace('GMT','UTC');}catch{return '';}}
function dateWords(e){const p=timeParts(e);return `${p.y} 年 ${p.m} 月 ${p.d} 日 · ${p.week}`;}
function paper(i,label,body){return `<div data-form-step="${i}"><div class="paper"><div class="paper-wash"><div><b>✓</b><span></span></div></div><h2 class="card-label">${label}</h2>${body}</div></div>`;}
function r2FormMotion(el,frames,options={}){return window.JUR2Suggestions.motion(el,frames,options)}
function r2Suggestion(key){return window.JUR2Suggestions.markup(key)}
function r2FieldError(input,button,message){
 if(input){input.dataset.r2Error=message;JUR9Inputs.showError(input,message,true);r2FormMotion(input,[{backgroundColor:'rgba(217,144,157,.20)'},{backgroundColor:'rgba(230,177,186,.06)'}],{duration:320});}
 const sheet=input?.closest('.sheet')||button?.closest('.sheet');let status=sheet?.querySelector('[data-fee-error],.r8-edit-error,#r8-note-error,.r9-save-error');if(!input&&!status&&button){status=document.createElement('p');status.className='r9-save-error r8-field-error';status.setAttribute('role','status');status.setAttribute('aria-live','polite');button.insertAdjacentElement('beforebegin',status);}if(status)status.textContent=message;
 if(button){if(!button.dataset.r2Original)button.dataset.r2Original=button.textContent;button.dataset.r2State='error';button.textContent=button.dataset.r2Original;}
---------- */
