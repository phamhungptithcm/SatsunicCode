import type { Company } from "../../../../../packages/contracts/src/community";

// Vetted first-party assets; identity must match the sourced directory record.
const logos = [
  {
    id: "cdd5c8d0763308fe1b73634158fa6f89cfa16839",
    name: "FPT Software",
    sourceUrl: "https://fptsoftware.com/en/about-us/global-presence",
    url: "/company-logos/fpt-software.png",
  },
  {
    id: "01b7a8aa38dd039949fdfb241872f4635ede1d16",
    name: "CMC Global",
    sourceUrl: "https://cmcglobal.com.vn/vi/cmc-global-3/",
    url: "/company-logos/cmc-global.svg",
  },
  {
    id: "57c413b676159d23d085ac062ebefd5184c13b2f",
    name: "VNG",
    sourceUrl: "https://bctn2024.vng.com.vn/about",
    url: "/company-logos/vng.png",
  },
  {
    id: "6d0f71048fee7b32f8e41adaa7f8755b3fc9e8c3",
    name: "MISA",
    sourceUrl: "https://www.misa.vn/cong-ty/",
    url: "/company-logos/misa.svg",
  },
  {
    id: "8357b603ecd4f49cbc5f69b3f4ab635974675401",
    name: "TMA Solutions",
    sourceUrl: "https://www.tmasolutions.com/about-us",
    url: "/company-logos/tma-solutions.png",
  },
  {
    id: "8ac12a81f9e660a654a830279b3d007deee3f6a2",
    name: "NashTech",
    sourceUrl: "https://www.nashtechglobal.com/our-locations",
    url: "/company-logos/nashtech.svg",
  },
  {
    id: "6ed95f12dd1f31d7c858dac9567bc7003d0edd6d",
    name: "Viettel Solutions",
    sourceUrl: "https://solutions.viettel.vn/en/",
    url: "/company-logos/viettel-solutions.png",
  },
  {
    id: "2ac10ed0f3e26468f136b7126db2e6e7422f5393",
    name: "VNPT-IT",
    sourceUrl: "https://vnptit.vn/",
    url: "/company-logos/vnpt-it.svg",
  },
  {
    id: "b196f30457e0ca046960c02e6aa0f4767f2a2603",
    name: "MoMo",
    sourceUrl: "https://momo.careers/about?fromType=nav_menu",
    url: "/company-logos/momo.svg",
  },
] as const;
export function officialCompanyLogo(
  company?: Pick<Company, "id" | "name" | "source" | "sourceUrl">,
) {
  if (company?.source !== "OFFICIAL_DIRECTORY") return "";
  return (
    logos.find(
      (logo) =>
        logo.id === company.id &&
        logo.name === company.name &&
        logo.sourceUrl === company.sourceUrl,
    )?.url ?? ""
  );
}
