import http from "node:http";
import https from "node:https";

function normalizeBaseUrl(host) {
  const trimmedHost = String(host || "").trim();
  if (!trimmedHost) {
    throw new Error("Host MikroTik wajib diisi");
  }

  const rawUrl = /^https?:\/\//i.test(trimmedHost)
    ? trimmedHost
    : `https://${trimmedHost}`;

  const url = new URL(rawUrl);
  url.pathname = url.pathname.replace(/\/+$/, "") + "/";
  return url;
}

function normalizeDisabled(value) {
  const normalized = String(value).trim().toLowerCase();
  return normalized === "true" || normalized === "yes" ? "true" : "false";
}

function normalizeSecret(secret, fallbackService) {
  return {
    ".id": String(secret[".id"] ?? ""),
    disabled: normalizeDisabled(secret.disabled),
    name: String(secret.name ?? ""),
    password: String(secret.password ?? ""),
    profile: String(secret.profile ?? ""),
    service: String(secret.service ?? fallbackService ?? ""),
  };
}

function httpRequestJson(url, { username, password, timeoutMs, insecure }) {
  const transport = url.protocol === "https:" ? https : http;
  const headers = {
    Accept: "application/json",
    Authorization: `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`,
  };

  return new Promise((resolve, reject) => {
    const request = transport.request(
      url,
      {
        method: "GET",
        headers,
        timeout: timeoutMs,
        agent:
          url.protocol === "https:"
            ? new https.Agent({ rejectUnauthorized: !insecure })
            : undefined,
      },
      (response) => {
        let rawBody = "";

        response.setEncoding("utf8");
        response.on("data", (chunk) => {
          rawBody += chunk;
        });

        response.on("end", () => {
          const statusCode = response.statusCode ?? 0;
          if (statusCode < 200 || statusCode >= 300) {
            reject(
              new Error(
                `Request gagal dengan status ${statusCode}: ${rawBody || response.statusMessage || "unknown error"}`,
              ),
            );
            return;
          }

          try {
            resolve(JSON.parse(rawBody));
          } catch (error) {
            reject(new Error(`Response bukan JSON valid: ${error.message}`));
          }
        });
      },
    );

    request.on("timeout", () => {
      request.destroy(new Error(`Request timeout setelah ${timeoutMs} ms`));
    });

    request.on("error", (error) => {
      reject(error);
    });

    request.end();
  });
}

export async function fetchSecrets({
  host,
  username,
  password,
  service,
  timeoutMs,
  insecure,
}) {
  const baseUrl = normalizeBaseUrl(host);
  const requestUrl = new URL("rest/ppp/secret", baseUrl);
  requestUrl.searchParams.set("service", service);

  const responseJson = await httpRequestJson(requestUrl, {
    username,
    password,
    timeoutMs,
    insecure,
  });

  if (!Array.isArray(responseJson)) {
    throw new Error("Response MikroTik tidak berbentuk array");
  }

  return responseJson
    .filter((item) => String(item.service ?? service) === service)
    .map((item) => normalizeSecret(item, service));
}
