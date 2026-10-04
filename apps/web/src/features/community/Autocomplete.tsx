import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { useLanguage, text } from "../../i18n";
import Icon from "./Icon";
type Option = { value: string; label: string };
const searchable = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/đ/gi, "d")
    .toLocaleLowerCase()
    .trim();
/** Suggestions only use caller-provided published data or the existing taxonomy. */
export default function Autocomplete({
  label,
  value,
  options,
  onChange,
  allowCustom = false,
  disabled = false,
  required = false,
  maxLength = 100,
  wide = false,
  onSelect,
  onCreate,
  placeholder,
  hideLabel = false,
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
  allowCustom?: boolean;
  disabled?: boolean;
  required?: boolean;
  maxLength?: number;
  wide?: boolean;
  onSelect?: (value: string) => void;
  onCreate?: (name: string) => void;
  placeholder?: string;
  hideLabel?: boolean;
}) {
  const { t } = useLanguage(),
    id = useId(),
    inputRef = useRef<HTMLInputElement>(null);
  const selected = options.find((o) => o.value === value)?.label ?? value;
  const [query, setQuery] = useState(selected),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1),
    [placement, setPlacement] = useState({ above: false, height: 180 });
  useEffect(() => {
    setQuery(selected);
  }, [selected]);
  const found = options
    .filter((o) => searchable(o.label).includes(searchable(query)))
    .slice(0, 8);
  const canCreate =
    !!onCreate &&
    query.trim().length >= 2 &&
    found.length === 0 &&
    !options.some((o) => searchable(o.label) === searchable(query));
  const createOption = {
    value: "__create__",
    label: t(
      text(`Tạo công ty “${query.trim()}”`, `Create company “${query.trim()}”`),
    ),
  };
  const matches = canCreate ? [...found, createOption] : found;
  const expanded = open && !disabled && matches.length > 0;
  useLayoutEffect(() => {
    if (!open || disabled) return;
    function position() {
      const input = inputRef.current;
      if (!input) return;
      const rect = input.getBoundingClientRect(),
        dialog = input.closest("dialog");
      const head = dialog
        ?.querySelector(".community-dialog-head")
        ?.getBoundingClientRect();
      const footer = dialog
        ?.querySelector(".community-form-footer")
        ?.getBoundingClientRect();
      const lower = Math.min(innerHeight - 12, footer?.top ?? innerHeight - 12);
      const upper = Math.max(12, head?.bottom ?? 12);
      const below = lower - rect.bottom - 6,
        above = rect.top - upper - 6;
      const up = below < 180 && above > below;
      setPlacement({
        above: up,
        height: Math.max(44, Math.min(180, up ? above : below)),
      });
    }
    position();
    window.addEventListener("resize", position);
    window.addEventListener("scroll", position, true);
    return () => {
      window.removeEventListener("resize", position);
      window.removeEventListener("scroll", position, true);
    };
  }, [open, disabled, matches.length]);
  useEffect(() => {
    if (expanded && active >= 0)
      document
        .getElementById(`${id}-option-${active}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [expanded, active, id]);
  function choose(option: Option) {
    if (inputRef.current?.matches(":disabled")) return;
    if (option === createOption) {
      setOpen(false);
      setActive(-1);
      onCreate?.(query.trim());
      return;
    }
    onChange(option.value);
    onSelect?.(option.value);
    setQuery(option.label);
    setOpen(false);
    setActive(-1);
  }
  return (
    <div className={`community-field${wide ? " wide" : ""}`}>
      <label htmlFor={id} className={hideLabel ? "sr-only" : undefined}>
        {label}
      </label>
      <div className="community-combobox">
        <input
          ref={inputRef}
          id={id}
          role="combobox"
          placeholder={placeholder}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={expanded}
          aria-controls={expanded ? id + "-list" : undefined}
          aria-activedescendant={
            expanded && active >= 0 && matches[active]
              ? `${id}-option-${active}`
              : undefined
          }
          required={required}
          disabled={disabled}
          maxLength={maxLength}
          value={query}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setOpen(false);
            setActive(-1);
            if (!allowCustom) setQuery(selected);
          }}
          onChange={(e) => {
            setQuery(e.target.value);
            setActive(-1);
            setOpen(true);
            if (allowCustom) onChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.nativeEvent.isComposing) return;
            if (e.key === "ArrowDown" || e.key === "ArrowUp") {
              e.preventDefault();
              setOpen(true);
              setActive((i) =>
                Math.max(
                  0,
                  Math.min(
                    matches.length - 1,
                    i + (e.key === "ArrowDown" ? 1 : -1),
                  ),
                ),
              );
            } else if (
              e.key === "Enter" &&
              expanded &&
              active >= 0 &&
              matches[active]
            ) {
              e.preventDefault();
              choose(matches[active]!);
            } else if (e.key === "Escape" && open) {
              e.preventDefault();
              e.stopPropagation();
              setOpen(false);
              setActive(-1);
            }
          }}
        />
        <span className="community-combobox-icon">
          <Icon name="search" />
        </span>
        {open && !disabled && (
          <div
            className={`community-options${placement.above ? " above" : ""}`}
            style={{ maxHeight: placement.height }}
            id={id + "-list"}
            role={matches.length ? "listbox" : "status"}
            aria-label={label}
          >
            {matches.map((option, index) => (
              <div
                id={`${id}-option-${index}`}
                key={option.value}
                role="option"
                aria-selected={index === active}
                onMouseDown={(e) => e.preventDefault()}
                onMouseMove={() => setActive(index)}
                onClick={() => choose(option)}
              >
                {option.label}
              </div>
            ))}
            {!matches.length && (
              <p>
                {allowCustom
                  ? t(
                      text(
                        "Không có gợi ý. Bạn có thể nhập mới.",
                        "No suggestions. You can enter a new value.",
                      ),
                    )
                  : t(
                      text(
                        "Không tìm thấy trong danh sách đã tải.",
                        "No match in the loaded list.",
                      ),
                    )}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
