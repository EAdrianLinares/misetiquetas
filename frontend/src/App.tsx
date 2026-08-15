import { useEffect, useMemo, useState } from 'react';
import type { CSSProperties } from 'react';
import './App.css';
import { BarcodePreview } from './components/BarcodePreview';
import type { PaperProfile, PaperType, PrintOrientation, PrintSettings, ParsedRecord, PreviewLabel, PrintResponse } from './types';
import { buildPrintDocumentHtml } from './utils/printDocument';
import { buildLayoutPlan, buildPrintSettings, paginate, PAPER_PROFILES } from './utils/printLayout';

const defaultInput = 'Producto A, COD-001, 1200\nProducto B, COD-002, 800, 650';
const TEMPLATE_SIZES = {
  standard: { widthMm: 80, heightMm: 50, label: '80 × 50 mm' },
  compact: { widthMm: 50, heightMm: 30, label: '50 × 30 mm' },
} as const;
const API_BASE_URL = (import.meta.env.VITE_API_URL ?? '').trim().replace(/\/$/, '');
const PAPER_TYPE_LABELS: Record<PaperType, string> = {
  a4: 'A4',
  letter: 'Carta',
  'continuous-58': 'Continuo 58 mm',
  'continuous-80': 'Continuo 80 mm',
  'continuous-100': 'Continuo 100 mm',
};

function buildApiUrl(path: '/api/parse' | '/api/preview' | '/api/print') {
  return API_BASE_URL ? `${API_BASE_URL}${path}` : path;
}

function profileToSettings(profile: PaperProfile): PrintSettings {
  return {
    paperType: profile.paperType,
    orientation: profile.orientation,
    columns: profile.columns,
    marginTopMm: profile.marginTopMm,
    marginBottomMm: profile.marginBottomMm,
    marginLeftMm: profile.marginLeftMm,
    marginRightMm: profile.marginRightMm,
    gapHorizontalMm: profile.gapHorizontalMm,
    gapVerticalMm: profile.gapVerticalMm,
    allowZeroMarginOnContinuous: false,
  };
}

