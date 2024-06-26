import Header from "./dashboard/_components/Header";
import Hero from "./dashboard/_components/Hero";


export default function Home() {
  return (
    <div className="bg-slate-900 h-full text-white">
      <Header></Header>
      <Hero />
    </div>
  );
}
