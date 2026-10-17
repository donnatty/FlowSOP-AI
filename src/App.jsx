import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Activity, ArrowRight, Bot, Check, CheckSquare, ClipboardCheck,
  Copy, FileText, GitBranch, Layers3, ListChecks, Plus, Printer,
  Send, ShieldCheck, Sparkles, Trash2, WandSparkles, Workflow,
} from 'lucide-react';

const DEMO_CASE = {
  title: 'Onboarding de Clientes',
  department: 'Atención al cliente',
  owner: 'Coordinador/a de servicio',
  supervisor: 'Gerencia de operaciones',
  trigger: 'Cuando se confirma el pago inicial y el cliente acepta la propuesta de servicio.',
  steps: [
    'Confirmar el pago y enviar un mensaje de bienvenida con los próximos pasos.',
    'Solicitar los datos de contacto, necesidades y documentación inicial del cliente.',
    'Crear el expediente digital y registrar el servicio contratado en el sistema.',
    'Agendar la reunión de inicio y compartir el calendario de trabajo con el cliente.',
  ],
  checklist: [
    'Pago inicial confirmado y registrado',
    'Datos de contacto y necesidades recopilados',
    'Expediente digital creado con documentos',
    'Reunión de inicio agendada y confirmada',
  ],
};

const EMPTY_FORM = {
  title: '',
  department: '',
  owner: '',
  supervisor: '',
  trigger: '',
  steps: [''],
  checklist: [''],
};

const TAB_ITEMS = [
  { id: 'manual', label: 'Manual SOP', icon: FileText },
  { id: 'flow', label: 'Flujograma', icon: GitBranch },
  { id: 'agent', label: 'Agente IA', icon: Bot },
];

function makeAnswer(question, form) {
  const q = question.toLowerCase();
  const steps = form.steps.filter((item) => item.trim());
  const checklist = form.checklist.filter((item) => item.trim());
  if (q.includes('responsable') || q.includes('dueño') || q.includes('owner')) {
    return `El responsable del proceso es ${form.owner || 'aún no está definido en el formulario'}. La supervisión corresponde a ${form.supervisor || 'un supervisor por asignar'}.`;
  }
  if (q.includes('primer') || q.includes('inicio') || q.includes('paso')) {
    return steps.length
      ? `El primer paso de “${form.title || 'este proceso'}” es: ${steps[0]}`
      : 'Aún no hay pasos definidos. Añade el primer paso en el formulario para que pueda orientarte.';
  }
  if (q.includes('requisito') || q.includes('checklist') || q.includes('lista')) {
    return checklist.length
      ? `El checklist actual incluye: ${checklist.join('; ')}.`
      : 'Este proceso todavía no tiene requisitos en su checklist. Puedes agregarlos en el formulario.';
  }
  if (q.includes('activador') || q.includes('inicia') || q.includes('dispara')) {
    return `El proceso se activa cuando: ${form.trigger || 'el activador todavía no está especificado'}`;
  }
  if (q.includes('paso') || q.includes('proceso')) {
    return steps.length
      ? `“${form.title || 'El proceso'}” tiene ${steps.length} paso${steps.length === 1 ? '' : 's'}: ${steps.join(' Luego, ')}`
      : 'Añade los pasos al formulario y podré resumir el proceso completo.';
  }
  return `Puedo ayudarte con “${form.title || 'el proceso actual'}”. Su área es ${form.department || 'por definir'} y se activa cuando ${form.trigger || 'se registre el activador'}. Pregúntame por el responsable, los pasos o el checklist.`;
}

function StepEditor({ steps, onChange }) {
  const setStep = (index, value) => onChange(steps.map((step, i) => i === index ? value : step));
  const removeStep = (index) => onChange(steps.filter((_, i) => i !== index));
  return (
    <div className="step-list">
      {steps.map((step, index) => (
        <div className="step-row" key={`step-${index}`}>
          <span className="step-number" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
          <textarea
            aria-label={`Paso ${index + 1}`}
            data-testid={`input-step-${index + 1}`}
            rows="2"
            placeholder={`Describe el paso ${index + 1}...`}
            value={step}
            onChange={(event) => setStep(index, event.target.value)}
          />
          <button
            type="button"
            className="icon-button"
            aria-label={`Eliminar paso ${index + 1}`}
            data-testid={`button-remove-step-${index + 1}`}
            onClick={() => removeStep(index)}
            disabled={steps.length === 1}
            title={steps.length === 1 ? 'Debe quedar al menos un paso' : 'Eliminar paso'}
          ><Trash2 size={15} /></button>
        </div>
      ))}
      <button type="button" className="add-link" data-testid="button-add-step" onClick={() => onChange([...steps, ''])}>
        <Plus size={14} /> Añadir paso
      </button>
    </div>
  );
}

