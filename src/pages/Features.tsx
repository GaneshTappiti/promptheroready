
import React from "react";
import Navbar from "@/components/Navbar";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const FeaturesPage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="flex-grow pt-16">
        <div className="container px-4 md:px-6 py-12">
          <h1 className="text-4xl font-bold tracking-tighter mb-8 text-center">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Our Features
            </span>
          </h1>
        </div>
        <Features />
      </main>
      <Footer />
    </div>
  );
};

export default FeaturesPage;
