export default function ProductMedia({ product }) {
  if (product.img) return <img className="prod-photo" src={product.img} alt={product.name} draggable="false" />;
  return product.icon;
}