function ChecklistEditor({ items, onChange }) {
  const updateItem = (index, value) => onChange(items.map((item, i) => i === index ? value : item));
  return (
    <div className="checklist-items">
      {items.map((item, index) => (
        <div className="checklist-row" key={`check-${index}`}>
          <input className="checklist-box" type="checkbox" aria-label={`Marcar requisito ${index + 1}`} data-testid={`checkbox-checklist-${index + 1}`} />
          <input
            className="list-input"
            aria-label={`Requisito ${index + 1}`}
            data-testid={`input-checklist-${index + 1}`}
            placeholder={`Requisito ${index + 1}`}
            value={item}
            onChange={(event) => updateItem(index, event.target.value)}
          />
          <button
            type="button"
            className="icon-button"
            aria-label={`Eliminar requisito ${index + 1}`}
            data-testid={`button-remove-checklist-${index + 1}`}
            onClick={() => onChange(items.filter((_, i) => i !== index))}
            disabled={items.length === 1}
          ><Trash2 size={14} /></button>
        </div>
      ))}
      <button type="button" className="add-link" data-testid="button-add-checklist" onClick={() => onChange([...items, ''])}>
        <Plus size={14} /> Añadir requisito
      </button>
    </div>
  );
}

function ProcessForm({ form, setForm, onGenerate }) {
  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const completedCount = [form.title, form.department, form.owner, form.trigger].filter((item) => item.trim()).length;
  return (
    <section className="panel builder-panel" aria-labelledby="builder-title">
      <div className="panel-heading">
        <div className="panel-title">
          <span className="section-icon"><Workflow size={17} /></span>
          <div>
            <h2 id="builder-title">Diseña tu proceso</h2>
            <p>Convierte el cómo se hace en cómo se debe hacer.</p>
          </div>
        </div>
        <span className="mini-count" data-testid="text-form-progress">{completedCount}/4 datos</span>
      </div>
      <form className="form-body" onSubmit={(event) => { event.preventDefault(); onGenerate(); }}>
        <div className="form-grid">
          <div className="field field-wide">
            <label htmlFor="process-title">Nombre del proceso</label>
            <input id="process-title" data-testid="input-process-title" value={form.title} onChange={(e) => setField('title', e.target.value)} placeholder="Ej. Onboarding de Clientes" required />
          </div>
          <div className="field">
            <label htmlFor="process-department">Departamento / área</label>
            <input id="process-department" data-testid="input-department" value={form.department} onChange={(e) => setField('department', e.target.value)} placeholder="Ej. Atención al cliente" />
          </div>
          <div className="field">
            <label htmlFor="process-owner">Responsable del proceso</label>
            <input id="process-owner" data-testid="input-owner" value={form.owner} onChange={(e) => setField('owner', e.target.value)} placeholder="Nombre o cargo" />
          </div>
          <div className="field field-wide">
            <label htmlFor="process-supervisor">Supervisor / aprobador</label>
            <input id="process-supervisor" data-testid="input-supervisor" value={form.supervisor} onChange={(e) => setField('supervisor', e.target.value)} placeholder="Nombre o cargo" />
          </div>
          <div className="field field-wide">
            <label htmlFor="process-trigger">¿Qué activa este proceso?</label>
            <textarea id="process-trigger" data-testid="input-trigger" value={form.trigger} onChange={(e) => setField('trigger', e.target.value)} placeholder="Describe el evento o condición que da inicio..." rows="2" />
          </div>
        </div>
        <div className="section-divider">
          <span className="subsection-label"><Activity size={14} /> Pasos del proceso</span>
          <span className="mini-count">{form.steps.filter((item) => item.trim()).length} pasos</span>
        </div>
        <StepEditor steps={form.steps} onChange={(steps) => setField('steps', steps)} />
        <div className="section-divider">
          <span className="subsection-label"><ListChecks size={14} /> Checklist de requisitos</span>
          <span className="mini-count">{form.checklist.filter((item) => item.trim()).length} requisitos</span>
        </div>
        <ChecklistEditor items={form.checklist} onChange={(checklist) => setField('checklist', checklist)} />
        <button type="submit" className="button button-primary generate-button" data-testid="button-generate">
          <WandSparkles size={16} /> Generar Manual, Flujograma y Activar Agente
        </button>
        <p className="form-note"><ShieldCheck size={12} /> Tus procesos se quedan en esta sesión de trabajo.</p>
      </form>
    </section>
  );
}

