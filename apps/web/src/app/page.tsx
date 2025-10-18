import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageSquare, Sparkles, Upload, Zap } from "lucide-react";
import Link from "next/link";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero dark">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative container mx-auto px-4 pt-20 pb-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/20 border border-purple-500/40">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span className="text-sm font-medium text-purple-300">
                RAG-Powered Document Intelligence
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold leading-tight text-white">
              Know Your <span className="text-fuchsia-500">Docs</span>
            </h1>

            <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
              Upload your documents and unlock instant insights. Ask questions,
              get precise answers—powered by advanced RAG technology.
            </p>

            <div className="flex gap-4 justify-center pt-4">
              <Link href="/auth">
                <Button
                  size="lg"
                  className="bg-purple-600 hover:bg-purple-700 text-white shadow-glow border-0"
                >
                  Get Started Free
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="border-purple-500/50 text-white hover:bg-purple-500/10 bg-transparent"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 container mx-auto px-4 relative">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Everything you need to understand your documents
          </h2>
          <p className="text-gray-400 text-lg">
            Powerful features designed for seamless document interaction
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="p-8 bg-gradient-card border-purple-500/30 hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6">
              <Upload className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Easy Upload
            </h3>
            <p className="text-gray-400">
              Drag and drop your documents or paste content directly. Support
              for PDFs, Word docs, and more.
            </p>
          </Card>

          <Card className="p-8 bg-gradient-card border-purple-500/30 hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6">
              <MessageSquare className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Intelligent Q&A
            </h3>
            <p className="text-gray-400">
              Ask questions in natural language and get accurate, context-aware
              answers from your documents.
            </p>
          </Card>

          <Card className="p-8 bg-gradient-card border-purple-500/30 hover:shadow-elegant transition-all duration-300">
            <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Lightning Fast
            </h3>
            <p className="text-gray-400">
              Powered by RAG technology for instant retrieval and generation of
              relevant information.
            </p>
          </Card>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 container mx-auto px-4 relative">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">How it works</h2>
            <p className="text-gray-400 text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-glow">
                1
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-white">
                  Upload Your Documents
                </h3>
                <p className="text-gray-400">
                  Simply upload your PDFs, documents, or paste text content into
                  the platform.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-glow">
                2
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-white">
                  Ask Questions
                </h3>
                <p className="text-gray-400">
                  Type your questions in natural language—no technical knowledge
                  required.
                </p>
              </div>
            </div>

            <div className="flex gap-6 items-start">
              <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center flex-shrink-0 text-white font-bold text-lg shadow-glow">
                3
              </div>
              <div>
                <h3 className="text-2xl font-semibold mb-2 text-white">
                  Get Instant Answers
                </h3>
                <p className="text-gray-400">
                  Receive accurate, contextual answers powered by advanced RAG
                  technology.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 container mx-auto px-4 relative">
        <Card className="max-w-4xl mx-auto p-12 text-center bg-gradient-card border-purple-500/30">
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready to unlock your documents?
          </h2>
          <p className="text-gray-400 text-lg mb-8">
            Join thousands of users already getting instant answers from their
            documents.
          </p>
          <Link href="/auth">
            <Button
              size="lg"
              className="bg-purple-600 hover:bg-purple-700 text-white shadow-glow border-0"
            >
              Start Free Today
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-purple-500/20">
        <div className="container mx-auto px-4 text-center text-gray-500">
          <p>&copy; 2025 Know Your Docs. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
