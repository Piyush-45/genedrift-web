import type { FieldSpec } from "./types";

/**
 * Renders one field from its generated spec. No section type is named
 * anywhere in here — add a 26th section to the site and this renders its form
 * with no change, because the spec is derived from the same schemas the
 * components are typed from.
 */

type Value = unknown;
type OnChange = (next: Value) => void;

function Label({ field }: { field: FieldSpec }) {
  return (
    <span className="lbl">
      {field.label}
      {field.required && <em title="Required">*</em>}
    </span>
  );
}

function TextInput({ field, value, onChange }: { field: FieldSpec; value: Value; onChange: OnChange }) {
  const str = typeof value === "string" ? value : "";
  return field.kind === "longtext" ? (
    <textarea rows={4} value={str} onChange={(e) => onChange(e.target.value)} />
  ) : (
    <input type="text" value={str} onChange={(e) => onChange(e.target.value)} />
  );
}

function SelectInput({ field, value, onChange }: { field: FieldSpec; value: Value; onChange: OnChange }) {
  const str = typeof value === "string" ? value : "";
  return (
    <select value={str} onChange={(e) => onChange(e.target.value)}>
      {!field.required && <option value="">— none —</option>}
      {(field.options ?? []).map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

function TextList({ field, value, onChange }: { field: FieldSpec; value: Value; onChange: OnChange }) {
  const rows = Array.isArray(value) ? (value as unknown[]) : [];
  const atMax = field.maxItems !== undefined && rows.length >= field.maxItems;

  return (
    <div className="list">
      {rows.map((row, i) => (
        <div className="row" key={i}>
          <input
            type="text"
            value={typeof row === "string" ? row : ""}
            onChange={(e) => {
              const next = [...rows];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button type="button" className="x" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
            Remove
          </button>
        </div>
      ))}
      {!atMax && (
        <button type="button" className="add" onClick={() => onChange([...rows, ""])}>
          + Add
        </button>
      )}
    </div>
  );
}

function GroupList({ field, value, onChange }: { field: FieldSpec; value: Value; onChange: OnChange }) {
  const rows = Array.isArray(value) ? (value as Record<string, unknown>[]) : [];
  const atMax = field.maxItems !== undefined && rows.length >= field.maxItems;
  const subFields = field.fields ?? [];

  /** A new row starts with every sub-field present, so nothing is undefined. */
  function blankRow(): Record<string, unknown> {
    const row: Record<string, unknown> = {};
    for (const sub of subFields) {
      row[sub.key] =
        sub.kind === "grouplist" || sub.kind === "textlist" ? []
        : sub.kind === "boolean" ? false
        : sub.kind === "number" ? 0
        : sub.kind === "select" ? (sub.options?.[0] ?? "")
        : "";
    }
    return row;
  }

  return (
    <div className="grouplist">
      {rows.map((row, i) => (
        <details className="group" key={i} open={rows.length <= 3}>
          <summary>
            <span className="gnum">{String(i + 1).padStart(2, "0")}</span>
            <span className="gtitle">
              {(field.titleKey && typeof row[field.titleKey] === "string" && (row[field.titleKey] as string)) ||
                "Untitled"}
            </span>
          </summary>
          <div className="gbody">
            {subFields.map((sub) => (
              <Field
                key={sub.key}
                field={sub}
                value={row[sub.key]}
                onChange={(next) => {
                  const copy = [...rows];
                  copy[i] = { ...row, [sub.key]: next };
                  onChange(copy);
                }}
              />
            ))}
            <button type="button" className="x" onClick={() => onChange(rows.filter((_, j) => j !== i))}>
              Remove this one
            </button>
          </div>
        </details>
      ))}
      {!atMax && (
        <button type="button" className="add" onClick={() => onChange([...rows, blankRow()])}>
          + Add {field.label.toLowerCase()}
        </button>
      )}
      {atMax && <p className="hint">Maximum of {field.maxItems} — remove one to add another.</p>}
    </div>
  );
}

export function Field({ field, value, onChange }: { field: FieldSpec; value: Value; onChange: OnChange }) {
  if (field.kind === "boolean") {
    return (
      <label className="field inline">
        <input type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} />
        <Label field={field} />
      </label>
    );
  }

  return (
    <label className="field">
      <Label field={field} />
      {field.kind === "select" ? (
        <SelectInput field={field} value={value} onChange={onChange} />
      ) : field.kind === "number" ? (
        <input
          type="number"
          value={typeof value === "number" ? value : ""}
          onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        />
      ) : field.kind === "textlist" ? (
        <TextList field={field} value={value} onChange={onChange} />
      ) : field.kind === "grouplist" ? (
        <GroupList field={field} value={value} onChange={onChange} />
      ) : (
        <TextInput field={field} value={value} onChange={onChange} />
      )}
      {field.help && <span className="hint">{field.help}</span>}
    </label>
  );
}
