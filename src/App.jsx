import FirstScene from "./scenes/FirstScene";
import SecondScene from "./scenes/SecondScene";
import GlobalNoise from "./components/GlobalNoise";
import ThirdScene from "./scenes/ThirdScene";

const App = () => {
  return (
    <main className="w-full bg-[#0f0f10]">
      <GlobalNoise />

      {/* Scroll height — first 1900px drives FirstScene, ~1600-2300px is the burn transition */}
      <div style={{ height: "5700px" }} >

      <FirstScene />
      <SecondScene />
      <ThirdScene/>
</div>
      
    </main>
  );
};

export default App;