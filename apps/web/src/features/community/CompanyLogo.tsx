import { useEffect, useState } from "react";
import { getBlob, ref } from "firebase/storage";
import { officialCompanyLogo } from "./officialCompanyLogos";
import type { Company } from "../../../../../packages/contracts/src/community";
import { storage } from "../../firebase";
export default function CompanyLogo({
  path,
  name,
  company,
}: {
  path?: string;
  name: string;
  company?: Pick<Company, "id" | "name" | "source" | "sourceUrl">;
}) {
  const [url, setUrl] = useState(""),
    [failedSource, setFailedSource] = useState("");
  const source = path ? url : officialCompanyLogo(company);
  useEffect(() => {
    let live = true,
      objectUrl = "";
    setUrl("");
    if (
      path &&
      /^(companyLogos\/[a-f0-9]{40}\/[a-f0-9-]{36}|companyUploads\/[^/]{1,128}\/[a-f0-9-]{36})\/logo\.png$/.test(
        path,
      )
    )
      void getBlob(ref(storage, path), 2 * 1024 * 1024)
        .then((blob) => {
          if (!live) return;
          objectUrl = URL.createObjectURL(blob);
          setUrl(objectUrl);
        })
        .catch(() => {});
    return () => {
      live = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [path]);
  return (
    <span className="community-logo" aria-label={name}>
      {source && failedSource !== source ? (
        <img
          src={source}
          alt={name}
          decoding="async"
          onError={() => setFailedSource(source)}
        />
      ) : (
        <span aria-hidden="true">{name.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}