function ManualDocument({ form }) {
  const steps = form.steps.filter((item) => item.trim());
  const checklist = form.checklist.filter((item) => item.trim());
  return (
    <article className="print-document" data-testid="document-sop">
      <div className="doc-actions">
        <button type="button" className="button button-secondary" data-testid="button-print-sop" onClick={() => window.print()}>
          <Printer size={15} /> Imprimir manual
        </button>
      </div>
      <header className="document-head">
        <div className="doc-kicker">Procedimiento operativo estándar</div>
        <h2 data-testid="text-sop-title">{form.title || 'Proceso sin título'}</h2>
        <p>Documento guía para ejecutar el proceso de forma clara, consistente y verificable.</p>
      </header>
      <div className="meta-grid" data-testid="section-sop-metadata">
        <div className="meta-item"><span>Código</span><strong>FS-{(form.title || 'PROCESO').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/gi, '').slice(0, 5).toUpperCase() || 'PROC'}-001</strong></div>
        <div className="meta-item"><span>Versión</span><strong>1.0 · Inicial</strong></div>
        <div className="meta-item"><span>Departamento</span><strong>{form.department || 'Por definir'}</strong></div>
        <div className="meta-item"><span>Responsable</span><strong>{form.owner || 'Por asignar'}</strong></div>
        <div className="meta-item"><span>Supervisor</span><strong>{form.supervisor || 'Por asignar'}</strong></div>
        <div className="meta-item"><span>Vigencia</span><strong>Desde su aprobación</strong></div>
      </div>
      <section className="doc-section">
        <h3><span>01</span> Propósito y activador</h3>
        <p style={{ margin: '0', color: '#5a4e60', fontSize: '11px', lineHeight: 1.65 }}>
          Este procedimiento orienta la ejecución de <strong>{form.title || 'este proceso'}</strong>. Se inicia cuando {form.trigger || 'se presenta la condición de inicio definida por el equipo'}.
        </p>
      </section>
      <section className="doc-section">
        <h3><span>02</span> Secuencia de trabajo</h3>
        {steps.length
          ? <ol className="doc-steps">{steps.map((step, index) => <li key={`${index}-${step}`} data-testid={`text-sop-step-${index + 1}`}><p>{step}</p></li>)}</ol>
          : <p style={{ color: '#82768a', fontSize: 11 }}>Añade pasos al proceso para documentar la secuencia de trabajo.</p>}
      </section>
      <section className="doc-section">
        <h3><span>03</span> Checklist de verificación</h3>
        {checklist.length
          ? <ul className="doc-checklist">{checklist.map((item, index) => <li key={`${index}-${item}`} data-testid={`text-sop-check-${index + 1}`}><CheckSquare size={14} /> {item}</li>)}</ul>
          : <p style={{ color: '#82768a', fontSize: 11 }}>No se han definido requisitos para este proceso.</p>}
      </section>
      <div className="doc-footer"><span>FlowSOP AI · Documento operativo</span><span>Uso interno · Revise antes de aplicar</span></div>
    </article>
  );
}

