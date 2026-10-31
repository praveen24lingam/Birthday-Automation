"use client";
import { useState } from "react";
import clsx from "clsx";
import { colorFor, initials } from "@/lib/utils";

export function Avatar({
  person,
  className,
  style,
}: {
  person: { id?: string; name: string; photo?: string };
  className?: string;
  style?: React.CSSProperties;
}) {
  const [imgError, setImgError] = useState(false);
  const showPhoto = Boolean(person.photo && !imgError);

  return (
    <span
      className={clsx("av", className)}
      style={{ ["--c" as string]: colorFor(person.id || person.name), ...style }}
      aria-hidden={showPhoto ? undefined : true}
    >
      {showPhoto ? (
        <img
          src={person.photo}
          alt={`Photo of ${person.name}`}
          loading="lazy"
          decoding="async"
          onError={() => setImgError(true)}
        />
      ) : (
        initials(person.name)
      )}
    </span>
  );
}
