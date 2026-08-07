import React from "react";
import Navbar from "@/components/layout/Navbar";
import { getAllModelEntries } from "@/lib/models";
import Head from "next/head";
import BenchmarksClient from "./ClientPage";

export default async function BenchmarksPage() {
  const allModels = await getAllModelEntries();

  return (
    <>
      <Head>
        <title>LLM Benchmarks & Leaderboard — Modelverse</title>
        <meta name="description" content="Compare MMLU, HumanEval, MATH and other benchmarks across top AI models." />
      </Head>
      <main className="min-h-screen bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent-soft)] selection:text-[var(--accent)] pb-24 font-sans antialiased relative">
        <Navbar theme="dark" />
        <BenchmarksClient allModels={allModels} />
      </main>
    </>
  );
}
