addEventListener("fetch", event => {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  if (request.method === "GET") {
    // 返回美化后的 HTML 页面
    return new Response(renderHTML(), {
      headers: { "Content-Type": "text/html" },
    });
  } else if (request.method === "POST") {
    // 处理节点生成请求
    const { type, domains1, domains2 } = await request.json();

    if (!domains1 || (type !== "notls" && !domains2)) {
      return new Response("Invalid input", { status: 400 });
    }

    let results = [];
    switch (type) {
      case "vless":
        results = generateVlessNodes(domains1, domains2);
        break;
      case "trojan":
        results = generateTrojanNodes(domains1, domains2);
        break;
      case "notls":
        results = generateNoTLSNodes(domains1);
        break;
      default:
        return new Response("Unknown type", { status: 400 });
    }

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
    });
  } else {
    return new Response("Method Not Allowed", { status: 405 });
  }
}

// 美化后的 HTML 页面
function renderHTML() {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>节点生成器</title>
  <style>
    html, body {
      height: 100%;
      margin: 0;
      padding: 0;
      font-family: Arial, sans-serif;
      background-color: #f4f7fc;
    }
    body {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
      overflow: auto;
    }
    .container {
      width: 90%;
      max-width: 800px;
      background-color: #fff;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      overflow: overlay;
    }
    h1 {
      text-align: center;
      color: #333;
    }
    .links {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-top: 20px;
    }
    .links a {
      font-size: 16px;
      color: #007bff;
      text-decoration: none;
      transition: color 0.3s;
    }
    .links a:hover {
      color: #0056b3;
    }
    label {
      font-size: 16px;
      font-weight: bold;
      color: #333;
    }
    textarea {
      width: 100%;
      padding: 10px;
      margin-top: 5px;
      font-size: 14px;
      border-radius: 5px;
      border: 1px solid #ccc;
      box-sizing: border-box;
    }
    select, button {
      padding: 10px 15px;
      font-size: 14px;
      margin-top: 10px;
      border-radius: 5px;
      border: 1px solid #ccc;
      background-color: #007bff;
      color: white;
      cursor: pointer;
    }
    select {
      width: 100%;
    }
    button {
      width: 100%;
      margin-top: 20px;
      background-color: #28a745;
      border-color: #28a745;
    }
    button:hover {
      background-color: #218838;
      border-color: #1e7e34;
    }
    pre {
      background-color: #f8f9fa;
      padding: 15px;
      border-radius: 5px;
      border: 1px solid #ddd;
      overflow-x: auto;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin-top: 20px;
      max-height: 300px;  /* 限制结果区域高度 */
      overflow-y: auto;  /* 允许垂直滚动 */
    }
    .footer {
      text-align: center;
      margin-top: 30px;
      font-size: 12px;
      color: #777;
    }
    .instructions {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 8px;
      border: 1px solid #ddd;
      margin-top: 20px;
      font-size: 14px;
    }
    .instructions ol {
      margin: 10px 0;
    }
    .instructions li {
      margin-bottom: 8px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>节点生成器</h1>

    <!-- 添加链接 -->
    <div class="links">
      <a href="https://youtube.com/@yixiu001" target="_blank">YouTube</a>
      <a href="https://t.me/yxjsjl" target="_blank">Telegram</a>
      <a href="https://github.com/yixiu001" target="_blank">GitHub</a>
      <a href="https://yixiu520.com" target="_blank">Blog</a>
    </div>

    <!-- 使用说明 -->
    <div class="instructions">
      <h3>使用介绍：</h3>
      <ol>
        <li>打开 <a href="https://fofa.info" target="_blank">https://fofa.info</a> 注册一个账号</li>
        <li>输入括号中的内容（icon_hash="-1354027319" && asn="13335" && port="443"）</li>
        <li>点击查询</li>
        <li>导出对应域名并下载</li>
        <li>输入到以下文本框中</li>
      </ol>
    </div>

    <form id="nodeForm">
      <div>
        <label for="type">选择节点类型：</label>
        <select name="type" id="type">
          <option value="vless">VLESS</option>
          <option value="trojan">Trojan</option>
          <option value="notls">noTLS VLESS</option>
        </select>
      </div>
      <div>
        <label for="domains1">域名1（每行一个）：</label>
        <textarea id="domains1" rows="5"></textarea>
      </div>
      <div>
        <label for="domains2">域名2（可选，noTLS 类型忽略）：</label>
        <textarea id="domains2" rows="5"></textarea>
      </div>
      <button type="submit">生成</button>
    </form>
    
    <h2>生成结果：</h2>
    <pre id="result">这里会显示生成的节点配置或订阅链接</pre>
  </div>

  <div class="footer">
    <p>&copy; 2024 节点生成器工具</p>
  </div>

  <script>
    document.getElementById("nodeForm").addEventListener("submit", async event => {
      event.preventDefault();
      const type = document.getElementById("type").value;
      const domains1 = document.getElementById("domains1").value.split("\\n").map(d => d.trim());
      const domains2 = document.getElementById("domains2").value.split("\\n").map(d => d.trim());

      const response = await fetch(window.location.href, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, domains1, domains2 }),
      });
      const data = await response.json();
      document.getElementById("result").textContent = data.results.join("\\n");
    });
  </script>
</body>
</html>
  `;
}

// 清理域名
function cleanDomain(domain) {
  return domain.replace(/^https?:\/\//, "").trim();
}

// 生成 VLESS 节点
function generateVlessNodes(domains1, domains2) {
  const uuid = "89b3cbba-e6ac-485a-9481-976a0415eab9";
  const baseDomain = "visa.cn";
  return domains1.map((d1, i) => {
    const d2 = domains2[i];
    if (!d1 || !d2) return null;
    return `vless://${uuid}@${baseDomain}:443?encryption=none&security=tls&sni=${cleanDomain(d1)}&type=ws&host=${cleanDomain(d2)}&path=%3Fed%3D2560#BPB共享节点`;
  }).filter(Boolean);
}

// 生成 Trojan 节点
function generateTrojanNodes(domains1, domains2) {
  const baseDomain = "visa.cn";
  return domains1.map((d1, i) => {
    const d2 = domains2[i];
    if (!d1 || !d2) return null;
    return `trojan://bpb-trojan@${baseDomain}:443?security=tls&sni=${cleanDomain(d1)}&type=ws&host=${cleanDomain(d2)}&path=%2Ftr%3Fed%3D2560#BPB共享节点`;
  }).filter(Boolean);
}

// 生成 noTLS VLESS 节点
function generateNoTLSNodes(domains1) {
  const uuid = "89b3cbba-e6ac-485a-9481-976a0415eab9";
  const baseDomain = "visa.cn";
  return domains1.map(d => {
    if (!d) return null;
    return `vless://${uuid}@${baseDomain}:80?encryption=none&security=none&type=ws&host=${cleanDomain(d)}&path=%3Fed%3D2560#BPB共享节点notls`;
  }).filter(Boolean);
}
