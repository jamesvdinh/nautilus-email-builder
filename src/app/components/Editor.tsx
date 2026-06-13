"use client";

import { DropZone, Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";
import Image from "next/image";

// ── Color picker ─────────────────────────────────────────────────────────────

const PRESET_COLORS = [
  "#000000",
  "#111827",
  "#374151",
  "#6b7280",
  "#9ca3af",
  "#d1d5db",
  "#f3f4f6",
  "#ffffff",
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

function ColorPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const current = value || "#000000";
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
        {PRESET_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            onClick={() => onChange(c)}
            style={{
              width: 22,
              height: 22,
              backgroundColor: c,
              border: current === c ? "2px solid #3b82f6" : "1px solid #d1d5db",
              borderRadius: 4,
              cursor: "pointer",
              padding: 0,
              flexShrink: 0,
            }}
          />
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <input
          type="color"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: 32,
            height: 32,
            padding: 2,
            border: "1px solid #d1d5db",
            borderRadius: 4,
            cursor: "pointer",
            flexShrink: 0,
          }}
        />
        <input
          type="text"
          value={current}
          onChange={(e) => onChange(e.target.value)}
          style={{
            flex: 1,
            padding: "4px 8px",
            fontSize: 12,
            fontFamily: "monospace",
            border: "1px solid #d1d5db",
            borderRadius: 4,
          }}
        />
      </div>
    </div>
  );
}

const colorField = {
  type: "custom" as const,
  render: ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (v: string) => void;
  }) => <ColorPicker value={value} onChange={onChange} />,
};

// ── Shared typography field options ──────────────────────────────────────────

