import { NextResponse } from "next/server";
import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib";
import { requireAuth } from "@/lib/auth/requireAuth";
import { getValidatorUsername } from "@/lib/validator/session";
import { getValidatorSummary } from "@/lib/validator/store";

function shortCertNumber(certNumber: string) {
  if (!certNumber) return certNumber;
  if (certNumber.length <= 34) return certNumber;
  return `${certNumber.slice(0, 16)}…${certNumber.slice(-16)}`;
}

function drawTemplateNormalized(outPage: any, embedded: any, rotation: number, tw: number, th: number) {
  const ang = ((rotation % 360) + 360) % 360;
  if (ang === 0) {
    outPage.drawPage(embedded, { x: 0, y: 0, width: tw, height: th });
    return { width: tw, height: th };
  }
  if (ang === 90) {
    outPage.drawPage(embedded, { x: th, y: 0, rotate: degrees(90), width: tw, height: th });
    return { width: th, height: tw };
  }
  if (ang === 180) {
    outPage.drawPage(embedded, { x: tw, y: th, rotate: degrees(180), width: tw, height: th });
    return { width: tw, height: th };
  }
  outPage.drawPage(embedded, { x: 0, y: tw, rotate: degrees(-90), width: tw, height: th });
  return { width: th, height: tw };
}

function drawDebugGrid(page: any, width: number, height: number) {
  if (process.env.CERT_DEBUG !== "1") return;
  const step = 50;
  for (let x = 0; x <= width; x += step) {
    page.drawLine({ start: { x, y: 0 }, end: { x, y: height }, thickness: 0.5, color: rgb(1, 0, 0) });
  }
  for (let y = 0; y <= height; y += step) {
    page.drawLine({ start: { x: 0, y }, end: { x: width, y }, thickness: 0.5, color: rgb(1, 0, 0) });
  }
}

export async function GET(_req: Request, ctx: { params: Promise<{ courseId: string }> }) {
  try {
    const { courseId } = await ctx.params;
    const auth = await requireAuth();
    if (auth.kind === "none") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let certNumber = "";
    let issuedAt = new Date();
    let scorePct = 0;
    let participantName = "Participant";

    if (auth.kind === "validator") {
      const reviewerUser = await getValidatorUsername();
      if (!reviewerUser) {
        return NextResponse.json({ error: "Validator not logged in" }, { status: 401 });
      }
      const summary = await getValidatorSummary(courseId, reviewerUser);
      if (!summary.certificate?.cert_number) {
        return NextResponse.json({ error: "No certificate found" }, { status: 403 });
      }
      certNumber = summary.certificate.cert_number;
      issuedAt = new Date(summary.certificate.issued_at);
      scorePct = Number(summary.certificate.score_pct ?? 0);
      participantName = "ASRT Test User";
    } else {
      const { user, supabase } = auth;
      const { data: cert, error } = await supabase
        .from("ce_certificates")
        .select("cert_number, issued_at, score_pct")
        .eq("user_id", user.id)
        .eq("course_id", courseId)
        .maybeSingle();

      if (error) {
        return NextResponse.json(
          { error: "Database not ready", detail: "Missing table ce_certificates. Run SUPABASE_CE_SCHEMA.sql in Supabase." },
          { status: 500 }
        );
      }
      if (!cert?.cert_number) {
        return NextResponse.json({ error: "No certificate found" }, { status: 403 });
      }

      certNumber = cert.cert_number;
      issuedAt = new Date(cert.issued_at);
      scorePct = Number(cert.score_pct ?? 0);

      const { data: profile } = await supabase
        .from("profiles")
        .select("display_name, first_name, last_name")
        .eq("user_id", user.id)
        .maybeSingle();

      participantName = profile?.display_name || [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || user.email || "Participant";
    }

    const templatePath = path.join(process.cwd(), "public", "ce", "ce01", "certificate.pdf");
    const templateBytes = await fs.readFile(templatePath);
    const templateDoc = await PDFDocument.load(templateBytes);
    const [templatePage] = templateDoc.getPages();
    const rotation = templatePage.getRotation().angle || 0;
    const { width: tw, height: th } = templatePage.getSize();

    const outDoc = await PDFDocument.create();
    const [embedded] = await outDoc.embedPages([templatePage]);
    const ang = ((rotation % 360) + 360) % 360;
    const outSize = ang === 90 || ang === 270 ? [th, tw] : [tw, th];
    const outPage = outDoc.addPage(outSize as [number, number]);

    let width: number;
    let height: number;
    if (tw < th && rotation === 0) {
      outPage.drawPage(embedded, { x: th, y: 0, rotate: degrees(90), width: tw, height: th });
      width = th;
      height = tw;
    } else {
      const wh = drawTemplateNormalized(outPage, embedded, rotation, tw, th);
      width = wh.width;
      height = wh.height;
    }

    const font = await outDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await outDoc.embedFont(StandardFonts.HelveticaBold);
    const certNumberDisplay = shortCertNumber(certNumber);
    const dateStr = issuedAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "2-digit" });

    drawDebugGrid(outPage, width, height);

    const pos = {
      name: { x: 250, y: 430, size: 14, maxWidth: width * 0.38 },
      date: { x: 300, y: 230, size: 11, maxWidth: width * 0.25 },
      cert: { x: 535, y: 175, size: 9, maxWidth: width * 0.25 },
      score: { x: 535, y: 160, size: 9, maxWidth: width * 0.25 },
    };

    outPage.drawText(participantName, {
      x: pos.name.x,
      y: pos.name.y,
      size: pos.name.size,
      font: fontBold,
      maxWidth: pos.name.maxWidth,
      color: rgb(0, 0, 0),
    });
    outPage.drawText(dateStr, {
      x: pos.date.x,
      y: pos.date.y,
      size: pos.date.size,
      font,
      maxWidth: pos.date.maxWidth,
      color: rgb(0, 0, 0),
    });
    outPage.drawText(certNumberDisplay, {
      x: pos.cert.x,
      y: pos.cert.y,
      size: pos.cert.size,
      font,
      maxWidth: pos.cert.maxWidth,
      color: rgb(0, 0, 0),
    });
    outPage.drawText(`Score: ${Math.round(scorePct)}%`, {
      x: pos.score.x,
      y: pos.score.y,
      size: pos.score.size,
      font,
      maxWidth: pos.score.maxWidth,
      color: rgb(0, 0, 0),
    });

    const pdfBytes = await outDoc.save();
    return new NextResponse(Buffer.from(pdfBytes), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="RTT-${courseId}-certificate.pdf"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: any) {
    console.error("CERT ROUTE ERROR:", err);
    return new Response(JSON.stringify({ error: "Certificate generation failed", detail: String(err?.message ?? err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
