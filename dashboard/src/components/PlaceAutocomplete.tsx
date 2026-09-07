import { useEffect, useRef, useState } from "react";
import { autocompletePlaces } from "../api";
import { Input } from "@/components/ui/input";

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
    <div className="relative">
      <Input
        id={id}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute top-[calc(100%+4px)] right-0 left-0 z-10 max-h-60 overflow-y-auto rounded-lg border border-border bg-card p-1 shadow-md">
          {suggestions.map((s) => (
            <li
              key={s.placeId}
              onMouseDown={() => selectSuggestion(s.description)}
              className="cursor-pointer rounded-md px-2.5 py-2 hover:bg-background"
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
