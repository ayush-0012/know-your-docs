"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  Database,
  FileText,
  Layers,
  LayoutDashboard,
  Search,
  Sparkles,
  Upload,
  User,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1 },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const Index = () => {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  useEffect(() => {
    // Enable smooth scrolling
    document.documentElement.style.scrollBehavior = "smooth";

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.documentElement.style.scrollBehavior = "auto";
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans selection:bg-purple-500/30 flex flex-col scroll-smooth">
      {/* Background - Clean Grid Only (No Purple Blur) */}
      <motion.div
        className="fixed inset-0 z-0 pointer-events-none"
        style={{ y: backgroundY }}
      >
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      </motion.div>

      {/* Navbar - Dynamic Glass Effect */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out ${
          scrolled
            ? "bg-[#0a0a0a]/80 backdrop-blur-xl border-b border-white/5 py-4"
            : "bg-transparent py-6 border-transparent"
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center group-hover:bg-neutral-200 transition-colors">
              <LayoutDashboard className="w-4 h-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-white">
              KnowYourDocs
            </span>
          </Link>

          <div className="flex gap-4 items-center">
            {/* <Link href="/auth" className="hidden sm:block">
              <span className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">
                Log in
              </span>
            </Link> */}
            <Link href="/auth">
              <Button
                size="sm"
                className="bg-white text-black hover:bg-neutral-200 font-medium rounded-full h-9 px-6 transition-all"
              >
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </motion.nav>

      <main className="relative z-10 flex-grow">
        {/* Hero Section - Added pt-32 to account for fixed navbar */}
        <section className="pt-32 pb-20 container mx-auto px-4 text-center flex flex-col items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-8"
          >
            <Sparkles className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-medium text-neutral-300 uppercase tracking-wide">
              Powered by RAG Technology
            </span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 max-w-4xl"
          >
            Your documents, <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-purple-600">
              simplified.
            </span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="text-lg text-neutral-400 max-w-xl mx-auto leading-relaxed mb-8"
          >
            Upload your files and start asking questions. A simple, clean way to
            get the answers you need from your documents using AI.
          </motion.p>

          {/* Use Case Tags */}
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="flex flex-wrap justify-center gap-3 mb-10"
          >
            {[
              "Research Papers",
              "Financial Reports",
              "Legal Contracts",
              "Class Notes",
            ].map((item) => (
              <motion.span
                key={item}
                variants={staggerItem}
                className="text-xs px-3 py-1 rounded-full bg-neutral-900 border border-white/10 text-neutral-500"
              >
                {item}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link href="/auth">
              <Button className="h-12 px-8 rounded-full bg-purple-600 hover:bg-purple-500 text-white text-base transition-all hover:scale-105">
                Start Uploading <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </motion.div>
        </section>

        {/* --- TECH STACK SECTION --- */}
        <section className="py-20 border-y border-white/5 bg-[#0a0a0a] relative">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-100px" }}
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <span className="text-xs font-semibold text-purple-400 tracking-widest uppercase">
                The Engine Room
              </span>
              <h2 className="text-3xl font-bold text-white mt-3">
                Built with Modern Architecture
              </h2>
              <p className="text-neutral-400 mt-2 max-w-lg mx-auto">
                We leverage the latest in AI and web technology to ensure speed,
                accuracy, and reliability.
              </p>
            </motion.div>

            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
            >
              {/* Tech 1: Gemini */}
              <motion.div
                variants={staggerItem}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">Google Gemini</h3>
                <p className="text-xs text-neutral-500">
                  Advanced reasoning & context understanding
                </p>
              </motion.div>

              {/* Tech 2: Vector DB */}
              <motion.div
                variants={staggerItem}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mb-4 border border-orange-500/20 group-hover:scale-110 transition-transform">
                  <Database className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">Vector DB</h3>
                <p className="text-xs text-neutral-500">
                  High-dimensional semantic indexing
                </p>
              </motion.div>

              {/* Tech 3: Next.js */}
              <motion.div
                variants={staggerItem}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mb-4 border border-white/20 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-1">Next.js</h3>
                <p className="text-xs text-neutral-500">
                  Server-side rendering & edge performance
                </p>
              </motion.div>

              {/* Tech 4: LangChain */}
              <motion.div
                variants={staggerItem}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
                className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:bg-white/[0.05] transition-colors group flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mb-4 border border-green-500/20 group-hover:scale-110 transition-transform">
                  <Layers className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-1">LangChain</h3>
                <p className="text-xs text-neutral-500">
                  Robust document processing pipeline
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 container mx-auto px-4">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold text-white mb-4">How it works</h2>
            <p className="text-neutral-400 max-w-md mx-auto">
              We process your data locally in chunks to ensure accurate context
              retrieval.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
            {/* Connecting Line (Desktop) */}
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
              className="hidden md:block absolute top-12 left-[16%] right-[16%] h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent origin-left"
            ></motion.div>

            {/* Step 1 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={scaleIn}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="relative flex flex-col items-center text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-24 h-24 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-6 z-10 shadow-xl"
              >
                <Upload className="w-10 h-10 text-purple-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">
                1. Upload
              </h3>
              <p className="text-sm text-neutral-500">
                Your file is parsed and split into manageable text chunks.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={scaleIn}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative flex flex-col items-center text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-24 h-24 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-6 z-10 shadow-xl"
              >
                <Database className="w-10 h-10 text-purple-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">
                2. Index
              </h3>
              <p className="text-sm text-neutral-500">
                Data is converted into vectors for semantic search
                understanding.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              variants={scaleIn}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative flex flex-col items-center text-center"
            >
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                transition={{ type: "spring", stiffness: 300 }}
                className="w-24 h-24 rounded-2xl bg-neutral-900 border border-white/10 flex items-center justify-center mb-6 z-10 shadow-xl"
              >
                <Bot className="w-10 h-10 text-purple-400" />
              </motion.div>
              <h3 className="text-lg font-semibold text-white mb-2">3. Chat</h3>
              <p className="text-sm text-neutral-500">
                Our AI retrieves the exact context to answer your specific
                questions.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 pb-32 max-w-5xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* CARD 1: Chat Interface */}
            <motion.div variants={staggerItem} className="md:col-span-3">
              <Card className="bg-neutral-900/50 border-white/10 p-0 overflow-hidden group hover:border-purple-500/30 transition-all duration-500">
                <div className="grid md:grid-cols-2 h-full min-h-[350px]">
                  {/* Text Side */}
                  <div className="p-8 flex flex-col justify-center relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center mb-6">
                      <Search className="w-6 h-6 text-purple-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-3">
                      Deep Context Search
                    </h3>
                    <p className="text-neutral-400 leading-relaxed">
                      Don't just read—interact. The system isolates the most
                      relevant paragraphs from your upload to construct a
                      precise answer.
                    </p>
                  </div>

                  {/* UI Mockup Side */}
                  <div className="bg-neutral-950/50 border-l border-white/5 relative p-6 flex flex-col justify-between">
                    <div className="space-y-4 mt-4">
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center flex-shrink-0 border border-white/10">
                          <User className="w-4 h-4 text-neutral-400" />
                        </div>
                        <div className="bg-neutral-800 text-neutral-200 px-4 py-2 rounded-2xl rounded-tl-none text-sm border border-white/5">
                          What are the key findings?
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 }}
                        className="flex gap-3 flex-row-reverse"
                      >
                        <div className="w-8 h-8 rounded-full bg-purple-900/30 flex items-center justify-center flex-shrink-0 border border-purple-500/20">
                          <Sparkles className="w-4 h-4 text-purple-400" />
                        </div>
                        <div className="bg-purple-900/20 text-purple-100 px-4 py-2 rounded-2xl rounded-tr-none text-sm border border-purple-500/20">
                          Based on the document, the primary outcome was a
                          stable increase in efficiency.
                        </div>
                      </motion.div>
                    </div>

                    <div className="mt-6 relative">
                      <div className="h-10 bg-neutral-900 rounded-full border border-white/10 flex items-center px-4 text-xs text-neutral-500">
                        Type a question...
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>

            {/* CARD 2: Accuracy */}
            <motion.div
              variants={staggerItem}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="md:col-span-1"
            >
              <Card className="h-full bg-neutral-900/50 border-white/10 p-6 flex flex-col relative hover:bg-neutral-900/80 hover:border-purple-500/30 transition-all duration-300 group">
                <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-green-200" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  Hallucination Free
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  Answers are strictly grounded in your provided text. If the
                  answer isn't in the file, we tell you.
                </p>
              </Card>
            </motion.div>

            {/* CARD 3: Simple Upload */}
            <motion.div
              variants={staggerItem}
              whileHover={{ y: -5 }}
              transition={{ duration: 0.2 }}
              className="md:col-span-2"
            >
              <Card className="h-full bg-neutral-900/50 border-white/10 p-6 flex flex-col md:flex-row items-center gap-8 relative hover:bg-neutral-900/80 hover:border-purple-500/30 transition-all duration-300 group">
                <div className="flex-1 text-center md:text-left">
                  <div className="w-12 h-12 rounded-xl bg-neutral-800 flex items-center justify-center mb-6 mx-auto md:mx-0 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-blue-200" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Simple File Support
                  </h3>
                  <p className="text-neutral-400 text-sm leading-relaxed max-w-md">
                    Works with standard PDF and text files. We handle the text
                    extraction so you don't have to copy-paste.
                  </p>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="w-full md:w-48 h-24 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center gap-3 group-hover:border-purple-500/30 transition-colors"
                >
                  <FileText className="w-6 h-6 text-neutral-500" />
                  <span className="text-xs font-medium text-neutral-400">
                    Select File
                  </span>
                </motion.div>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        {/* CTA Section - Clean Grid Mask */}
        <section className="relative py-24 border-t border-white/10 bg-[#0a0a0a] overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeInUp}
            transition={{ duration: 0.7 }}
            className="container relative z-10 mx-auto px-4 text-center"
          >
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white tracking-tight">
              Ready to get started?
            </h2>
            <p className="text-neutral-400 mb-10 max-w-md mx-auto text-lg">
              No complex setup. Just upload your document and start your
              conversation.
            </p>
            <Link href="/auth">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  size="lg"
                  className="bg-white text-black hover:bg-neutral-200 rounded-full px-10 h-14 text-base font-semibold transition-transform"
                >
                  Start Now
                </Button>
              </motion.div>
            </Link>
          </motion.div>
        </section>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="py-8 border-t border-white/5 bg-[#050505] text-center"
      >
        <p className="text-neutral-600 text-sm">
          © {new Date().getFullYear()} KnowYourDocs. Built for precision.
        </p>
      </motion.footer>
    </div>
  );
};

export default Index;
