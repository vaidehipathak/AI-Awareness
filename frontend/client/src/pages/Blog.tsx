import { FileText, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const categories = [
  { name: "Education", count: 12 },
  { name: "Community", count: 8 },
  { name: "Research", count: 6 },
  { name: "Policy", count: 4 },
  { name: "Technology", count: 3 }
];

const articles = [
  {
    title: "The Impact of Digital Awareness Campaigns",
    date: "March 12, 2024",
    category: "Research",
    description: "An analysis of how digital platforms are revolutionizing awareness campaigns and social change initiatives..."
  },
  {
    title: "How to Measure Community Engagement",
    date: "March 10, 2024",
    category: "Guide", 
    description: "Essential metrics and tools for evaluating the effectiveness of your community outreach efforts..."
  }
];

export default function Blog() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-secondary/50 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="h-8 w-8 text-muted-foreground" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6" data-testid="page-title">
            Blog & Insights
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="page-description">
            This is the Blog page. Stay informed with the latest articles, expert insights, 
            and thought-provoking content from our community of contributors.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="space-y-8">
              {/* Featured Article */}
              <Card className="overflow-hidden shadow-sm border border-border">
                <img 
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=400" 
                  alt="Person reading with coffee and plants" 
                  className="w-full h-48 object-cover"
                  data-testid="featured-image"
                />
                <CardContent className="p-6">
                  <div className="flex items-center mb-3">
                    <Badge className="bg-primary text-primary-foreground mr-3" data-testid="featured-badge">
                      Featured
                    </Badge>
                    <span className="text-sm text-muted-foreground" data-testid="featured-date">March 15, 2024</span>
                  </div>
                  <h2 className="text-xl font-bold text-card-foreground mb-3" data-testid="featured-title">
                    Building Sustainable Communities Through Education
                  </h2>
                  <p className="text-muted-foreground mb-4" data-testid="featured-excerpt">
                    Discover how education serves as the cornerstone for creating lasting positive change in communities worldwide...
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-muted rounded-full mr-3"></div>
                      <span className="text-sm text-muted-foreground" data-testid="featured-author">By Sarah Johnson</span>
                    </div>
                    <Button variant="link" className="text-primary hover:text-primary/80 font-medium text-sm p-0" data-testid="featured-read-more">
                      Read More →
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Articles */}
              <div className="space-y-6">
                {articles.map((article, index) => (
                  <Card key={index} className="shadow-sm border border-border" data-testid={`article-card-${index}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center mb-3">
                        <span className="text-sm text-muted-foreground" data-testid={`article-date-${index}`}>{article.date}</span>
                        <span className="mx-2 text-muted-foreground">•</span>
                        <Badge variant="secondary" className="text-accent" data-testid={`article-category-${index}`}>
                          {article.category}
                        </Badge>
                      </div>
                      <h3 className="text-lg font-semibold text-card-foreground mb-2" data-testid={`article-title-${index}`}>
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm" data-testid={`article-description-${index}`}>
                        {article.description}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Categories */}
            <Card className="shadow-sm border border-border">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-card-foreground" data-testid="categories-title">
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categories.map((category, index) => (
                    <a 
                      key={index}
                      href="#" 
                      className="block text-muted-foreground hover:text-primary transition-colors text-sm"
                      data-testid={`category-${index}`}
                    >
                      {category.name} ({category.count})
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Newsletter */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-3" data-testid="newsletter-title">Stay Updated</h3>
                <p className="text-primary-foreground/90 text-sm mb-4" data-testid="newsletter-description">
                  Subscribe to our newsletter for the latest insights and updates.
                </p>
                <div className="space-y-3">
                  <Input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-primary-foreground text-primary placeholder-primary/60"
                    data-testid="newsletter-email"
                  />
                  <Button 
                    className="w-full bg-accent hover:bg-accent/90 text-accent-foreground"
                    data-testid="newsletter-subscribe"
                  >
                    Subscribe
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
