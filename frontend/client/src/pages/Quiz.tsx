import { HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const quizzes = [
  {
    title: "Awareness Fundamentals",
    description: "Test your understanding of basic awareness concepts and principles.",
    questions: 15,
    duration: "10 min",
    level: "Beginner",
    levelColor: "bg-primary text-primary-foreground"
  },
  {
    title: "Advanced Concepts", 
    description: "Challenge yourself with complex scenarios and advanced topics.",
    questions: 25,
    duration: "20 min",
    level: "Advanced",
    levelColor: "bg-destructive text-destructive-foreground"
  },
  {
    title: "Community Impact",
    description: "Explore the role of community engagement in creating positive change.",
    questions: 20,
    duration: "15 min", 
    level: "Intermediate",
    levelColor: "bg-accent text-accent-foreground"
  },
  {
    title: "Quick Assessment",
    description: "A brief assessment to gauge your current knowledge level.",
    questions: 5,
    duration: "3 min",
    level: "Quick",
    levelColor: "bg-secondary text-secondary-foreground"
  }
];

export default function Quiz() {
  return (
    <div className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <HelpCircle className="h-8 w-8 text-accent" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6" data-testid="page-title">
            Interactive Quiz
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="page-description">
            This is the Quiz page. Test your knowledge with our interactive assessments and 
            track your learning progress through engaging quiz experiences.
          </p>
        </div>

        <Card className="shadow-sm border border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold text-card-foreground" data-testid="quizzes-title">
                Available Quizzes
              </CardTitle>
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground" data-testid="button-create-quiz">
                Create Quiz
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {quizzes.map((quiz, index) => (
                <Card key={index} className="bg-muted border border-border hover:shadow-md transition-shadow duration-200" data-testid={`quiz-card-${index}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-foreground" data-testid={`quiz-title-${index}`}>
                        {quiz.title}
                      </h3>
                      <Badge className={`${quiz.levelColor} text-xs font-medium`} data-testid={`quiz-level-${index}`}>
                        {quiz.level}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mb-4" data-testid={`quiz-description-${index}`}>
                      {quiz.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground" data-testid={`quiz-info-${index}`}>
                        {quiz.questions} questions • {quiz.duration}
                      </span>
                      <Button variant="link" className="text-primary hover:text-primary/80 font-medium text-sm p-0" data-testid={`quiz-start-${index}`}>
                        Start Quiz →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
