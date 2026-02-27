import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Layout } from "./components/Layout";
import { HomePage } from "./features/home/HomePage";
import { DesignerPage } from "./features/designer/DesignerPage";
import { ShopPage } from "./features/shop/ShopPage";
import { ModelistPage } from "./features/modelist/ModelistPage";
import { MeasurementsPage } from "./features/measurements/MeasurementsPage";
import { SewingPage } from "./features/sewing/SewingPage";
import { HelpPage } from "./features/help/HelpPage";

export function App() {
  return (
    <ThemeProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/designer" element={<DesignerPage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/modelist/:garmentType" element={<ModelistPage />} />
          <Route path="/measurements" element={<MeasurementsPage />} />
          <Route path="/sewing" element={<SewingPage />} />
          <Route path="/help" element={<HelpPage />} />
        </Routes>
      </Layout>
    </ThemeProvider>
  );
}