function makeMermaid(form) {
  const steps = form.steps.filter((item) => item.trim());
  const safe = (text) => text.replace(/"/g, "'").replace(/[\r\n]+/g, ' ').slice(0, 90);
  const lines = ['flowchart TD', '  A(["Inicio"])'];
  steps.forEach((step, index) => {
    const id = `S${index + 1}`;
    lines.push(`  ${id}["${safe(step)}"]`);
    lines.push(`  ${index === 0 ? 'A' : `S${index}`} --> ${id}`);
  });
  lines.push(`  Z(["${safe(form.title || 'Proceso completado')}"])`);
  lines.push(`  ${steps.length ? `S${steps.length}` : 'A'} --> Z`);
  lines.push('  classDef start fill:#f3e8ff,stroke:#8b38a5,color:#4c1d63,stroke-width:1.5px');
  lines.push('  classDef step fill:#ffffff,stroke:#c9a8d8,color:#493451,stroke-width:1.2px');
  lines.push('  classDef finish fill:#fce7f3,stroke:#be185d,color:#701d45,stroke-width:1.5px');
  lines.push('  class A start');
  if (steps.length) lines.push(`  class ${steps.map((_, index) => `S${index + 1}`).join(',')} step`);
  lines.push('  class Z finish');
  return lines.join('\n');
}

function FlowDiagram({ form }) {
  const diagramRef = useRef(null);
  const renderId = useRef(0);
  const [renderError, setRenderError] = useState('');
  const code = useMemo(() => makeMermaid(form), [form]);
  useEffect(() => {
    let active = true;
    const target = diagramRef.current;
    if (!target) return undefined;
    setRenderError('');
    target.innerHTML = '<div class="skeleton-diagram" aria-label="Generando flujograma"></div>';
    const id = `flowsop-diagram-${++renderId.current}`;
    const renderDiagram = async () => {
      try {
        const { default: mermaid } = await import('mermaid');
        if (!active) return;
        mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'base', themeVariables: { fontFamily: 'DM Sans, sans-serif', primaryColor: '#ffffff', primaryTextColor: '#493451', primaryBorderColor: '#c9a8d8', lineColor: '#9c66ad', secondaryColor: '#f3e8ff', tertiaryColor: '#fce7f3' } });
        const { svg } = await mermaid.render(id, code);
        if (active && target) target.innerHTML = svg;
      } catch {
        if (active) setRenderError('No se pudo dibujar el flujograma. Puedes copiar el código para revisarlo.');
      }
    };
    void renderDiagram();
    return () => { active = false; };
  }, [code]);
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      textarea.remove();
    }
  };
  return (
    <section aria-label="Flujograma del proceso">
      <div className="diagram-wrap" ref={diagramRef} data-testid="diagram-rendered" aria-live="polite" />
      {renderError && <p role="status" data-testid="status-diagram-error" style={{ color: '#a52d4d', fontSize: 11 }}>{renderError}</p>}
      <div className="code-box">
        <div className="code-box-top"><span>CÓDIGO MERMAID</span><CopyButton onClick={copyCode} label="Copiar código" testId="button-copy-mermaid" /></div>
        <pre data-testid="text-mermaid-code">{code}</pre>
      </div>
    </section>
  );
}

function CopyButton({ onClick, label, testId }) {
  const [copied, setCopied] = useState(false);
  const handleClick = async () => {
    await onClick();
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };
  return <button type="button" className="button button-quiet" onClick={handleClick} data-testid={testId} style={{ minHeight: 28, padding: '0 9px', fontSize: 10 }}>
    {copied ? <Check size={13} /> : <Copy size={13} />}{copied ? 'Copiado' : label}
  </button>;
}

const SUGGESTED_QUESTIONS = [
  '¿Quién es el responsable?',
  '¿Cuál es el primer paso?',
  '¿Qué requisitos tiene el checklist?',
];

function ContextualAgent({ form }) {
  const [messages, setMessages] = useState([]);
  const [question, setQuestion] = useState('');
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }); }, [messages]);
  const ask = (text) => {
    const clean = text.trim();
    if (!clean) return;
    setMessages((current) => [...current, { role: 'user', text: clean }, { role: 'assistant', text: makeAnswer(clean, form) }]);
    setQuestion('');
  };
  return (
    <section className="chat-panel" aria-label="Asistente contextual">
      <div className="chat-intro">
        <span className="agent-avatar"><Bot size={18} /></span>
        <div><strong>Agente de procesos activo</strong><p>Respuestas basadas en el proceso que estás editando. No invento pasos ni responsables.</p></div>
      </div>
      <div className="chat-messages" aria-live="polite" data-testid="chat-messages">
        <div className="message assistant" data-testid="message-agent-welcome">
          Hola. Ya tengo el contexto de <strong>{form.title || 'tu proceso'}</strong>. Pregúntame cómo ejecutarlo o usa una sugerencia.
        </div>
        {messages.map((message, index) => <div className={`message ${message.role}`} key={`${index}-${message.role}`} data-testid={`message-${message.role}-${index}`}>{message.text}</div>)}
        <div ref={bottomRef} />
      </div>
      <div className="suggestions" aria-label="Preguntas sugeridas">
        {SUGGESTED_QUESTIONS.map((text) => <button type="button" className="suggestion-chip" key={text} data-testid={`button-suggestion-${SUGGESTED_QUESTIONS.indexOf(text) + 1}`} onClick={() => ask(text)}>{text}</button>)}
      </div>
      <form className="chat-form" onSubmit={(event) => { event.preventDefault(); ask(question); }}>
        <label className="sr-only" htmlFor="agent-question">Escribe una pregunta sobre el proceso</label>
        <input id="agent-question" data-testid="input-agent-question" value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Pregunta sobre este proceso..." />
        <button type="submit" className="button button-primary" data-testid="button-send-question" aria-label="Enviar pregunta"><Send size={16} /></button>
      </form>
    </section>
  );
}

