"use client";

import { DropZone, Puck, type Data } from "@puckeditor/core";
import "@puckeditor/core/puck.css";

const emailConfig = {
  components: {
    EmailButton: {
      label: "Button",
      fields: {
        text: { type: "text", label: "Button Text" },
        href: { type: "text", label: "Link URL" },
        backgroundColor: { type: "text", label: "Background Color" },
        textColor: { type: "text", label: "Text Color" },
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
        text: { type: "text", label: "Text" },
        level: {
          type: "select",
          label: "Level",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
          ],
        },
        align: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: { type: "text", label: "Color (hex)" },
      },
      defaultProps: {
        text: "Your Heading",
        level: "h1",
        align: "center",
        color: "#111827",
      },
      render: ({
        text,
        level,
        align,
        color,
      }: {
        text: string;
        level: "h1" | "h2" | "h3";
        align: string;
        color: string;
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
                fontFamily: "sans-serif",
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
        text: { type: "text", label: "Content" },
        align: {
          type: "select",
          label: "Alignment",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
        color: { type: "text", label: "Color (hex)" },
      },
      defaultProps: {
        text: "Your email content goes here. Write something compelling.",
        align: "left",
        color: "#374151",
      },
      render: ({
        text,
        align,
        color,
      }: {
        text: string;
        align: string;
        color: string;
      }) => (
        <div style={{ padding: "4px 16px" }}>
          <p
            style={{
              textAlign: align as "left" | "center" | "right",
              color,
              margin: 0,
              lineHeight: 1.6,
              fontFamily: "sans-serif",
              fontSize: "15px",
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
        src: { type: "text", label: "Image URL" },
        alt: { type: "text", label: "Alt Text" },
      },
      defaultProps: {
        src: "https://placehold.co/600x200/e2e8f0/94a3b8?text=Image",
        alt: "Email image",
      },
      render: ({ src, alt }: { src: string; alt: string }) => (
        <div style={{ textAlign: "center", padding: "8px 16px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            style={{ maxWidth: "100%", display: "block", margin: "0 auto" }}
          />
        </div>
      ),
    },

    EmailContainer: {
      label: "Container",
      fields: {
        backgroundColor: { type: "text", label: "Background Color" },
        padding: { type: "number", label: "Padding (px)" },
        maxWidth: { type: "number", label: "Max Width (px)" },
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
        backgroundColor: { type: "text", label: "Background Color" },
        paddingTop: { type: "number", label: "Padding Top (px)" },
        paddingBottom: { type: "number", label: "Padding Bottom (px)" },
        paddingLeft: { type: "number", label: "Padding Left (px)" },
        paddingRight: { type: "number", label: "Padding Right (px)" },
        borderRadius: { type: "number", label: "Border Radius (px)" },
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
        color: { type: "text", label: "Color (hex)" },
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
        height: { type: "number", label: "Height (px)" },
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
