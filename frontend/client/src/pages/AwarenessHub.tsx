import { Brain, FileText, Video, Book } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AwarenessHub() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6" data-testid="page-title">
            Awareness Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="page-description">
            This is the Awareness Hub page. Here you'll find comprehensive educational resources, 
            research findings, and tools to enhance your understanding of important topics.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card className="shadow-sm border border-border mb-8">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-card-foreground" data-testid="resources-title">
                  Educational Resources
                </CardTitle>
                <p className="text-muted-foreground" data-testid="resources-description">
                  Explore our curated collection of educational materials designed to increase awareness and understanding.
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-muted rounded-lg" data-testid="resource-item-1">
                    <FileText className="h-5 w-5 text-primary mr-3" />
                    <span>Educational Content Resources</span>
                  </div>
                  <div className="flex items-center p-4 bg-muted rounded-lg" data-testid="resource-item-2">
                    <Video className="h-5 w-5 text-primary mr-3" />
                    <span>Video Learning Materials</span>
                  </div>
                  <div className="flex items-center p-4 bg-muted rounded-lg" data-testid="resource-item-3">
                    <Book className="h-5 w-5 text-primary mr-3" />
                    <span>Research Papers & Studies</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-8">
            <Card className="shadow-sm border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-card-foreground" data-testid="stats-title">
                  Quick Stats
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between" data-testid="stat-resources">
                    <span>Resources Available</span>
                    <span className="font-semibold">150+</span>
                  </div>
                  <div className="flex justify-between" data-testid="stat-categories">
                    <span>Categories</span>
                    <span className="font-semibold">12</span>
                  </div>
                  <div className="flex justify-between" data-testid="stat-engagement">
                    <span>User Engagement</span>
                    <span className="font-semibold text-accent">95%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3" data-testid="featured-title">Featured Topic</h3>
                <p className="text-primary-foreground/90 text-sm" data-testid="featured-description">
                  Discover the latest insights on community awareness and social impact initiatives.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
