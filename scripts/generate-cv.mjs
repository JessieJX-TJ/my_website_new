import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import PDFDocument from "pdfkit";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "public");
const outFile = path.join(outDir, "Xi-Jessie-Ji-CV.pdf");

fs.mkdirSync(outDir, { recursive: true });

const accent = "#1A365D";
const muted = "#4A5568";
const ink = "#1A202C";
const rule = "#CBD5E0";

const doc = new PDFDocument({
  size: "A4",
  margins: { top: 50, bottom: 46, left: 50, right: 50 },
  info: {
    Title: "CV — Xi (Jessie) Ji",
    Author: "Xi (Jessie) Ji",
  },
});

doc.registerFont("regular", "C:/Windows/Fonts/segoeui.ttf");
doc.registerFont("bold", "C:/Windows/Fonts/segoeuib.ttf");
doc.registerFont("italic", "C:/Windows/Fonts/segoeuii.ttf");

const left = doc.page.margins.left;
const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;

function section(title) {
  doc.moveDown(0.85);
  doc.font("bold").fontSize(13).fillColor(accent).text(title, left, doc.y, { width });
  const y = doc.y + 3;
  doc
    .moveTo(left, y)
    .lineTo(left + width, y)
    .strokeColor(rule)
    .lineWidth(0.8)
    .stroke();
  doc.y = y + 12;
}

function row(leftText, rightText, options = {}) {
  const { leftFont = "bold", rightFont = "bold", size = 11, color = ink, rightColor = ink, gap = 2 } = options;
  const y = doc.y;
  doc.font(rightFont).fontSize(size);
  const rightWidth = doc.widthOfString(rightText);
  doc.font(leftFont).fontSize(size).fillColor(color).text(leftText, left, y, {
    width: width - rightWidth - 16,
  });
  const afterLeft = doc.y;
  doc.font(rightFont).fontSize(size).fillColor(rightColor).text(rightText, left, y, {
    width,
    align: "right",
  });
  doc.y = Math.max(afterLeft, doc.y) + gap;
}

const stream = fs.createWriteStream(outFile);
doc.pipe(stream);

doc.font("bold").fontSize(22).fillColor(accent).text("Xi (Jessie) Ji", left, 50, {
  width,
  align: "center",
});
doc.moveDown(0.15);
doc.font("regular").fontSize(12).fillColor(muted).text("HCI / Interaction Design Researcher", {
  width,
  align: "center",
});
doc.moveDown(0.35);

doc.font("regular").fontSize(9);
const email = "2433039@tongji.edu.cn";
const sep = "   ·   ORCID: ";
const orcid = "0009-0007-6290-6624";
const emailW = doc.widthOfString(email);
const sepW = doc.widthOfString(sep);
const orcidW = doc.widthOfString(orcid);
let x = left + (width - (emailW + sepW + orcidW)) / 2;
const contactY = doc.y;
doc.fillColor(accent).text(email, x, contactY, {
  lineBreak: false,
  link: "mailto:2433039@tongji.edu.cn",
  underline: false,
});
x += emailW;
doc.fillColor(muted).text(sep, x, contactY, { lineBreak: false });
x += sepW;
doc.fillColor(accent).text(orcid, x, contactY, {
  lineBreak: false,
  link: "https://orcid.org/0009-0007-6290-6624",
});
doc.y = contactY + 16;

section("Research Interests");
doc.font("bold").fontSize(10.5).fillColor(ink).text("Human–AI Interaction   ·   Design Practice   ·   Empirical HCI", {
  width,
});
doc.moveDown(0.35);
doc
  .font("regular")
  .fontSize(10.5)
  .fillColor(ink)
  .text(
    "My research interests lie at the intersection of Human–AI Interaction and design practice, with a focus on how generative and agentic AI are changing the ways designers express, explore, evaluate, and revise design ideas. I am particularly interested in how AI coding agents and executable prototypes reshape design practices, interaction with design materials, and designers' agency and control.",
    { width, lineGap: 2 }
  );

section("Selected Research & Publications");
doc
  .font("bold")
  .fontSize(11)
  .fillColor(ink)
  .text(
    "Designing with Vibe Coding: How Designers Express, Evaluate, and Revise Executable Prototypes",
    { width, lineGap: 1 }
  );
doc.moveDown(0.25);
doc.font("bold").fontSize(9.5).text("Xi Ji", { continued: true });
doc.font("regular").text(", Yu Shu, Preben Hansen");
doc.moveDown(0.15);
doc.font("italic").fontSize(9.5).text("CHI 2027 — Submitted");
doc.moveDown(0.2);
doc
  .font("regular")
  .fontSize(9.5)
  .fillColor(muted)
  .text(
    "Empirical qualitative study with 25 UX/UI designers examining how designers express design intentions, evaluate executable prototypes, and iteratively revise design ideas when working with AI coding agents.",
    { width, lineGap: 1.5 }
  );

section("Education");
row("Tongji University", "September 2024–Present");
row("M.A./M.Des. in Design, Intelligent Media Interaction", "Shanghai, China", {
  leftFont: "regular",
  rightFont: "regular",
  size: 9.5,
  rightColor: muted,
  gap: 10,
});
row("Communication University of China", "September 2020–June 2024");
row("B.A. in Visual Communication Design", "Beijing, China", {
  leftFont: "regular",
  rightFont: "regular",
  size: 9.5,
  rightColor: muted,
  gap: 4,
});

section("Experience");
row("SAIC IM Motors", "22 June 2026–Present");
doc.font("regular").fontSize(9.5).fillColor(ink).text("UX/UI Design Intern", { width });
doc.moveDown(0.35);

const bullets = [
  "Designed interaction flows and interface presentations for B2B AI-agent products, including AIC Material DVP, the Mold Cost Budget Assessment Agent (“Xiaotudi”), and a regulatory intelligence agent.",
  "Designed UX/UI and interactive prototypes for these products, translating complex enterprise workflows and domain-specific tasks into clear interaction structures and interface experiences.",
  "Implemented front-end interfaces connected to backend services, using AI coding tools to translate interaction designs into executable product interfaces and iterate directly on working implementations.",
];

for (const item of bullets) {
  const y = doc.y;
  doc.font("regular").fontSize(10.5).fillColor(ink).text("•", left, y, { width: 14, lineBreak: false });
  doc.text(item, left + 14, y, { width: width - 14, lineGap: 1.5 });
  doc.moveDown(0.2);
}

doc.end();

await new Promise((resolve, reject) => {
  stream.on("finish", resolve);
  stream.on("error", reject);
});

console.log("Wrote", outFile);
