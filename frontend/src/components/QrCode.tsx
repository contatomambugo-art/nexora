import { useMemo } from 'react';
import qrcode from 'qrcode-generator';

/** QR em SVG (módulos escuros viram um único path). Fundo branco com margem para leitura. */
export function QrCode({ value, label }: { value: string; label: string }) {
  const { n, path } = useMemo(() => {
    const qr = qrcode(0, 'M'); qr.addData(value); qr.make();
    const n = qr.getModuleCount(); let path = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
    return { n, path };
  }, [value]);
  return (
    <svg className="qr" viewBox={`-2 -2 ${n + 4} ${n + 4}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" /><path d={path} fill="#000" />
    </svg>
  );
}
