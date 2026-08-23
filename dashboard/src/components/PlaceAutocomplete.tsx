import { useEffect, useRef, useState } from "react";
import { autocompletePlaces } from "../api";

export function PlaceAutocomplete({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  const [suggestions, setSuggestions] = useState<{ description: string; placeId: string }[]>([]);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<number | null>(null);
  const lastSelectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (value === lastSelectedRef.current || value.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = window.setTimeout(() => {
      autocompletePlaces(value)
        .then((results) => {
          setSuggestions(results);
          setOpen(true);
        })
        .catch(() => setSuggestions([]));
    }, 300);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value]);

  function selectSuggestion(description: string) {
    lastSelectedRef.current = description;
    setOpen(false);
    setSuggestions([]);
    onChange(description);
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            zIndex: 10,
            listStyle: "none",
            margin: 0,
            padding: 4,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius)",
            boxShadow: "var(--shadow)",
            maxHeight: 240,
            overflowY: "auto",
          }}
        >
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              onMouseDown={() => selectSuggestion(s.description)}
              style={{ padding: "8px 10px", borderRadius: 6, cursor: "pointer" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
