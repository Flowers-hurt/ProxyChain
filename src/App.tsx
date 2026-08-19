import Layout from "./ui/Layout";
import ImportStep from "./ui/steps/ImportStep";
import SelectStep from "./ui/steps/SelectStep";
import ResidentialStep from "./ui/steps/ResidentialStep";
import ChainStep from "./ui/steps/ChainStep";
import ExportStep from "./ui/steps/ExportStep";
import { useAppStore } from "./store";

const STEPS = [ImportStep, SelectStep, ResidentialStep, ChainStep, ExportStep];

function App() {
  const step = useAppStore((s) => s.step);
  const Step = STEPS[step - 1] ?? ImportStep;
  return (
    <Layout>
      <Step />
    </Layout>
  );
}

export default App;