const fontFamilyField = {
  type: "select" as const,
  label: "Font Family",
  options: [
    { label: "Sans-serif", value: "Arial, Helvetica, sans-serif" },
    { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
    { label: "Monospace", value: "'Courier New', Courier, monospace" },
    { label: "System UI", value: "system-ui, -apple-system, sans-serif" },
  ],
};

const fontWeightField = {
  type: "select" as const,
  label: "Weight",
  options: [
    { label: "Regular", value: "400" },
    { label: "Medium", value: "500" },
    { label: "Semibold", value: "600" },
    { label: "Bold", value: "700" },
  ],
};

// ── Component config ─────────────────────────────────────────────────────────

const emailConfig = {
  components: {
    EmailButton: {
      label: "Button",
      fields: {
        text: { type: "text" as const, label: "Button Text" },
        href: { type: "text" as const, label: "Link URL" },
        backgroundColor: { ...colorField, label: "Background Color" },
        textColor: { ...colorField, label: "Text Color" },
      },
      defaultProps: {
        text: "Click Here",
        href: "https://example.com",
        backgroundColor: "#3b82f6",
        textColor: "#ffffff",
      },
      render: ({
        text,
        href,
        backgroundColor,
        textColor,
      }: {
        text: string;
        href: string;
        backgroundColor: string;
        textColor: string;
      }) => (
        <div style={{ textAlign: "center", padding: "12px 16px" }}>
          <a
            href={href}
            style={{
              backgroundColor,
              color: textColor,
              padding: "12px 28px",
              borderRadius: "6px",
              textDecoration: "none",
              display: "inline-block",
              fontWeight: 600,
              fontSize: "14px",
              fontFamily: "sans-serif",
            }}
          >
            {text}
          </a>
        </div>
      ),
    },

    EmailHeading: {
      label: "Heading",
      fields: {
        text: { type: "text" as const, label: "Text" },
        level: {
          type: "select" as const,
          label: "Level",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
          ],
        },
        align: {
          type: "select" as const,
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: { ...colorField, label: "Color" },
        fontFamily: fontFamilyField,
        fontWeight: fontWeightField,
      },
      defaultProps: {
        text: "Your Heading",
        level: "h1",
        align: "center",
        color: "#111827",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontWeight: "700",
      },
      render: ({
        text,
        level,
        align,
        color,
        fontFamily,
        fontWeight,
      }: {
        text: string;
        level: "h1" | "h2" | "h3";
        align: string;
        color: string;
        fontFamily: string;
        fontWeight: string;
      }) => {
        const Tag = level;
        const sizes: Record<string, string> = {
          h1: "2rem",
          h2: "1.5rem",
          h3: "1.25rem",
        };
        return (
          <div style={{ padding: "8px 16px" }}>
            <Tag
              style={{
                textAlign: align as "left" | "center" | "right",
                color,
                fontSize: sizes[level],
                margin: 0,
                fontFamily,
                fontWeight,
              }}
            >
              {text}
            </Tag>
          </div>
        );
      },
    },

    EmailText: {
      label: "Text",
      fields: {
        text: { type: "text" as const, label: "Content" },
        size: { type: "number" as const, label: "Font Size (px)" },
        align: {
          type: "select" as const,
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: { ...colorField, label: "Color" },
        fontFamily: fontFamilyField,
        fontWeight: fontWeightField,
        lineHeight: { type: "number" as const, label: "Line Height" },
        letterSpacing: {
          type: "number" as const,
          label: "Letter Spacing (px)",
        },
      },
      defaultProps: {
        text: "Your email content goes here. Write something compelling.",
        size: 15,
        align: "left",
        color: "#374151",
        fontFamily: "Arial, Helvetica, sans-serif",
        fontWeight: "400",
        lineHeight: 1.6,
        letterSpacing: 0,
      },
      render: ({
        text,
        size,
        align,
        color,
        fontFamily,
        fontWeight,
        lineHeight,
        letterSpacing,
      }: {
        text: string;
        size: number;
        align: string;
        color: string;
        fontFamily: string;
        fontWeight: string;
        lineHeight: number;
        letterSpacing: number;
      }) => (
        <div style={{ padding: "4px 16px" }}>
          <p
            style={{
              textAlign: align as "left" | "center" | "right",
              color,
              margin: 0,
              fontSize: size,
              fontFamily,
              fontWeight,
              lineHeight,
              letterSpacing: letterSpacing ? `${letterSpacing}px` : undefined,
            }}
          >
            {text}
          </p>
        </div>
      ),
    },

    EmailImage: {
      label: "Image",
      fields: {
        src: { type: "text" as const, label: "Image URL" },
        alt: { type: "text" as const, label: "Alt Text" },
        width: { type: "number" as const, label: "Width (px)" },
        href: { type: "text" as const, label: "Link URL (optional)" },
      },
      defaultProps: {
        src: "https://placehold.co/600x200/e2e8f0/94a3b8?text=Image",
        alt: "Email image",
        width: 600,
        href: "",
      },
      render: ({
        src,
        alt,
        width,
        href,
      }: {
        src: string;
        alt: string;
        width: number;
        href: string;
      }) => {
        const img = (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={200}
            unoptimized
            style={{
              maxWidth: "100%",
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />
        );
        return (
          <div style={{ textAlign: "center", padding: "8px 16px" }}>
            {href ? <a href={href}>{img}</a> : img}
          </div>
        );
      },
    },

    EmailContainer: {
      label: "Container",
      fields: {
        backgroundColor: { ...colorField, label: "Background Color" },
        padding: { type: "number" as const, label: "Padding (px)" },
        maxWidth: { type: "number" as const, label: "Max Width (px)" },
      },
      defaultProps: {
        backgroundColor: "#ffffff",
        padding: 24,
        maxWidth: 600,
      },
      render: ({
        backgroundColor,
        padding,
        maxWidth,
      }: {
        backgroundColor: string;
        padding: number;
        maxWidth: number;
      }) => (
        <div
          style={{
            backgroundColor,
            padding,
            maxWidth,
            margin: "0 auto",
            width: "100%",
          }}
        >
          <DropZone zone="content" />
        </div>
      ),
    },

    EmailSection: {
      label: "Section",
      fields: {
        backgroundColor: { ...colorField, label: "Background Color" },
        paddingTop: { type: "number" as const, label: "Padding Top (px)" },
        paddingBottom: {
          type: "number" as const,
          label: "Padding Bottom (px)",
        },
        paddingLeft: { type: "number" as const, label: "Padding Left (px)" },
        paddingRight: { type: "number" as const, label: "Padding Right (px)" },
        borderRadius: { type: "number" as const, label: "Border Radius (px)" },
      },
      defaultProps: {
        backgroundColor: "transparent",
        paddingTop: 16,
        paddingBottom: 16,
        paddingLeft: 0,
        paddingRight: 0,
        borderRadius: 0,
      },
      render: ({
        backgroundColor,
        paddingTop,
        paddingBottom,
        paddingLeft,
        paddingRight,
        borderRadius,
      }: {
        backgroundColor: string;
        paddingTop: number;
        paddingBottom: number;
        paddingLeft: number;
        paddingRight: number;
        borderRadius: number;
      }) => (
        <div
          style={{
            backgroundColor,
            paddingTop,
            paddingBottom,
            paddingLeft,
            paddingRight,
            borderRadius,
          }}
        >
          <DropZone zone="content" />
        </div>
      ),
    },

    EmailDivider: {
      label: "Divider",
      fields: {
        color: { ...colorField, label: "Color" },
      },
      defaultProps: {
        color: "#e5e7eb",
      },
      render: ({ color }: { color: string }) => (
        <div style={{ padding: "8px 16px" }}>
          <hr
            style={{
              borderColor: color,
              borderTopWidth: 1,
              borderStyle: "solid",
              margin: 0,
            }}
          />
        </div>
      ),
    },

    EmailSpacer: {
      label: "Spacer",
      fields: {
        height: { type: "number" as const, label: "Height (px)" },
      },
      defaultProps: {
        height: 32,
      },
      render: ({ height }: { height: number }) => (
        <div style={{ height, display: "block" }} />
      ),
    },
  },
};

export type EmailData = Data;

interface EditorProps {
  onPublish: (data: Data) => void;
  initialData?: Data;
}

export function Editor({ onPublish, initialData }: EditorProps) {
  const defaultData: Data = initialData ?? {
    content: [],
    root: { props: {} },
  };

  return (
    <Puck
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      config={emailConfig as any}
      data={defaultData}
      onPublish={onPublish}
    />
  );
}
