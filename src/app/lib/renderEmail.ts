export interface ContentItem {
  type: string;
  props: Record<string, unknown> & { id?: string };
}

export interface PuckData {
  content: ContentItem[];
  root?: { props?: Record<string, unknown> };
  zones?: Record<string, ContentItem[]>;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderItems(items: ContentItem[], zones: Record<string, ContentItem[]>): string {
  return items.map((item) => renderComponent(item, zones)).join("\n");
}

function renderComponent(item: ContentItem, zones: Record<string, ContentItem[]>): string {
  const { type, props } = item;
  const id = String(props.id ?? "");

  switch (type) {
    case "EmailContainer": {
      const bg = escapeHtml(String(props.backgroundColor ?? "#ffffff"));
      const padding = Number(props.padding ?? 24);
      const maxWidth = Number(props.maxWidth ?? 600);
      const children = renderItems(zones[`${id}:content`] ?? [], zones);
      return `<div style="background-color:${bg};padding:${padding}px;max-width:${maxWidth}px;margin:0 auto;width:100%;">${children}</div>`;
    }

    case "EmailSection": {
      const bg = escapeHtml(String(props.backgroundColor ?? "transparent"));
      const pt = Number(props.paddingTop ?? 16);
      const pb = Number(props.paddingBottom ?? 16);
      const pl = Number(props.paddingLeft ?? 0);
      const pr = Number(props.paddingRight ?? 0);
      const br = Number(props.borderRadius ?? 0);
      const children = renderItems(zones[`${id}:content`] ?? [], zones);
      return `<div style="background-color:${bg};padding:${pt}px ${pr}px ${pb}px ${pl}px;border-radius:${br}px;">${children}</div>`;
    }

    case "EmailHeading": {
      const text = escapeHtml(String(props.text ?? ""));
      const level = String(props.level ?? "h1");
      const align = String(props.align ?? "center");
      const color = escapeHtml(String(props.color ?? "#111827"));
      const fontFamily = escapeHtml(String(props.fontFamily ?? "Arial, Helvetica, sans-serif"));
      const fontWeight = String(props.fontWeight ?? "700");
      const sizes: Record<string, string> = { h1: "2rem", h2: "1.5rem", h3: "1.25rem" };
      const size = sizes[level] ?? "2rem";
      return `<${level} style="text-align:${align};color:${color};font-size:${size};font-family:${fontFamily};font-weight:${fontWeight};margin:0;padding:8px 0;">${text}</${level}>`;
    }

    case "EmailText": {
      const text = escapeHtml(String(props.text ?? ""));
      const align = String(props.align ?? "left");
      const color = escapeHtml(String(props.color ?? "#374151"));
      const fontSize = Number(props.size ?? 15);
      const fontFamily = escapeHtml(String(props.fontFamily ?? "Arial, Helvetica, sans-serif"));
      const fontWeight = String(props.fontWeight ?? "400");
      const lineHeight = Number(props.lineHeight ?? 1.6);
      const letterSpacing = Number(props.letterSpacing ?? 0);
      const letterSpacingStyle = letterSpacing ? `letter-spacing:${letterSpacing}px;` : "";
      return `<p style="text-align:${align};color:${color};margin:8px 0;font-size:${fontSize}px;font-family:${fontFamily};font-weight:${fontWeight};line-height:${lineHeight};${letterSpacingStyle}">${text}</p>`;
    }

    case "EmailButton": {
      const text = escapeHtml(String(props.text ?? "Click Here"));
      const href = escapeHtml(String(props.href ?? "#"));
      const bg = escapeHtml(String(props.backgroundColor ?? "#3b82f6"));
      const fg = escapeHtml(String(props.textColor ?? "#ffffff"));
      return `<div style="text-align:center;padding:12px 0;"><a href="${href}" style="background-color:${bg};color:${fg};padding:12px 28px;border-radius:6px;text-decoration:none;display:inline-block;font-weight:600;font-size:14px;font-family:sans-serif;">${text}</a></div>`;
    }

    case "EmailImage": {
      const src = escapeHtml(String(props.src ?? ""));
      const alt = escapeHtml(String(props.alt ?? ""));
      const width = Number(props.width ?? 600);
      const height = Number(props.height ?? 200);
      const href = props.href ? escapeHtml(String(props.href)) : "";
      // Email clients need plain <img> — next/image URLs won't work in inboxes
      const img = `<img src="${src}" alt="${alt}" width="${width}" height="${height}" style="max-width:100%;height:auto;display:block;margin:0 auto;" />`;
      const inner = href ? `<a href="${href}">${img}</a>` : img;
      return `<div style="text-align:center;padding:8px 0;">${inner}</div>`;
    }

    case "EmailDivider": {
      const color = escapeHtml(String(props.color ?? "#e5e7eb"));
      return `<hr style="border:none;border-top:1px solid ${color};margin:16px 0;" />`;
    }

    case "EmailSpacer": {
      const height = Number(props.height ?? 32);
      return `<div style="height:${height}px;"></div>`;
    }

    default:
      return "";
  }
}

export function renderEmailHtml(data: PuckData): string {
  const content = data?.content ?? [];
  const zones = data?.zones ?? {};
  const body = renderItems(content, zones);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <style>
    body { margin: 0; padding: 0; background-color: #f4f4f5; }
    .email-wrapper { max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 32px 24px; }
  </style>
</head>
<body>
  <div class="email-wrapper">
    ${body}
  </div>
</body>
</html>`;
}
