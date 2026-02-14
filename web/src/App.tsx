import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import PatternPage from "./pages/PatternPage";

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/pattern/:type" element={<PatternPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
