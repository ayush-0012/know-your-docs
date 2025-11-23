import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRight,
  MessageSquare,
  ShieldCheck,
  Upload,
  Zap,
} from "lucide-react";
import Link from "next/link";

const Index = () => {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-purple-900/50">
      {/* Background - Minimal Static Noise/Dots */}
      <div className="fixed inset-0 z-0 opacity-20 bg-[radial-gradient(#404040_1px,transparent_1px)] [background-size:20px_20px]"></div>

      {/* Navbar */}
      <nav className="relative z-50 container mx-auto px-6 py-8 flex justify-between items-center border-b border-white/5">
        <div className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <div className="w-3 h-3 bg-purple-600"></div>
          KnowYourDocs
        </div>
        <div className="flex gap-6 items-center">
          {/* <Link
            href="/auth"
            className="text-sm font-medium text-neutral-400 hover:text-white transition-colors"
          >
            Login
          </Link> */}
          <Link href="/auth">
            <Button
              size="sm"
              className="bg-white text-black hover:bg-neutral-200 font-medium rounded-none h-9 px-6"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 pt-24 pb-16 container mx-auto px-4 text-center">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-white mb-6">
          Your documents, <span className="text-purple-500">understood.</span>
        </h1>
        <p className="text-lg text-neutral-500 max-w-lg mx-auto leading-relaxed">
          The cleanest RAG solution for your data. Upload files and get precise
          answers instantly.
        </p>
      </section>

      {/* Even Bento Grid (2x2) */}
      <section className="relative z-10 container mx-auto px-4 pb-24 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CARD 1: Chat Interface Preview */}
          <Card className="bg-neutral-900/40 border-white/5 p-6 h-[320px] flex flex-col justify-between overflow-hidden relative group hover:border-purple-500/20 transition-colors duration-300">
            <div className="absolute top-6 left-6 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-purple-500" />
              <span className="text-sm font-medium text-white">
                Live Interaction
              </span>
            </div>

            <div className="mt-12 space-y-4">
              {/* User Message - LEFT */}
              <div className="flex justify-start w-full">
                <div className="bg-neutral-800 text-neutral-300 px-4 py-3 rounded-lg rounded-tl-none text-sm max-w-[80%] border border-white/5">
                  What is the net profit margin?
                </div>
              </div>

              {/* AI Message - RIGHT */}
              <div className="flex justify-end w-full">
                <div className="bg-purple-900/40 text-purple-100 px-4 py-3 rounded-lg rounded-tr-none text-sm max-w-[80%] border border-purple-500/20 shadow-[0_0_15px_-5px_rgba(168,85,247,0.4)]">
                  The net profit margin for FY24 is 18.5%, up from 16% last
                  year.
                </div>
              </div>
            </div>
          </Card>

          {/* CARD 2: Speed / Efficiency */}
          <Card className="bg-neutral-900/40 border-white/5 p-6 h-[320px] flex flex-col justify-center items-center text-center relative hover:border-purple-500/20 transition-colors duration-300">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">
              Lightning Fast
            </h3>
            <p className="text-neutral-500 text-sm max-w-[200px]">
              Vector indexing ensures your queries are answered in milliseconds.
            </p>
          </Card>

          {/* CARD 3: Upload Capability */}
          <Card className="bg-neutral-900/40 border-white/5 p-6 h-[320px] flex flex-col justify-center items-center text-center relative hover:border-purple-500/20 transition-colors duration-300">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
              <Upload className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Simple Upload</h3>
            <p className="text-neutral-500 text-sm max-w-[200px]">
              Select your PDFs or text files. We handle the parsing and
              processing.
            </p>
          </Card>

          {/* CARD 4: Security */}
          <Card className="bg-neutral-900/40 border-white/5 p-6 h-[320px] flex flex-col justify-center items-center text-center relative hover:border-purple-500/20 transition-colors duration-300">
            <div className="w-16 h-16 rounded-full bg-neutral-800 flex items-center justify-center mb-6">
              <ShieldCheck className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Secure Core</h3>
            <p className="text-neutral-500 text-sm max-w-[200px]">
              Your data remains yours. Encrypted at rest, never used for
              training.
            </p>
          </Card>
        </div>
      </section>

      {/* High Visibility CTA */}
      <section className="relative z-10 py-20 bg-white text-black border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 tracking-tight">
            Ready to start?
          </h2>
          <p className="text-neutral-600 mb-8 max-w-md mx-auto">
            Experience the future of document interaction today.
          </p>
          <div className="flex justify-center">
            <Link href="/auth">
              <Button
                size="lg"
                className="bg-purple-600 text-white hover:bg-purple-700 rounded-none px-10 h-14 text-lg"
              >
                Upload Document <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