function Deliverables({ form, generated }) {
  const [tab, setTab] = useState('manual');
  const current = TAB_ITEMS.find((item) => item.id === tab);
  return (
    <section className="panel deliverable-panel" aria-labelledby="deliverables-title">
      <div className="deliverable-top">
        <div className="deliverable-label">
          <h2 id="deliverables-title">Tu espacio de trabajo</h2>
          <span className="ready-pill" data-testid="status-deliverables"><span className="ready-dot" />{generated ? 'Entregables listos' : 'Vista previa'}</span>
        </div>
        <div className="tabs" role="tablist" aria-label="Entregables del proceso">
          {TAB_ITEMS.map(({ id, label, icon: Icon }) => (
            <button type="button" role="tab" id={`tab-${id}`} aria-controls={`tabpanel-${id}`} aria-selected={tab === id} className="tab-button" key={id} data-testid={`tab-${id}`} onClick={() => setTab(id)}>
              <Icon size={15} />{label}
            </button>
          ))}
        </div>
      </div>
      <div className="tab-content" role="tabpanel" id={`tabpanel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {!generated ? (
          <div className="empty-state" data-testid="empty-deliverables">
            <div className="empty-illustration"><Layers3 size={28} /></div>
            <h3>De lo informal a lo claro.</h3>
            <p>Completa el proceso o carga el caso de demostración. Generaremos un manual listo para imprimir, un flujograma y un agente contextual.</p>
            <span className="ready-pill"><Sparkles size={12} /> Tres herramientas, un solo proceso</span>
          </div>
        ) : tab === 'manual' ? (
          <ManualDocument form={form} />
        ) : tab === 'flow' ? (
          <FlowDiagram form={form} />
        ) : (
          <ContextualAgent key={form.title} form={form} />
        )}
        {generated && current && <span className="sr-only" data-testid="text-active-deliverable">Entregable activo: {current.label}</span>}
      </div>
    </section>
  );
}

export default function App() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [generated, setGenerated] = useState(false);
  const loadDemo = () => {
    setForm({ ...DEMO_CASE, steps: [...DEMO_CASE.steps], checklist: [...DEMO_CASE.checklist] });
    setGenerated(true);
  };
  const generate = () => setGenerated(true);
  return (
    <main className="app-shell">
      <header className="topbar">
        <div className="topbar-inner">
          <div className="brand-lockup">
            <span className="brand-mark"><Layers3 size={21} /></span>
            <div><div className="brand-name">FlowSOP AI</div><div className="brand-sub">Tu operación, en claro.</div></div>
          </div>
          <div className="identity-badge">PMV Operativo | Donnatty Durán</div>
          <div className="top-actions">
            <button type="button" className="button button-secondary" data-testid="button-load-demo" onClick={loadDemo}>
              <Sparkles size={15} /><span>Cargar Caso Demo (1-Click)</span>
            </button>
          </div>
        </div>
      </header>
      <div className="page-wrap">
        <div className="page-heading">
          <div>
            <div className="eyebrow"><ClipboardCheck size={13} /> Estándares de trabajo, a tu alcance</div>
            <h1>Ordena lo que ya sabes hacer.</h1>
            <p>Documenta el proceso una vez. Dáselo claro a todo tu equipo.</p>
          </div>
        </div>
        <div className="workspace">
          <ProcessForm form={form} setForm={setForm} onGenerate={generate} />
          <Deliverables form={form} generated={generated} />
        </div>
      </div>
      <footer className="footer">
        <span>Solución de optimización y gobernanza de procesos diseñada por Donnatty Durán | Reto Migrantes Libres</span>
        <span aria-hidden="true">·</span>
            <a href="mailto:donnattyd@gmail.com" data-testid="link-contact">donnattyd@gmail.com <ArrowRight size={11} /></a>
      </footer>
    </main>
  );
}
