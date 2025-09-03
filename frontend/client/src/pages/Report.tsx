import { TrendingUp, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const metrics = [
  {
    value: "2,543",
    label: "Total Users",
    change: "↗ +12% this month",
    color: "text-primary"
  },
  {
    value: "89%", 
    label: "Engagement Rate",
    change: "↗ +5% this month",
    color: "text-accent"
  },
  {
    value: "456",
    label: "Quizzes Completed", 
    change: "↗ +23% this month",
    color: "text-secondary-foreground"
  },
  {
    value: "78",
    label: "Reports Generated",
    change: "↗ +8% this month", 
    color: "text-destructive"
  }
];

const reports = [
  {
    title: "Monthly Engagement Report",
    date: "Generated on March 15, 2024"
  },
  {
    title: "Quiz Performance Analysis",
    date: "Generated on March 12, 2024"
  },
  {
    title: "User Demographics Report", 
    date: "Generated on March 10, 2024"
  }
];

export default function Report() {
  return (
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-8 w-8 text-destructive" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-6" data-testid="page-title">
            Reports & Analytics
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="page-description">
            This is the Report page. Access comprehensive reports, analytics, and data insights 
            to track progress and measure the impact of awareness initiatives.
          </p>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-12">
          {metrics.map((metric, index) => (
            <Card key={index} className="shadow-sm border border-border text-center" data-testid={`metric-card-${index}`}>
              <CardContent className="p-6">
                <div className={`text-3xl font-bold mb-2 ${metric.color}`} data-testid={`metric-value-${index}`}>
                  {metric.value}
                </div>
                <div className="text-sm text-muted-foreground" data-testid={`metric-label-${index}`}>
                  {metric.label}
                </div>
                <div className="text-xs text-accent mt-1" data-testid={`metric-change-${index}`}>
                  {metric.change}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart Placeholder */}
          <Card className="shadow-sm border border-border">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-card-foreground" data-testid="chart-title">
                User Engagement Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center" data-testid="chart-placeholder">
                <div className="text-center">
                  <BarChart3 className="h-16 w-16 text-muted-foreground mb-3 mx-auto" />
                  <p className="text-muted-foreground">Chart visualization would appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Report List */}
          <Card className="shadow-sm border border-border">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold text-card-foreground" data-testid="reports-title">
                  Recent Reports
                </CardTitle>
                <Button variant="link" className="text-primary hover:text-primary/80 font-medium text-sm p-0" data-testid="button-view-all">
                  View All →
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg" data-testid={`report-item-${index}`}>
                    <div>
                      <div className="font-medium text-card-foreground text-sm" data-testid={`report-title-${index}`}>
                        {report.title}
                      </div>
                      <div className="text-xs text-muted-foreground" data-testid={`report-date-${index}`}>
                        {report.date}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80" data-testid={`report-download-${index}`}>
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button 
                className="w-full mt-6 bg-primary hover:bg-primary/90 text-primary-foreground"
                data-testid="button-generate-report"
              >
                Generate New Report
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
