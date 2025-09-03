import { Brain, HelpCircle, FileText, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const features = [
  {
    icon: Brain,
    title: "Awareness Hub",
    description: "Comprehensive resources and educational content to expand your knowledge.",
    iconBg: "bg-primary/10",
    iconColor: "text-primary"
  },
  {
    icon: HelpCircle,
    title: "Interactive Quiz",
    description: "Test your knowledge and learn through engaging interactive assessments.",
    iconBg: "bg-accent/10",
    iconColor: "text-accent"
  },
  {
    icon: FileText,
    title: "Blog & Insights",
    description: "Stay updated with the latest articles, insights, and expert perspectives.",
    iconBg: "bg-secondary/50",
    iconColor: "text-muted-foreground"
  },
  {
    icon: TrendingUp,
    title: "Reports",
    description: "Access detailed reports and analytics to track progress and impact.",
    iconBg: "bg-destructive/10",
    iconColor: "text-destructive"
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="hero-gradient py-20 sm:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-primary-foreground mb-6" data-testid="hero-title">
              Building Awareness,<br />
          
            </h1>
            <p className="text-xl sm:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto" data-testid="hero-description">
              Empowering communities with knowledge, tools, and resources to create meaningful impact in our world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-3 font-semibold shadow-lg"
                data-testid="button-get-started"
              >
                Get Started
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="border-2 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary px-8 py-3 font-semibold bg-transparent"
                data-testid="button-learn-more"
              >
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4" data-testid="features-title">
              Explore Our Platform
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="features-description">
              Discover the tools and resources designed to help you stay informed and make a difference.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <Card key={index} className="feature-card shadow-sm border border-border" data-testid={`feature-card-${index}`}>
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 ${feature.iconBg} rounded-lg flex items-center justify-center mb-4`}>
                      <IconComponent className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="text-xl font-semibold text-card-foreground mb-2" data-testid={`feature-title-${index}`}>
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground" data-testid={`feature-description-${index}`}>
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20 bg-muted">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-6" data-testid="cta-title">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg text-muted-foreground mb-8" data-testid="cta-description">
            Join thousands of users who are already using our platform to create positive change in their communities.
          </p>
          <Button 
            size="lg" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 font-semibold shadow-lg"
            data-testid="button-start-journey"
          >
            Start Your Journey
          </Button>
        </div>
      </div>
    </div>
  );
}
