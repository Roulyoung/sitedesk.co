export type BlogPost = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  tags: string[];
};

export const blogPosts: BlogPost[] = [
  {
    title: "Waarom een laadtijd van 0ms geen luxe is, maar pure noodzaak",
    slug: "waarom-0ms-geen-luxe-is",
    excerpt: "Elke seconde vertraging kost directe omzet. Ontdek waarom de Edge-architectuur dit definitief oplost.",
    date: "2026-02-10",
    tags: ["Performance", "Edge", "CRO"],
  },
];

export const PAGE_SIZE = 6;

export const paginate = (items: BlogPost[], page: number, perPage: number) => {
  const start = (page - 1) * perPage;
  return items.slice(start, start + perPage);
};
