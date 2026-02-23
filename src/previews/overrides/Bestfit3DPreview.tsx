import styles from "./Bestfit3DPreview.module.css";

type PreviewProduct = {
  id: string;
  name: string;
  image: string;
  price: string;
  category: string;
};

const Bestfit3DPreview = ({
  clientSlug,
  products,
}: {
  clientSlug: string;
  products: PreviewProduct[];
}) => (
  <section className={styles.panel}>
    <div className={styles.header}>
      <h2 className={styles.title}>Bestfit 3D Configurator Preview</h2>
      <span className={styles.badge}>client: {clientSlug}</span>
    </div>

    <div className={styles.canvasMock}>3D VIEWPORT PLACEHOLDER</div>

    <div className={styles.controls}>
      <div className={styles.control}>Model: {products[0]?.name || "No model loaded"}</div>
      <div className={styles.control}>Materials: 6 presets</div>
      <div className={styles.control}>Camera slots: 4</div>
      <div className={styles.control}>SKU source: Google Sheets Products</div>
    </div>
  </section>
);

export default Bestfit3DPreview;
