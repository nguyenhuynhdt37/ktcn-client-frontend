import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "SET VinhUni";
export const size = {
  width: 1200,
  height: 600,
};

export const contentType = "image/png";

export default async function Image({ params }: { params: { locale: string } }) {
  const { locale } = params;
  const isEn = locale === "en";
  const collegeName = isEn
    ? "College of Engineering and Technology - Vinh University"
    : "Trường Kỹ thuật và Công nghệ - Trường Đại học Vinh";
  const title = isEn
    ? "Official News & Information"
    : "Cổng Thông Tin Chính Thức";

  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(to bottom right, #b7410e, #1b4965)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "sans-serif",
          padding: 40,
        }}
      >
        <div style={{ fontSize: 24, fontWeight: "bold", textTransform: "uppercase", letterSpacing: 2 }}>
          {collegeName}
        </div>
        <div style={{ fontSize: 54, fontWeight: "bold", marginTop: 20, textAlign: "center" }}>
          {title}
        </div>
        <div style={{ fontSize: 18, opacity: 0.8, marginTop: 30 }}>
          ktcn.itup.io.vn
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
