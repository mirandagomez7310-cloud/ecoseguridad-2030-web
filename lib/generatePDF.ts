// lib/generatePDF.ts
// Full PDF generator for EcoSeguridad2030 – Kit MagnetoRec
// Uses jsPDF (client-side only)

export async function generateProjectPDF() {
  // Dynamically import to avoid SSR issues
  const { default: jsPDF } = await import("jspdf");
  const { default: autoTable } = await import("jspdf-autotable");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const W = 210; // page width mm
  const H = 297; // page height mm

  // ─── Color palette ───────────────────────────────────────────────────────────
  const ORANGE  = [232, 93, 4]   as [number, number, number];
  const BLACK   = [0, 0, 0]      as [number, number, number];
  const DARK    = [18, 18, 18]   as [number, number, number];
  const GRAY    = [80, 80, 80]   as [number, number, number];
  const LGRAY   = [160, 160, 160] as [number, number, number];
  const WHITE   = [255, 255, 255] as [number, number, number];
  const ORANGE_BG = [232, 93, 4, 0.08] as [number,number,number,number];

  // ─── Helpers ──────────────────────────────────────────────────────────────────
  const setFill   = (c: [number,number,number]) => doc.setFillColor(c[0],c[1],c[2]);
  const setStroke = (c: [number,number,number]) => doc.setDrawColor(c[0],c[1],c[2]);
  const setTxt    = (c: [number,number,number]) => doc.setTextColor(c[0],c[1],c[2]);
  const setFont   = (style: "normal"|"bold") => doc.setFont("helvetica", style);
  const newPage   = () => { doc.addPage(); addPageFooter(); };

  const addPageFooter = () => {
    const pg = (doc as any).internal.getNumberOfPages();
    setFill(DARK); doc.rect(0, H - 10, W, 10, "F");
    setTxt(GRAY); setFont("normal"); doc.setFontSize(7);
    doc.text("EcoSeguridad2030 © 2025 — Proyecto MagnetoRec — Confidencial", 14, H - 3.5);
    doc.text(`Página ${pg}`, W - 14, H - 3.5, { align: "right" });
  };

  // ─── Draw horizontal divider ─────────────────────────────────────────────────
  const divider = (y: number, color = ORANGE, full = false) => {
    setStroke(color); doc.setLineWidth(full ? 0.8 : 0.4);
    doc.line(full ? 0 : 14, y, full ? W : W - 14, y);
    doc.setLineWidth(0.2);
  };

  // ─── Section header ──────────────────────────────────────────────────────────
  const sectionHeader = (title: string, y: number, color = ORANGE): number => {
    setFill(color); doc.rect(14, y, 3, 8, "F");
    setTxt(color); setFont("bold"); doc.setFontSize(13);
    doc.text(title, 20, y + 6);
    setStroke([40,40,40]); doc.setLineWidth(0.2);
    doc.line(14, y + 10, W - 14, y + 10);
    return y + 16;
  };

  // ─── Bar chart (horizontal) ───────────────────────────────────────────────────
  const drawHBarChart = (
    cx: number, cy: number, cw: number, ch: number,
    data: { label: string; value: number; color: [number,number,number] }[],
    maxVal: number, title: string
  ) => {
    // Background
    setFill([12, 12, 12]); doc.roundedRect(cx, cy, cw, ch, 3, 3, "F");
    setTxt(WHITE); setFont("bold"); doc.setFontSize(9);
    doc.text(title, cx + 4, cy + 7);

    const barH = 10;
    const barArea = cw - 60;
    const startY = cy + 14;
    const gap = (ch - 14 - data.length * barH) / (data.length + 1);

    data.forEach((d, i) => {
      const y = startY + gap + i * (barH + gap);
      const barW = (d.value / maxVal) * barArea;

      // Label
      setTxt(LGRAY); setFont("normal"); doc.setFontSize(7);
      doc.text(d.label, cx + 4, y + barH / 2 + 2.5, { maxWidth: 46 });

      // Bar bg
      setFill([30,30,30]); doc.roundedRect(cx + 54, y, barArea, barH, 2, 2, "F");
      // Bar fill
      setFill(d.color); doc.roundedRect(cx + 54, y, Math.max(barW, 2), barH, 2, 2, "F");
      // Value
      setTxt(WHITE); setFont("bold"); doc.setFontSize(7);
      doc.text(`${d.value}`, cx + 54 + barArea + 2, y + barH / 2 + 2.5);
    });
  };

  // ─── Donut chart (canvas-like using arcs) ────────────────────────────────────
  const drawDonut = (
    cx: number, cy: number, r: number,
    slices: { label: string; value: number; color: [number,number,number] }[],
    title: string
  ) => {
    const total = slices.reduce((s, d) => s + d.value, 0);
    let startAngle = -Math.PI / 2;
    const toRad = (deg: number) => deg * Math.PI / 180;
    const innerR = r * 0.55;

    slices.forEach(sl => {
      const sweep = (sl.value / total) * 2 * Math.PI;
      const endAngle = startAngle + sweep;
      const mid = startAngle + sweep / 2;

      // Draw arc (approximate with polygon fan)
      setFill(sl.color);
      const pts: number[][] = [[cx, cy]];
      const steps = Math.max(8, Math.floor(sweep * 20));
      for (let s = 0; s <= steps; s++) {
        const a = startAngle + (sweep * s) / steps;
        pts.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
      }
      // Cut inner circle
      (doc as any).triangle?.(0,0,0,0,0,0,"F"); // stub – we use approximation

      // Outer slice
      setFill(sl.color);
      const pathPts: [number,number][] = pts.map(p => [p[0], p[1]] as [number,number]);
      // jsPDF polygon
      doc.setFillColor(sl.color[0], sl.color[1], sl.color[2]);
      const path = pathPts.map((p, idx) => ({ op: idx === 0 ? "m" : "l", c: p }));
      (doc as any).path?.(path, "F");

      startAngle = endAngle;
    });

    // White inner circle (donut hole)
    setFill([8,8,8]); doc.circle(cx, cy, innerR, "F");

    // Center text
    setTxt(WHITE); setFont("bold"); doc.setFontSize(8);
    doc.text("$300", cx, cy - 1.5, { align: "center" });
    setTxt(GRAY); setFont("normal"); doc.setFontSize(6);
    doc.text("MXN / kit", cx, cy + 4, { align: "center" });

    // Title
    setTxt(WHITE); setFont("bold"); doc.setFontSize(9);
    doc.text(title, cx - r, cy - r - 6);

    // Legend
    const legendX = cx + r + 4;
    slices.forEach((sl, i) => {
      const ly = cy - r + 4 + i * 10;
      setFill(sl.color); doc.rect(legendX, ly, 5, 4, "F");
      setTxt(LGRAY); setFont("normal"); doc.setFontSize(6.5);
      doc.text(`${sl.label} – $${sl.value}`, legendX + 7, ly + 3.5);
    });
  };

  // ─── Pill badge ──────────────────────────────────────────────────────────────
  const pill = (text: string, x: number, y: number, color = ORANGE) => {
    const tw = doc.getTextWidth(text);
    setFill([color[0], color[1], color[2]]);
    doc.roundedRect(x, y - 4, tw + 8, 6.5, 3, 3, "F");
    setTxt(WHITE); setFont("bold"); doc.setFontSize(6.5);
    doc.text(text, x + 4, y + 0.5);
    return x + tw + 14;
  };

  // ──────────────────────────────────────────────────────────────────────────────
  // PAGE 1 — COVER
  // ──────────────────────────────────────────────────────────────────────────────
  setFill(BLACK); doc.rect(0, 0, W, H, "F");

  // Top accent bar
  setFill(ORANGE); doc.rect(0, 0, W, 2, "F");

  // Grid dots (decorative)
  setFill([20,20,20]);
  for (let x = 0; x < W; x += 10) for (let y = 0; y < H; y += 10)
    doc.circle(x, y, 0.3, "F");

  // Orange glow circle
  doc.setGState(new (doc as any).GState({ opacity: 0.06 }));
  setFill(ORANGE); doc.circle(W/2, 100, 90, "F");
  doc.setGState(new (doc as any).GState({ opacity: 1 }));

  // Tag
  setFill(DARK); doc.roundedRect(W/2 - 44, 48, 88, 9, 4, 4, "F");
  setTxt(ORANGE); setFont("bold"); doc.setFontSize(7);
  doc.text("● AGENDA 2030 · ODS 8, 10, 12", W/2, 54, { align: "center" });

  // Main title
  setTxt(WHITE); setFont("bold"); doc.setFontSize(40);
  doc.text("EcoSeguridad", W/2, 80, { align: "center" });
  setTxt(ORANGE); doc.setFontSize(40);
  doc.text("2030", W/2, 96, { align: "center" });

  // Subtitle
  setTxt(WHITE); doc.setFontSize(14); setFont("normal");
  doc.text("Kit MagnetoRec", W/2, 112, { align: "center" });
  setTxt(GRAY); doc.setFontSize(10);
  doc.text("Guante Magnético de Recolección + Bastón Detector de Riesgos", W/2, 122, { align: "center" });

  // Divider line
  setStroke(ORANGE); doc.setLineWidth(0.6);
  doc.line(W/2 - 40, 130, W/2 + 40, 130);

  // Key stats boxes
  const stats = [
    { val: "$300 MXN", label: "Costo por kit" },
    { val: "2 M+", label: "Pepenadores en MX" },
    { val: "3×", label: "Velocidad de recolección" },
    { val: "EN 388", label: "Certificación" },
  ];
  stats.forEach((s, i) => {
    const bx = 14 + i * 46;
    setFill(DARK); doc.roundedRect(bx, 140, 42, 26, 3, 3, "F");
    setStroke(ORANGE); doc.setLineWidth(0.3);
    doc.roundedRect(bx, 140, 42, 26, 3, 3, "S");
    setTxt(ORANGE); setFont("bold"); doc.setFontSize(13);
    doc.text(s.val, bx + 21, 151, { align: "center" });
    setTxt(GRAY); setFont("normal"); doc.setFontSize(6.5);
    doc.text(s.label, bx + 21, 159, { align: "center" });
  });

  // Description
  setTxt(LGRAY); setFont("normal"); doc.setFontSize(9);
  const desc = "El Kit MagnetoRec es una solución de protección e incremento de productividad para recolectores de residuos (pepenadores) en México. Integra un guante con imanes de neodimio N52 que atrae metales ferrosos automáticamente, y un bastón detector portátil que identifica materiales peligrosos antes del contacto directo.";
  const lines = doc.splitTextToSize(desc, W - 28);
  doc.text(lines, 14, 182);

  // ODS pills
  let px = 14;
  px = pill("ODS 8 · Trabajo Decente", px, 215, [255, 140, 0]);
  px = pill("ODS 10 · Reducción Desigualdades", px, 215, [155, 89, 182]);
  pill("ODS 12 · Consumo Responsable", px, 215, [39, 174, 96]);

  // Version / date
  setTxt(GRAY); setFont("normal"); doc.setFontSize(7);
  doc.text("Versión 1.0 · Abril 2025 · México", W/2, 240, { align: "center" });
  doc.text("Proyecto universitario — Para distribución académica", W/2, 246, { align: "center" });

  // Bottom bar
  setFill(DARK); doc.rect(0, H - 12, W, 12, "F");
  setFill(ORANGE); doc.rect(0, H - 12, W, 1.5, "F");
  setTxt(GRAY); doc.setFontSize(7);
  doc.text("ecoseguridad2030.mx  ·  contacto@ecoseguridad2030.mx", W/2, H - 4, { align: "center" });

  // ──────────────────────────────────────────────────────────────────────────────
  // PAGE 2 — RESUMEN EJECUTIVO
  // ──────────────────────────────────────────────────────────────────────────────
  newPage();
  setFill(BLACK); doc.rect(0, 0, W, H, "F");
  setFill(ORANGE); doc.rect(0, 0, W, 2, "F");

  let y = 20;
  setTxt(ORANGE); setFont("bold"); doc.setFontSize(8);
  doc.text("RESUMEN EJECUTIVO", 14, y); y += 8;

  setTxt(WHITE); setFont("bold"); doc.setFontSize(22);
  doc.text("El problema que resolvemos.", 14, y); y += 12;
  divider(y); y += 8;

  // Problem cards
  const problems = [
    { icon: "⚠", title: "2.1 millones de pepenadores", body: "En México existen más de 2 millones de trabajadores informales de la recolección de residuos. El 78% trabaja sin ningún equipo de protección personal, exponiéndose a cortes, infecciones y contaminación por materiales peligrosos." },
    { icon: "💰", title: "Ingreso promedio: $120 MXN/día", body: "La baja eficiencia en la recolección, por falta de herramientas, limita gravemente el ingreso. Un recolector sin kit promedia 25–30 kg de metal por jornada. Con el Kit MagnetoRec, la proyección es de 70–90 kg (+200%)." },
    { icon: "🌍", title: "2.4 millones de toneladas de metal", body: "México genera 2.4 millones de toneladas de residuos ferrosos anualmente. Solo el 38% se recupera. Cada kit activa directamente la economía circular al aumentar el volumen recuperado por trabajador." },
  ];

  problems.forEach((p, i) => {
    const bx = 14 + i * 61;
    setFill(DARK); doc.roundedRect(bx, y, 57, 68, 3, 3, "F");
    setStroke([30,30,30]); doc.setLineWidth(0.3);
    doc.roundedRect(bx, y, 57, 68, 3, 3, "S");
    setTxt(ORANGE); setFont("bold"); doc.setFontSize(18);
    doc.text(p.icon, bx + 6, y + 13);
    setTxt(WHITE); doc.setFontSize(8);
    const tl = doc.splitTextToSize(p.title, 45);
    doc.text(tl, bx + 5, y + 22);
    setTxt(GRAY); setFont("normal"); doc.setFontSize(7);
    const bl = doc.splitTextToSize(p.body, 48);
    doc.text(bl, bx + 5, y + 30);
  });
  y += 76;

  // Solution
  y = sectionHeader("Nuestra Solución", y);
  setFill(DARK); doc.roundedRect(14, y, W - 28, 46, 3, 3, "F");
  setFill(ORANGE); doc.rect(14, y, 2.5, 46, "F");
  setTxt(WHITE); setFont("bold"); doc.setFontSize(10);
  doc.text("Kit MagnetoRec — 2 productos, 1 solución integral", 22, y + 9);
  setTxt(LGRAY); setFont("normal"); doc.setFontSize(8);
  const solText = doc.splitTextToSize(
    "El guante integra 4 imanes de neodimio N52 (los más potentes del mercado) cosidos estratégicamente en palma y tres dedos. Al acercar la mano a una zona de residuos, los metales ferrosos (tapas, latas aplastadas, varillas, cables de cobre recubierto, tornillos) se adhieren automáticamente al guante sin necesidad de tocarlos directamente.\n\nEl bastón detector complementa la seguridad: identifica materiales biológicos, químicos o de riesgo antes de que el recolector haga contacto, gracias a su sensor de proximidad electromagnética y pantalla LCD de lectura inmediata.", W - 36);
  doc.text(solText, 22, y + 16);
  y += 54;

  // Impact numbers
  y = sectionHeader("Impacto Proyectado", y);
  const impacts = [
    { val: "60%", label: "Reducción\nesfuerzo físico" },
    { val: "3×", label: "Más kgs\nrecolectados" },
    { val: "< 3", label: "Jornadas para\nrecuperar inversión" },
    { val: "10K", label: "Kits meta\naño 2026" },
  ];
  impacts.forEach((imp, i) => {
    const bx = 14 + i * 46.5;
    setFill(DARK); doc.roundedRect(bx, y, 42, 24, 2, 2, "F");
    setTxt(ORANGE); setFont("bold"); doc.setFontSize(17);
    doc.text(imp.val, bx + 21, y + 13, { align: "center" });
    setTxt(GRAY); setFont("normal"); doc.setFontSize(6.5);
    doc.text(imp.label, bx + 21, y + 20, { align: "center" });
  });
  y += 34;

  // ──────────────────────────────────────────────────────────────────────────────
  // PAGE 3 — ESPECIFICACIONES TÉCNICAS
  // ──────────────────────────────────────────────────────────────────────────────
  newPage();
  setFill(BLACK); doc.rect(0, 0, W, H, "F");
  setFill(ORANGE); doc.rect(0, 0, W, 2, "F");

  y = 20;
  setTxt(ORANGE); setFont("bold"); doc.setFontSize(8);
  doc.text("ESPECIFICACIONES TÉCNICAS", 14, y); y += 8;
  setTxt(WHITE); setFont("bold"); doc.setFontSize(22);
  doc.text("Los productos del kit.", 14, y); y += 12;
  divider(y); y += 10;

  // Guante specs
  y = sectionHeader("🧤  Guante MagnetoRec — Sistema Magnético HPPE", y, [39,174,96]);

  // Two column layout
  const leftCol = 14, rightCol = 112, colW = 90;

  // Left: construction
  setFill(DARK); doc.roundedRect(leftCol, y, colW, 92, 3, 3, "F");
  setTxt([39,174,96]); setFont("bold"); doc.setFontSize(8);
  doc.text("Materiales de Fabricación", leftCol + 4, y + 8);
  const matRows = [
    ["Capa externa", "HPPE calibre 13 tejido de punto (430 g/m²)"],
    ["Recubrimiento palma", "Nitrilo rugoso (1.2 mm espesor, adherencia 40N/cm²)"],
    ["Refuerzos", "Fibra kevlar en palma y 3 dedos (áreas de alto impacto)"],
    ["Capa interna", "Textil transpirable antibacteriano (tratamiento Aegis®)"],
    ["Impermeabilidad", "100% impermeable en palma — norma EN 374-2"],
    ["Peso", "Aprox. 85–95 g por guante"],
  ];
  matRows.forEach(([k, v], i) => {
    const ry = y + 14 + i * 12;
    setFill([24,24,24]); if (i % 2 === 0) doc.rect(leftCol, ry, colW, 12, "F");
    setTxt(LGRAY); setFont("bold"); doc.setFontSize(6.5);
    doc.text(k, leftCol + 4, ry + 7.5, { maxWidth: 36 });
    setTxt(WHITE); setFont("normal"); doc.setFontSize(6.5);
    doc.text(v, leftCol + 42, ry + 7.5, { maxWidth: 50 });
  });

  // Right: magnets + protection
  setFill(DARK); doc.roundedRect(rightCol, y, colW, 42, 3, 3, "F");
  setTxt(ORANGE); setFont("bold"); doc.setFontSize(8);
  doc.text("Sistema Magnético Integrado", rightCol + 4, y + 8);
  const magRows = [
    ["Tipo de imán", "Neodimio hierro boro (NdFeB) N52"],
    ["Cantidad", "4 discos: 1 en palma, 3 en dedos índice/medio/anular"],
    ["Diámetro", "25 mm Ø × 5 mm espesor"],
    ["Gauss (campo)", "~14,800 gauss en superficie"],
  ];
  magRows.forEach(([k, v], i) => {
    const ry = y + 14 + i * 6.5;
    setTxt(LGRAY); setFont("bold"); doc.setFontSize(6.5);
    doc.text(k + ":", rightCol + 4, ry + 4);
    setTxt(WHITE); setFont("normal"); doc.setFontSize(6.5);
    doc.text(v, rightCol + 38, ry + 4, { maxWidth: 48 });
  });

  // Protection standards
  setFill(DARK); doc.roundedRect(rightCol, y + 48, colW, 44, 3, 3, "F");
  setTxt([255,140,0]); setFont("bold"); doc.setFontSize(8);
  doc.text("Nivel de Protección (EN 388:2016)", rightCol + 4, y + 56);
  const protRows = [
    ["Abrasión (nivel 4)", "████████ 4/4 · Alta resistencia"],
    ["Corte por cuchilla (X)", "4/5 · Muy alta"],
    ["Desgarro (nivel 4)", "4/4 · Alta resistencia"],
    ["Perforación (nivel 4)", "4/4 · Alta resistencia"],
    ["Código total", "EN 388 · 4X44F"],
  ];
  protRows.forEach(([k, v], i) => {
    const ry = y + 62 + i * 6.5;
    setTxt(LGRAY); setFont("bold"); doc.setFontSize(6.5);
    doc.text(k + ":", rightCol + 4, ry);
    setTxt(WHITE); setFont("normal"); doc.setFontSize(6.5);
    doc.text(v, rightCol + 45, ry, { maxWidth: 42 });
  });

  y += 100;

  // Bastón specs
  y = sectionHeader("🔦  Bastón Detector de Riesgos", y, [59,130,246]);

  const batonLeft = [
    ["Sensor principal", "Inductivo + radiométrico de proximidad"],
    ["Tecnología", "Sensor electromagnético diferencial"],
    ["Metales detectados", "Ferrosos y no ferrosos (Al, Fe, Cu, Pb, acero inox)"],
    ["Rango de detección", "2 a 8 cm (variable según material)"],
    ["Tiempo de respuesta", "< 0.5 segundos"],
    ["Precisión", "±5% (temperatura ambiente 15–40°C)"],
    ["Alertas", "LED bicolor + vibración háptica (65 dB silenciosa)"],
    ["Pantalla", "LCD retroiluminado 1.2\" — lecturas en tiempo real"],
    ["Alimentación", "2× pilas AAA (incluidas) — autonomía 8–12 horas"],
    ["Protección", "IP54 — resistente a polvo y salpicaduras"],
    ["Peso", "~210 g con baterías"],
    ["Longitud", "28 cm — diseño ergonómico telescópico"],
  ];

  setFill(DARK); doc.roundedRect(14, y, W - 28, batonLeft.length * 8 + 6, 3, 3, "F");
  batonLeft.forEach(([k, v], i) => {
    const ry = y + 6 + i * 8;
    if (i % 2 === 0) { setFill([20,20,20]); doc.rect(14, ry, W - 28, 8, "F"); }
    setTxt(LGRAY); setFont("bold"); doc.setFontSize(7);
    doc.text(k, 18, ry + 5.5, { maxWidth: 60 });
    setTxt(WHITE); setFont("normal"); doc.setFontSize(7);
    doc.text(v, 82, ry + 5.5, { maxWidth: 120 });
  });
  y += batonLeft.length * 8 + 16;

  // ──────────────────────────────────────────────────────────────────────────────
  // PAGE 4 — FINANZAS + GRÁFICAS
  // ──────────────────────────────────────────────────────────────────────────────
  newPage();
  setFill(BLACK); doc.rect(0, 0, W, H, "F");
  setFill(ORANGE); doc.rect(0, 0, W, 2, "F");

  y = 20;
  setTxt(ORANGE); setFont("bold"); doc.setFontSize(8);
  doc.text("ESTRUCTURA FINANCIERA", 14, y); y += 8;
  setTxt(WHITE); setFont("bold"); doc.setFontSize(22);
  doc.text("Costos, inversión y proyecciones.", 14, y); y += 12;
  divider(y); y += 10;

  // Cost table
  y = sectionHeader("Desglose de Costo por Kit MagnetoRec", y);
  autoTable(doc, {
    startY: y,
    head: [["Componente", "Especificación", "Proveedor ref.", "Costo unitario"]],
    body: [
      ["Guante HPPE calibre 13 (par)", "Tejido de punto + recub. nitrilo rugoso", "Safety Pro MX / Lutexpo", "$180 MXN"],
      ["Imanes neodimio N52 D25×5mm (x4)", "Grado N52, 14,800 gauss, con adhesivo epoxi", "MagnetMX / MercadoLibre", "$90 MXN"],
      ["Costura integración imanes", "Mano de obra taller textil local (por par)", "Taller local", "$50 MXN"],
      ["Bastón detector portátil", "Sensor inductivo + pantalla LCD + pilas", "TechField Mx / AliExpress", "$280 MXN"],
      ["Empaque + instructivo impreso", "Caja kraft + folleto A5 4 colores", "PackMex", "$60 MXN"],
      ["Control de calidad / pruebas", "Inspección magnética + funcional", "Interno", "$20 MXN"],
    ],
    foot: [["", "", "TOTAL KIT MAGNETOREC", "$300 MXN"]],
    styles: { fontSize: 7.5, cellPadding: 3.5, font: "helvetica", textColor: [200,200,200], fillColor: [10,10,10] },
    headStyles: { fillColor: [232,93,4], textColor: [255,255,255], fontStyle: "bold", fontSize: 7.5 },
    footStyles: { fillColor: [232,93,4,0.15], textColor: [232,93,4], fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [18,18,18] },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 62 }, 2: { cellWidth: 38 }, 3: { cellWidth: 26, halign: "right" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  // Horizontal bar chart — cost breakdown
  drawHBarChart(14, y, 88, 62, [
    { label: "Guante HPPE", value: 180, color: [39,174,96] },
    { label: "Bastón detector", value: 280, color: [59,130,246] },
    { label: "Imanes N52", value: 90, color: ORANGE },
    { label: "Integración", value: 50, color: [155,89,182] },
    { label: "Empaque", value: 60, color: [80,80,80] },
    { label: "QC / Pruebas", value: 20, color: [40,40,40] },
  ], 300, "Distribución de costos por kit (MXN)");

  // Vertical bar chart — projection
  const projData = [
    { year: "2025", kits: 500, color: [60,60,60] },
    { year: "2026", kits: 10000, color: ORANGE },
    { year: "2027", kits: 25000, color: [232,93,4] },
    { year: "2028", kits: 60000, color: [255,140,0] },
    { year: "2029", kits: 120000, color: [255,160,30] },
    { year: "2030", kits: 200000, color: [255,190,60] },
  ];
  const chX = 112, chY = y, chW = 84, chH = 62;
  setFill([12,12,12]); doc.roundedRect(chX, chY, chW, chH, 3, 3, "F");
  setTxt(WHITE); setFont("bold"); doc.setFontSize(8);
  doc.text("Proyección de distribución de kits", chX + 4, chY + 7);
  const maxKits = 200000;
  const barW2 = (chW - 16) / projData.length - 3;
  projData.forEach((d, i) => {
    const bx = chX + 8 + i * ((chW - 16) / projData.length);
    const bh = ((d.kits / maxKits) * (chH - 22));
    const by = chY + chH - 14 - bh;
    setFill(d.color); doc.roundedRect(bx, by, barW2, bh, 1, 1, "F");
    setTxt(GRAY); setFont("normal"); doc.setFontSize(5.5);
    doc.text(d.year, bx + barW2 / 2, chY + chH - 5, { align: "center" });
    if (d.kits >= 10000) {
      setTxt(WHITE); setFont("bold"); doc.setFontSize(5.5);
      doc.text(`${d.kits >= 1000 ? (d.kits/1000)+"K" : d.kits}`, bx + barW2 / 2, by - 1, { align: "center" });
    }
  });
  y += 70;

  // Investment table
  y = sectionHeader("Inversión Inicial — Fase de Lanzamiento (35 kits piloto)", y);
  autoTable(doc, {
    startY: y,
    head: [["Concepto", "Detalle", "Monto MXN"]],
    body: [
      ["Producción inicial (35 kits)", "35 guantes + 35 bastones + integración", "$23,800"],
      ["Diseño, branding e instructivos", "Naming, packaging, folleto A5", "$4,500"],
      ["Registro de marca IMPI", "Solicitud de marca mixta, clase 9 y 25", "$3,200"],
      ["Taller integración imanes", "Mano de obra costura especializada", "$1,750"],
      ["Logística y distribución piloto", "Envíos, combustible, campo", "$2,550"],
      ["Fondo de contingencia (10%)", "Imprevistos y reemplazos", "$4,200"],
    ],
    foot: [["", "INVERSIÓN TOTAL", "$40,000 MXN"]],
    styles: { fontSize: 7.5, cellPadding: 3.5, textColor: [200,200,200], fillColor: [10,10,10] },
    headStyles: { fillColor: [155,89,182], textColor: [255,255,255], fontStyle: "bold" },
    footStyles: { fillColor: [155,89,182,0.1], textColor: [155,89,182], fontStyle: "bold", fontSize: 8 },
    alternateRowStyles: { fillColor: [18,18,18] },
    columnStyles: { 0: { cellWidth: 66 }, 1: { cellWidth: 90 }, 2: { cellWidth: 26, halign: "right" } },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 10;

  // ROI box
  setFill([232,93,4,0.06] as any); doc.roundedRect(14, y, W - 28, 22, 3, 3, "F");
  setStroke(ORANGE); doc.setLineWidth(0.3); doc.roundedRect(14, y, W - 28, 22, 3, 3, "S");
  setTxt(ORANGE); setFont("bold"); doc.setFontSize(8);
  doc.text("📈  Retorno de Inversión proyectado", 20, y + 8);
  setTxt(WHITE); setFont("normal"); doc.setFontSize(7.5);
  doc.text("Con PVP de $500 MXN/kit y costo de producción de $300 MXN, el margen bruto es de $200 MXN (40%). Punto de equilibrio en 200 kits vendidos (~$100K MXN). Con 35 kits piloto el ingreso es $17,500 MXN.", 20, y + 16, { maxWidth: W - 36 });

  // ──────────────────────────────────────────────────────────────────────────────
  // PAGE 5 — ODS + IMPACTO SOCIAL
  // ──────────────────────────────────────────────────────────────────────────────
  newPage();
  setFill(BLACK); doc.rect(0, 0, W, H, "F");
  setFill(ORANGE); doc.rect(0, 0, W, 2, "F");

  y = 20;
  setTxt(ORANGE); setFont("bold"); doc.setFontSize(8);
  doc.text("ALINEACIÓN CON ODS — AGENDA 2030", 14, y); y += 8;
  setTxt(WHITE); setFont("bold"); doc.setFontSize(22);
  doc.text("Impacto en los Objetivos de Desarrollo Sostenible.", 14, y); y += 14;
  divider(y); y += 10;

  const odsData = [
    {
      num: "ODS 8", color: [255,140,0] as [number,number,number],
      title: "Trabajo Decente y Crecimiento Económico",
      kpis: ["Ingresos: $120 → $300+ MXN/día (estimado)", "Reducción de lesiones físicas: 65% meta 2026", "Trabajadores formalizados: 500 en fase piloto"],
      body: "El Kit MagnetoRec eleva la productividad del pepenador en hasta 3 veces, permitiéndole recolectar mayor volumen de material reciclable en menos tiempo y con menor desgaste físico. Esto se traduce en mayor ingreso diario sin cambiar de oficio ni requerir capacitación técnica avanzada. Adicionalmente, el guante y el bastón funcionan como EPP certificado, dignificando las condiciones de trabajo.",
    },
    {
      num: "ODS 10", color: [155,89,182] as [number,number,number],
      title: "Reducción de las Desigualdades",
      kpis: ["Precio accesible: $300 MXN (recuperable en 2 jornadas)", "Sin requisito de smartphone ni electricidad", "Distribuible a zonas sin infraestructura bancaria"],
      body: "El kit fue diseñado para ser económicamente accesible al segmento más vulnerable. Con un precio de $300 MXN, equivale a menos de 3 días de trabajo al ingreso promedio actual del recolector. El modelo de distribución contempla subsidios por parte de empresas con programa de RSE y municipios, permitiendo que el kit llegue sin costo al trabajador en las fases iniciales.",
    },
    {
      num: "ODS 12", color: [39,174,96] as [number,number,number],
      title: "Producción y Consumo Responsables",
      kpis: ["Metal recuperado extra: +45 kg por jornada estimado", "Reducción de metal en rellenos sanitarios", "Cada kit activa 1 circuito de economía circular"],
      body: "Al incrementar el volumen de material ferroso y no ferroso recuperado por jornada, cada recolector con el kit MagnetoRec contribuye directamente a que más material llegue a plantas de reciclaje en lugar de vertederos. México genera 2.4 millones de ton de residuos metálicos/año; con 10,000 kits distribuidos en 2026, la meta es recuperar 450 ton adicionales de metal por mes.",
    },
  ];

  odsData.forEach((ods, idx) => {
    if (idx > 0) { divider(y, [20,20,20]); y += 6; }

    // ODS badge
    setFill(ods.color); doc.roundedRect(14, y, 28, 9, 4, 4, "F");
    setTxt(WHITE); setFont("bold"); doc.setFontSize(8);
    doc.text(ods.num, 28, y + 6.2, { align: "center" });

    setTxt(WHITE); setFont("bold"); doc.setFontSize(11);
    doc.text(ods.title, 46, y + 7);
    y += 14;

    // KPIs row
    ods.kpis.forEach((kpi, ki) => {
      const kx = 14 + ki * 63;
      setFill([16,16,16]); doc.roundedRect(kx, y, 59, 11, 2, 2, "F");
      setFill(ods.color); doc.circle(kx + 5, y + 5.5, 1.5, "F");
      setTxt(LGRAY); setFont("normal"); doc.setFontSize(6.5);
      const kl = doc.splitTextToSize(kpi, 48);
      doc.text(kl, kx + 9, y + 4.5);
    });
    y += 16;

    // Body
    setTxt([140,140,140]); setFont("normal"); doc.setFontSize(7.5);
    const bl = doc.splitTextToSize(ods.body, W - 36);
    doc.text(bl, 18, y);
    y += bl.length * 3.8 + 10;
  });

  // ODS summary table
  y = sectionHeader("Tabla de Métricas ODS — Metas 2025–2030", y + 4);
  autoTable(doc, {
    startY: y,
    head: [["ODS", "Indicador", "Línea Base 2025", "Meta 2026", "Meta 2030"]],
    body: [
      ["ODS 8", "Ingresos por jornada del recolector", "$120 MXN/día", "$220 MXN/día", "$350 MXN/día"],
      ["ODS 8", "Kgs de metal recolectados/día", "25–30 kg", "70–90 kg", "100–130 kg"],
      ["ODS 8", "Trabajadores con EPP formal", "< 5%", "15% (500 kits)", "> 40% (10,000+ kits)"],
      ["ODS 10", "Kits distribuidos a trabajadores", "0", "500 (piloto)", "10,000+"],
      ["ODS 10", "Precio accesible vs ingreso diario", "–", "< 6 jornadas", "< 3 jornadas"],
      ["ODS 12", "Metal ferroso extra recuperado/mes", "0 ton", "+22 ton", "+450 ton"],
      ["ODS 12", "Kits activos en campo", "0", "500", "10,000"],
    ],
    styles: { fontSize: 6.8, cellPadding: 3, textColor: [200,200,200], fillColor: [10,10,10] },
    headStyles: { fillColor: [232,93,4], textColor: [255,255,255], fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: [18,18,18] },
    columnStyles: { 0: { cellWidth: 18 }, 1: { cellWidth: 72 }, 2: { cellWidth: 30 }, 3: { cellWidth: 30 }, 4: { cellWidth: 32 } },
    margin: { left: 14, right: 14 },
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // PAGE 6 — PLAN OPERATIVO
  // ──────────────────────────────────────────────────────────────────────────────
  newPage();
  setFill(BLACK); doc.rect(0, 0, W, H, "F");
  setFill(ORANGE); doc.rect(0, 0, W, 2, "F");

  y = 20;
  setTxt(ORANGE); setFont("bold"); doc.setFontSize(8);
  doc.text("PLAN OPERATIVO", 14, y); y += 8;
  setTxt(WHITE); setFont("bold"); doc.setFontSize(22);
  doc.text("Hoja de ruta 2025–2030.", 14, y); y += 12;
  divider(y); y += 10;

  const phases = [
    {
      num: "01", title: "Investigación y Validación", period: "Ene – Jun 2025", color: [155,89,182] as [number,number,number], status: "COMPLETADO",
      items: ["Diagnóstico de campo con 120 pepenadores en CDMX, Guadalajara y Monterrey", "Validación técnica del sensor inductivo (sensor LVT-12M8, datasheet disponible)", "Alianzas institucionales gestionadas: SEMARNAT, CANACINTRA, UNAM Ingeniería", "Prototipo funcional #1 fabricado y probado en condiciones reales de campo", "Solicitud de patente provisional ante el IMPI (expediente en proceso)", "Encuesta de aceptación: 87% de recolectores aprobaría usar el kit"],
    },
    {
      num: "02", title: "Pilotaje Controlado", period: "Jul 2025 – Mar 2026", color: ORANGE as [number,number,number], status: "EN CURSO",
      items: ["Distribución a 500 trabajadores seleccionados (5 estados prioritarios)", "Protocolo de capacitación: 2 horas por grupo, materiales en español e imágenes", "Medición mensual: kgs recolectados, lesiones registradas, ingreso diario", "Campaña 'Apadrina un Recolector' — meta: 300 patrocinadores individuales", "Incorporación de ajustes al diseño del guante basados en feedback de campo", "Primer reporte de impacto parcial para aliados institucionales"],
    },
    {
      num: "03", title: "Escalabilidad Nacional", period: "2026 – 2030", color: [39,174,96] as [number,number,number], status: "PLANIFICADO",
      items: ["Meta: 10,000 kits distribuidos en 2026; 200,000 kits acumulados en 2030", "Expansión progresiva a los 5 estados con mayor población recolectora", "Modelo de distribución: venta directa + franquicia social + licitaciones municipales", "Integración con plataformas de reciclaje: Reciclapp, Cicla+", "Reporte de impacto final ante la ONU para Agenda 2030", "Posible exportación del modelo a Colombia, Argentina y Perú"],
    },
  ];

  phases.forEach((ph, idx) => {
    // Phase header
    setFill(ph.color); doc.roundedRect(14, y, 4, 28 + ph.items.length * 7, 0, 0, "F");
    setFill(DARK); doc.roundedRect(18, y, W - 32, 28 + ph.items.length * 7, 3, 3, "F");

    // Badge
    setFill(ph.color); doc.roundedRect(22, y + 4, 20, 8, 2, 2, "F");
    setTxt(WHITE); setFont("bold"); doc.setFontSize(7);
    doc.text(`Fase ${ph.num}`, 32, y + 9.5, { align: "center" });

    // Status
    setFill([20,20,20]); doc.roundedRect(46, y + 4, 30, 8, 2, 2, "F");
    setTxt(ph.color); setFont("bold"); doc.setFontSize(6.5);
    doc.text(ph.status, 61, y + 9.5, { align: "center" });

    setTxt(WHITE); setFont("bold"); doc.setFontSize(10);
    doc.text(ph.title, 22, y + 20);

    setTxt(GRAY); setFont("normal"); doc.setFontSize(7);
    doc.text(ph.period, W - 16, y + 20, { align: "right" });

    ph.items.forEach((item, i) => {
      const iy = y + 28 + i * 7;
      setFill(ph.color); doc.circle(24, iy + 1, 1.2, "F");
      setTxt([150,150,150]); setFont("normal"); doc.setFontSize(7);
      doc.text(item, 28, iy + 1.5, { maxWidth: W - 50 });
    });

    y += 36 + ph.items.length * 7 + 8;
  });

  // ──────────────────────────────────────────────────────────────────────────────
  // PAGE 7 — MODELO DE NEGOCIO
  // ──────────────────────────────────────────────────────────────────────────────
  newPage();
  setFill(BLACK); doc.rect(0, 0, W, H, "F");
  setFill(ORANGE); doc.rect(0, 0, W, 2, "F");

  y = 20;
  setTxt(ORANGE); setFont("bold"); doc.setFontSize(8);
  doc.text("MODELO DE NEGOCIO Y DISTRIBUCIÓN", 14, y); y += 8;
  setTxt(WHITE); setFont("bold"); doc.setFontSize(22);
  doc.text("Canales, precios y sostenibilidad.", 14, y); y += 12;
  divider(y); y += 10;

  // Pricing table
  y = sectionHeader("Estructura de Precios", y);
  autoTable(doc, {
    startY: y,
    head: [["Canal", "Precio Venta", "Descuento", "Margen Bruto", "Notas"]],
    body: [
      ["Venta directa B2C", "$500 MXN", "—", "40% ($200)", "Plataforma web + MercadoLibre"],
      ["Empresa RSE / ESG (lote 50+)", "$420 MXN", "16%", "28% ($120)", "Incluye logo empresa en empaque"],
      ["Municipio / Gobierno (lote 500+)", "$300 MXN", "40%", "0%", "Subsidiado — pérdida asumida por donativo"],
      ["ONG Partner", "$200 MXN (costo)", "33%", "0%", "Precio de costo para distribución social"],
      ["Campaña Apadrina (B2C donativo)", "$50 MXN/mes", "—", "N/A", "Donante paga kit de un trabajador c/mes"],
    ],
    styles: { fontSize: 7, cellPadding: 3, textColor: [200,200,200], fillColor: [10,10,10] },
    headStyles: { fillColor: [232,93,4], textColor: [255,255,255], fontStyle: "bold", fontSize: 7 },
    alternateRowStyles: { fillColor: [18,18,18] },
    margin: { left: 14, right: 14 },
  });
  y = (doc as any).lastAutoTable.finalY + 12;

  y = sectionHeader("Estrategia de Distribución", y);
  const channels = [
    { color: [232,93,4] as [number,number,number], tag: "B2C", title: "Directo al trabajador", body: "Venta online vía plataforma propia y MercadoLibre. El kit se envía en 3–5 días hábiles a cualquier estado de México. Incluye instructivo impreso en español con ilustraciones." },
    { color: [155,89,182] as [number,number,number], tag: "B2B", title: "Empresas y Municipios", body: "Paquetes corporativos desde 50 kits para estrategias ESG/RSE. Incluye reporte de impacto trimestral con datos del campo. Deducible de impuestos (CFDI)." },
    { color: [39,174,96] as [number,number,number], tag: "ONG", title: "Alianza Social", body: "Colaboración con organizaciones como Greenpeace MX, Fundación E+E y municipios para distribuir kits a costo o sin costo en comunidades de alta vulnerabilidad." },
  ];
  channels.forEach((ch, i) => {
    const bx = 14 + i * 62;
    setFill(DARK); doc.roundedRect(bx, y, 58, 56, 3, 3, "F");
    setFill(ch.color); doc.rect(bx, y, 58, 2.5, "F");
    setFill(ch.color); doc.roundedRect(bx + 4, y + 7, 16, 8, 2, 2, "F");
    setTxt(WHITE); setFont("bold"); doc.setFontSize(7);
    doc.text(ch.tag, bx + 12, y + 12.5, { align: "center" });
    setTxt(WHITE); setFont("bold"); doc.setFontSize(9);
    doc.text(ch.title, bx + 4, y + 24);
    setTxt(GRAY); setFont("normal"); doc.setFontSize(7);
    const bl = doc.splitTextToSize(ch.body, 50);
    doc.text(bl, bx + 4, y + 32);
  });
  y += 64;

  y = sectionHeader("Resumen de Sostenibilidad Financiera", y);
  const sustData = [
    { label: "Punto de equilibrio (unidades)", val: "182 kits" },
    { label: "Punto de equilibrio (ingresos)", val: "$163,800 MXN" },
    { label: "Margen bruto estándar (B2C)", val: "40% — $200 MXN/kit" },
    { label: "Proyección ingresos año 1 (500 kits)", val: "$250,000 MXN bruto" },
    { label: "Proyección ingresos año 2 (10,000 kits)", val: "$5,000,000 MXN bruto" },
    { label: "Reinversión en I+D (% sobre ventas)", val: "8% — mejora del sensor electromagnético" },
  ];
  setFill(DARK); doc.roundedRect(14, y, W - 28, sustData.length * 10 + 8, 3, 3, "F");
  sustData.forEach((row, i) => {
    const ry = y + 6 + i * 10;
    if (i % 2 === 0) { setFill([20,20,20]); doc.rect(14, ry, W - 28, 10, "F"); }
    setTxt(LGRAY); setFont("normal"); doc.setFontSize(7.5);
    doc.text(row.label, 20, ry + 6.5);
    setTxt(ORANGE); setFont("bold"); doc.setFontSize(7.5);
    doc.text(row.val, W - 20, ry + 6.5, { align: "right" });
  });
  y += sustData.length * 10 + 18;

  // ──────────────────────────────────────────────────────────────────────────────
  // PAGE 8 — CONCLUSIONES + CONTACTO
  // ──────────────────────────────────────────────────────────────────────────────
  newPage();
  setFill(BLACK); doc.rect(0, 0, W, H, "F");
  setFill(ORANGE); doc.rect(0, 0, W, 2, "F");

  y = 22;
  y = sectionHeader("Conclusiones y Próximos Pasos", y);

  const conclusions = [
    { num: "01", text: "El Kit MagnetoRec es técnicamente viable: los materiales (HPPE, neodimio N52, sensor inductivo) existen en el mercado mexicano, son accesibles y ya han sido probados en condiciones reales de campo." },
    { num: "02", text: "El costo de $300 MXN es recuperable en menos de 2 jornadas de trabajo con el incremento de productividad proyectado, lo que hace al kit autosustentable para el propio trabajador." },
    { num: "03", text: "El modelo de distribución mixto (B2C, B2B RSE, ONG, municipios) garantiza que el kit llegue a los distintos segmentos del mercado objetivo, con precios adaptados a cada canal." },
    { num: "04", text: "La alineación con ODS 8, 10 y 12 abre acceso a financiamiento internacional (BID, PNUD, Green Climate Fund) y hace al proyecto elegible para esquemas de impacto social con retorno." },
    { num: "05", text: "El potencial de escalabilidad es significativo: con 10,000 kits distribuidos en 2026 y 200,000 en 2030, el impacto sistémico en la economía circular de México sería medible y verificable." },
  ];

  conclusions.forEach((c, i) => {
    setFill(DARK); doc.roundedRect(14, y, W - 28, 22, 3, 3, "F");
    setFill(ORANGE); doc.rect(14, y, 2.5, 22, "F");
    setTxt(ORANGE); setFont("bold"); doc.setFontSize(14);
    doc.text(c.num, 22, y + 14);
    setTxt(WHITE); setFont("normal"); doc.setFontSize(8);
    const tl = doc.splitTextToSize(c.text, W - 54);
    doc.text(tl, 36, y + 8);
    y += 26;
  });

  y += 10;
  divider(y); y += 12;

  // Próximos pasos
  setTxt(WHITE); setFont("bold"); doc.setFontSize(12);
  doc.text("Próximos pasos inmediatos", 14, y); y += 10;
  const nexts = [
    "Finalizar prototipo funcional del guante con sensor adicional de vibración háptica (Q3 2025)",
    "Conseguir muestra de 50 guantes de proveedor Safety Pro MX para prueba de campo controlada",
    "Registrar marca 'MagnetoRec' ante el IMPI y dominio web ecoseguridad2030.mx",
    "Lanzar campaña pre-seed en plataforma de crowdfunding para $40,000 MXN de inversión inicial",
    "Establecer alianza formal con al menos 1 municipio de CDMX para distribución piloto 500 kits",
  ];
  nexts.forEach((n, i) => {
    setFill(ORANGE); doc.circle(18, y + 1.5, 1.5, "F");
    setTxt([150,150,150]); setFont("normal"); doc.setFontSize(8);
    doc.text(n, 23, y + 2, { maxWidth: W - 40 });
    y += 9;
  });

  y += 14;

  // Contact box
  setFill([12,12,12]); doc.roundedRect(14, y, W - 28, 36, 5, 5, "F");
  setStroke(ORANGE); doc.setLineWidth(0.4); doc.roundedRect(14, y, W - 28, 36, 5, 5, "S");
  setTxt(ORANGE); setFont("bold"); doc.setFontSize(10);
  doc.text("¿Quieres ser parte del proyecto?", W/2, y + 11, { align: "center" });
  setTxt(LGRAY); setFont("normal"); doc.setFontSize(8);
  doc.text("contacto@ecoseguridad2030.mx  ·  ecoseguridad2030.mx  ·  Instagram @ecoseg2030", W/2, y + 20, { align: "center" });
  setTxt(GRAY); doc.setFontSize(7);
  doc.text("Inversionistas, patrocinadores, aliados municipales o académicos: escríbenos.", W/2, y + 28, { align: "center" });

  // ────────────────────────────────────────────────────────────
  // Patch footer into page 1 manually (first page has no auto footer)
  // ────────────────────────────────────────────────────────────
  doc.setPage(1);
  setFill(DARK); doc.rect(0, H - 10, W, 10, "F");
  setTxt(GRAY); setFont("normal"); doc.setFontSize(7);
  doc.text("EcoSeguridad2030 © 2025 — Proyecto MagnetoRec — Confidencial", 14, H - 3.5);
  doc.text("Página 1", W - 14, H - 3.5, { align: "right" });

  // Save
  doc.save("EcoSeguridad2030_KitMagnetoRec_2025.pdf");
}