function profileNeedsZeroMargins(profile: PaperProfile) {
  return (
    profile.paperType.startsWith('continuous') &&
    (profile.marginTopMm === 0 ||
      profile.marginBottomMm === 0 ||
      profile.marginLeftMm === 0 ||
      profile.marginRightMm === 0)
  );
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
  const [paperProfileId, setPaperProfileId] = useState('continuous-58-default');
  const [customPrintSettings, setCustomPrintSettings] = useState<PrintSettings>(profileToSettings(PAPER_PROFILES.find((profile) => profile.id === 'custom') ?? PAPER_PROFILES[0]));
  const [allowZeroMarginOnContinuous, setAllowZeroMarginOnContinuous] = useState(false);
  const [previewLabels, setPreviewLabels] = useState<PreviewLabel[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('Pega tus datos y pulsa interpretar para comenzar.');
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [showPrintSuccessModal, setShowPrintSuccessModal] = useState(false);
  const [copySuccessMessage, setCopySuccessMessage] = useState<string | null>(null);
  const [isRecordsExpanded, setIsRecordsExpanded] = useState(false);

  const validRecords = useMemo(() => records.filter((record) => record.validationState === 'valid'), [records]);
  const selectedPaperProfile = useMemo(
    () => PAPER_PROFILES.find((profile) => profile.id === paperProfileId) ?? PAPER_PROFILES[0],
    [paperProfileId],
  );
  const isCustomPaperProfile = selectedPaperProfile.isCustom === true;
  const printSettings = useMemo(
    () =>
      buildPrintSettings({
        profile: selectedPaperProfile,
        customSettings: isCustomPaperProfile ? customPrintSettings : undefined,
        allowZeroMarginOnContinuous,
      }),
    [allowZeroMarginOnContinuous, customPrintSettings, isCustomPaperProfile, selectedPaperProfile],
  );
  const previewLayout = useMemo(() => {
    const firstLabel = previewLabels[0];
    if (!firstLabel) {
      return null;
    }

    return buildLayoutPlan({
      labelWidthMm: firstLabel.templateWidthMm,
      labelHeightMm: firstLabel.templateHeightMm,
      totalItems: previewLabels.length,
      settings: printSettings,
    });
  }, [previewLabels, printSettings]);
  const previewPages = useMemo(
    () => (previewLayout ? paginate(previewLabels, previewLayout.itemsPerPage) : []),
    [previewLabels, previewLayout],
  );

  useEffect(() => {
    if (!showPrintSuccessModal) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowPrintSuccessModal(false);
      setCopySuccessMessage(null);
    }, 15000);

    return () => window.clearTimeout(timeoutId);
  }, [showPrintSuccessModal]);

  const handlePreview = async () => {
    setLoading(true);
    setShowPrintSuccessModal(false);
    setCopySuccessMessage(null);
    setMessage('Interpretando datos y generando vista previa...');
    try {
      const parseResponse = await fetch(buildApiUrl('/api/parse'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: inputText }),
      });
      const parseData = await readJsonResponse<{ records: ParsedRecord[]; errors: string[] }>(parseResponse);
      const nextRecords = parseData.records ?? [];
      setRecords(nextRecords);
      setErrors(parseData.errors ?? []);

      if (nextRecords.length === 0) {
        setPreviewLabels([]);
        setMessage('No se encontraron registros para generar la vista previa.');
        return;
      }

      const validRecordsForPreview = nextRecords.filter((record) => record.validationState === 'valid');
      if (validRecordsForPreview.length === 0) {
        setPreviewLabels([]);
        setMessage('Hay registros con errores; corrige los datos antes de previsualizar.');
        return;
      }

      const previewResponse = await fetch(buildApiUrl('/api/preview'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          records: validRecordsForPreview.map((record) => ({
            ...record,
            price: Number(record.price),
            discountPrice: record.discountPrice ? Number(record.discountPrice) : null,
          })),
          template,
          codeType,
          copies,
        }),
      });
      const previewData = await readJsonResponse<{ labels: PreviewLabel[] }>(previewResponse);
      setPreviewLabels(previewData.labels ?? []);
      setPrintStatus(null);
      setMessage('Datos interpretados y vista previa generada correctamente.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'No se pudo interpretar ni generar la vista previa.');
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
        body: JSON.stringify({ labels: previewLabels, settings: printSettings }),
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

  const handleProfileChange = (nextProfileId: string) => {
    setPaperProfileId(nextProfileId);

    const nextProfile = PAPER_PROFILES.find((profile) => profile.id === nextProfileId);
    setAllowZeroMarginOnContinuous(nextProfile ? profileNeedsZeroMargins(nextProfile) : false);

    if (nextProfile?.isCustom) {
      return;
    }

    if (nextProfile) {
      setCustomPrintSettings(profileToSettings(nextProfile));
    }
  };

  const updateCustomPrintSettings = <K extends keyof PrintSettings>(field: K, value: PrintSettings[K]) => {
    setCustomPrintSettings((current) => ({
      ...current,
      [field]: value,
    }));
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
              <p>Usa un formato simple por fila: nombre, código, precio y descuento opcional. Ejemplo: Producto A, COD-001, 1200.</p>
            </div>
          </div>

          <textarea
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            rows={10}
            placeholder={'Producto A, COD-001, 1200\nProducto B, COD-002, 800, 650'}
          />

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

          <div className="config-split">
            <div className="config-card">
              <h3>Configuración de la etiqueta</h3>
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
            </div>

            <div className="config-card">
              <h3>Configuración de impresión</h3>
              <div className="controls">
                <label>
                  Perfil de papel
                  <select value={paperProfileId} onChange={(event) => handleProfileChange(event.target.value)}>
                    {PAPER_PROFILES.map((profile) => (
                      <option key={profile.id} value={profile.id}>
                        {profile.name}
                      </option>
                    ))}
                  </select>
                </label>

                {isCustomPaperProfile ? (
                  <>
                    <label>
                      Papel base
                      <select
                        value={customPrintSettings.paperType}
                        onChange={(event) =>
                          updateCustomPrintSettings('paperType', event.target.value as PaperType)
                        }
                      >
                        <option value="a4">{PAPER_TYPE_LABELS.a4}</option>
                        <option value="letter">{PAPER_TYPE_LABELS.letter}</option>
                        <option value="continuous-58">{PAPER_TYPE_LABELS['continuous-58']}</option>
                        <option value="continuous-80">{PAPER_TYPE_LABELS['continuous-80']}</option>
                        <option value="continuous-100">{PAPER_TYPE_LABELS['continuous-100']}</option>
                      </select>
                    </label>
                    <label>
                      Orientación
                      <select
                        value={customPrintSettings.orientation}
                        onChange={(event) =>
                          updateCustomPrintSettings('orientation', event.target.value as PrintOrientation)
                        }
                      >
                        <option value="portrait">Vertical</option>
                        <option value="landscape">Horizontal</option>
                      </select>
                    </label>
                    <label>
                      Columnas
                      <input
                        type="number"
                        min="1"
                        max="4"
                        value={customPrintSettings.columns}
                        onChange={(event) =>
                          updateCustomPrintSettings('columns', Number(event.target.value))
                        }
                      />
                    </label>
                    <label>
                      Margen superior (mm)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={customPrintSettings.marginTopMm}
                        onChange={(event) =>
                          updateCustomPrintSettings('marginTopMm', Number(event.target.value))
                        }
                      />
                    </label>
                    <label>
                      Margen inferior (mm)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={customPrintSettings.marginBottomMm}
                        onChange={(event) =>
                          updateCustomPrintSettings('marginBottomMm', Number(event.target.value))
                        }
                      />
                    </label>
                    <label>
                      Margen izquierdo (mm)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={customPrintSettings.marginLeftMm}
                        onChange={(event) =>
                          updateCustomPrintSettings('marginLeftMm', Number(event.target.value))
                        }
                      />
                    </label>
                    <label>
                      Margen derecho (mm)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={customPrintSettings.marginRightMm}
                        onChange={(event) =>
                          updateCustomPrintSettings('marginRightMm', Number(event.target.value))
                        }
                      />
                    </label>
                    <label>
                      Separación horizontal (mm)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={customPrintSettings.gapHorizontalMm}
                        onChange={(event) =>
                          updateCustomPrintSettings('gapHorizontalMm', Number(event.target.value))
                        }
                      />
                    </label>
                    <label>
                      Separación vertical (mm)
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={customPrintSettings.gapVerticalMm}
                        onChange={(event) =>
                          updateCustomPrintSettings('gapVerticalMm', Number(event.target.value))
                        }
                      />
                    </label>
                  </>
                ) : null}
              </div>

              {printSettings.paperType.startsWith('continuous') && (
                <label className="checkbox-row">
                  <input
                    type="checkbox"
                    checked={allowZeroMarginOnContinuous}
                    onChange={(event) => setAllowZeroMarginOnContinuous(event.target.checked)}
                  />
                  Permitir márgenes de 0mm en continuo
                </label>
              )}
            </div>
          </div>

          <div className={`record-table-wrapper ${isRecordsExpanded ? 'expanded' : 'compact'}`}>
            <div className="record-table-toolbar">
              <span>
                {records.length} registros · {validRecords.length} OK
              </span>
              <button type="button" className="secondary compact-toggle" onClick={() => setIsRecordsExpanded((expanded) => !expanded)}>
                {isRecordsExpanded ? 'Compactar' : 'Ampliar'}
              </button>
            </div>

            {records.length === 0 ? (
              <div className="empty-state">Aún no hay registros para revisar.</div>
            ) : isRecordsExpanded ? (
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
            ) : null}
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
            <button onClick={handlePreview} disabled={loading || !inputText.trim()}>
              {loading ? 'Generando...' : 'Generar vista previa'}
            </button>
            <button onClick={handlePrint} disabled={loading || previewLabels.length === 0} className="secondary">
              Preparar impresión
            </button>
          </div>
        </div>

        {printStatus && <div className="success-box">{printStatus}</div>}

        {previewLayout && (
          <p className="layout-summary">
            Layout: {previewLayout.columns} columna(s) · {previewLayout.rowsPerPage} fila(s)/página · {previewLayout.pageCount} página(s)
          </p>
        )}
        <div className="preview-pages">
          {previewPages.map((pageLabels, pageIndex) => (
            <section key={`preview-page-${pageIndex + 1}`} className="preview-page">
              <p className="preview-page-title">Página {pageIndex + 1}</p>
              <div
                className="preview-grid"
                style={
                  previewLayout
                    ? ({
                        gridTemplateColumns: `repeat(${previewLayout.columns}, minmax(0, 1fr))`,
                        columnGap: `${printSettings.gapHorizontalMm}mm`,
                        rowGap: `${printSettings.gapVerticalMm}mm`,
                        justifyItems: previewLayout.columns === 1 ? 'center' : 'start',
                      } as CSSProperties)
                    : undefined
                }
              >
                {pageLabels.map((label) => (
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
