import DashboardLayout from "../layouts/DashboardLayout";

const ProductsPage = () => {
  return (
    <DashboardLayout>
      <div>
        <h1 className="text-3xl font-bold text-white">
          Products
        </h1>

        <p className="mt-2 text-slate-400">
          Manage inventory products.
        </p>
      </div>
    </DashboardLayout>
  );
};

export default ProductsPage;