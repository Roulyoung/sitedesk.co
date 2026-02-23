import { useMemo, useState } from "react";
import styles from "./PreviewShopDemo.module.css";

type PreviewProduct = {
  id: string;
  name: string;
  image: string;
  price: string;
  category: string;
};

const normalize = (value: string) => value.trim().toLowerCase();

const PreviewShopDemo = ({ products }: { products: PreviewProduct[] }) => {
  const [query, setQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const product of products) {
      if (product.category) set.add(product.category);
    }
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const q = normalize(query);
    return products.filter((product) => {
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      if (!matchesCategory) return false;
      if (!q) return true;
      const haystack = normalize(`${product.name} ${product.category}`);
      return haystack.includes(q);
    });
  }, [products, query, activeCategory]);

  return (
    <section className={styles.demo}>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Zoek in demo-producten"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <div className={styles.categories}>
          {categories.map((category) => {
            const active = category === activeCategory;
            return (
              <button
                key={category}
                type="button"
                className={`${styles.chip} ${active ? styles.chipActive : ""}`}
                onClick={() => setActiveCategory(category)}
              >
                {category === "all" ? "Alle categorieën" : category}
              </button>
            );
          })}
        </div>
        <p className={styles.meta}>
          {filteredProducts.length} van {products.length} producten zichtbaar
        </p>
      </div>

      <div className={styles.grid}>
        {filteredProducts.map((product) => (
          <article className={styles.card} key={product.id}>
            <div className={styles.imageWrap}>
              {product.image ? <img className={styles.image} src={product.image} alt={product.name} loading="lazy" /> : null}
            </div>
            <div className={styles.body}>
              <h2 className={styles.title}>{product.name}</h2>
              <p className={styles.price}>{product.price || "Prijs op aanvraag"}</p>
              {product.category ? <p className={styles.category}>{product.category}</p> : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default PreviewShopDemo;
