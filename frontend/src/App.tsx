import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import './App.css';
import { BarcodePreview } from './components/BarcodePreview';
import type { ParsedRecord, PreviewLabel, PrintResponse } from './types';
import { buildPrintDocumentHtml } from './utils/printDocument';

const defaultInput = 'Producto A,001,1200\nProducto B,002,800,650';
const TEMPLATE_SIZES = {
  standard: { widthMm: 80, heightMm: 50, label: '80 × 50 mm' },
  compact: { widthMm: 50, heightMm: 30, label: '50 × 30 mm' },
} as const;
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '');

function buildApiUrl(path: '/api/parse' | '/api/preview' | '/api/print') {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

async function readJsonResponse<T>(response: Response) {
  const data = (await response.json()) as T & { message?: string | string[] };

  if (response.ok) {
    return data;
  }

  if (Array.isArray(data.message)) {
    throw new Error(data.message.join(' · '));
  }

  throw new Error(data.message ?? 'La solicitud no se pudo completar.');
}

function App() {
  const coffeeSupportKey = '0091439175';
  const [inputText, setInputText] = useState(defaultInput);
  const [records, setRecords] = useState<ParsedRecord[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [template, setTemplate] = useState('standard');
  const [codeType, setCodeType] = useState('barcode');
  const [copies, setCopies] = useState(2);
  const [previewLabels, setPreviewLabels] = useState<PreviewLabel[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Pega tus datos y pulsa interpretar para comenzar.');
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [showPrintSuccessModal, setShowPrintSuccessModal] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);

  const validRecords = useMemo(() => records.filter((record) => record.validationState === 'valid'), [records]);

  const handleParse = async () => {
    setLoading(true);
    setShowPrintSuccessModal(false);
    setCopySuccessMessage(null);
    setMessage('Interpretando datos...');
    try {
      const response = await fetch(buildApiUrl('/api/parse'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText }),
      });
      const data = await readJsonResponse<{ records: ParsedRecord[]; errors: string[] }>(response);
      setRecords(data.records ?? []);
      setErrors(data.errors ?? []);
      setPreviewLabels([]);
      setPrintStatus(null);
      setMessage(data.records?.length ? 'Datos interpretados correctamente.' : 'No se encontraron registros.');
    } catch (error) {
      setMessage('No se pudieron interpretar los datos.');
      setErrors([error instanceof Error ? error.message : 'Verifica que el servidor de NestJS esté en ejecución.']);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    setShowPrintSuccessModal(false);
    setCopySuccessMessage(null);
    setMessage('Generando vista previa...');
    try {
      const response = await fetch(buildApiUrl('/api/preview'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: records.map((record) => ({
            ...record,
            price: Number(record.price),
            discountPrice: record.discountPrice ? Number(record.discountPrice) : null,
          })),
          template,
          codeType,
          copies,
        }),
      });
      const data = await readJsonResponse<{ labels: PreviewLabel[] }>(response);
      setPreviewLabels(data.labels ?? []);
      setPrintStatus(null);
      setMessage('Vista previa lista para revisar.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo generar la vista previa.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      setMessage('Tu navegador bloqueó la ventana de impresión. Permite ventanas emergentes e intenta de nuevo.');
      setPrintStatus(null);
      setShowPrintSuccessModal(false);
      setCopySuccessMessage(null);
      return;
    }

    printWindow.document.write(
      '<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8" /><title>Preparando impresión</title><style>body{font-family:Inter,Arial,sans-serif;padding:24px;color:#334155}</style></head><body><p>Preparando documento para impresión...</p></body></html>',
    );
    printWindow.document.close();

    setLoading(true);
    setShowPrintSuccessModal(false);
    setCopySuccessMessage(null);
    setMessage('Preparando impresión...');
    try {
      const response = await fetch(buildApiUrl('/api/print'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels: previewLabels }),
      });
      const data = await readJsonResponse<PrintResponse>(response);
      const html = await buildPrintDocumentHtml(data.printDocument);

      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();
      setPrintStatus(`${data.status}: ${Array.isArray(data.printDocument?.labels) ? data.printDocument.labels.length : 0} etiquetas listas.`);
      setMessage('Documento listo para impresión.');
      setShowPrintSuccessModal(true);
      setCopySuccessMessage(null);
    } catch (error) {
      printWindow.close();
      setPrintStatus(null);
      setShowPrintSuccessModal(false);
      setCopySuccessMessage(null);
      setMessage(error instanceof Error ? error.message : 'No se pudo preparar la impresión.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCoffeeKey = async () => {
    try {
      await navigator.clipboard.writeText(coffeeSupportKey);
      setCopySuccessMessage('Llave copiada.');
    } catch (error) {
      setCopySuccessMessage(null);
      setMessage(error instanceof Error ? error.message : 'No se pudo copiar la llave.');
    }
  };

  const updateRecord = (index: number, field: keyof ParsedRecord, value: string) => {
    setRecords((current) =>
      current.map((record, recordIndex) => {
        if (recordIndex !== index) {
          return record;
        }

        if (field === 'name') {
          return { ...record, name: value };
        }
        if (field === 'code') {
          return { ...record, code: value };
        }
        if (field === 'price') {
          const nextValue = Number(value);
          return { ...record, price: Number.isFinite(nextValue) ? nextValue : 0 };
        }
        if (field === 'discountPrice') {
          const nextValue = value ? Number(value) : null;
          return { ...record, discountPrice: Number.isFinite(nextValue) ? nextValue : null };
        }
        return record;
      }),
    );
  };

  return (
    <div className="app-shell">
      <header className="hero-card">
        <div>
          <p className="eyebrow">Mis Etiquetas </p>
          <h1>Convierte datos en etiquetas listas para imprimir.</h1>
          <p>
            Pega información desde Excel, Google Sheets, CSV o texto tabulado y convierte esa entrada en
            una vista previa lista para imprimir.
          </p>
        </div>
      </header>

      <main className="content-grid">
        <section className="panel panel-large">
          <div className="panel-header">
            <div>
              <h2>1. Pega la información</h2>
              <p>Usa un formato simple por fila: nombre, código, precio y descuento opcional. Cada producto va en un enter.</p>
            </div>
            <button onClick={handleParse} disabled={loading}>
              {loading ? 'Procesando...' : 'Interpretar datos'}
            </button>
          </div>

          <textarea value={inputText} onChange={(event) => setInputText(event.target.value)} rows={10} />

          <div className="status-row">
            <span className="status-pill">{message}</span>
          </div>

          {errors.length > 0 && (
            <div className="error-box">
              <h3>Errores detectados</h3>
              <ul>
                {errors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>2. Revisa los registros</h2>
              <p>Corrige cualquier dato antes de generar la vista previa. La medida la define la plantilla.</p>
            </div>
          </div>

          <div className="controls">
            <label>
              Plantilla
              <select value={template} onChange={(event) => setTemplate(event.target.value)}>
                <option value="standard">Estándar · {TEMPLATE_SIZES.standard.label}</option>
                <option value="compact">Compacta · {TEMPLATE_SIZES.compact.label}</option>
              </select>
            </label>
            <label>
              Tipo de código
              <select value={codeType} onChange={(event) => setCodeType(event.target.value)}>
                <option value="barcode">Código de barras</option>
                <option value="qr">Código QR</option>
              </select>
            </label>
            <label>
              Copias
              <input
                type="number"
                min="1"
                value={copies}
                onChange={(event) => setCopies(Number(event.target.value))}
              />
            </label>
          </div>

          <div className="record-table-wrapper">
            {records.length === 0 ? (
              <div className="empty-state">Aún no hay registros para revisar.</div>
            ) : (
              <table className="record-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Código</th>
                    <th>Precio</th>
                    <th>Descuento</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record, index) => (
                    <tr key={record.id} className={record.validationState === 'invalid' ? 'record-row invalid' : 'record-row'}>
                      <td>
                        <input value={record.name} onChange={(event) => updateRecord(index, 'name', event.target.value)} />
                      </td>
                      <td>
                        <input value={record.code} onChange={(event) => updateRecord(index, 'code', event.target.value)} />
                      </td>
                      <td>
                        <input type="number" value={record.price} onChange={(event) => updateRecord(index, 'price', event.target.value)} />
                      </td>
                      <td>
                        <input type="number" value={record.discountPrice ?? ''} onChange={(event) => updateRecord(index, 'discountPrice', event.target.value)} />
                      </td>
                      <td>
                        <span className={`record-status ${record.validationState === 'invalid' ? 'invalid' : 'valid'}`}>
                          {record.validationState === 'valid' ? 'OK' : 'Revisar'}
                        </span>
                        {record.errors.length > 0 && <small>{record.errors.join(' · ')}</small>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>

      <section className="panel actions-panel">
        <div className="panel-header">
          <div>
            <h2>3. Genera la vista previa</h2>
            <p>Revisa y luego prepara la impresión.</p>
          </div>
          <div className="action-buttons">
            <button onClick={handlePreview} disabled={loading || validRecords.length === 0}>
              {loading ? 'Generando...' : 'Generar vista previa'}
            </button>
            <button onClick={handlePrint} disabled={loading || previewLabels.length === 0} className="secondary">
              Preparar impresión
            </button>
          </div>
        </div>

        {printStatus && <div className="success-box">{printStatus}</div>}

        <div className="preview-grid">
          {previewLabels.map((label) => (
            <article
              key={label.id}
              className={`label-card ${label.codeType === 'qr' ? 'qr-mode' : ''} ${label.template === 'compact' ? 'compact-mode' : 'standard-mode'}`}
              style={
                {
                  '--label-width-mm': `${label.templateWidthMm}mm`,
                  '--label-height-mm': `${label.templateHeightMm}mm`,
                } as CSSProperties
              }
            >
              <p className="label-name">{label.name}</p>
              <div className="barcode-wrap">
                <BarcodePreview value={label.code} codeType={label.codeType} template={label.template} />
              </div>
              <p className="label-price-row">
                <span className={label.discountPrice !== null ? 'label-price-strike' : 'label-price-current'}>
                  {label.price.toLocaleString('es-CO')}
                </span>
                {label.discountPrice !== null ? (
                  <span className="label-discount-current">{label.discountPrice.toLocaleString('es-CO')}</span>
                ) : null}
              </p>
            </article>
          ))}
        </div>
      </section>

      {showPrintSuccessModal && (
        <div
          className="success-modal-overlay"
          role="presentation"
          onClick={() => {
            setShowPrintSuccessModal(false);
            setCopySuccessMessage(null);
          }}
        >
          <div
            className="success-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="success-modal-title"
            onClick={(event) => event.stopPropagation()}
          >
            <h2 id="success-modal-title">🎉 ¡Tus etiquetas están listas!</h2>
            <p className="success-modal-main">✅ El PDF se descargó correctamente.</p>
            <p>
              Esperamos que esta herramienta te haya ahorrado tiempo. <b>Negocio al Clic</b> desarrolla herramientas
              gratuitas para emprendedores y empresarios.
            </p>
            <p>
              Si esta aplicación te ayudó, puedes apoyarnos para seguir creando nuevas herramientas.
            </p>
            <div className="coffee-support">
              <p>Puedes invitarnos un café ☕</p>
              <img src="/QR.webp" alt="Código QR para invitar un café" className="coffee-qr" />
              <p>Escanea el código QR para invitarnos un café.</p>
              <div className="coffee-key-row">
                <span>🗝️ {coffeeSupportKey}</span>
                <button type="button" className="copy-key-button" onClick={handleCopyCoffeeKey}>
                  📋
                </button>
              </div>
              {copySuccessMessage && <p className="copy-key-success">{copySuccessMessage}</p>}
            </div>
            <div className="close-modal-row">
              <button
                className="close-modal-button"
                type="button"
                onClick={() => {
                  setShowPrintSuccessModal(false);
                  setCopySuccessMessage(null);
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
