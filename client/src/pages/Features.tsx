import { useState } from "react";
import { Link } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ArrowLeft, ThumbsUp, ThumbsDown, Lightbulb, Sparkles, Send } from "lucide-react";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import logoBlack from "@assets/snwlogo_black_1768413266371.png";
import logoWhite from "@assets/snwlogo_white_1768413266371.png";

interface Feature {
  id: number;
  title: string;
  description: string;
  upvotes: number;
  downvotes: number;
  isUserSuggested: boolean;
  createdAt: string;
}

interface FeaturesResponse {
  features: Feature[];
  votes: { featureId: number; voteType: string }[];
}

function getVisitorId(): string {
  let visitorId = localStorage.getItem("snw_visitor_id");
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem("snw_visitor_id", visitorId);
  }
  return visitorId;
}

export default function Features() {
  const { user } = useAuth();
  const [visitorId] = useState(getVisitorId);
  const [suggestionTitle, setSuggestionTitle] = useState("");
  const [suggestionDescription, setSuggestionDescription] = useState("");
  const [showSuggestionForm, setShowSuggestionForm] = useState(false);

  const { data, isLoading, error } = useQuery<FeaturesResponse>({
    queryKey: ["/api/features", visitorId],
    queryFn: async () => {
      const res = await fetch(`/api/features?visitorId=${visitorId}`);
      if (!res.ok) throw new Error("Failed to fetch features");
      return res.json();
    },
  });

  const voteMutation = useMutation({
    mutationFn: async ({ featureId, voteType }: { featureId: number; voteType: 'up' | 'down' }) => {
      const res = await apiRequest("POST", `/api/features/${featureId}/vote`, { visitorId, voteType });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/features", visitorId] });
    },
  });

  const suggestMutation = useMutation({
    mutationFn: async ({ title, description }: { title: string; description: string }) => {
      const res = await apiRequest("POST", "/api/features", { title, description });
      return res.json();
    },
    onSuccess: () => {
      setSuggestionTitle("");
      setSuggestionDescription("");
      setShowSuggestionForm(false);
      queryClient.invalidateQueries({ queryKey: ["/api/features", visitorId] });
    },
  });

  const getUserVote = (featureId: number): string | null => {
    const vote = data?.votes.find(v => v.featureId === featureId);
    return vote?.voteType || null;
  };

  const handleVote = (featureId: number, voteType: 'up' | 'down') => {
    voteMutation.mutate({ featureId, voteType });
  };

  const handleSuggest = (e: React.FormEvent) => {
    e.preventDefault();
    if (suggestionTitle.trim().length >= 3 && suggestionDescription.trim().length >= 10) {
      suggestMutation.mutate({ title: suggestionTitle, description: suggestionDescription });
    }
  };

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

      <main className="w-full max-w-3xl mx-auto px-4 sm:px-6 py-8">
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
          
          <div className="flex items-center gap-3 mb-4">
            <div className="inline-flex p-3 rounded-full bg-primary/10 text-primary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold">Feature Roadmap</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Help shape the future of startwriting.now! Vote on features you'd love to see, or suggest your own ideas.
          </p>
        </motion.div>

        {user && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            {!showSuggestionForm ? (
              <Button 
                onClick={() => setShowSuggestionForm(true)}
                className="gap-2"
                data-testid="button-suggest-feature"
              >
                <Lightbulb className="w-4 h-4" />
                Suggest a Feature
              </Button>
            ) : (
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-primary" />
                  Suggest a Feature
                </h3>
                <form onSubmit={handleSuggest} className="space-y-4">
                  <div>
                    <Input
                      placeholder="Feature title"
                      value={suggestionTitle}
                      onChange={(e) => setSuggestionTitle(e.target.value)}
                      data-testid="input-suggestion-title"
                    />
                  </div>
                  <div>
                    <Textarea
                      placeholder="Describe your feature idea in detail..."
                      value={suggestionDescription}
                      onChange={(e) => setSuggestionDescription(e.target.value)}
                      className="min-h-[100px]"
                      data-testid="input-suggestion-description"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={suggestionTitle.trim().length < 3 || suggestionDescription.trim().length < 10 || suggestMutation.isPending}
                      className="gap-2"
                      data-testid="button-submit-suggestion"
                    >
                      <Send className="w-4 h-4" />
                      {suggestMutation.isPending ? "Submitting..." : "Submit"}
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setShowSuggestionForm(false)}
                      data-testid="button-cancel-suggestion"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Card>
            )}
          </motion.div>
        )}

        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3 mb-2" />
                <div className="h-4 bg-muted rounded w-2/3" />
              </Card>
            ))}
          </div>
        ) : error ? (
          <Card className="p-6 text-center">
            <p className="text-muted-foreground">Failed to load features. Please try refreshing the page.</p>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            {data?.features.map((feature, index) => {
              const userVote = getUserVote(feature.id);
              const netVotes = feature.upvotes - feature.downvotes;
              
              return (
                <motion.div
                  key={feature.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * index }}
                >
                  <Card className="p-5" data-testid={`feature-card-${feature.id}`}>
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center gap-1 min-w-[60px]">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVote(feature.id, 'up')}
                          className={`h-8 w-8 ${userVote === 'up' ? 'text-green-600 bg-green-100 dark:bg-green-900/30' : ''}`}
                          disabled={voteMutation.isPending}
                          data-testid={`button-upvote-${feature.id}`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                        </Button>
                        <span className={`font-semibold text-sm ${netVotes > 0 ? 'text-green-600' : netVotes < 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {netVotes > 0 ? '+' : ''}{netVotes}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleVote(feature.id, 'down')}
                          className={`h-8 w-8 ${userVote === 'down' ? 'text-red-500 bg-red-100 dark:bg-red-900/30' : ''}`}
                          disabled={voteMutation.isPending}
                          data-testid={`button-downvote-${feature.id}`}
                        >
                          <ThumbsDown className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{feature.title}</h3>
                          {feature.isUserSuggested && (
                            <Badge variant="secondary" className="text-xs">
                              Community Idea
                            </Badge>
                          )}
                        </div>
                        <p className="text-muted-foreground mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        <footer className="pt-12 pb-8 text-center space-y-2">
          <p className="text-sm text-muted-foreground/60 flex items-center justify-center gap-3">
            <Link href="/about" className="hover:text-foreground transition-colors">
              About
            </Link>
          </p>
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
