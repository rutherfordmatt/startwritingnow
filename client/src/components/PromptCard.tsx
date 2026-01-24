import { RefreshCw, Sparkles, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { type Prompt } from "@shared/schema";
import { motion, AnimatePresence } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type PromptCategory = "Life" | "Career" | "Creativity" | "Gratitude" | "Mindfulness";

interface PromptCardProps {
  prompt: Prompt | undefined;
  isLoading: boolean;
  onRefresh: () => void;
  category: PromptCategory;
  onCategoryChange: (category: PromptCategory) => void;
}

export function PromptCard({ 
  prompt, 
  isLoading, 
  onRefresh, 
  category, 
  onCategoryChange 
}: PromptCardProps) {
  const categories: PromptCategory[] = ["Life", "Career", "Creativity", "Gratitude", "Mindfulness"];
  
  return (
    <div className="w-full">
      <div className="flex flex-row items-center justify-between gap-4 mb-6">
        {/* Mobile dropdown */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2" data-testid="button-category-mobile">
                {category}
                <ChevronDown className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {categories.map((cat) => (
                <DropdownMenuItem
                  key={cat}
                  onClick={() => onCategoryChange(cat)}
                  className={category === cat ? "bg-muted" : ""}
                  data-testid={`button-category-mobile-${cat.toLowerCase()}`}
                >
                  {cat}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Desktop tabs */}
        <div className="hidden md:flex items-center gap-1 bg-muted/50 p-1 rounded-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryChange(cat)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                category === cat
                  ? "bg-white dark:bg-zinc-800 text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              data-testid={`button-category-${cat.toLowerCase()}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={onRefresh}
          disabled={isLoading}
          className="text-muted-foreground hover:text-primary gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          New Prompt
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={prompt?.id || "loading"}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative group"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/10 via-purple-500/10 to-primary/10 rounded-2xl blur-xl opacity-50 group-hover:opacity-100 transition duration-500"></div>
          <div className="relative bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl p-8 md:p-10 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="hidden md:flex p-3 rounded-full bg-primary/10 text-primary mt-1">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h2 className="font-serif text-2xl md:text-3xl lg:text-4xl text-foreground leading-tight">
                  {isLoading ? (
                    <span className="animate-pulse bg-muted rounded w-3/4 inline-block h-[1.2em]"></span>
                  ) : (
                    prompt?.content || "Ready to write?"
                  )}
                </h2>
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
