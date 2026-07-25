import { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import './App.css';
import { BarcodePreview } from './components/BarcodePreview';
import type { ParsedRecord, PreviewLabel } from './types';

const defaultInput = 'nombre\tcodigo\tprecio\nProducto A\t001\t1200\nProducto B\t002\t800';
const TEMPLATE_SIZES = {
  standard: { widthMm: 80, heightMm: 50, label: '80 × 50 mm' },
  compact: { widthMm: 50, heightMm: 30, label: '50 × 30 mm' },
} as const;

function App() {
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

  const validRecords = useMemo(() => records.filter((record) => record.validationState === 'valid'), [records]);

  const handleParse = async () => {
    setLoading(true);
    setMessage('Interpretando datos...');
    try {
      const response = await fetch('/api/parse', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText }),
      });
      const data = await response.json();
      setRecords(data.records ?? []);
      setErrors(data.errors ?? []);
      setPreviewLabels([]);
      setPrintStatus(null);
      setMessage(data.records?.length ? 'Datos interpretados correctamente.' : 'No se encontraron registros.');
    } catch (error) {
      setMessage('No se pudo conectar con el backend.');
      setErrors(['Verifica que el servidor de NestJS esté en ejecución.']);
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    setLoading(true);
    setMessage('Generando vista previa...');
    try {
      const response = await fetch('/api/preview', {
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
      const data = await response.json();
      setPreviewLabels(data.labels ?? []);
      setMessage('Vista previa lista para revisar.');
    } catch (error) {
      setMessage('No se pudo generar la vista previa.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = async () => {
    setLoading(true);
    setMessage('Preparando impresión...');
    try {
      const response = await fetch('/api/print', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ labels: previewLabels }),
      });
      const data = await response.json();
      setPrintStatus(`${data.status}: ${data.printDocument?.labels ?? 0} etiquetas listas.`);
      setMessage('Documento listo para impresión.');
    } catch (error) {
      setMessage('No se pudo preparar la impresión.');
    } finally {
      setLoading(false);
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
          <p className="eyebrow">Etiquetas MVP</p>
          <h1>Convierte datos pegados en etiquetas listas para imprimir.</h1>
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
              <p>Usa un formato simple con columnas separadas por tabulaciones o comas.</p>
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
                  ['--label-width-mm' as '--label-width-mm']: `${label.templateWidthMm}mm`,
                  ['--label-height-mm' as '--label-height-mm']: `${label.templateHeightMm}mm`,
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
    </div>
  );
}

export default App;
