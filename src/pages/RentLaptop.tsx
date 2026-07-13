import { useParams } from "react-router-dom";
import { useLaptopProducts } from "@/hooks/useLaptopProducts";

const RentLaptop = () => {
  const { id } = useParams();
  const { data: products, isLoading } = useLaptopProducts();

  if (isLoading) {
    return (
      <div className="container py-20">
        Loading...
      </div>
    );
  }

  const product = products?.find(
    (item) => String(item.id) === id
  );

  if (!product) {
    return (
      <div className="container py-20">
        Laptop tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="container py-20">
      <h1 className="text-3xl font-bold mb-6">
        {product.name}
      </h1>

      <img
        src={product.image}
        className="w-72 rounded-xl mb-6"
      />

      <h2 className="text-2xl font-bold">
        {product.price}
      </h2>
    </div>
  );
};

export default RentLaptop;