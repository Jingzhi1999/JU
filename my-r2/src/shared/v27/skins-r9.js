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
 * 页面级切换（R9.code.html L87289-L87302，setSkin：html[data-skin] + 650ms opacity/blur 交叉淡入）附在文件末尾注释中，未改。
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
})();

/* ---------- 参考：R9 页面级 setSkin / openSettings（R9.code.html L87289-L87302，原文，仅注释） ----------
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
---------- */
