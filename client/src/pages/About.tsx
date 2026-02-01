import { Link } from "wouter";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { PenLine, Shield, Clock, Target, Sparkles, Heart, Lock, ArrowLeft, Smile, Download, Trophy } from "lucide-react";
import logoBlack from "@assets/snwlogo_black_1768413266371.png";
import logoWhite from "@assets/snwlogo_white_1768413266371.png";

export default function About() {
  const features = [
    {
      icon: Clock,
      title: "3-Minute Sessions",
      description: "Quick, focused writing sessions that fit into any schedule. Build a daily habit without overwhelming your day."
    },
    {
      icon: Sparkles,
      title: "Daily Prompts",
      description: "Fresh writing prompts across 5 categories: Life, Career, Creativity, Gratitude, and Mindfulness to inspire your thoughts."
    },
    {
      icon: Target,
      title: "Streak Tracking",
      description: "Stay motivated with streak tracking that celebrates your consistency and helps you build a lasting writing habit."
    },
    {
      icon: PenLine,
      title: "Word Goals",
      description: "Set daily word count goals and track your progress in real-time as you write."
    },
    {
      icon: Heart,
      title: "Distraction-Free",
      description: "A clean, minimal interface designed to help you focus on what matters most: your thoughts."
    },
    {
      icon: Smile,
      title: "Mood Tracking",
      description: "Log how you're feeling after each entry. Discover patterns between your writing and emotions over time."
    },
    {
      icon: Trophy,
      title: "Achievements",
      description: "Unlock 15 badges as you build your writing habit. Celebrate milestones for entries, streaks, and words written."
    },
    {
      icon: Download,
      title: "Export Your Journal",
      description: "Download all your entries as PDF or text files. Your writing is always yours to keep."
    },
    {
      icon: Lock,
      title: "Private by Design",
      description: "Your journal entries are completely private. No one else can read them - not even us."
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-500">
      <header className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
        <Link href="/">
          <div className="flex items-center gap-2 cursor-pointer">
            <img src={logoBlack} alt="startwriting.now" className="h-8 dark:hidden" />
            <img src={logoWhite} alt="startwriting.now" className="h-8 hidden dark:block" />
          </div>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
        </div>
      </header>

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/">
            <Button variant="ghost" className="gap-2 mb-6" data-testid="button-back-home">
              <ArrowLeft className="w-4 h-4" />
              Back to Writing
            </Button>
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About startwriting.now</h1>
          <p className="text-xl text-muted-foreground">
            A simple, powerful tool to help you develop a daily writing habit through micro-journaling.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-semibold mb-6">Why Micro-Journaling?</h2>
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed">
              Writing just 3 minutes a day can transform your thinking, boost creativity, and improve mental clarity. 
              startwriting.now makes it easy to start and stick with this powerful habit by removing friction and 
              providing gentle guidance through daily prompts.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-semibold mb-8">Key Features</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * (index + 3) }}
                className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-6"
              >
                <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary mb-4">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-16"
        >
          <div className="bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 text-center">
            <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 mb-4">
              <Shield className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-semibold mb-4">Your Privacy Matters</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Your journal entries are completely private and secure. No one can see what you write - 
              not other users, not administrators, not anyone. Your thoughts belong to you and you alone. 
              We believe that true self-reflection requires complete privacy, and we've built startwriting.now 
              with that principle at its core.
            </p>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center"
        >
          <h2 className="text-2xl font-semibold mb-4">Ready to Start Writing?</h2>
          <p className="text-muted-foreground mb-6">
            It only takes 3 minutes a day to build a life-changing habit.
          </p>
          <Link href="/">
            <Button size="lg" className="gap-2" data-testid="button-start-writing">
              <PenLine className="w-5 h-5" />
              Start Writing Now
            </Button>
          </Link>
        </motion.section>

        <footer className="pt-12 pb-8 text-center">
          <p className="text-sm text-muted-foreground/60">
            Created with Love by{" "}
            <a 
              href="https://mattrutherford.co.uk" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-foreground transition-colors"
            >
              Matt Rutherford
            </a>
          </p>
        </footer>
      </main>
    </div>
  );
}
