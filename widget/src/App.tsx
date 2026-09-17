import { useEffect, useMemo, useState } from "react";
import { Field } from "./FieldEditor";
import {
  describeError,
  initCreator,
  loadPages,
  loadSections,
  publishPage,
  savePageMeta,
  saveSectionData,
} from "./creator";
import spec from "./section-fields.json";
import type { FieldSpecFile, PageRecord, SectionRecord } from "./types";

const FIELDS = spec as FieldSpecFile;

type Notice = { tone: "ok" | "bad"; text: string } | null;

export default function App() {
  const [loading, setLoading] = useState(true);
  const [fatal, setFatal] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice>(null);

  const [pages, setPages] = useState<PageRecord[]>([]);
  const [sections, setSections] = useState<SectionRecord[]>([]);

  const [pageId, setPageId] = useState<string | null>(null);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  /** Unsaved edits, keyed by section id. Absent = untouched. */
  const [drafts, setDrafts] = useState<Record<string, Record<string, unknown>>>({});
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await initCreator();
        const [p, s] = await Promise.all([loadPages(), loadSections()]);
        setPages(p);
        setSections(s);
        setPageId(p[0]?.id ?? null);
      } catch (error) {
        setFatal(describeError(error));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const page = useMemo(() => pages.find((p) => p.id === pageId) ?? null, [pages, pageId]);

  const pageSections = useMemo(
    () => sections.filter((s) => s.pageId === pageId).sort((a, b) => a.displayOrder - b.displayOrder),
    [sections, pageId],
  );

  const dirtyCount = Object.keys(drafts).length;

  function valueOf(section: SectionRecord): Record<string, unknown> {
    return drafts[section.id] ?? section.data;
  }

  function edit(section: SectionRecord, key: string, next: unknown) {
    setDrafts((current) => ({
      ...current,
      [section.id]: { ...valueOf(section), [key]: next },
    }));
  }

  async function saveAll() {
    setBusy(true);
    setNotice(null);
    try {
      for (const [id, data] of Object.entries(drafts)) {
        await saveSectionData(id, data);
      }
      setSections((current) =>
        current.map((s) => (drafts[s.id] ? { ...s, data: drafts[s.id]! } : s)),
      );
      setDrafts({});
      setNotice({ tone: "ok", text: "Saved. Not live yet — press Publish." });
    } catch (error) {
      setNotice({ tone: "bad", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    if (!page) return;
    setBusy(true);
    setNotice(null);
    try {
      // Save first, always. Publishing what is on screen while Creator still
      // holds the old text is the single most confusing thing a CMS can do.
      if (dirtyCount > 0) {
        for (const [id, data] of Object.entries(drafts)) await saveSectionData(id, data);
        setSections((current) =>
          current.map((s) => (drafts[s.id] ? { ...s, data: drafts[s.id]! } : s)),
        );
        setDrafts({});
      }
      const { sectionCount } = await publishPage(page.id);
      setNotice({ tone: "ok", text: `Published. ${sectionCount} sections are live.` });
      setPages((current) =>
        current.map((p) => (p.id === page.id ? { ...p, status: "Published" } : p)),
      );
    } catch (error) {
      setNotice({ tone: "bad", text: describeError(error) });
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <div className="boot">Loading the workspace…</div>;
  if (fatal) return <div className="boot bad">{fatal}</div>;

  if (pages.length === 0) {
    return (
      <div className="boot">
        No pages yet. Add a row to <code>Website_Pages</code> to get started.
      </div>
    );
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <h1>Website</h1>
        <ul className="pagelist">
          {pages.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                className={p.id === pageId ? "on" : ""}
                onClick={() => {
                  setPageId(p.id);
                  setOpenSectionId(null);
                  setNotice(null);
                }}
              >
                <span className="ptitle">{p.internalTitle || p.path}</span>
                <span className="ppath">{p.path}</span>
                <span className={`pstatus s-${p.status.toLowerCase()}`}>{p.status}</span>
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="main">
        {page && (
          <>
            <header className="head">
              <div>
                <h2>{page.internalTitle || page.path}</h2>
                <p className="path">{page.path}</p>
              </div>
              <div className="actions">
                {dirtyCount > 0 && <span className="dirty">{dirtyCount} unsaved</span>}
                <button type="button" onClick={saveAll} disabled={busy || dirtyCount === 0}>
                  Save
                </button>
                <button type="button" className="primary" onClick={publish} disabled={busy}>
                  {busy ? "Working…" : "Publish"}
                </button>
              </div>
            </header>

            {notice && <p className={`notice ${notice.tone}`}>{notice.text}</p>}

            {pageSections.length === 0 && (
              <p className="empty">
                This page has no sections yet. Add rows to <code>Website_Sections</code> with this
                page selected.
              </p>
            )}

            <ol className="sections">
              {pageSections.map((section) => {
                const known = FIELDS.sections[section.sectionType];
                const open = openSectionId === section.id;
                const value = valueOf(section);

                return (
                  <li key={section.id} className={open ? "sec open" : "sec"}>
                    <button
                      type="button"
                      className="sechead"
                      onClick={() => setOpenSectionId(open ? null : section.id)}
                    >
                      <span className="secname">{known?.label ?? section.sectionType}</span>
                      {section.isRequired && <span className="lock" title="Required on this page">required</span>}
                      {section.hidden && <span className="hiddenflag">hidden</span>}
                      {drafts[section.id] && <span className="dot" title="Unsaved changes" />}
                      <span className="chev">{open ? "−" : "+"}</span>
                    </button>

                    {open && (
                      <div className="secbody">
                        {section.parseError ? (
                          // Never overwrite content we could not read.
                          <p className="notice bad">
                            {section.parseError} This section is read-only here until someone fixes
                            the record. Nothing you do on this screen will overwrite it.
                          </p>
                        ) : !known ? (
                          <p className="notice bad">
                            <code>{section.sectionType}</code> is not a section this site can
                            render. Check the spelling against the Section_Type list.
                          </p>
                        ) : (
                          known.fields.map((field) => (
                            <Field
                              key={field.key}
                              field={field}
                              value={value[field.key]}
                              onChange={(next) => edit(section, field.key, next)}
                            />
                          ))
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>

            <details className="seo">
              <summary>Search engine settings</summary>
              <PageMeta
                page={page}
                onSaved={(updated) => {
                  setPages((current) => current.map((p) => (p.id === updated.id ? updated : p)));
                  setNotice({ tone: "ok", text: "Saved. Not live yet — press Publish." });
                }}
                onError={(message) => setNotice({ tone: "bad", text: message })}
              />
            </details>
          </>
        )}
      </main>
    </div>
  );
}

function PageMeta({
  page,
  onSaved,
  onError,
}: {
  page: PageRecord;
  onSaved: (page: PageRecord) => void;
  onError: (message: string) => void;
}) {
  const [title, setTitle] = useState(page.seoTitle);
  const [description, setDescription] = useState(page.seoDescription);
  const [internal, setInternal] = useState(page.internalTitle);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(page.seoTitle);
    setDescription(page.seoDescription);
    setInternal(page.internalTitle);
  }, [page]);

  return (
    <div className="metabody">
      <label className="field">
        <span className="lbl">Page name (internal only)</span>
        <input type="text" value={internal} onChange={(e) => setInternal(e.target.value)} />
      </label>
      <label className="field">
        <span className="lbl">Title shown in Google</span>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
      </label>
      <label className="field">
        <span className="lbl">Description shown in Google</span>
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </label>
      <button
        type="button"
        disabled={saving}
        onClick={async () => {
          setSaving(true);
          try {
            await savePageMeta(page.id, {
              internalTitle: internal,
              seoTitle: title,
              seoDescription: description,
            });
            onSaved({ ...page, internalTitle: internal, seoTitle: title, seoDescription: description });
          } catch (error) {
            onError(describeError(error));
          } finally {
            setSaving(false);
          }
        }}
      >
        Save settings
      </button>
    </div>
  );
}
